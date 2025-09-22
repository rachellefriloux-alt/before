/* global module, require -- required for CJS file */

// Jest (and probably some other runtimes with custom implementations of
// `require`) doesn't support `exports` in `package.json`, so this file is here
// to help them load this module. Note that it is also `.js` and not `.cjs` for
// the same reason - `cjs` files requires to be loaded with an extension, but
// since Jest doesn't respect `module` outside of ESM mode it still works in
// this case (and the `require` in _this_ file does specify the extension).

module.exports = require("./dist/eslintrc-universal.cjs");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function Universal(opts) {
  var _this;
  _this = _Namespace.call(this, opts) || this;
  _this.type = _types.UNIVERSAL;
  _this.value = '*';
  return _this;
}
