'use strict';

var callBind = require('call-bind-apply-helpers');
var gOPD = require('gopd');
var $TypeError = require('es-errors/type');

/** @type {{ __proto__?: object | null }} */
var obj = {};
try {
	obj.__proto__ = null; // eslint-disable-line no-proto
} catch (e) {
	if (!e || typeof e !== 'object' || !('code' in e) || e.code !== 'ERR_PROTO_ACCESS') {
		throw e;
	}
}

var hasProtoMutator = !('toString' in obj);

// eslint-disable-next-line no-extra-parens
var desc = gOPD && gOPD(Object.prototype, /** @type {keyof typeof Object.prototype} */ ('__proto__'));

/** @type {import('./set')} */
module.exports = hasProtoMutator && (
// eslint-disable-next-line no-extra-parens
	(!!desc && typeof desc.set === 'function' && /** @type {import('./set')} */ (callBind([desc.set])))
	|| /** @type {import('./set')} */ function setDunder(object, proto) {
		// this is node v0.10 or older, which doesn't have Object.setPrototypeOf and has undeniable __proto__
		if (object == null) { // eslint-disable-line eqeqeq
			throw new $TypeError('set Object.prototype.__proto__ called on null or undefined');
		}
		// eslint-disable-next-line no-proto, no-param-reassign, no-extra-parens
		/** @type {{ __proto__?: object | null }} */ (object).__proto__ = proto;
		return proto;
	}
);
// IE11 doesn't support `Array.from(set)`
function arrayFromSet(set) {
    const values = [];
    set.forEach(value => {
        values.push(value);
    });
    return values;
}

function inspectSet(set, options) {
    if (set.size === 0)
        return 'Set{}';
    options.truncate -= 7;
    return `Set{ ${inspectList(arrayFromSet(set), options)} }`;
}


"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSetDef = parseSetDef;
const errorMessages_1 = require("../errorMessages.js");
const parseDef_1 = require("../parseDef.js");
function parseSetDef(def, refs) {
    const items = (0, parseDef_1.parseDef)(def.valueType._def, {
        ...refs,
        currentPath: [...refs.currentPath, 'items'],
    });
    const schema = {
        type: 'array',
        uniqueItems: true,
        items,
    };
    if (def.minSize) {
        (0, errorMessages_1.setResponseValueAndErrors)(schema, 'minItems', def.minSize.value, def.minSize.message, refs);
    }
    if (def.maxSize) {
        (0, errorMessages_1.setResponseValueAndErrors)(schema, 'maxItems', def.maxSize.value, def.maxSize.message, refs);
    }
    return schema;
}
//# sourceMappingURL=set.js.map

'use strict';

var callBind = require('call-bind-apply-helpers');
var gOPD = require('gopd');
var $TypeError = require('es-errors/type');

/** @type {{ __proto__?: object | null }} */
var obj = {};
try {
	obj.__proto__ = null; // eslint-disable-line no-proto
} catch (e) {
	if (!e || typeof e !== 'object' || !('code' in e) || e.code !== 'ERR_PROTO_ACCESS') {
		throw e;
	}
}

var hasProtoMutator = !('toString' in obj);

// eslint-disable-next-line no-extra-parens
var desc = gOPD && gOPD(Object.prototype, /** @type {keyof typeof Object.prototype} */ ('__proto__'));

/** @type {import('./set')} */
module.exports = hasProtoMutator && (
// eslint-disable-next-line no-extra-parens
	(!!desc && typeof desc.set === 'function' && /** @type {import('./set')} */ (callBind([desc.set])))
	|| /** @type {import('./set')} */ function setDunder(object, proto) {
		// this is node v0.10 or older, which doesn't have Object.setPrototypeOf and has undeniable __proto__
		if (object == null) { // eslint-disable-line eqeqeq
			throw new $TypeError('set Object.prototype.__proto__ called on null or undefined');
		}
		// eslint-disable-next-line no-proto, no-param-reassign, no-extra-parens
		/** @type {{ __proto__?: object | null }} */ (object).__proto__ = proto;
		return proto;
	}
);


'use strict';

var test = require('tape');

var setDunderProto = require('../set');

test('setDunderProto', { skip: !setDunderProto }, function (t) {
	if (!setDunderProto) {
		throw 'should never happen; this is just for type narrowing'; // eslint-disable-line no-throw-literal
	}

	// @ts-expect-error
	t['throws'](function () { setDunderProto(); }, TypeError, 'throws if no arguments');
	// @ts-expect-error
	t['throws'](function () { setDunderProto(undefined); }, TypeError, 'throws with undefined and nothing');
	// @ts-expect-error
	t['throws'](function () { setDunderProto(undefined, undefined); }, TypeError, 'throws with undefined and undefined');
	// @ts-expect-error
	t['throws'](function () { setDunderProto(null); }, TypeError, 'throws with null and undefined');
	// @ts-expect-error
	t['throws'](function () { setDunderProto(null, undefined); }, TypeError, 'throws with null and undefined');

	/** @type {{ inherited?: boolean }} */
	var obj = {};
	t.ok('toString' in obj, 'object initially has toString');

	setDunderProto(obj, null);
	t.notOk('toString' in obj, 'object no longer has toString');

	t.notOk('inherited' in obj, 'object lacks inherited property');
	setDunderProto(obj, { inherited: true });
	t.equal(obj.inherited, true, 'object has inherited property');

	t.end();
});

test('no dunder proto', { skip: !!setDunderProto }, function (t) {
	if ('__proto__' in Object.prototype) {
		t['throws'](
			// @ts-expect-error
			function () { ({}).__proto__ = null; }, // eslint-disable-line no-proto
			Error,
			'throws when setting Object.prototype.__proto__'
		);
	} else {
		t.notOk('__proto__' in Object.prototype, 'no __proto__ in Object.prototype');
	}

	t.end();
});


'use strict';

var Type = require('../type');

var _hasOwnProperty = Object.prototype.hasOwnProperty;

function resolveYamlSet(data) {
  if (data === null) return true;

  var key, object = data;

  for (key in object) {
    if (_hasOwnProperty.call(object, key)) {
      if (object[key] !== null) return false;
    }
  }

  return true;
}

function constructYamlSet(data) {
  return data !== null ? data : {};
}

module.exports = new Type('tag:yaml.org,2002:set', {
  kind: 'mapping',
  resolve: resolveYamlSet,
  construct: constructYamlSet
});


import { inspectList } from './helpers.js';
// IE11 doesn't support `Array.from(set)`
function arrayFromSet(set) {
    const values = [];
    set.forEach(value => {
        values.push(value);
    });
    return values;
}
export default function inspectSet(set, options) {
    if (set.size === 0)
        return 'Set{}';
    options.truncate -= 7;
    return `Set{ ${inspectList(arrayFromSet(set), options)} }`;
}


"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSetDef = parseSetDef;
const errorMessages_1 = require("../errorMessages.js");
const parseDef_1 = require("../parseDef.js");
function parseSetDef(def, refs) {
    const items = (0, parseDef_1.parseDef)(def.valueType._def, {
        ...refs,
        currentPath: [...refs.currentPath, 'items'],
    });
    const schema = {
        type: 'array',
        uniqueItems: true,
        items,
    };
    if (def.minSize) {
        (0, errorMessages_1.setResponseValueAndErrors)(schema, 'minItems', def.minSize.value, def.minSize.message, refs);
    }
    if (def.maxSize) {
        (0, errorMessages_1.setResponseValueAndErrors)(schema, 'maxItems', def.maxSize.value, def.maxSize.message, refs);
    }
    return schema;
}
//# sourceMappingURL=set.js.map