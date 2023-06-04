#pragma once

#include "Provider.hh"

class Effector : public Provider
{
protected:
    Provider &parent;
    Effector(Provider &parent) : parent(parent) {}

public:
    virtual Ref<Metadata> getMetadata() override { return parent.getMetadata(); }
};