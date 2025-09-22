// @ts-check
import { WalkerBase } from './walker.js';

/** @typedef { import('estree').BaseNode} BaseNode */
/** @typedef { import('./walker').WalkerContext} WalkerContext */

/** @typedef {(
 *    this: WalkerContext,
 *    node: BaseNode,
 *    parent: BaseNode,
 *    key: string,
 *    index: number
 * ) => Promise<void>} AsyncHandler */

export class AsyncWalker extends WalkerBase {
	/**
	 *
	 * @param {AsyncHandler} enter
	 * @param {AsyncHandler} leave
	 */
	constructor(enter, leave) {
		super();

		/** @type {AsyncHandler} */
		this.enter = enter;

		/** @type {AsyncHandler} */
		this.leave = leave;
	}

	/**
	 *
	 * @param {BaseNode} node
	 * @param {BaseNode} parent
	 * @param {string} [prop]
	 * @param {number} [index]
	 * @returns {Promise<BaseNode>}
	 */
	async visit(node, parent, prop, index) {
		if (node) {
			if (this.enter) {
				const _should_skip = this.should_skip;
				const _should_remove = this.should_remove;
				const _replacement = this.replacement;
				this.should_skip = false;
				this.should_remove = false;
				this.replacement = null;

				await this.enter.call(this.context, node, parent, prop, index);

				if (this.replacement) {
					node = this.replacement;
					this.replace(parent, prop, index, node);
				}

				if (this.should_remove) {
					this.remove(parent, prop, index);
				}

				const skipped = this.should_skip;
				const removed = this.should_remove;

				this.should_skip = _should_skip;
				this.should_remove = _should_remove;
				this.replacement = _replacement;

				if (skipped) return node;
				if (removed) return null;
			}

			for (const key in node) {
				const value = node[key];

				if (typeof value !== "object") {
					continue;
				} else if (Array.isArray(value)) {
					for (let i = 0; i < value.length; i += 1) {
						if (value[i] !== null && typeof value[i].type === 'string') {
							if (!(await this.visit(value[i], node, key, i))) {
								// removed
								i--;
							}
						}
					}
				} else if (value !== null && typeof value.type === "string") {
					await this.visit(value, node, key, null);
				}
			}

			if (this.leave) {
				const _replacement = this.replacement;
				const _should_remove = this.should_remove;
				this.replacement = null;
				this.should_remove = false;

				await this.leave.call(this.context, node, parent, prop, index);

				if (this.replacement) {
					node = this.replacement;
					this.replace(parent, prop, index, node);
				}

				if (this.should_remove) {
					this.remove(parent, prop, index);
				}

				const removed = this.should_remove;

				this.replacement = _replacement;
				this.should_remove = _should_remove;

				if (removed) return null;
			}
		}

		return node;
	}
}

/**
 * Ducktype a node.
 *
 * @param {unknown} value
 * @returns {value is Node}
 */
function isNode(value) {
	return (
		value !== null && typeof value === 'object' && 'type' in value && typeof value.type === 'string'
	);
}


/**
 * Creates validating function for passed schema with asynchronous loading of missing schemas.
 * `loadSchema` option should be a function that accepts schema uri and returns promise that resolves with the schema.
 * @this  Ajv
 * @param {Object}   schema schema object
 * @param {Boolean}  meta optional true to compile meta-schema; this parameter can be skipped
 * @param {Function} callback an optional node-style callback, it is called with 2 parameters: error (or null) and validating function.
 * @return {Promise} promise that resolves with a validating function.
 */
function compileAsync(schema, meta, callback) {
  /* eslint no-shadow: 0 */
  /* global Promise */
  /* jshint validthis: true */
  var self = this;
  if (typeof this._opts.loadSchema != 'function')
    throw new Error('options.loadSchema should be a function');

  if (typeof meta == 'function') {
    callback = meta;
    meta = undefined;
  }

  var p = loadMetaSchemaOf(schema).then(function () {
    var schemaObj = self._addSchema(schema, undefined, meta);
    return schemaObj.validate || _compileAsync(schemaObj);
  });

  if (callback) {
    p.then(
      function(v) { callback(null, v); },
      callback
    );
  }

  return p;


  function loadMetaSchemaOf(sch) {
    var $schema = sch.$schema;
    return $schema && !self.getSchema($schema)
            ? compileAsync.call(self, { $ref: $schema }, true)
            : Promise.resolve();
  }


  function _compileAsync(schemaObj) {
    try { return self._compile(schemaObj); }
    catch(e) {
      if (e instanceof MissingRefError) return loadMissingSchema(e);
      throw e;
    }


    function loadMissingSchema(e) {
      var ref = e.missingSchema;
      if (added(ref)) throw new Error('Schema ' + ref + ' is loaded but ' + e.missingRef + ' cannot be resolved');

      var schemaPromise = self._loadingSchemas[ref];
      if (!schemaPromise) {
        schemaPromise = self._loadingSchemas[ref] = self._opts.loadSchema(ref);
        schemaPromise.then(removePromise, removePromise);
      }

      return schemaPromise.then(function (sch) {
        if (!added(ref)) {
          return loadMetaSchemaOf(sch).then(function () {
            if (!added(ref)) self.addSchema(sch, ref, undefined, meta);
          });
        }
      }).then(function() {
        return _compileAsync(schemaObj);
      });

      function removePromise() {
        delete self._loadingSchemas[ref];
      }

      function added(ref) {
        return self._refs[ref] || self._schemas[ref];
      }
    }
  }
}


function loadMetaSchemaOf(sch) {
  var $schema = sch.$schema;
  return $schema && !self.getSchema($schema)
          ? compileAsync.call(self, { $ref: $schema }, true)
          : Promise.resolve();
}


function _compileAsync(schemaObj) {
  try { return self._compile(schemaObj); }
  catch(e) {
    if (e instanceof MissingRefError) return loadMissingSchema(e);
    throw e;
  }


  function loadMissingSchema(e) {
    var ref = e.missingSchema;
    if (added(ref)) throw new Error('Schema ' + ref + ' is loaded but ' + e.missingRef + ' cannot be resolved');

    var schemaPromise = self._loadingSchemas[ref];
    if (!schemaPromise) {
      schemaPromise = self._loadingSchemas[ref] = self._opts.loadSchema(ref);
      schemaPromise.then(removePromise, removePromise);
    }

    return schemaPromise.then(function (sch) {
      if (!added(ref)) {
        return loadMetaSchemaOf(sch).then(function () {
          if (!added(ref)) self.addSchema(sch, ref, undefined, meta);
        });
      }
    }).then(function() {
      return _compileAsync(schemaObj);
    });

    function removePromise() {
      delete self._loadingSchemas[ref];
    }

    function added(ref) {
      return self._refs[ref] || self._schemas[ref];
    }
  }
}


function loadMissingSchema(e) {
  var ref = e.missingSchema;
  if (added(ref)) throw new Error('Schema ' + ref + ' is loaded but ' + e.missingRef + ' cannot be resolved');

  var schemaPromise = self._loadingSchemas[ref];
  if (!schemaPromise) {
    schemaPromise = self._loadingSchemas[ref] = self._opts.loadSchema(ref);
    schemaPromise.then(removePromise, removePromise);
  }

  return schemaPromise.then(function (sch) {
    if (!added(ref)) {
      return loadMetaSchemaOf(sch).then(function () {
        if (!added(ref)) self.addSchema(sch, ref, undefined, meta);
      });
    }
  }).then(function() {
    return _compileAsync(schemaObj);
  });

  function removePromise() {
    delete self._loadingSchemas[ref];
  }

  function added(ref) {
    return self._refs[ref] || self._schemas[ref];
  }
}

function removePromise() {
  delete self._loadingSchemas[ref];
}

function added(ref) {
  return self._refs[ref] || self._schemas[ref];
}
