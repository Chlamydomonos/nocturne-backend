#pragma once

#include "Effector.hh"

class SpeedEffector : public Effector
{
private:
    int speedPercent{100};
    Buffer buffer;

public:
    SpeedEffector(Ref<Provider> parent) : Effector(parent) {}

    void setSpeedPercent(i32 speedPercent) { this->speedPercent = speedPercent; }
    i32 getSpeedPercent() const { return speedPercent; }
    f64 getRealSpeed(i32 size) const;

    Ref<Buffer> getData(i32 size) override;
};