"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDefaultDef = parseDefaultDef;
const parseDef_1 = require("../parseDef.js");
function parseDefaultDef(_def, refs) {
    return {
        ...(0, parseDef_1.parseDef)(_def.innerType._def, refs),
        default: _def.defaultValue(),
    };
}
//# sourceMappingURL=default.js.map

// JS-YAML's default schema for `safeLoad` function.
// It is not described in the YAML specification.
//
// This schema is based on standard YAML's Core schema and includes most of
// extra types described at YAML tag repository. (http://yaml.org/type/)


'use strict';


module.exports = require('./core').extend({
  implicit: [
    require('../type/timestamp'),
    require('../type/merge')
  ],
  explicit: [
    require('../type/binary'),
    require('../type/omap'),
    require('../type/pairs'),
    require('../type/set')
  ]
});


"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDefaultDef = parseDefaultDef;
const parseDef_1 = require("../parseDef.js");
function parseDefaultDef(_def, refs) {
    return {
        ...(0, parseDef_1.parseDef)(_def.innerType._def, refs),
        default: _def.defaultValue(),
    };
}
//# sourceMappingURL=default.js.map