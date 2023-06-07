#pragma once

#include "Effector.hh"

class SpeedEffector : public Effector
{
private:
    int speedPercent{100};
    Buffer buffer;

public:
    SpeedEffector(Ref<Provider> parent) : Effector(parent) {}

    void setSpeedPercent(i32 speedPercent);
    i32 getSpeedPercent();
    f64 getRealSpeed(i32 size);

    Ref<Buffer> getData(i32 size) override;
};