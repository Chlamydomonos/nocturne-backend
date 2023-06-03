#include "Queue.hh"

#include <stdexcept>

Queue::Queue(int size)
{
    this->data = new char[size];
    this->dataEnd = this->data + size;
    this->start = this->data;
    this->end = this->data;
}

Queue::~Queue()
{
    delete[] this->data;
}

int Queue::size() const
{
    if (this->end >= this->start)
    {
        return this->end - this->start;
    }
    else
    {
        return this->dataEnd - this->start + this->end - this->data;
    }
}

void Queue::push(const char *from, int size)
{
    if (size > this->dataSize() - this->size())
    {
        throw std::runtime_error("Queue::push: not enough space");
    }
    if (this->end + size <= this->dataEnd)
    {
        std::copy(from, from + size, this->end);
        this->end += size;
    }
    else
    {
        int firstPartSize = this->dataEnd - this->end;
        std::copy(from, from + firstPartSize, this->end);
        std::copy(from + firstPartSize, from + size, this->data);
        this->end = this->data + size - firstPartSize;
    }
}

void Queue::pop(char *to, int size)
{
    if (size > this->size())
    {
        throw std::runtime_error("Queue::pop: not enough data");
    }
    if (this->start + size <= this->dataEnd)
    {
        std::copy(this->start, this->start + size, to);
        this->start += size;
    }
    else
    {
        int firstPartSize = this->dataEnd - this->start;
        std::copy(this->start, this->dataEnd, to);
        std::copy(this->data, this->data + size - firstPartSize, to + firstPartSize);
        this->start = this->data + size - firstPartSize;
    }
}