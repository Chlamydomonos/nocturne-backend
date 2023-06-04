#pragma once

#include "Provider.hh"

#include <string>

class Decoder : public Provider
{
protected:
    std::string fileName;
    Decoder(std::string fileName) : fileName(fileName) {}

public:
    virtual i32 getCurrentFrame() = 0;
    virtual void setCurrentFrame(i32 currentFrame) = 0;
};