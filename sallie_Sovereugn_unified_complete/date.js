import { truncate } from './helpers.js';
export default function inspectDate(dateObject, options) {
    const stringRepresentation = dateObject.toJSON();
    if (stringRepresentation === null) {
        return 'Invalid Date';
    }
    const split = stringRepresentation.split('T');
    const date = split[0];
    // If we need to - truncate the time portion, but never the date
    return options.stylize(`${date}T${truncate(split[1], options.truncate - date.length - 1)}`, 'date');
}


"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDateDef = parseDateDef;
const errorMessages_1 = require("../errorMessages.js");
function parseDateDef(def, refs, overrideDateStrategy) {
    const strategy = overrideDateStrategy ?? refs.dateStrategy;
    if (Array.isArray(strategy)) {
        return {
            anyOf: strategy.map((item, i) => parseDateDef(def, refs, item)),
        };
    }
    switch (strategy) {
        case 'string':
        case 'format:date-time':
            return {
                type: 'string',
                format: 'date-time',
            };
        case 'format:date':
            return {
                type: 'string',
                format: 'date',
            };
        case 'integer':
            return integerDateParser(def, refs);
    }
}
const integerDateParser = (def, refs) => {
    const res = {
        type: 'integer',
        format: 'unix-time',
    };
    if (refs.target === 'openApi3') {
        return res;
    }
    for (const check of def.checks) {
        switch (check.kind) {
            case 'min':
                (0, errorMessages_1.setResponseValueAndErrors)(res, 'minimum', check.value, // This is in milliseconds
                check.message, refs);
                break;
            case 'max':
                (0, errorMessages_1.setResponseValueAndErrors)(res, 'maximum', check.value, // This is in milliseconds
                check.message, refs);
                break;
        }
    }
    return res;
};
//# sourceMappingURL=date.js.map

import { truncate } from './helpers.js';
export default function inspectDate(dateObject, options) {
    const stringRepresentation = dateObject.toJSON();
    if (stringRepresentation === null) {
        return 'Invalid Date';
    }
    const split = stringRepresentation.split('T');
    const date = split[0];
    // If we need to - truncate the time portion, but never the date
    return options.stylize(`${date}T${truncate(split[1], options.truncate - date.length - 1)}`, 'date');
}


"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDateDef = parseDateDef;
const errorMessages_1 = require("../errorMessages.js");
function parseDateDef(def, refs, overrideDateStrategy) {
    const strategy = overrideDateStrategy ?? refs.dateStrategy;
    if (Array.isArray(strategy)) {
        return {
            anyOf: strategy.map((item, i) => parseDateDef(def, refs, item)),
        };
    }
    switch (strategy) {
        case 'string':
        case 'format:date-time':
            return {
                type: 'string',
                format: 'date-time',
            };
        case 'format:date':
            return {
                type: 'string',
                format: 'date',
            };
        case 'integer':
            return integerDateParser(def, refs);
    }
}
const integerDateParser = (def, refs) => {
    const res = {
        type: 'integer',
        format: 'unix-time',
    };
    if (refs.target === 'openApi3') {
        return res;
    }
    for (const check of def.checks) {
        switch (check.kind) {
            case 'min':
                (0, errorMessages_1.setResponseValueAndErrors)(res, 'minimum', check.value, // This is in milliseconds
                check.message, refs);
                break;
            case 'max':
                (0, errorMessages_1.setResponseValueAndErrors)(res, 'maximum', check.value, // This is in milliseconds
                check.message, refs);
                break;
        }
    }
    return res;
};
//# sourceMappingURL=date.js.map