"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isKeyword = isKeyword;
exports.isReservedWord = isReservedWord;
exports.isStrictBindOnlyReservedWord = isStrictBindOnlyReservedWord;
exports.isStrictBindReservedWord = isStrictBindReservedWord;
exports.isStrictReservedWord = isStrictReservedWord;
const reservedWords = {
  keyword: ["break", "case", "catch", "continue", "debugger", "default", "do", "else", "finally", "for", "function", "if", "return", "switch", "throw", "try", "var", "const", "while", "with", "new", "this", "super", "class", "extends", "export", "import", "null", "true", "false", "in", "instanceof", "typeof", "void", "delete"],
  strict: ["implements", "interface", "let", "package", "private", "protected", "public", "static", "yield"],
  strictBind: ["eval", "arguments"]
};
const keywords = new Set(reservedWords.keyword);
const reservedWordsStrictSet = new Set(reservedWords.strict);
const reservedWordsStrictBindSet = new Set(reservedWords.strictBind);
function isReservedWord(word, inModule) {
  return inModule && word === "await" || word === "enum";
}
function isStrictReservedWord(word, inModule) {
  return isReservedWord(word, inModule) || reservedWordsStrictSet.has(word);
}
function isStrictBindOnlyReservedWord(word) {
  return reservedWordsStrictBindSet.has(word);
}
function isStrictBindReservedWord(word, inModule) {
  return isStrictReservedWord(word, inModule) || isStrictBindOnlyReservedWord(word);
}
function isKeyword(word) {
  return keywords.has(word);
}

//# sourceMappingURL=keyword.js.map


/**
 * Define custom keyword
 * @this  Ajv
 * @param {String} keyword custom keyword, should be unique (including different from all standard, custom and macro keywords).
 * @param {Object} definition keyword definition object with properties `type` (type(s) which the keyword applies to), `validate` or `compile`.
 * @return {Ajv} this for method chaining
 */
function addKeyword(keyword, definition) {
  /* jshint validthis: true */
  /* eslint no-shadow: 0 */
  var RULES = this.RULES;
  if (RULES.keywords[keyword])
    throw new Error('Keyword ' + keyword + ' is already defined');

  if (!IDENTIFIER.test(keyword))
    throw new Error('Keyword ' + keyword + ' is not a valid identifier');

  if (definition) {
    this.validateKeyword(definition, true);

    var dataType = definition.type;
    if (Array.isArray(dataType)) {
      for (var i=0; i<dataType.length; i++)
        _addRule(keyword, dataType[i], definition);
    } else {
      _addRule(keyword, dataType, definition);
    }

    var metaSchema = definition.metaSchema;
    if (metaSchema) {
      if (definition.$data && this._opts.$data) {
        metaSchema = {
          anyOf: [
            metaSchema,
            { '$ref': 'https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#' }
          ]
        };
      }
      definition.validateSchema = this.compile(metaSchema, true);
    }
  }

  RULES.keywords[keyword] = RULES.all[keyword] = true;


  function _addRule(keyword, dataType, definition) {
    var ruleGroup;
    for (var i=0; i<RULES.length; i++) {
      var rg = RULES[i];
      if (rg.type == dataType) {
        ruleGroup = rg;
        break;
      }
    }

    if (!ruleGroup) {
      ruleGroup = { type: dataType, rules: [] };
      RULES.push(ruleGroup);
    }

    var rule = {
      keyword: keyword,
      definition: definition,
      custom: true,
      code: customRuleCode,
      implements: definition.implements
    };
    ruleGroup.rules.push(rule);
    RULES.custom[keyword] = rule;
  }

  return this;
}


function _addRule(keyword, dataType, definition) {
  var ruleGroup;
  for (var i=0; i<RULES.length; i++) {
    var rg = RULES[i];
    if (rg.type == dataType) {
      ruleGroup = rg;
      break;
    }
  }

  if (!ruleGroup) {
    ruleGroup = { type: dataType, rules: [] };
    RULES.push(ruleGroup);
  }

  var rule = {
    keyword: keyword,
    definition: definition,
    custom: true,
    code: customRuleCode,
    implements: definition.implements
  };
  ruleGroup.rules.push(rule);
  RULES.custom[keyword] = rule;
}


/**
 * Get keyword
 * @this  Ajv
 * @param {String} keyword pre-defined or custom keyword.
 * @return {Object|Boolean} custom keyword definition, `true` if it is a predefined keyword, `false` otherwise.
 */
function getKeyword(keyword) {
  /* jshint validthis: true */
  var rule = this.RULES.custom[keyword];
  return rule ? rule.definition : this.RULES.keywords[keyword] || false;
}


/**
 * Remove keyword
 * @this  Ajv
 * @param {String} keyword pre-defined or custom keyword.
 * @return {Ajv} this for method chaining
 */
function removeKeyword(keyword) {
  /* jshint validthis: true */
  var RULES = this.RULES;
  delete RULES.keywords[keyword];
  delete RULES.all[keyword];
  delete RULES.custom[keyword];
  for (var i=0; i<RULES.length; i++) {
    var rules = RULES[i].rules;
    for (var j=0; j<rules.length; j++) {
      if (rules[j].keyword == keyword) {
        rules.splice(j, 1);
        break;
      }
    }
  }
  return this;
}


/**
 * Validate keyword definition
 * @this  Ajv
 * @param {Object} definition keyword definition object.
 * @param {Boolean} throwError true to throw exception if definition is invalid
 * @return {boolean} validation result
 */
function validateKeyword(definition, throwError) {
  validateKeyword.errors = null;
  var v = this._validateKeyword = this._validateKeyword
                                  || this.compile(definitionSchema, true);

  if (v(definition)) return true;
  validateKeyword.errors = v.errors;
  if (throwError)
    throw new Error('custom keyword definition is invalid: '  + this.errorsText(v.errors));
  else
    return false;
}

function isStrictModeReservedWordES6(id) {
    switch (id) {
    case 'implements':
    case 'interface':
    case 'package':
    case 'private':
    case 'protected':
    case 'public':
    case 'static':
    case 'let':
        return true;
    default:
        return false;
    }
}

function isKeywordES5(id, strict) {
    // yield should not be treated as keyword under non-strict mode.
    if (!strict && id === 'yield') {
        return false;
    }
    return isKeywordES6(id, strict);
}

function isKeywordES6(id, strict) {
    if (strict && isStrictModeReservedWordES6(id)) {
        return true;
    }

    switch (id.length) {
    case 2:
        return (id === 'if') || (id === 'in') || (id === 'do');
    case 3:
        return (id === 'var') || (id === 'for') || (id === 'new') || (id === 'try');
    case 4:
        return (id === 'this') || (id === 'else') || (id === 'case') ||
            (id === 'void') || (id === 'with') || (id === 'enum');
    case 5:
        return (id === 'while') || (id === 'break') || (id === 'catch') ||
            (id === 'throw') || (id === 'const') || (id === 'yield') ||
            (id === 'class') || (id === 'super');
    case 6:
        return (id === 'return') || (id === 'typeof') || (id === 'delete') ||
            (id === 'switch') || (id === 'export') || (id === 'import');
    case 7:
        return (id === 'default') || (id === 'finally') || (id === 'extends');
    case 8:
        return (id === 'function') || (id === 'continue') || (id === 'debugger');
    case 10:
        return (id === 'instanceof');
    default:
        return false;
    }
}

function isReservedWordES5(id, strict) {
    return id === 'null' || id === 'true' || id === 'false' || isKeywordES5(id, strict);
}

function isReservedWordES6(id, strict) {
    return id === 'null' || id === 'true' || id === 'false' || isKeywordES6(id, strict);
}

function isRestrictedWord(id) {
    return id === 'eval' || id === 'arguments';
}

function isIdentifierNameES5(id) {
    var i, iz, ch;

    if (id.length === 0) { return false; }

    ch = id.charCodeAt(0);
    if (!code.isIdentifierStartES5(ch)) {
        return false;
    }

    for (i = 1, iz = id.length; i < iz; ++i) {
        ch = id.charCodeAt(i);
        if (!code.isIdentifierPartES5(ch)) {
            return false;
        }
    }
    return true;
}

function decodeUtf16(lead, trail) {
    return (lead - 0xD800) * 0x400 + (trail - 0xDC00) + 0x10000;
}

function isIdentifierNameES6(id) {
    var i, iz, ch, lowCh, check;

    if (id.length === 0) { return false; }

    check = code.isIdentifierStartES6;
    for (i = 0, iz = id.length; i < iz; ++i) {
        ch = id.charCodeAt(i);
        if (0xD800 <= ch && ch <= 0xDBFF) {
            ++i;
            if (i >= iz) { return false; }
            lowCh = id.charCodeAt(i);
            if (!(0xDC00 <= lowCh && lowCh <= 0xDFFF)) {
                return false;
            }
            ch = decodeUtf16(ch, lowCh);
        }
        if (!check(ch)) {
            return false;
        }
        check = code.isIdentifierPartES6;
    }
    return true;
}

function isIdentifierES5(id, strict) {
    return isIdentifierNameES5(id) && !isReservedWordES5(id, strict);
}

function isIdentifierES6(id, strict) {
    return isIdentifierNameES6(id) && !isReservedWordES6(id, strict);
}
