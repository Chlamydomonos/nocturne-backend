#include "ALSA.hh"
#include <stdexcept>

#define CK_SND(func, params) checkSnd(func params, #func)

static void checkSnd(int rc, const char *msg)
{
    if (rc < 0)
    {
        fprintf(stderr, "%s: %s)", msg, snd_strerror(rc));
        throw std::runtime_error(msg);
    }
}

ALSA::ALSA(Provider &provider, u32 frames)
    : provider{provider}, metadata{provider.getMetadata()}, frames{frames}
{

    /* Open PCM device for playback. */
    CK_SND(snd_pcm_open, (&handle, "default", SND_PCM_STREAM_PLAYBACK, 0));

    /* Allocate a hardware parameters object. */
    CK_SND(snd_pcm_hw_params_malloc, (&hwParams));

    /* Fill it in with default values. */
    CK_SND(snd_pcm_hw_params_any, (handle, hwParams));

    /* Set the desired hardware parameters. */

    /* access mode */

    CK_SND(snd_pcm_hw_params_set_access, (handle, hwParams, SND_PCM_ACCESS_RW_INTERLEAVED));

    /* set bits_per_sample */

    CK_SND(snd_pcm_hw_params_set_format, (handle, hwParams, metadata.format));

    /* set sample rate */
    unsigned int sample_rate = metadata.sample_rate;

    CK_SND(snd_pcm_hw_params_set_rate_near, (handle, hwParams, &sample_rate, &dir));

    /* set channels */
    CK_SND(snd_pcm_hw_params_set_channels, (handle, hwParams, metadata.channels));

    /* Write the parameters to the driver */
    CK_SND(snd_pcm_hw_params, (handle, hwParams));

    CK_SND(snd_pcm_sw_params_malloc, (&swParams));

    CK_SND(snd_pcm_sw_params_current, (handle, swParams));

    CK_SND(snd_pcm_sw_params_set_avail_min, (handle, swParams, frames));

    CK_SND(snd_pcm_sw_params_set_start_threshold, (handle, swParams, 0));

    CK_SND(snd_pcm_sw_params, (handle, swParams));

    size = frames * metadata.channels * metadata.bits_per_sample / 8;

    // music player control unit
    snd_mixer_open(&mixer, 0);
    snd_mixer_attach(mixer, "default");
    snd_mixer_selem_register(mixer, NULL, NULL);
    snd_mixer_load(mixer);

    printf("Playing this %d Hz %d channels %d bits_per_sample audio\n", sample_rate, metadata.channels, metadata.bits_per_sample);
    printf("Period size is %u\n", frames);
}

ALSA::~ALSA()
{
    if (playThread)
    {
        playThread->join();
    }
    snd_pcm_drain(handle);
    snd_pcm_close(handle);
    snd_mixer_close(mixer);
}

void ALSA::startPlay()
{
    if (playThread)
    {
        throw std::runtime_error("already playing");
    }
    control = PLAY;
    playThread = std::make_unique<std::thread>(&ALSA::play, this);
}

void ALSA::play()
{
    do
    {
        std::unique_lock<std::mutex> lock(mutex);
        if (control == PAUSE)
            cv.wait(lock, [this]
                    { return control == PLAY; });
        else
            lock.unlock();
    } while (playInterleave());
}

bool ALSA::playInterleave()
{
    int error;
    if ((error = snd_pcm_wait(handle, 1000)) < 0)
    {
        fprintf(stderr, "Poll failed: %s\n", snd_strerror(error));
        return false;
    }

    int framesToDeliver;
    if ((framesToDeliver = snd_pcm_avail_update(handle)) < 0)
    {
        if (framesToDeliver == -EPIPE)
        {
            fprintf(stderr, "XRun occurred\n");
            return false;
        }
        else
        {
            fprintf(stderr, "Get available space failed: %d", framesToDeliver);
            return false;
        }
    }

    if (framesToDeliver < frames)
    {
        return true;
    }

    {
        std::scoped_lock<std::mutex> lock(mutex);
        snd_pcm_delay(handle, &currentFrame);
    }

    auto buffer = provider.getData(size);
    if (buffer.size() < size)
    {
        printf("End of file, buffer size: %d\n", buffer.size());
        return false;
    }

    int flag = 0;
    if ((flag = snd_pcm_writei(handle, buffer.data(), frames)) == -EPIPE)
    {
        fprintf(stderr, "Underrun occurred\n");
        int code = snd_pcm_prepare(handle);
        if (code < 0)
        {
            fprintf(stderr, "Can't recover from underrun, prepare failed: %s\n", snd_strerror(code));
        }
        else
        {
            fprintf(stderr, "Prepare success\n");
        }
    }
    else if (flag < 0)
    {
        fprintf(stderr, "Error from writei: %s\n", snd_strerror(flag));
        throw std::runtime_error("Error from writei");
    }
    else if (flag != (int)frames)
    {
        fprintf(stderr, "Short write, write %d frames\n", flag);
    }
    return true;
}

void ALSA::resume()
{
    {
        std::scoped_lock<std::mutex> lock(mutex);
        snd_pcm_pause(handle, 0);
        control = PLAY;
    }
    cv.notify_one();
}

void ALSA::pause()
{
    {
        std::scoped_lock<std::mutex> lock(mutex);
        snd_pcm_pause(handle, 1);
        control = PAUSE;
    }
    cv.notify_one();
}

void ALSA::setVolume(int volume)
{
    snd_mixer_elem_t *elem = snd_mixer_first_elem(mixer);
    while (elem != NULL)
    {
        if (snd_mixer_elem_get_type(elem) == SND_MIXER_ELEM_SIMPLE &&
            snd_mixer_selem_is_active(elem))
        {
            const char *name = snd_mixer_selem_get_name(elem);
            if (strcmp(name, "Master") == 0)
            {
                break;
            }
        }
        elem = snd_mixer_elem_next(elem);
    }
    long max = 512, vol;
    vol = (long)(max * volume / 100.0f); // volume is a float between 0 and 1
    snd_mixer_selem_set_playback_volume_all(elem, vol);
}

i32 ALSA::getCurrentFrame()
{
    std::scoped_lock<std::mutex> lock(mutex);
    return currentFrame;
}

void ALSA::refreshBuffer()
{
    std::scoped_lock<std::mutex> lock(mutex);
    snd_pcm_drop(handle);
    snd_pcm_prepare(handle);
}