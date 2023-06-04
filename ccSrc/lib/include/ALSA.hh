#pragma once

#include "nocturne_types.hh"

#include "Provider.hh"
#include "Metadata.hh"

#include <alsa/asoundlib.h>
#include <condition_variable>
#include <memory>
#include <mutex>
#include <thread>

class ALSA
{
public:
    ALSA(Ref<Provider> provider, HasDefault<u32> frames = 4096);
    ~ALSA();

    // play the music in a separate thread
    void startPlay();
    // play music in current thread
    void play();

    void resume();
    void pause();
    void setVolume(i32 volume);

    void stop();
    boolean hasStopped() { return control == STOP; }

    i32 getCurrentFrame();
    void refreshBuffer();

private:
    bool playInterleave();

    snd_pcm_t *handle;
    snd_pcm_hw_params_t *hwParams;
    snd_pcm_sw_params_t *swParams;
    snd_mixer_t *mixer;

    snd_pcm_uframes_t frames;
    int dir;
    int size;

    Provider &provider;
    const Metadata &metadata;

    std::unique_ptr<std::thread> playThread;
    enum
    {
        PLAY,
        PAUSE,
        STOP
    } control{PLAY};
    std::mutex mutex;
    std::condition_variable cv;

    long currentFrame;
};