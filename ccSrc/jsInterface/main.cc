#include "index.hh"
#include <napi.h>

static Napi::Object Init(Napi::Env env, Napi::Object exports)
{
    initAll(env, exports);
    return exports;
}

NODE_API_MODULE(ccLib, Init)