'use strict';

/*eslint-disable max-len*/

var YAMLException = require('./exception');
var Type          = require('./type');


function compileList(schema, name) {
  var result = [];

  schema[name].forEach(function (currentType) {
    var newIndex = result.length;

    result.forEach(function (previousType, previousIndex) {
      if (previousType.tag === currentType.tag &&
          previousType.kind === currentType.kind &&
          previousType.multi === currentType.multi) {

        newIndex = previousIndex;
      }
    });

    result[newIndex] = currentType;
  });

  return result;
}


function compileMap(/* lists... */) {
  var result = {
        scalar: {},
        sequence: {},
        mapping: {},
        fallback: {},
        multi: {
          scalar: [],
          sequence: [],
          mapping: [],
          fallback: []
        }
      }, index, length;

  function collectType(type) {
    if (type.multi) {
      result.multi[type.kind].push(type);
      result.multi['fallback'].push(type);
    } else {
      result[type.kind][type.tag] = result['fallback'][type.tag] = type;
    }
  }

  for (index = 0, length = arguments.length; index < length; index += 1) {
    arguments[index].forEach(collectType);
  }
  return result;
}


function Schema(definition) {
  return this.extend(definition);
}


Schema.prototype.extend = function extend(definition) {
  var implicit = [];
  var explicit = [];

  if (definition instanceof Type) {
    // Schema.extend(type)
    explicit.push(definition);

  } else if (Array.isArray(definition)) {
    // Schema.extend([ type1, type2, ... ])
    explicit = explicit.concat(definition);

  } else if (definition && (Array.isArray(definition.implicit) || Array.isArray(definition.explicit))) {
    // Schema.extend({ explicit: [ type1, type2, ... ], implicit: [ type1, type2, ... ] })
    if (definition.implicit) implicit = implicit.concat(definition.implicit);
    if (definition.explicit) explicit = explicit.concat(definition.explicit);

  } else {
    throw new YAMLException('Schema.extend argument should be a Type, [ Type ], ' +
      'or a schema definition ({ implicit: [...], explicit: [...] })');
  }

  implicit.forEach(function (type) {
    if (!(type instanceof Type)) {
      throw new YAMLException('Specified list of YAML types (or a single Type object) contains a non-Type object.');
    }

    if (type.loadKind && type.loadKind !== 'scalar') {
      throw new YAMLException('There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.');
    }

    if (type.multi) {
      throw new YAMLException('There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.');
    }
  });

  explicit.forEach(function (type) {
    if (!(type instanceof Type)) {
      throw new YAMLException('Specified list of YAML types (or a single Type object) contains a non-Type object.');
    }
  });

  var result = Object.create(Schema.prototype);

  result.implicit = (this.implicit || []).concat(implicit);
  result.explicit = (this.explicit || []).concat(explicit);

  result.compiledImplicit = compileList(result, 'implicit');
  result.compiledExplicit = compileList(result, 'explicit');
  result.compiledTypeMap  = compileMap(result.compiledImplicit, result.compiledExplicit);

  return result;
};


module.exports = Schema;


function subschema(keyword) {
  var sch = {
    properties: {},
    additionalProperties: false,
    additionalItems: false,
    anyOf: [
      {format: 'email'},
      {format: 'hostname'}
    ]
  };
  sch.properties['foo_' + keyword] = {title: 'foo'};
  sch.properties['bar_' + keyword] = {title: 'bar'};
  return sch;
}


function expectedCalls(keyword) {
  return [
    [schema[keyword], `/${keyword}`, schema, '', keyword, schema, undefined],
    [schema[keyword].properties[`foo_${keyword}`], `/${keyword}/properties/foo_${keyword}`, schema, `/${keyword}`, 'properties', schema[keyword], `foo_${keyword}`],
    [schema[keyword].properties[`bar_${keyword}`], `/${keyword}/properties/bar_${keyword}`, schema, `/${keyword}`, 'properties', schema[keyword], `bar_${keyword}`],
    [schema[keyword].anyOf[0], `/${keyword}/anyOf/0`, schema, `/${keyword}`, 'anyOf', schema[keyword], 0],
    [schema[keyword].anyOf[1], `/${keyword}/anyOf/1`, schema, `/${keyword}`, 'anyOf', schema[keyword], 1]
  ];
}


function expectedCallsChild(keyword, i) {
  return [
    [schema[keyword][i], `/${keyword}/${i}`, schema, '', keyword, schema, i],
    [schema[keyword][i].properties[`foo_${keyword}_${i}`], `/${keyword}/${i}/properties/foo_${keyword}_${i}`, schema, `/${keyword}/${i}`, 'properties', schema[keyword][i], `foo_${keyword}_${i}`],
    [schema[keyword][i].properties[`bar_${keyword}_${i}`], `/${keyword}/${i}/properties/bar_${keyword}_${i}`, schema, `/${keyword}/${i}`, 'properties', schema[keyword][i], `bar_${keyword}_${i}`],
    [schema[keyword][i].anyOf[0], `/${keyword}/${i}/anyOf/0`, schema, `/${keyword}/${i}`, 'anyOf', schema[keyword][i], 0],
    [schema[keyword][i].anyOf[1], `/${keyword}/${i}/anyOf/1`, schema, `/${keyword}/${i}`, 'anyOf', schema[keyword][i], 1]
  ];
}
