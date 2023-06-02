#pragma once

#include "nocturne_types.hh"

#include "Decoder.hh"

#include <fstream>

struct WAVHeader
{
    char riff[4];          // "RIFF"
    unsigned int size;     // size of file - 8
    char wave[4];          // "WAVE"
    char fmt[4];           // "fmt "
    unsigned int fmt_size; // size of fmt chunk
    unsigned short format;
    unsigned short channels;
    unsigned int sample_rate;
    unsigned int byte_rate;     // sample_rate * channels * bits_per_sample / 8
    unsigned short block_align; // channels * bits_per_sample / 8
    unsigned short bits_per_sample;
} __attribute__((packed));

class WAVDecoder : public Decoder
{
private:
    Metadata metadata{};
    Buffer buffer{};
    WAVHeader header{};
    std::fstream file;

public:
    WAVDecoder(String fileName);
    ConstRef<Metadata> getMetadata() override;
    Ref<Buffer> getData(i32 size) override;
};