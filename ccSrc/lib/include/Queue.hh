#pragma once

class Queue
{
private:
    char *data;
    char *dataEnd;
    char *start;
    char *end;
    int dataSize() const { return this->dataEnd - this->data; }

public:
    Queue(int size);
    ~Queue();
    int size() const;
    void push(const char *from, int size);
    void pop(char *to, int size);
};