#pragma once

#include "nocturne_types.hh"

#include "Decoder.hh"
#include "Queue.hh"

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
    Queue queue{65536};
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

    int currentByte{0};
    int bytesPerFrame;
    int totalFrames;

public:
    FFDecoder(String fileName);
    virtual ~FFDecoder();
    Ref<Metadata> getMetadata() override;
    Ref<Buffer> getData(i32 size) override;
    i32 getCurrentFrame() override;
    void setCurrentFrame(i32 currentFrame) override;
    i32 getTotalFrames() override { return totalFrames; }
};