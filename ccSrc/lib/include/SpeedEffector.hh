#pragma once

#include "Effector.hh"

#include <mutex>

class SpeedEffector : public Effector
{
private:
    int speedPercent{100};
    Buffer buffer;

    std::mutex mutex{};

public:
    SpeedEffector(Ref<Provider> parent) : Effector(parent) {}

    void setSpeedPercent(i32 speedPercent)
    {
        std::scoped_lock lock(mutex);
        this->speedPercent = speedPercent;
    }
    i32 getSpeedPercent() const { return speedPercent; }
    f64 getRealSpeed(i32 size) const;

    Ref<Buffer> getData(i32 size) override;
};