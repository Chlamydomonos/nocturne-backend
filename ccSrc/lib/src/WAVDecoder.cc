#include "WAVDecoder.hh"
#include <cstring>
#include <fcntl.h>
#include <stdexcept>

// sanity check
static void wavChecker(const WAVHeader &header)
{
    // do some sanity checks like FFmpeg does
    if (strncmp(header.riff, "RIFF", 4) != 0)
    {
        throw std::runtime_error("Not a RIFF file");
    }
    if (strncmp(header.wave, "WAVE", 4) != 0)
    {
        throw std::runtime_error("Not a WAVE file");
    }
    if (strncmp(header.fmt, "fmt ", 4) != 0)
    {
        throw std::runtime_error("Not a fmt file");
    }
}

static int seekDataSection(std::fstream &file)
{
    // automaton
    // 0: d
    // 1: da
    // 2: dat
    // 3: data, return
    // read one byte at a time
    // if we see "data", return
    enum
    {
        INIT,
        D,
        DA,
        DAT
    } automaton = INIT;

    char c;
    while (file.get(c))
    {
        switch (automaton)
        {
        case INIT:
            if (c == 'd')
            {
                automaton = D;
            }
            break;
        case D:
            if (c == 'a')
            {
                automaton = DA;
            }
            else
            {
                automaton = INIT;
            }
            break;
        case DA:
            if (c == 't')
            {
                automaton = DAT;
            }
            else
            {
                automaton = INIT;
            }
            break;
        case DAT:
            if (c == 'a')
            {
                return file.tellg();
            }
            else
            {
                automaton = INIT;
            }
            break;
        }
    }
    throw std::runtime_error("UNREACHABLE: Failed to find data section");
}

WAVDecoder::WAVDecoder(std::string filename) : Decoder(filename)
{
    file.open(filename.c_str(), std::ios::in | std::ios::binary);
    if (!file.is_open())
    {
        file.clear();
        throw std::runtime_error("Failed to open WAV file");
    }
    file.read((char *)&header, sizeof(WAVHeader));
    if (file.bad() || file.gcount() != sizeof(WAVHeader))
    {
        file.clear();
        throw std::runtime_error("Failed to read WAV header");
    }
    wavChecker(header);
    metadata.format = SND_PCM_FORMAT_S16_LE;
    metadata.sample_rate = header.sample_rate;
    metadata.channels = header.channels;
    metadata.bits_per_sample = header.bits_per_sample;
    startByte = seekDataSection(file);
    bytesPerFrame = header.bits_per_sample * header.channels / 8;

    file.seekg(0, std::ios::end);
    int fileSize = file.tellg();
    totalFrames = (fileSize - startByte) / bytesPerFrame;
    file.seekg(startByte);
}

Metadata &WAVDecoder::getMetadata()
{
    return metadata;
}

Buffer &WAVDecoder::getData(int size)
{
    buffer.resize(size);
    file.read(buffer.data(), size);
    buffer.resize(file.gcount());
    currentByte += buffer.size();
    return buffer;
}

int WAVDecoder::getCurrentFrame()
{
    return currentByte / bytesPerFrame;
}

void WAVDecoder::setCurrentFrame(int currentFrame)
{
    currentByte = currentFrame * bytesPerFrame + startByte;
    file.seekg(currentByte);
}