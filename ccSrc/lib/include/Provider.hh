#pragma once

#include "nocturne_types.hh"

#include "Metadata.hh"

#include <vector>
#include <mutex>
#include <thread>

using Buffer = std::vector<char>;

#define LOCK std::scoped_lock<std::mutex> _$lock(mutex)

class Provider
{
protected:
    std::mutex mutex;
public:
    virtual Ref<Metadata> getMetadata() = 0;
    virtual Ref<Buffer> getData(i32 size) = 0;
};