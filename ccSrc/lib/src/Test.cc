#include "Test.hh"
#include <cstdio>

Test::Test()
{
    printf("Test::Test()\n");
}

Test::~Test()
{
    printf("Test::~Test()\n");
}

void Test::print()
{
    printf("Test::print()\n");
}