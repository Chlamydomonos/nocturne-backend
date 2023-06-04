#include "index.hh"
#include <napi.h>

#define PARSE_WRAPPER(x, type) x.IsExternal() ? x.As<Napi::External<type>>().Data() : x.As<Napi::Object>().Get("getValue").As<Napi::Function>().Call(x, {}).As<Napi::External<type>>().Data()

static Napi::Value getSampleRate(const Napi::CallbackInfo &info)
{
    auto env = info.Env();
    auto &arg = info[0];
    auto metadata = PARSE_WRAPPER(arg, Metadata);
    printf("sample rate: %d\n", metadata->sample_rate);
    return Napi::Number::New(env, metadata->sample_rate);
}

static Napi::Object Init(Napi::Env env, Napi::Object exports)
{
    initAll(env, exports);
    exports.Set("getSampleRate", Napi::Function::New(env, getSampleRate));
    return exports;
}

NODE_API_MODULE(ccLib, Init)