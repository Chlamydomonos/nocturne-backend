#pragma once

#include "Decoder.hh"

#include <deque>

extern "C"
{
#include <libavcodec/avcodec.h>
#include <libavformat/avformat.h>
#include <libavutil/frame.h>
#include <libavutil/mem.h>
}

class FFDecoder : public Decoder
{
private:
    Metadata metadata{};
    std::deque<char> tempBuffer{};
    Buffer buffer{};
    Buffer tempPlanarBuffer{};

    // audio stream format information
    AVFormatContext *formatContext{nullptr};
    int audioStreamIndex = -1;

    // decoder
    AVCodec *codec{nullptr};
    AVCodecContext *codecContext{nullptr};
    AVCodecParameters *codecParameters{nullptr};

    // data
    AVFrame *frame{nullptr};
    AVPacket *packet{nullptr};

    [[nodiscard]] bool nextStream();
    [[nodiscard]] bool precedePacket();
    [[nodiscard]] bool precedeFrame();

    [[nodiscard]] bool getDataInterleave(char **buffer, int *size, unsigned long *frameCount);
    [[nodiscard]] virtual bool getDataPlanar(char ***buffers, int *bytesPerSample, unsigned long *frameCount);

    void handleBuffer(int size);
    bool handleData(char **buffer, int *size, unsigned long *frameCount);

public:
    FFDecoder(std::string fileName);
    ~FFDecoder();
    const Metadata &getMetadata() override;
    Buffer &getData(int size) override;
};