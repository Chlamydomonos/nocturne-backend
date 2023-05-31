#pragma once

#include "Metadata.hh"

#include <vector>

using Buffer = std::vector<char>;

class Provider
{
public:
    virtual const Metadata &getMetadata() = 0;
    virtual Buffer &getData(int size) = 0;
};