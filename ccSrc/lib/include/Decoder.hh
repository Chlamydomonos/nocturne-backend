#pragma once

#include "Provider.hh"

#include <string>

class Decoder : public Provider
{
protected:
    std::string fileName;
    Decoder(std::string fileName) : fileName(fileName) {}
};