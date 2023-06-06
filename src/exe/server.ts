#!/usr/bin/env node

import express from 'express';
import cors from 'cors';

import Nocturne from '../Nocturne';

export default class NocturneServerWrapper {
    private nocturne = new Nocturne();
    private static OBJ_FIELDS = new Set<string>(Object.getOwnPropertyNames(Object.prototype));

    getNocturneValue(key: string) {
        const separatedKey = key.split('.');
        let value: any = this.nocturne;
        for (const k of separatedKey) {
            value = value[k];
        }
        return value;
    }

    invokeNocturneFunction(key: string, ...args: any[]) {
        const separatedKey = key.split('.');
        const last = separatedKey.pop()!;
        let value: any = this.nocturne;
        for (const k of separatedKey) {
            value = value[k];
        }
        return value[last](...args);
    }

    private findKey(key: string) {
        const separatedKey = key.split('.');
        let value: any = this.nocturne;
        for (const k of separatedKey) {
            value = value[k];
            if (!value) {
                console.log(`Key ${key} not found`);
                return null;
            }
        }
        return value;
    }

    private listKeys(obj: any) {
        const prototype = Object.getPrototypeOf(obj);
        const result = Object.getOwnPropertyNames(obj);
        if (prototype) {
            const result2 = Object.getOwnPropertyNames(prototype);
            for (const key of result2) {
                if (!NocturneServerWrapper.OBJ_FIELDS.has(key)) {
                    result.push(key);
                }
            }
        }
        return result;
    }

    buildKeys() {
        console.log('Build Keys');
        const queue: string[] = [];
        for (const key of this.listKeys(this.nocturne)) {
            if (typeof key == 'string' && (<any>this.nocturne)[key]) {
                queue.push(key);
            }
        }

        const keys: Record<string, 'function' | 'value'> = {};
        while (queue.length > 0) {
            const key = queue.shift()!;
            console.log('Key:', key);
            const value = this.findKey(key);
            if (!value) {
                continue;
            }
            console.log('keys:', this.listKeys(value));
            if (this.nocturne.isIgnored(key)) {
                console.log('Ignored:', key);
                continue;
            }
            if (typeof value == 'object') {
                for (const k of this.listKeys(value)) {
                    if (typeof k == 'string') {
                        queue.push(`${key}.${k}`);
                    }
                }
            } else {
                if (typeof value == 'function') {
                    keys[key] = 'function';
                } else {
                    keys[key] = 'value';
                }
            }
        }
        console.log('Keys:', JSON.stringify(keys));
        return JSON.stringify(keys);
    }
}

const app = express();
app.use(express.json());
app.use(cors());

const nocturne = new NocturneServerWrapper();

setInterval(() => {
    nocturne;
}, 1000); // persist nocturne

app.get('/keys', (_req, res) => {
    res.send(nocturne.buildKeys());
});

app.post('/get-nocturne-value', (req, res) => {
    const { key } = req.body;
    res.send({ result: nocturne.getNocturneValue(key) });
});

app.post('/invoke-nocturne-function', (req, res) => {
    const { key, args } = req.body;
    res.send({ result: nocturne.invokeNocturneFunction(key, ...args) });
});

app.listen(3018, () => {
    console.log('Server started at port 3018');
});
