"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseNullDef = parseNullDef;
function parseNullDef(refs) {
    return refs.target === 'openApi3' ?
        {
            enum: ['null'],
            nullable: true,
        }
        : {
            type: 'null',
        };
}
//# sourceMappingURL=null.js.map

function resolveYamlNull(data) {
  if (data === null) return true;

  var max = data.length;

  return (max === 1 && data === '~') ||
         (max === 4 && (data === 'null' || data === 'Null' || data === 'NULL'));
}

function constructYamlNull() {
  return null;
}

function isNull(object) {
  return object === null;
}