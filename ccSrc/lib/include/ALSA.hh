#pragma once

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
    ALSA(Provider &provider, int frames = 4096);
    ~ALSA();

    // play the music in a separate thread
    void startPlay();
    // play music in current thread
    void play();

    void resume();
    void pause();
    void setVolume(int volume);

private:
    bool playInterleave();

    snd_pcm_t *handle;
    snd_pcm_hw_params_t *params;
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
        PAUSE
    } control;
    std::mutex mutex;
    std::condition_variable cv;
};