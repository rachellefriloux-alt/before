module.exports = {
  getScope
}

/**
 * Gets the scope for the current node
 * @param {RuleContext} context The rule context
 * @param {ESNode} currentNode The node to get the scope of
 * @returns { import('eslint').Scope.Scope } The scope information for this node
 */
function getScope(context, currentNode) {
  // On Program node, get the outermost scope to avoid return Node.js special function scope or ES modules scope.
  const inner = currentNode.type !== 'Program'
  const scopeManager = context.getSourceCode().scopeManager

  /** @type {ESNode | null} */
  let node = currentNode
  for (; node; node = /** @type {ESNode | null} */ (node.parent)) {
    const scope = scopeManager.acquire(node, inner)

    if (scope) {
      if (scope.type === 'function-expression-name') {
        return scope.childScopes[0]
      }
      return scope
    }
  }

  return scopeManager.scopes[0]
}

/**
 * Test if scope is struct
 * @param {Scope} scope scope
 * @param {Block} block block
 * @param {boolean} isMethodDefinition is method definition
 * @returns {boolean} is strict scope
 */
function isStrictScope(scope, block, isMethodDefinition) {
    let body;

    // When upper scope is exists and strict, inner scope is also strict.
    if (scope.upper && scope.upper.isStrict) {
        return true;
    }

    if (isMethodDefinition) {
        return true;
    }

    if (scope.type === "class" || scope.type === "module") {
        return true;
    }

    if (scope.type === "block" || scope.type === "switch") {
        return false;
    }

    if (scope.type === "function") {
        if (block.type === Syntax.ArrowFunctionExpression && block.body.type !== Syntax.BlockStatement) {
            return false;
        }

        if (block.type === Syntax.Program) {
            body = block;
        } else {
            body = block.body;
        }

        if (!body) {
            return false;
        }
    } else if (scope.type === "global") {
        body = block;
    } else {
        return false;
    }

    // Search for a 'use strict' directive.
    for (let i = 0, iz = body.body.length; i < iz; ++i) {
        const stmt = body.body[i];

        /*
         * Check if the current statement is a directive.
         * If it isn't, then we're past the directive prologue
         * so stop the search because directives cannot
         * appear after this point.
         *
         * Some parsers set `directive:null` on non-directive
         * statements, so the `typeof` check is safer than
         * checking for property existence.
         */
        if (typeof stmt.directive !== "string") {
            break;
        }

        if (stmt.directive === "use strict") {
            return true;
        }
    }

    return false;
}

/**
 * Register scope
 * @param {ScopeManager} scopeManager scope manager
 * @param {Scope} scope scope
 * @returns {void}
 */
function registerScope(scopeManager, scope) {
    scopeManager.scopes.push(scope);

    const scopes = scopeManager.__nodeToScope.get(scope.block);

    if (scopes) {
        scopes.push(scope);
    } else {
        scopeManager.__nodeToScope.set(scope.block, [scope]);
    }
}

/**
 * Should be statically
 * @param {Object} def def
 * @returns {boolean} should be statically
 */
function shouldBeStatically(def) {
    return (
        (def.type === Variable.ClassName) ||
        (def.type === Variable.Variable && def.parent.kind !== "var")
    );
}
