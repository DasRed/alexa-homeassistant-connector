import fs from 'fs';
import {handler} from './index.js';
import payload from './payload/index.js';

const type = process.argv[2];
if (payload[type] === undefined) {
    console.error(`Payload type is not defined or not valid. Following types are allowed: ${Object.keys(payload)}`);
    process.exit(1);
}

if (process.env.AHC_HOMEASSISTANT_HOST === undefined) {
    console.error(`Environment variable AHC_HOMEASSISTANT_HOST is not defined.`);
    process.exit(1);
}

if (process.env.AHC_HOMEASSISTANT_TOKEN === undefined) {
    console.error(`Environment variable AHC_HOMEASSISTANT_TOKEN is not defined.`);
    process.exit(1);
}

const result = await handler(payload[type]);
fs.writeFileSync('./out.json', JSON.stringify(result, null, 4));
console.log(result.event);
