#pragma once

#include "Metadata.hh"

#include <vector>

using Buffer = std::vector<char>;

class Provider
{
    virtual Metadata &getMetadata() = 0;
    virtual Buffer &getData(int size) = 0;
};