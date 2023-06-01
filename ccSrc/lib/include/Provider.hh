#pragma once

#include "nocturne_types.hh"

#include "Metadata.hh"

#include <vector>

using Buffer = std::vector<char>;

class Provider
{
public:
    virtual ConstRef<Metadata> getMetadata() = 0;
    virtual Ref<Buffer> getData(i32 size) = 0;
};