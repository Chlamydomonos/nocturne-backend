#include <string>

using i8 = char;
using i16 = short;
using i32 = int;
using i64 = long long;
using u8 = unsigned char;
using u16 = unsigned short;
using u32 = unsigned int;
using u64 = unsigned long long;
using f32 = float;
using f64 = double;
using String = std::string;
using ConstString = const std::string &;
using CString = const char *;

template <typename T>
using Ref = T &;

template <typename T>
using ConstRef = const T &;

template <typename T>
using HasDefault = T;