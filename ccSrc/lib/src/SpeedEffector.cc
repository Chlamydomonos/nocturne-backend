#include "SpeedEffector.hh"

#include <stdexcept>

#define BIG_FRAME_SIZE 24 // 24 bytes, 一定是整数个frame
#define SECTION_FRAME_COUNT 256
#define SECTION_SIZE (BIG_FRAME_SIZE * SECTION_FRAME_COUNT)

Ref<Buffer> SpeedEffector::getData(i32 size)
{
    if (size < SECTION_SIZE)
    {
        throw std::runtime_error("SpeedEffector::getData: size too small, must be greater than " + std::to_string(SECTION_SIZE));
    }

    buffer.resize(size);
    int neededFrames = (size * speedPercent / 100) / BIG_FRAME_SIZE;
    int neededSize = neededFrames * BIG_FRAME_SIZE;
    int bytesInSection = static_cast<int>(100.0 / speedPercent * SECTION_FRAME_COUNT) * BIG_FRAME_SIZE;

    Buffer &parentBuffer = parent.getData(neededSize);

    int bufferIndex = 0, parentBufferIndex = 0;
    if (bytesInSection <= SECTION_SIZE)
    {
        for (parentBufferIndex = 0; parentBufferIndex < neededSize; parentBufferIndex += SECTION_SIZE)
        {
            std::copy(parentBuffer.begin() + parentBufferIndex, parentBuffer.begin() + parentBufferIndex + bytesInSection, buffer.begin() + bufferIndex);
            bufferIndex += bytesInSection;
        }
    }
    else
    {
        for (parentBufferIndex = 0; parentBufferIndex < neededSize; parentBufferIndex += SECTION_SIZE)
        {
            std::copy(parentBuffer.begin() + parentBufferIndex, parentBuffer.begin() + parentBufferIndex + SECTION_SIZE, buffer.begin() + bufferIndex);
            std::copy(parentBuffer.begin() + parentBufferIndex, parentBuffer.begin() + parentBufferIndex + bytesInSection - SECTION_SIZE, buffer.begin() + bufferIndex + SECTION_SIZE);
            bufferIndex += bytesInSection;
        }
    }

    if (bufferIndex < size)
    {
        parentBufferIndex -= size - bufferIndex;
        std::copy(parentBuffer.begin() + parentBufferIndex, parentBuffer.end(), buffer.begin() + bufferIndex);
    }

    return buffer;
}

double SpeedEffector::getRealSpeed(int size) const
{
    int neededFrames = (size * speedPercent / 100) / BIG_FRAME_SIZE;
    int neededSize = neededFrames * BIG_FRAME_SIZE;
    return static_cast<double>(size) / neededSize;
}