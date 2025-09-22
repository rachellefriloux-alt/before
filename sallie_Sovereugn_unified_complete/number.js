import { truncate } from './helpers.js';
const isNaN = Number.isNaN || (i => i !== i); // eslint-disable-line no-self-compare
export default function inspectNumber(number, options) {
    if (isNaN(number)) {
        return options.stylize('NaN', 'number');
    }
    if (number === Infinity) {
        return options.stylize('Infinity', 'number');
    }
    if (number === -Infinity) {
        return options.stylize('-Infinity', 'number');
    }
    if (number === 0) {
        return options.stylize(1 / number === Infinity ? '+0' : '-0', 'number');
    }
    return options.stylize(truncate(String(number), options.truncate), 'number');
}
function parseNumberDef(def, refs) {
    const res = {
        type: 'number',
    };
    if (!def.checks)
        return res;
    for (const check of def.checks) {
        switch (check.kind) {
            case 'int':
                res.type = 'integer';
                (0, errorMessages_1.addErrorMessage)(res, 'type', check.message, refs);
                break;
            case 'min':
                if (refs.target === 'jsonSchema7') {
                    if (check.inclusive) {
                        (0, errorMessages_1.setResponseValueAndErrors)(res, 'minimum', check.value, check.message, refs);
                    }
                    else {
                        (0, errorMessages_1.setResponseValueAndErrors)(res, 'exclusiveMinimum', check.value, check.message, refs);
                    }
                }
                else {
                    if (!check.inclusive) {
                        res.exclusiveMinimum = true;
                    }
                    (0, errorMessages_1.setResponseValueAndErrors)(res, 'minimum', check.value, check.message, refs);
                }
                break;
            case 'max':
                if (refs.target === 'jsonSchema7') {
                    if (check.inclusive) {
                        (0, errorMessages_1.setResponseValueAndErrors)(res, 'maximum', check.value, check.message, refs);
                    }
                    else {
                        (0, errorMessages_1.setResponseValueAndErrors)(res, 'exclusiveMaximum', check.value, check.message, refs);
                    }
                }
                else {
                    if (!check.inclusive) {
                        res.exclusiveMaximum = true;
                    }
                    (0, errorMessages_1.setResponseValueAndErrors)(res, 'maximum', check.value, check.message, refs);
                }
                break;
            case 'multipleOf':
                (0, errorMessages_1.setResponseValueAndErrors)(res, 'multipleOf', check.value, check.message, refs);
                break;
        }
    }
    return res;
}
//# sourceMappingURL=number.js.map
