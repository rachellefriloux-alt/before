import { inspectList } from './helpers.js';
function inspectMapEntry([key, value], options) {
    options.truncate -= 4;
    key = options.inspect(key, options);
    options.truncate -= key.length;
    value = options.inspect(value, options);
    return `${key} => ${value}`;
}
// IE11 doesn't support `map.entries()`
function mapToEntries(map) {
    const entries = [];
    map.forEach((value, key) => {
        entries.push([key, value]);
    });
    return entries;
}
export default function inspectMap(map, options) {
    if (map.size === 0)
        return 'Map{}';
    options.truncate -= 7;
    return `Map{ ${inspectList(mapToEntries(map), options, inspectMapEntry)} }`;
}


"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseMapDef = parseMapDef;
const parseDef_1 = require("../parseDef.js");
const record_1 = require("./record.js");
function parseMapDef(def, refs) {
    if (refs.mapStrategy === 'record') {
        return (0, record_1.parseRecordDef)(def, refs);
    }
    const keys = (0, parseDef_1.parseDef)(def.keyType._def, {
        ...refs,
        currentPath: [...refs.currentPath, 'items', 'items', '0'],
    }) || {};
    const values = (0, parseDef_1.parseDef)(def.valueType._def, {
        ...refs,
        currentPath: [...refs.currentPath, 'items', 'items', '1'],
    }) || {};
    return {
        type: 'array',
        maxItems: 125,
        items: {
            type: 'array',
            items: [keys, values],
            minItems: 2,
            maxItems: 2,
        },
    };
}
//# sourceMappingURL=map.js.map

var concatMap = require('../');
var xs = [ 1, 2, 3, 4, 5, 6 ];
var ys = concatMap(xs, function (x) {
    return x % 2 ? [ x - 0.1, x, x + 0.1 ] : [];
});
console.dir(ys);


var concatMap = require('../');
var test = require('tape');

test('empty or not', function (t) {
    var xs = [ 1, 2, 3, 4, 5, 6 ];
    var ixes = [];
    var ys = concatMap(xs, function (x, ix) {
        ixes.push(ix);
        return x % 2 ? [ x - 0.1, x, x + 0.1 ] : [];
    });
    t.same(ys, [ 0.9, 1, 1.1, 2.9, 3, 3.1, 4.9, 5, 5.1 ]);
    t.same(ixes, [ 0, 1, 2, 3, 4, 5 ]);
    t.end();
});

test('always something', function (t) {
    var xs = [ 'a', 'b', 'c', 'd' ];
    var ys = concatMap(xs, function (x) {
        return x === 'b' ? [ 'B', 'B', 'B' ] : [ x ];
    });
    t.same(ys, [ 'a', 'B', 'B', 'B', 'c', 'd' ]);
    t.end();
});

test('scalars', function (t) {
    var xs = [ 'a', 'b', 'c', 'd' ];
    var ys = concatMap(xs, function (x) {
        return x === 'b' ? [ 'B', 'B', 'B' ] : x;
    });
    t.same(ys, [ 'a', 'B', 'B', 'B', 'c', 'd' ]);
    t.end();
});

test('undefs', function (t) {
    var xs = [ 'a', 'b', 'c', 'd' ];
    var ys = concatMap(xs, function () {});
    t.same(ys, [ undefined, undefined, undefined, undefined ]);
    t.end();
});


'use strict';

var Type = require('../type');

module.exports = new Type('tag:yaml.org,2002:map', {
  kind: 'mapping',
  construct: function (data) { return data !== null ? data : {}; }
});


import { inspectList } from './helpers.js';
function inspectMapEntry([key, value], options) {
    options.truncate -= 4;
    key = options.inspect(key, options);
    options.truncate -= key.length;
    value = options.inspect(value, options);
    return `${key} => ${value}`;
}
// IE11 doesn't support `map.entries()`
function mapToEntries(map) {
    const entries = [];
    map.forEach((value, key) => {
        entries.push([key, value]);
    });
    return entries;
}
export default function inspectMap(map, options) {
    if (map.size === 0)
        return 'Map{}';
    options.truncate -= 7;
    return `Map{ ${inspectList(mapToEntries(map), options, inspectMapEntry)} }`;
}


"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseMapDef = parseMapDef;
const parseDef_1 = require("../parseDef.js");
const record_1 = require("./record.js");
function parseMapDef(def, refs) {
    if (refs.mapStrategy === 'record') {
        return (0, record_1.parseRecordDef)(def, refs);
    }
    const keys = (0, parseDef_1.parseDef)(def.keyType._def, {
        ...refs,
        currentPath: [...refs.currentPath, 'items', 'items', '0'],
    }) || {};
    const values = (0, parseDef_1.parseDef)(def.valueType._def, {
        ...refs,
        currentPath: [...refs.currentPath, 'items', 'items', '1'],
    }) || {};
    return {
        type: 'array',
        maxItems: 125,
        items: {
            type: 'array',
            items: [keys, values],
            minItems: 2,
            maxItems: 2,
        },
    };
}
//# sourceMappingURL=map.js.map