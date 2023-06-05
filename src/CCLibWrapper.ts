import * as path from 'path';
import * as fs from 'fs';
import { CType_Metadata } from './generated/types';
let ccLibPath = path.resolve(__dirname, '../build/Release/ccLib.node');
if (!fs.existsSync(ccLibPath)) {
    ccLibPath = path.resolve(__dirname, '../build/Debug/ccLib.node');
}
const ccLib = require(ccLibPath);

export function getSampleRate(metadata: CType_Metadata) {
    return ccLib.getSampleRate(metadata.value);
}
