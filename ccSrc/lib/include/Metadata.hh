#pragma once

extern "C"
{
#include "alsa/asoundlib.h"
}

struct Metadata
{
    unsigned int sample_rate;
    unsigned int nb_samples;
    unsigned short channels;
    unsigned short bits_per_sample;
    snd_pcm_format_t format;
    snd_pcm_access_t accessMethod;
};