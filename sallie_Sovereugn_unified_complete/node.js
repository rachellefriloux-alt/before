import { a as cleanUrl, c as createManualModuleSource } from './chunk-utils.js';
import MagicString from 'magic-string';
import { walk } from 'estree-walker';
import { createFilter } from 'vite';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path/posix';
import { M as MockerRegistry, a as ManualMockedModule } from './chunk-registry.js';
import { fileURLToPath } from 'node:url';
import { existsSync, readFileSync } from 'node:fs';
import { findMockRedirect } from './redirect.js';
import { i as isAbsolute, j as join$1, r as resolve } from './chunk-pathe.M-eThtNZ.js';
import 'node:module';

const isNodeInPatternWeakSet = new WeakSet();
function setIsNodeInPattern(node) {
	return isNodeInPatternWeakSet.add(node);
}
function isNodeInPattern(node) {
	return isNodeInPatternWeakSet.has(node);
}
/**
* Same logic from \@vue/compiler-core & \@vue/compiler-sfc
* Except this is using acorn AST
*/
function esmWalker(root, { onIdentifier, onImportMeta, onDynamicImport, onCallExpression }) {
	const parentStack = [];
	const varKindStack = [];
	const scopeMap = new WeakMap();
	const identifiers = [];
	const setScope = (node, name) => {
		let scopeIds = scopeMap.get(node);
		if (scopeIds && scopeIds.has(name)) {
			return;
		}
		if (!scopeIds) {
			scopeIds = new Set();
			scopeMap.set(node, scopeIds);
		}
		scopeIds.add(name);
	};
	function isInScope(name, parents) {
		return parents.some((node) => {
			var _scopeMap$get;
			return node && ((_scopeMap$get = scopeMap.get(node)) === null || _scopeMap$get === void 0 ? void 0 : _scopeMap$get.has(name));
		});
	}
	function handlePattern(p, parentScope) {
		if (p.type === "Identifier") {
			setScope(parentScope, p.name);
		} else if (p.type === "RestElement") {
			handlePattern(p.argument, parentScope);
		} else if (p.type === "ObjectPattern") {
			p.properties.forEach((property) => {
				if (property.type === "RestElement") {
					setScope(parentScope, property.argument.name);
				} else {
					handlePattern(property.value, parentScope);
				}
			});
		} else if (p.type === "ArrayPattern") {
			p.elements.forEach((element) => {
				if (element) {
					handlePattern(element, parentScope);
				}
			});
		} else if (p.type === "AssignmentPattern") {
			handlePattern(p.left, parentScope);
		} else {
			setScope(parentScope, p.name);
		}
	}
	walk(root, {
		enter(node, parent) {
			if (node.type === "ImportDeclaration") {
				return this.skip();
			}
			// track parent stack, skip for "else-if"/"else" branches as acorn nests
			// the ast within "if" nodes instead of flattening them
			if (parent && !(parent.type === "IfStatement" && node === parent.alternate)) {
				parentStack.unshift(parent);
			}
			// track variable declaration kind stack used by VariableDeclarator
			if (node.type === "VariableDeclaration") {
				varKindStack.unshift(node.kind);
			}
			if (node.type === "CallExpression") {
				onCallExpression === null || onCallExpression === void 0 ? void 0 : onCallExpression(node);
			}
			if (node.type === "MetaProperty" && node.meta.name === "import") {
				onImportMeta === null || onImportMeta === void 0 ? void 0 : onImportMeta(node);
			} else if (node.type === "ImportExpression") {
				onDynamicImport === null || onDynamicImport === void 0 ? void 0 : onDynamicImport(node);
			}
			if (node.type === "Identifier") {
				if (!isInScope(node.name, parentStack) && isRefIdentifier(node, parent, parentStack)) {
					// record the identifier, for DFS -> BFS
					identifiers.push([node, parentStack.slice(0)]);
				}
			} else if (isFunctionNode(node)) {
				// If it is a function declaration, it could be shadowing an import
				// Add its name to the scope so it won't get replaced
				if (node.type === "FunctionDeclaration") {
					const parentScope = findParentScope(parentStack);
					if (parentScope) {
						setScope(parentScope, node.id.name);
					}
				}
				// walk function expressions and add its arguments to known identifiers
				// so that we don't prefix them
				node.params.forEach((p) => {
					if (p.type === "ObjectPattern" || p.type === "ArrayPattern") {
						handlePattern(p, node);
						return;
					}
					walk(p.type === "AssignmentPattern" ? p.left : p, { enter(child, parent) {
						// skip params default value of destructure
						if ((parent === null || parent === void 0 ? void 0 : parent.type) === "AssignmentPattern" && (parent === null || parent === void 0 ? void 0 : parent.right) === child) {
							return this.skip();
						}
						if (child.type !== "Identifier") {
							return;
						}
						// do not record as scope variable if is a destructuring keyword
						if (isStaticPropertyKey(child, parent)) {
							return;
						}
						// do not record if this is a default value
						// assignment of a destructuring variable
						if ((parent === null || parent === void 0 ? void 0 : parent.type) === "TemplateLiteral" && (parent === null || parent === void 0 ? void 0 : parent.expressions.includes(child)) || (parent === null || parent === void 0 ? void 0 : parent.type) === "CallExpression" && (parent === null || parent === void 0 ? void 0 : parent.callee) === child) {
							return;
						}
						setScope(node, child.name);
					} });
				});
			} else if (node.type === "Property" && parent.type === "ObjectPattern") {
				// mark property in destructuring pattern
				setIsNodeInPattern(node);
			} else if (node.type === "VariableDeclarator") {
				const parentFunction = findParentScope(parentStack, varKindStack[0] === "var");
				if (parentFunction) {
					handlePattern(node.id, parentFunction);
				}
			} else if (node.type === "CatchClause" && node.param) {
				handlePattern(node.param, node);
			}
		},
		leave(node, parent) {
			// untrack parent stack from above
			if (parent && !(parent.type === "IfStatement" && node === parent.alternate)) {
				parentStack.shift();
			}
			if (node.type === "VariableDeclaration") {
				varKindStack.shift();
			}
		}
	});
	// emit the identifier events in BFS so the hoisted declarations
	// can be captured correctly
	identifiers.forEach(([node, stack]) => {
		if (!isInScope(node.name, stack)) {
			const parent = stack[0];
			const grandparent = stack[1];
			const hasBindingShortcut = isStaticProperty(parent) && parent.shorthand && (!isNodeInPattern(parent) || isInDestructuringAssignment(parent, parentStack));
			const classDeclaration = parent.type === "PropertyDefinition" && (grandparent === null || grandparent === void 0 ? void 0 : grandparent.type) === "ClassBody" || parent.type === "ClassDeclaration" && node === parent.superClass;
			const classExpression = parent.type === "ClassExpression" && node === parent.id;
			onIdentifier === null || onIdentifier === void 0 ? void 0 : onIdentifier(node, {
				hasBindingShortcut,
				classDeclaration,
				classExpression
			}, stack);
		}
	});
}
function isRefIdentifier(id, parent, parentStack) {
	// declaration id
	if (parent.type === "CatchClause" || (parent.type === "VariableDeclarator" || parent.type === "ClassDeclaration") && parent.id === id) {
		return false;
	}
	if (isFunctionNode(parent)) {
		// function declaration/expression id
		if (parent.id === id) {
			return false;
		}
		// params list
		if (parent.params.includes(id)) {
			return false;
		}
	}
	// class method name
	if (parent.type === "MethodDefinition" && !parent.computed) {
		return false;
	}
	// property key
	if (isStaticPropertyKey(id, parent)) {
		return false;
	}
	// object destructuring pattern
	if (isNodeInPattern(parent) && parent.value === id) {
		return false;
	}
	// non-assignment array destructuring pattern
	if (parent.type === "ArrayPattern" && !isInDestructuringAssignment(parent, parentStack)) {
		return false;
	}
	// member expression property
	if (parent.type === "MemberExpression" && parent.property === id && !parent.computed) {
		return false;
	}
	if (parent.type === "ExportSpecifier") {
		return false;
	}
	// is a special keyword but parsed as identifier
	if (id.name === "arguments") {
		return false;
	}
	return true;
}
function isStaticProperty(node) {
	return node && node.type === "Property" && !node.computed;
}
function isStaticPropertyKey(node, parent) {
	return isStaticProperty(parent) && parent.key === node;
}
const functionNodeTypeRE = /Function(?:Expression|Declaration)$|Method$/;
function isFunctionNode(node) {
	return functionNodeTypeRE.test(node.type);
}
const blockNodeTypeRE = /^BlockStatement$|^For(?:In|Of)?Statement$/;
function isBlock(node) {
	return blockNodeTypeRE.test(node.type);
}
function findParentScope(parentStack, isVar = false) {
	return parentStack.find(isVar ? isFunctionNode : isBlock);
}
function isInDestructuringAssignment(parent, parentStack) {
	if (parent && (parent.type === "Property" || parent.type === "ArrayPattern")) {
		return parentStack.some((i) => i.type === "AssignmentExpression");
	}
	return false;
}
function getArbitraryModuleIdentifier(node) {
	return node.type === "Identifier" ? node.name : node.raw;
}

function automockPlugin(options = {}) {
	return {
		name: "vitest:automock",
		enforce: "post",
		transform(code, id) {
			if (id.includes("mock=automock") || id.includes("mock=autospy")) {
				const mockType = id.includes("mock=automock") ? "automock" : "autospy";
				const ms = automockModule(code, mockType, this.parse, options);
				return {
					code: ms.toString(),
					map: ms.generateMap({
						hires: "boundary",
						source: cleanUrl(id)
					})
				};
			}
		}
	};
}
// TODO: better source map replacement
function automockModule(code, mockType, parse, options = {}) {
	const globalThisAccessor = options.globalThisAccessor || "\"__vitest_mocker__\"";
	const ast = parse(code);
	const m = new MagicString(code);
	const allSpecifiers = [];
	let importIndex = 0;
	for (const _node of ast.body) {
		if (_node.type === "ExportAllDeclaration") {
			throw new Error(`automocking files with \`export *\` is not supported in browser mode because it cannot be statically analysed`);
		}
		if (_node.type === "ExportNamedDeclaration") {
			const node = _node;
			const declaration = node.declaration;
			function traversePattern(expression) {
				// export const test = '1'
				if (expression.type === "Identifier") {
					allSpecifiers.push({ name: expression.name });
				} else if (expression.type === "ArrayPattern") {
					expression.elements.forEach((element) => {
						if (!element) {
							return;
						}
						traversePattern(element);
					});
				} else if (expression.type === "ObjectPattern") {
					expression.properties.forEach((property) => {
						// export const { ...rest } = {}
						if (property.type === "RestElement") {
							traversePattern(property);
						} else if (property.type === "Property") {
							traversePattern(property.value);
						} else ;
					});
				} else if (expression.type === "RestElement") {
					traversePattern(expression.argument);
				} else if (expression.type === "AssignmentPattern") {
					throw new Error(`AssignmentPattern is not supported. Please open a new bug report.`);
				} else if (expression.type === "MemberExpression") {
					throw new Error(`MemberExpression is not supported. Please open a new bug report.`);
				} else ;
			}
			if (declaration) {
				if (declaration.type === "FunctionDeclaration") {
					allSpecifiers.push({ name: declaration.id.name });
				} else if (declaration.type === "VariableDeclaration") {
					declaration.declarations.forEach((declaration) => {
						traversePattern(declaration.id);
					});
				} else if (declaration.type === "ClassDeclaration") {
					allSpecifiers.push({ name: declaration.id.name });
				} else ;
				m.remove(node.start, declaration.start);
			}
			const specifiers = node.specifiers || [];
			const source = node.source;
			if (!source && specifiers.length) {
				specifiers.forEach((specifier) => {
					allSpecifiers.push({
						alias: getArbitraryModuleIdentifier(specifier.exported),
						name: getArbitraryModuleIdentifier(specifier.local)
					});
				});
				m.remove(node.start, node.end);
			} else if (source && specifiers.length) {
				const importNames = [];
				specifiers.forEach((specifier) => {
					const importedName = `__vitest_imported_${importIndex++}__`;
					importNames.push([getArbitraryModuleIdentifier(specifier.local), importedName]);
					allSpecifiers.push({
						name: importedName,
						alias: getArbitraryModuleIdentifier(specifier.exported)
					});
				});
				const importString = `import { ${importNames.map(([name, alias]) => `${name} as ${alias}`).join(", ")} } from '${source.value}'`;
				m.overwrite(node.start, node.end, importString);
			}
		}
		if (_node.type === "ExportDefaultDeclaration") {
			const node = _node;
			const declaration = node.declaration;
			allSpecifiers.push({
				name: "__vitest_default",
				alias: "default"
			});
			m.overwrite(node.start, declaration.start, `const __vitest_default = `);
		}
	}
	const moduleObject = `
const __vitest_current_es_module__ = {
  __esModule: true,
  ${allSpecifiers.map(({ name }) => `["${name}"]: ${name},`).join("\n  ")}
}
const __vitest_mocked_module__ = globalThis[${globalThisAccessor}].mockObject(__vitest_current_es_module__, "${mockType}")
`;
	const assigning = allSpecifiers.map(({ name }, index) => {
		return `const __vitest_mocked_${index}__ = __vitest_mocked_module__["${name}"]`;
	}).join("\n");
	const redeclarations = allSpecifiers.map(({ name, alias }, index) => {
		return `  __vitest_mocked_${index}__ as ${alias || name},`;
	}).join("\n");
	const specifiersExports = `
export {
${redeclarations}
}
`;
	m.append(moduleObject + assigning + specifiersExports);
	return m;
}

const regexDynamicImport = /import\s*\(/;
function dynamicImportPlugin(options = {}) {
	return {
		name: "vitest:browser:esm-injector",
		enforce: "post",
		transform(source, id) {
			// TODO: test is not called for static imports
			if (!regexDynamicImport.test(source)) {
				return;
			}
			if (options.filter && !options.filter(id)) {
				return;
			}
			return injectDynamicImport(source, id, this.parse, options);
		}
	};
}
function injectDynamicImport(code, id, parse, options = {}) {
	const s = new MagicString(code);
	let ast;
	try {
		ast = parse(code);
	} catch (err) {
		console.error(`Cannot parse ${id}:\n${err.message}`);
		return;
	}
	// 3. convert references to import bindings & import.meta references
	esmWalker(ast, {
		onImportMeta() {
			// s.update(node.start, node.end, viImportMetaKey)
		},
		onDynamicImport(node) {
			const globalThisAccessor = options.globalThisAccessor || "\"__vitest_mocker__\"";
			const replaceString = `globalThis[${globalThisAccessor}].wrapDynamicImport(() => import(`;
			const importSubstring = code.substring(node.start, node.end);
			const hasIgnore = importSubstring.includes("/* @vite-ignore */");
			s.overwrite(node.start, node.source.start, replaceString + (hasIgnore ? "/* @vite-ignore */ " : ""));
			s.overwrite(node.end - 1, node.end, "))");
		}
	});
	return {
		code: s.toString(),
		map: s.generateMap({
			hires: "boundary",
			source: id
		})
	};
}

// AST walker module for ESTree compatible trees


function makeTest(test) {
  if (typeof test === "string")
    { return function (type) { return type === test; } }
  else if (!test)
    { return function () { return true; } }
  else
    { return test }
}

var Found = function Found(node, state) { this.node = node; this.state = state; };

// Find the innermost node of a given type that contains the given
// position. Interface similar to findNodeAt.
function findNodeAround(node, pos, test, baseVisitor, state) {
  test = makeTest(test);
  if (!baseVisitor) { baseVisitor = base; }
  try {
    (function c(node, st, override) {
      var type = override || node.type;
      if (node.start > pos || node.end < pos) { return }
      baseVisitor[type](node, st, c);
      if (test(type, node)) { throw new Found(node, st) }
    })(node, state);
  } catch (e) {
    if (e instanceof Found) { return e }
    throw e
  }
}

function skipThrough(node, st, c) { c(node, st); }
function ignore(_node, _st, _c) {}

// Node walkers.

var base = {};

base.Program = base.BlockStatement = base.StaticBlock = function (node, st, c) {
  for (var i = 0, list = node.body; i < list.length; i += 1)
    {
    var stmt = list[i];

    c(stmt, st, "Statement");
  }
};
base.Statement = skipThrough;
base.EmptyStatement = ignore;
base.ExpressionStatement = base.ParenthesizedExpression = base.ChainExpression =
  function (node, st, c) { return c(node.expression, st, "Expression"); };
base.IfStatement = function (node, st, c) {
  c(node.test, st, "Expression");
  c(node.consequent, st, "Statement");
  if (node.alternate) { c(node.alternate, st, "Statement"); }
};
base.LabeledStatement = function (node, st, c) { return c(node.body, st, "Statement"); };
base.BreakStatement = base.ContinueStatement = ignore;
base.WithStatement = function (node, st, c) {
  c(node.object, st, "Expression");
  c(node.body, st, "Statement");
};
base.SwitchStatement = function (node, st, c) {
  c(node.discriminant, st, "Expression");
  for (var i = 0, list = node.cases; i < list.length; i += 1) {
    var cs = list[i];

    c(cs, st);
  }
};
base.SwitchCase = function (node, st, c) {
  if (node.test) { c(node.test, st, "Expression"); }
  for (var i = 0, list = node.consequent; i < list.length; i += 1)
    {
    var cons = list[i];

    c(cons, st, "Statement");
  }
};
base.ReturnStatement = base.YieldExpression = base.AwaitExpression = function (node, st, c) {
  if (node.argument) { c(node.argument, st, "Expression"); }
};
base.ThrowStatement = base.SpreadElement =
  function (node, st, c) { return c(node.argument, st, "Expression"); };
base.TryStatement = function (node, st, c) {
  c(node.block, st, "Statement");
  if (node.handler) { c(node.handler, st); }
  if (node.finalizer) { c(node.finalizer, st, "Statement"); }
};
base.CatchClause = function (node, st, c) {
  if (node.param) { c(node.param, st, "Pattern"); }
  c(node.body, st, "Statement");
};
base.WhileStatement = base.DoWhileStatement = function (node, st, c) {
  c(node.test, st, "Expression");
  c(node.body, st, "Statement");
};
base.ForStatement = function (node, st, c) {
  if (node.init) { c(node.init, st, "ForInit"); }
  if (node.test) { c(node.test, st, "Expression"); }
  if (node.update) { c(node.update, st, "Expression"); }
  c(node.body, st, "Statement");
};
base.ForInStatement = base.ForOfStatement = function (node, st, c) {
  c(node.left, st, "ForInit");
  c(node.right, st, "Expression");
  c(node.body, st, "Statement");
};
base.ForInit = function (node, st, c) {
  if (node.type === "VariableDeclaration") { c(node, st); }
  else { c(node, st, "Expression"); }
};
base.DebuggerStatement = ignore;

base.FunctionDeclaration = function (node, st, c) { return c(node, st, "Function"); };
base.VariableDeclaration = function (node, st, c) {
  for (var i = 0, list = node.declarations; i < list.length; i += 1)
    {
    var decl = list[i];

    c(decl, st);
  }
};
base.VariableDeclarator = function (node, st, c) {
  c(node.id, st, "Pattern");
  if (node.init) { c(node.init, st, "Expression"); }
};

base.Function = function (node, st, c) {
  if (node.id) { c(node.id, st, "Pattern"); }
  for (var i = 0, list = node.params; i < list.length; i += 1)
    {
    var param = list[i];

    c(param, st, "Pattern");
  }
  c(node.body, st, node.expression ? "Expression" : "Statement");
};

base.Pattern = function (node, st, c) {
  if (node.type === "Identifier")
    { c(node, st, "VariablePattern"); }
  else if (node.type === "MemberExpression")
    { c(node, st, "MemberPattern"); }
  else
    { c(node, st); }
};
base.VariablePattern = ignore;
base.MemberPattern = skipThrough;
base.RestElement = function (node, st, c) { return c(node.argument, st, "Pattern"); };
base.ArrayPattern = function (node, st, c) {
  for (var i = 0, list = node.elements; i < list.length; i += 1) {
    var elt = list[i];

    if (elt) { c(elt, st, "Pattern"); }
  }
};
base.ObjectPattern = function (node, st, c) {
  for (var i = 0, list = node.properties; i < list.length; i += 1) {
    var prop = list[i];

    if (prop.type === "Property") {
      if (prop.computed) { c(prop.key, st, "Expression"); }
      c(prop.value, st, "Pattern");
    } else if (prop.type === "RestElement") {
      c(prop.argument, st, "Pattern");
    }
  }
};

base.Expression = skipThrough;
base.ThisExpression = base.Super = base.MetaProperty = ignore;
base.ArrayExpression = function (node, st, c) {
  for (var i = 0, list = node.elements; i < list.length; i += 1) {
    var elt = list[i];

    if (elt) { c(elt, st, "Expression"); }
  }
};
base.ObjectExpression = function (node, st, c) {
  for (var i = 0, list = node.properties; i < list.length; i += 1)
    {
    var prop = list[i];

    c(prop, st);
  }
};
base.FunctionExpression = base.ArrowFunctionExpression = base.FunctionDeclaration;
base.SequenceExpression = function (node, st, c) {
  for (var i = 0, list = node.expressions; i < list.length; i += 1)
    {
    var expr = list[i];

    c(expr, st, "Expression");
  }
};
base.TemplateLiteral = function (node, st, c) {
  for (var i = 0, list = node.quasis; i < list.length; i += 1)
    {
    var quasi = list[i];

    c(quasi, st);
  }

  for (var i$1 = 0, list$1 = node.expressions; i$1 < list$1.length; i$1 += 1)
    {
    var expr = list$1[i$1];

    c(expr, st, "Expression");
  }
};
base.TemplateElement = ignore;
base.UnaryExpression = base.UpdateExpression = function (node, st, c) {
  c(node.argument, st, "Expression");
};
base.BinaryExpression = base.LogicalExpression = function (node, st, c) {
  c(node.left, st, "Expression");
  c(node.right, st, "Expression");
};
base.AssignmentExpression = base.AssignmentPattern = function (node, st, c) {
  c(node.left, st, "Pattern");
  c(node.right, st, "Expression");
};
base.ConditionalExpression = function (node, st, c) {
  c(node.test, st, "Expression");
  c(node.consequent, st, "Expression");
  c(node.alternate, st, "Expression");
};
base.NewExpression = base.CallExpression = function (node, st, c) {
  c(node.callee, st, "Expression");
  if (node.arguments)
    { for (var i = 0, list = node.arguments; i < list.length; i += 1)
      {
        var arg = list[i];

        c(arg, st, "Expression");
      } }
};
base.MemberExpression = function (node, st, c) {
  c(node.object, st, "Expression");
  if (node.computed) { c(node.property, st, "Expression"); }
};
base.ExportNamedDeclaration = base.ExportDefaultDeclaration = function (node, st, c) {
  if (node.declaration)
    { c(node.declaration, st, node.type === "ExportNamedDeclaration" || node.declaration.id ? "Statement" : "Expression"); }
  if (node.source) { c(node.source, st, "Expression"); }
};
base.ExportAllDeclaration = function (node, st, c) {
  if (node.exported)
    { c(node.exported, st); }
  c(node.source, st, "Expression");
};
base.ImportDeclaration = function (node, st, c) {
  for (var i = 0, list = node.specifiers; i < list.length; i += 1)
    {
    var spec = list[i];

    c(spec, st);
  }
  c(node.source, st, "Expression");
};
base.ImportExpression = function (node, st, c) {
  c(node.source, st, "Expression");
};
base.ImportSpecifier = base.ImportDefaultSpecifier = base.ImportNamespaceSpecifier = base.Identifier = base.PrivateIdentifier = base.Literal = ignore;

base.TaggedTemplateExpression = function (node, st, c) {
  c(node.tag, st, "Expression");
  c(node.quasi, st, "Expression");
};
base.ClassDeclaration = base.ClassExpression = function (node, st, c) { return c(node, st, "Class"); };
base.Class = function (node, st, c) {
  if (node.id) { c(node.id, st, "Pattern"); }
  if (node.superClass) { c(node.superClass, st, "Expression"); }
  c(node.body, st);
};
base.ClassBody = function (node, st, c) {
  for (var i = 0, list = node.body; i < list.length; i += 1)
    {
    var elt = list[i];

    c(elt, st);
  }
};
base.MethodDefinition = base.PropertyDefinition = base.Property = function (node, st, c) {
  if (node.computed) { c(node.key, st, "Expression"); }
  if (node.value) { c(node.value, st, "Expression"); }
};

function hoistMocksPlugin(options = {}) {
	const filter = options.filter || createFilter(options.include, options.exclude);
	const { hoistableMockMethodNames = ["mock", "unmock"], dynamicImportMockMethodNames = [
		"mock",
		"unmock",
		"doMock",
		"doUnmock"
	], hoistedMethodNames = ["hoisted"], utilsObjectNames = ["vi", "vitest"] } = options;
	const methods = new Set([
		...hoistableMockMethodNames,
		...hoistedMethodNames,
		...dynamicImportMockMethodNames
	]);
	const regexpHoistable = new RegExp(`\\b(?:${utilsObjectNames.join("|")})\\s*\.\\s*(?:${Array.from(methods).join("|")})\\(`);
	return {
		name: "vitest:mocks",
		enforce: "post",
		transform(code, id) {
			if (!filter(id)) {
				return;
			}
			return hoistMocks(code, id, this.parse, {
				regexpHoistable,
				hoistableMockMethodNames,
				hoistedMethodNames,
				utilsObjectNames,
				dynamicImportMockMethodNames,
				...options
			});
		}
	};
}
const API_NOT_FOUND_ERROR = `There are some problems in resolving the mocks API.
You may encounter this issue when importing the mocks API from another module other than 'vitest'.
To fix this issue you can either:
- import the mocks API directly from 'vitest'
- enable the 'globals' options`;
function API_NOT_FOUND_CHECK(names) {
	return `\nif (${names.map((name) => `typeof globalThis["${name}"] === "undefined"`).join(" && ")}) ` + `{ throw new Error(${JSON.stringify(API_NOT_FOUND_ERROR)}) }\n`;
}
function isIdentifier(node) {
	return node.type === "Identifier";
}
function getNodeTail(code, node) {
	let end = node.end;
	if (code[node.end] === ";") {
		end += 1;
	}
	if (code[node.end] === "\n") {
		return end + 1;
	}
	if (code[node.end + 1] === "\n") {
		end += 1;
	}
	return end;
}
const regexpHoistable = /\b(?:vi|vitest)\s*\.\s*(?:mock|unmock|hoisted|doMock|doUnmock)\(/;
const hashbangRE = /^#!.*\n/;
// this is a fork of Vite SSR transform
function hoistMocks(code, id, parse, options = {}) {
	var _hashbangRE$exec;
	const needHoisting = (options.regexpHoistable || regexpHoistable).test(code);
	if (!needHoisting) {
		return;
	}
	const s = new MagicString(code);
	let ast;
	try {
		ast = parse(code);
	} catch (err) {
		console.error(`Cannot parse ${id}:\n${err.message}.`);
		return;
	}
	const { hoistableMockMethodNames = ["mock", "unmock"], dynamicImportMockMethodNames = [
		"mock",
		"unmock",
		"doMock",
		"doUnmock"
	], hoistedMethodNames = ["hoisted"], utilsObjectNames = ["vi", "vitest"], hoistedModule = "vitest" } = options;
	// hoist at the start of the file, after the hashbang
	let hoistIndex = ((_hashbangRE$exec = hashbangRE.exec(code)) === null || _hashbangRE$exec === void 0 ? void 0 : _hashbangRE$exec[0].length) ?? 0;
	let hoistedModuleImported = false;
	let uid = 0;
	const idToImportMap = new Map();
	const imports = [];
	// this will transform import statements into dynamic ones, if there are imports
	// it will keep the import as is, if we don't need to mock anything
	// in browser environment it will wrap the module value with "vitest_wrap_module" function
	// that returns a proxy to the module so that named exports can be mocked
	function defineImport(importNode) {
		const source = importNode.source.value;
		// always hoist vitest import to top of the file, so
		// "vi" helpers can access it
		if (hoistedModule === source) {
			hoistedModuleImported = true;
			return;
		}
		const importId = `__vi_import_${uid++}__`;
		imports.push({
			id: importId,
			node: importNode
		});
		return importId;
	}
	// 1. check all import statements and record id -> importName map
	for (const node of ast.body) {
		// import foo from 'foo' --> foo -> __import_foo__.default
		// import { baz } from 'foo' --> baz -> __import_foo__.baz
		// import * as ok from 'foo' --> ok -> __import_foo__
		if (node.type === "ImportDeclaration") {
			const importId = defineImport(node);
			if (!importId) {
				continue;
			}
			for (const spec of node.specifiers) {
				if (spec.type === "ImportSpecifier") {
					if (spec.imported.type === "Identifier") {
						idToImportMap.set(spec.local.name, `${importId}.${spec.imported.name}`);
					} else {
						idToImportMap.set(spec.local.name, `${importId}[${JSON.stringify(spec.imported.value)}]`);
					}
				} else if (spec.type === "ImportDefaultSpecifier") {
					idToImportMap.set(spec.local.name, `${importId}.default`);
				} else {
					// namespace specifier
					idToImportMap.set(spec.local.name, importId);
				}
			}
		}
	}
	const declaredConst = new Set();
	const hoistedNodes = [];
	function createSyntaxError(node, message) {
		const _error = new SyntaxError(message);
		Error.captureStackTrace(_error, createSyntaxError);
		const serializedError = {
			name: "SyntaxError",
			message: _error.message,
			stack: _error.stack
		};
		if (options.codeFrameGenerator) {
			serializedError.frame = options.codeFrameGenerator(node, id, code);
		}
		return serializedError;
	}
	function assertNotDefaultExport(node, error) {
		var _findNodeAround;
		const defaultExport = (_findNodeAround = findNodeAround(ast, node.start, "ExportDefaultDeclaration")) === null || _findNodeAround === void 0 ? void 0 : _findNodeAround.node;
		if ((defaultExport === null || defaultExport === void 0 ? void 0 : defaultExport.declaration) === node || (defaultExport === null || defaultExport === void 0 ? void 0 : defaultExport.declaration.type) === "AwaitExpression" && defaultExport.declaration.argument === node) {
			throw createSyntaxError(defaultExport, error);
		}
	}
	function assertNotNamedExport(node, error) {
		var _findNodeAround2;
		const nodeExported = (_findNodeAround2 = findNodeAround(ast, node.start, "ExportNamedDeclaration")) === null || _findNodeAround2 === void 0 ? void 0 : _findNodeAround2.node;
		if ((nodeExported === null || nodeExported === void 0 ? void 0 : nodeExported.declaration) === node) {
			throw createSyntaxError(nodeExported, error);
		}
	}
	function getVariableDeclaration(node) {
		var _findNodeAround3, _declarationNode$decl;
		const declarationNode = (_findNodeAround3 = findNodeAround(ast, node.start, "VariableDeclaration")) === null || _findNodeAround3 === void 0 ? void 0 : _findNodeAround3.node;
		const init = declarationNode === null || declarationNode === void 0 || (_declarationNode$decl = declarationNode.declarations[0]) === null || _declarationNode$decl === void 0 ? void 0 : _declarationNode$decl.init;
		if (init && (init === node || init.type === "AwaitExpression" && init.argument === node)) {
			return declarationNode;
		}
	}
	const usedUtilityExports = new Set();
	esmWalker(ast, {
		onIdentifier(id, info, parentStack) {
			const binding = idToImportMap.get(id.name);
			if (!binding) {
				return;
			}
			if (info.hasBindingShortcut) {
				s.appendLeft(id.end, `: ${binding}`);
			} else if (info.classDeclaration) {
				if (!declaredConst.has(id.name)) {
					declaredConst.add(id.name);
					// locate the top-most node containing the class declaration
					const topNode = parentStack[parentStack.length - 2];
					s.prependRight(topNode.start, `const ${id.name} = ${binding};\n`);
				}
			} else if (!info.classExpression) {
				s.update(id.start, id.end, binding);
			}
		},
		onCallExpression(node) {
			if (node.callee.type === "MemberExpression" && isIdentifier(node.callee.object) && utilsObjectNames.includes(node.callee.object.name) && isIdentifier(node.callee.property)) {
				const methodName = node.callee.property.name;
				usedUtilityExports.add(node.callee.object.name);
				if (hoistableMockMethodNames.includes(methodName)) {
					const method = `${node.callee.object.name}.${methodName}`;
					assertNotDefaultExport(node, `Cannot export the result of "${method}". Remove export declaration because "${method}" doesn\'t return anything.`);
					const declarationNode = getVariableDeclaration(node);
					if (declarationNode) {
						assertNotNamedExport(declarationNode, `Cannot export the result of "${method}". Remove export declaration because "${method}" doesn\'t return anything.`);
					}
					// rewrite vi.mock(import('..')) into vi.mock('..')
					if (node.type === "CallExpression" && node.callee.type === "MemberExpression" && dynamicImportMockMethodNames.includes(node.callee.property.name)) {
						const moduleInfo = node.arguments[0];
						// vi.mock(import('./path')) -> vi.mock('./path')
						if (moduleInfo.type === "ImportExpression") {
							const source = moduleInfo.source;
							s.overwrite(moduleInfo.start, moduleInfo.end, s.slice(source.start, source.end));
						}
						// vi.mock(await import('./path')) -> vi.mock('./path')
						if (moduleInfo.type === "AwaitExpression" && moduleInfo.argument.type === "ImportExpression") {
							const source = moduleInfo.argument.source;
							s.overwrite(moduleInfo.start, moduleInfo.end, s.slice(source.start, source.end));
						}
					}
					hoistedNodes.push(node);
				} else if (dynamicImportMockMethodNames.includes(methodName)) {
					const moduleInfo = node.arguments[0];
					let source = null;
					if (moduleInfo.type === "ImportExpression") {
						source = moduleInfo.source;
					}
					if (moduleInfo.type === "AwaitExpression" && moduleInfo.argument.type === "ImportExpression") {
						source = moduleInfo.argument.source;
					}
					if (source) {
						s.overwrite(moduleInfo.start, moduleInfo.end, s.slice(source.start, source.end));
					}
				}
				if (hoistedMethodNames.includes(methodName)) {
					assertNotDefaultExport(node, "Cannot export hoisted variable. You can control hoisting behavior by placing the import from this file first.");
					const declarationNode = getVariableDeclaration(node);
					if (declarationNode) {
						assertNotNamedExport(declarationNode, "Cannot export hoisted variable. You can control hoisting behavior by placing the import from this file first.");
						// hoist "const variable = vi.hoisted(() => {})"
						hoistedNodes.push(declarationNode);
					} else {
						var _findNodeAround4;
						const awaitedExpression = (_findNodeAround4 = findNodeAround(ast, node.start, "AwaitExpression")) === null || _findNodeAround4 === void 0 ? void 0 : _findNodeAround4.node;
						// hoist "await vi.hoisted(async () => {})" or "vi.hoisted(() => {})"
						const moveNode = (awaitedExpression === null || awaitedExpression === void 0 ? void 0 : awaitedExpression.argument) === node ? awaitedExpression : node;
						hoistedNodes.push(moveNode);
					}
				}
			}
		}
	});
	function getNodeName(node) {
		const callee = node.callee || {};
		if (callee.type === "MemberExpression" && isIdentifier(callee.property) && isIdentifier(callee.object)) {
			return `${callee.object.name}.${callee.property.name}()`;
		}
		return "\"hoisted method\"";
	}
	function getNodeCall(node) {
		if (node.type === "CallExpression") {
			return node;
		}
		if (node.type === "VariableDeclaration") {
			const { declarations } = node;
			const init = declarations[0].init;
			if (init) {
				return getNodeCall(init);
			}
		}
		if (node.type === "AwaitExpression") {
			const { argument } = node;
			if (argument.type === "CallExpression") {
				return getNodeCall(argument);
			}
		}
		return node;
	}
	function createError(outsideNode, insideNode) {
		const outsideCall = getNodeCall(outsideNode);
		const insideCall = getNodeCall(insideNode);
		throw createSyntaxError(insideCall, `Cannot call ${getNodeName(insideCall)} inside ${getNodeName(outsideCall)}: both methods are hoisted to the top of the file and not actually called inside each other.`);
	}
	// validate hoistedNodes doesn't have nodes inside other nodes
	for (let i = 0; i < hoistedNodes.length; i++) {
		const node = hoistedNodes[i];
		for (let j = i + 1; j < hoistedNodes.length; j++) {
			const otherNode = hoistedNodes[j];
			if (node.start >= otherNode.start && node.end <= otherNode.end) {
				throw createError(otherNode, node);
			}
			if (otherNode.start >= node.start && otherNode.end <= node.end) {
				throw createError(node, otherNode);
			}
		}
	}
	// hoist vi.mock/vi.hoisted
	for (const node of hoistedNodes) {
		const end = getNodeTail(code, node);
		// don't hoist into itself if it's already at the top
		if (hoistIndex === end || hoistIndex === node.start) {
			hoistIndex = end;
		} else {
			s.move(node.start, end, hoistIndex);
		}
	}
	// hoist actual dynamic imports last so they are inserted after all hoisted mocks
	for (const { node: importNode, id: importId } of imports) {
		const source = importNode.source.value;
		s.update(importNode.start, importNode.end, `const ${importId} = await import(${JSON.stringify(source)});\n`);
		if (importNode.start === hoistIndex) {
			// no need to hoist, but update hoistIndex to keep the order
			hoistIndex = importNode.end;
		} else {
			// There will be an error if the module is called before it is imported,
			// so the module import statement is hoisted to the top
			s.move(importNode.start, importNode.end, hoistIndex);
		}
	}
	if (!hoistedModuleImported && hoistedNodes.length) {
		const utilityImports = [...usedUtilityExports];
		// "vi" or "vitest" is imported from a module other than "vitest"
		if (utilityImports.some((name) => idToImportMap.has(name))) {
			s.prepend(API_NOT_FOUND_CHECK(utilityImports));
		} else if (utilityImports.length) {
			s.prepend(`import { ${[...usedUtilityExports].join(", ")} } from ${JSON.stringify(hoistedModule)}\n`);
		}
	}
	return {
		code: s.toString(),
		map: s.generateMap({
			hires: "boundary",
			source: id
		})
	};
}

function interceptorPlugin(options = {}) {
	const registry = options.registry || new MockerRegistry();
	return {
		name: "vitest:mocks:interceptor",
		enforce: "pre",
		load: {
			order: "pre",
			async handler(id) {
				const mock = registry.getById(id);
				if (!mock) {
					return;
				}
				if (mock.type === "manual") {
					const exports = Object.keys(await mock.resolve());
					const accessor = options.globalThisAccessor || "\"__vitest_mocker__\"";
					return createManualModuleSource(mock.url, exports, accessor);
				}
				if (mock.type === "redirect") {
					return readFile(mock.redirect, "utf-8");
				}
			}
		},
		transform: {
			order: "post",
			handler(code, id) {
				const mock = registry.getById(id);
				if (!mock) {
					return;
				}
				if (mock.type === "automock" || mock.type === "autospy") {
					const m = automockModule(code, mock.type, this.parse, { globalThisAccessor: options.globalThisAccessor });
					return {
						code: m.toString(),
						map: m.generateMap({
							hires: "boundary",
							source: cleanUrl(id)
						})
					};
				}
			}
		},
		configureServer(server) {
			server.ws.on("vitest:interceptor:register", (event) => {
				if (event.type === "manual") {
					const module = ManualMockedModule.fromJSON(event, async () => {
						const keys = await getFactoryExports(event.url);
						return Object.fromEntries(keys.map((key) => [key, null]));
					});
					registry.add(module);
				} else {
					if (event.type === "redirect") {
						const redirectUrl = new URL(event.redirect);
						event.redirect = join(server.config.root, redirectUrl.pathname);
					}
					registry.register(event);
				}
				server.ws.send("vitest:interceptor:register:result");
			});
			server.ws.on("vitest:interceptor:delete", (id) => {
				registry.delete(id);
				server.ws.send("vitest:interceptor:delete:result");
			});
			server.ws.on("vitest:interceptor:invalidate", () => {
				registry.clear();
				server.ws.send("vitest:interceptor:invalidate:result");
			});
			function getFactoryExports(url) {
				server.ws.send("vitest:interceptor:resolve", url);
				let timeout;
				return new Promise((resolve, reject) => {
					timeout = setTimeout(() => {
						reject(new Error(`Timeout while waiting for factory exports of ${url}`));
					}, 1e4);
					server.ws.on("vitest:interceptor:resolved", ({ url: resolvedUrl, keys }) => {
						if (resolvedUrl === url) {
							clearTimeout(timeout);
							resolve(keys);
						}
					});
				});
			}
		}
	};
}

const VALID_ID_PREFIX = "/@id/";
class ServerMockResolver {
	constructor(server, options = {}) {
		this.server = server;
		this.options = options;
	}
	async resolveMock(rawId, importer, options) {
		const { id, fsPath, external } = await this.resolveMockId(rawId, importer);
		const resolvedUrl = this.normalizeResolveIdToUrl({ id }).url;
		if (options.mock === "factory") {
			var _manifest$fsPath;
			const manifest = getViteDepsManifest(this.server.config);
			const needsInterop = (manifest === null || manifest === void 0 || (_manifest$fsPath = manifest[fsPath]) === null || _manifest$fsPath === void 0 ? void 0 : _manifest$fsPath.needsInterop) ?? false;
			return {
				mockType: "manual",
				resolvedId: id,
				resolvedUrl,
				needsInterop
			};
		}
		if (options.mock === "spy") {
			return {
				mockType: "autospy",
				resolvedId: id,
				resolvedUrl
			};
		}
		const redirectUrl = findMockRedirect(this.server.config.root, fsPath, external);
		return {
			mockType: redirectUrl === null ? "automock" : "redirect",
			redirectUrl,
			resolvedId: id,
			resolvedUrl
		};
	}
	invalidate(ids) {
		ids.forEach((id) => {
			const moduleGraph = this.server.moduleGraph;
			const module = moduleGraph.getModuleById(id);
			if (module) {
				module.transformResult = null;
			}
		});
	}
	async resolveId(id, importer) {
		const resolved = await this.server.pluginContainer.resolveId(id, importer, { ssr: false });
		if (!resolved) {
			return null;
		}
		return this.normalizeResolveIdToUrl(resolved);
	}
	normalizeResolveIdToUrl(resolved) {
		const isOptimized = resolved.id.startsWith(withTrailingSlash(this.server.config.cacheDir));
		let url;
		// normalise the URL to be acceptable by the browser
		// https://github.com/vitejs/vite/blob/14027b0f2a9b01c14815c38aab22baf5b29594bb/packages/vite/src/node/plugins/importAnalysis.ts#L103
		const root = this.server.config.root;
		if (resolved.id.startsWith(withTrailingSlash(root))) {
			url = resolved.id.slice(root.length);
		} else if (resolved.id !== "/@react-refresh" && isAbsolute(resolved.id) && existsSync(cleanUrl(resolved.id))) {
			url = join$1("/@fs/", resolved.id);
		} else {
			url = resolved.id;
		}
		if (url[0] !== "." && url[0] !== "/") {
			url = resolved.id.startsWith(VALID_ID_PREFIX) ? resolved.id : VALID_ID_PREFIX + resolved.id.replace("\0", "__x00__");
		}
		return {
			id: resolved.id,
			url,
			optimized: isOptimized
		};
	}
	async resolveMockId(rawId, importer) {
		if (!this.server.moduleGraph.getModuleById(importer) && !importer.startsWith(this.server.config.root)) {
			importer = join$1(this.server.config.root, importer);
		}
		const resolved = await this.server.pluginContainer.resolveId(rawId, importer, { ssr: false });
		return this.resolveModule(rawId, resolved);
	}
	resolveModule(rawId, resolved) {
		const id = (resolved === null || resolved === void 0 ? void 0 : resolved.id) || rawId;
		const external = !isAbsolute(id) || isModuleDirectory(this.options, id) ? rawId : null;
		return {
			id,
			fsPath: cleanUrl(id),
			external
		};
	}
}
function isModuleDirectory(config, path) {
	const moduleDirectories = config.moduleDirectories || ["/node_modules/"];
	return moduleDirectories.some((dir) => path.includes(dir));
}
const metadata = new WeakMap();
function getViteDepsManifest(config) {
	if (metadata.has(config)) {
		return metadata.get(config);
	}
	const cacheDirPath = getDepsCacheDir(config);
	const metadataPath = resolve(cacheDirPath, "_metadata.json");
	if (!existsSync(metadataPath)) {
		return null;
	}
	const { optimized } = JSON.parse(readFileSync(metadataPath, "utf-8"));
	const newManifest = {};
	for (const name in optimized) {
		const dep = optimized[name];
		const file = resolve(cacheDirPath, dep.file);
		newManifest[file] = {
			hash: dep.fileHash,
			needsInterop: dep.needsInterop
		};
	}
	metadata.set(config, newManifest);
	return newManifest;
}
function getDepsCacheDir(config) {
	return resolve(config.cacheDir, "deps");
}
function withTrailingSlash(path) {
	if (path[path.length - 1] !== "/") {
		return `${path}/`;
	}
	return path;
}

// this is an implementation for public usage
// vitest doesn't use this plugin directly
function mockerPlugin(options = {}) {
	let server;
	const registerPath = resolve(fileURLToPath(new URL("./register.js", import.meta.url)));
	return [
		{
			name: "vitest:mocker:ws-rpc",
			config(_, { command }) {
				if (command !== "serve") {
					return;
				}
				return {
					server: { preTransformRequests: false },
					optimizeDeps: { exclude: ["@vitest/mocker/register", "@vitest/mocker/browser"] }
				};
			},
			configureServer(server_) {
				server = server_;
				const mockResolver = new ServerMockResolver(server);
				server.ws.on("vitest:mocks:resolveId", async ({ id, importer }) => {
					const resolved = await mockResolver.resolveId(id, importer);
					server.ws.send("vitest:mocks:resolvedId:result", resolved);
				});
				server.ws.on("vitest:mocks:resolveMock", async ({ id, importer, options }) => {
					const resolved = await mockResolver.resolveMock(id, importer, options);
					server.ws.send("vitest:mocks:resolveMock:result", resolved);
				});
				server.ws.on("vitest:mocks:invalidate", async ({ ids }) => {
					mockResolver.invalidate(ids);
					server.ws.send("vitest:mocks:invalidate:result");
				});
			},
			async load(id) {
				if (id !== registerPath) {
					return;
				}
				if (!server) {
					// mocker doesn't work during build
					return "export {}";
				}
				const content = await readFile(registerPath, "utf-8");
				const result = content.replace(/__VITEST_GLOBAL_THIS_ACCESSOR__/g, options.globalThisAccessor ?? "\"__vitest_mocker__\"").replace("__VITEST_MOCKER_ROOT__", JSON.stringify(server.config.root));
				return result;
			}
		},
		hoistMocksPlugin(options.hoistMocks),
		interceptorPlugin(options),
		automockPlugin(options),
		dynamicImportPlugin(options)
	];
}

export { ServerMockResolver, automockModule, automockPlugin, createManualModuleSource, dynamicImportPlugin, findMockRedirect, hoistMocks, hoistMocksPlugin, interceptorPlugin, mockerPlugin };


/**
 * Module dependencies.
 */

const tty = require('tty');
const util = require('util');

/**
 * This is the Node.js implementation of `debug()`.
 */

exports.init = init;
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.destroy = util.deprecate(
	() => {},
	'Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.'
);

/**
 * Colors.
 */

exports.colors = [6, 2, 3, 4, 5, 1];

try {
	// Optional dependency (as in, doesn't need to be installed, NOT like optionalDependencies in package.json)
	// eslint-disable-next-line import/no-extraneous-dependencies
	const supportsColor = require('supports-color');

	if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
		exports.colors = [
			20,
			21,
			26,
			27,
			32,
			33,
			38,
			39,
			40,
			41,
			42,
			43,
			44,
			45,
			56,
			57,
			62,
			63,
			68,
			69,
			74,
			75,
			76,
			77,
			78,
			79,
			80,
			81,
			92,
			93,
			98,
			99,
			112,
			113,
			128,
			129,
			134,
			135,
			148,
			149,
			160,
			161,
			162,
			163,
			164,
			165,
			166,
			167,
			168,
			169,
			170,
			171,
			172,
			173,
			178,
			179,
			184,
			185,
			196,
			197,
			198,
			199,
			200,
			201,
			202,
			203,
			204,
			205,
			206,
			207,
			208,
			209,
			214,
			215,
			220,
			221
		];
	}
} catch (error) {
	// Swallow - we only care if `supports-color` is available; it doesn't have to be.
}

/**
 * Build up the default `inspectOpts` object from the environment variables.
 *
 *   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
 */

exports.inspectOpts = Object.keys(process.env).filter(key => {
	return /^debug_/i.test(key);
}).reduce((obj, key) => {
	// Camel-case
	const prop = key
		.substring(6)
		.toLowerCase()
		.replace(/_([a-z])/g, (_, k) => {
			return k.toUpperCase();
		});

	// Coerce string value into JS value
	let val = process.env[key];
	if (/^(yes|on|true|enabled)$/i.test(val)) {
		val = true;
	} else if (/^(no|off|false|disabled)$/i.test(val)) {
		val = false;
	} else if (val === 'null') {
		val = null;
	} else {
		val = Number(val);
	}

	obj[prop] = val;
	return obj;
}, {});

/**
 * Is stdout a TTY? Colored output is enabled when `true`.
 */

function useColors() {
	return 'colors' in exports.inspectOpts ?
		Boolean(exports.inspectOpts.colors) :
		tty.isatty(process.stderr.fd);
}

/**
 * Adds ANSI color escape codes if enabled.
 *
 * @api public
 */

function formatArgs(args) {
	const {namespace: name, useColors} = this;

	if (useColors) {
		const c = this.color;
		const colorCode = '\u001B[3' + (c < 8 ? c : '8;5;' + c);
		const prefix = `  ${colorCode};1m${name} \u001B[0m`;

		args[0] = prefix + args[0].split('\n').join('\n' + prefix);
		args.push(colorCode + 'm+' + module.exports.humanize(this.diff) + '\u001B[0m');
	} else {
		args[0] = getDate() + name + ' ' + args[0];
	}
}

function getDate() {
	if (exports.inspectOpts.hideDate) {
		return '';
	}
	return new Date().toISOString() + ' ';
}

/**
 * Invokes `util.formatWithOptions()` with the specified arguments and writes to stderr.
 */

function log(...args) {
	return process.stderr.write(util.formatWithOptions(exports.inspectOpts, ...args) + '\n');
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */
function save(namespaces) {
	if (namespaces) {
		process.env.DEBUG = namespaces;
	} else {
		// If you set a process.env field to null or undefined, it gets cast to the
		// string 'null' or 'undefined'. Just delete instead.
		delete process.env.DEBUG;
	}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
	return process.env.DEBUG;
}

/**
 * Init logic for `debug` instances.
 *
 * Create a new `inspectOpts` object in case `useColors` is set
 * differently for a particular `debug` instance.
 */

function init(debug) {
	debug.inspectOpts = {};

	const keys = Object.keys(exports.inspectOpts);
	for (let i = 0; i < keys.length; i++) {
		debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
	}
}

module.exports = require('./common')(exports);

const {formatters} = module.exports;

/**
 * Map %o to `util.inspect()`, all on a single line.
 */

formatters.o = function (v) {
	this.inspectOpts.colors = this.useColors;
	return util.inspect(v, this.inspectOpts)
		.split('\n')
		.map(str => str.trim())
		.join(' ');
};

/**
 * Map %O to `util.inspect()`, allowing multiple lines if needed.
 */

formatters.O = function (v) {
	this.inspectOpts.colors = this.useColors;
	return util.inspect(v, this.inspectOpts);
};


'use strict'

let CssSyntaxError = require('./css-syntax-error')
let Stringifier = require('./stringifier')
let stringify = require('./stringify')
let { isClean, my } = require('./symbols')

function cloneNode(obj, parent) {
  let cloned = new obj.constructor()

  for (let i in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, i)) {
      /* c8 ignore next 2 */
      continue
    }
    if (i === 'proxyCache') continue
    let value = obj[i]
    let type = typeof value

    if (i === 'parent' && type === 'object') {
      if (parent) cloned[i] = parent
    } else if (i === 'source') {
      cloned[i] = value
    } else if (Array.isArray(value)) {
      cloned[i] = value.map(j => cloneNode(j, cloned))
    } else {
      if (type === 'object' && value !== null) value = cloneNode(value)
      cloned[i] = value
    }
  }

  return cloned
}

function sourceOffset(inputCSS, position) {
  // Not all custom syntaxes support `offset` in `source.start` and `source.end`
  if (position && typeof position.offset !== 'undefined') {
    return position.offset
  }

  let column = 1
  let line = 1
  let offset = 0

  for (let i = 0; i < inputCSS.length; i++) {
    if (line === position.line && column === position.column) {
      offset = i
      break
    }

    if (inputCSS[i] === '\n') {
      column = 1
      line += 1
    } else {
      column += 1
    }
  }

  return offset
}

class Node {
  get proxyOf() {
    return this
  }

  constructor(defaults = {}) {
    this.raws = {}
    this[isClean] = false
    this[my] = true

    for (let name in defaults) {
      if (name === 'nodes') {
        this.nodes = []
        for (let node of defaults[name]) {
          if (typeof node.clone === 'function') {
            this.append(node.clone())
          } else {
            this.append(node)
          }
        }
      } else {
        this[name] = defaults[name]
      }
    }
  }

  addToError(error) {
    error.postcssNode = this
    if (error.stack && this.source && /\n\s{4}at /.test(error.stack)) {
      let s = this.source
      error.stack = error.stack.replace(
        /\n\s{4}at /,
        `$&${s.input.from}:${s.start.line}:${s.start.column}$&`
      )
    }
    return error
  }

  after(add) {
    this.parent.insertAfter(this, add)
    return this
  }

  assign(overrides = {}) {
    for (let name in overrides) {
      this[name] = overrides[name]
    }
    return this
  }

  before(add) {
    this.parent.insertBefore(this, add)
    return this
  }

  cleanRaws(keepBetween) {
    delete this.raws.before
    delete this.raws.after
    if (!keepBetween) delete this.raws.between
  }

  clone(overrides = {}) {
    let cloned = cloneNode(this)
    for (let name in overrides) {
      cloned[name] = overrides[name]
    }
    return cloned
  }

  cloneAfter(overrides = {}) {
    let cloned = this.clone(overrides)
    this.parent.insertAfter(this, cloned)
    return cloned
  }

  cloneBefore(overrides = {}) {
    let cloned = this.clone(overrides)
    this.parent.insertBefore(this, cloned)
    return cloned
  }

  error(message, opts = {}) {
    if (this.source) {
      let { end, start } = this.rangeBy(opts)
      return this.source.input.error(
        message,
        { column: start.column, line: start.line },
        { column: end.column, line: end.line },
        opts
      )
    }
    return new CssSyntaxError(message)
  }

  getProxyProcessor() {
    return {
      get(node, prop) {
        if (prop === 'proxyOf') {
          return node
        } else if (prop === 'root') {
          return () => node.root().toProxy()
        } else {
          return node[prop]
        }
      },

      set(node, prop, value) {
        if (node[prop] === value) return true
        node[prop] = value
        if (
          prop === 'prop' ||
          prop === 'value' ||
          prop === 'name' ||
          prop === 'params' ||
          prop === 'important' ||
          /* c8 ignore next */
          prop === 'text'
        ) {
          node.markDirty()
        }
        return true
      }
    }
  }

  /* c8 ignore next 3 */
  markClean() {
    this[isClean] = true
  }

  markDirty() {
    if (this[isClean]) {
      this[isClean] = false
      let next = this
      while ((next = next.parent)) {
        next[isClean] = false
      }
    }
  }

  next() {
    if (!this.parent) return undefined
    let index = this.parent.index(this)
    return this.parent.nodes[index + 1]
  }

  positionBy(opts = {}) {
    let pos = this.source.start
    if (opts.index) {
      pos = this.positionInside(opts.index)
    } else if (opts.word) {
      let inputString =
        'document' in this.source.input
          ? this.source.input.document
          : this.source.input.css
      let stringRepresentation = inputString.slice(
        sourceOffset(inputString, this.source.start),
        sourceOffset(inputString, this.source.end)
      )
      let index = stringRepresentation.indexOf(opts.word)
      if (index !== -1) pos = this.positionInside(index)
    }
    return pos
  }

  positionInside(index) {
    let column = this.source.start.column
    let line = this.source.start.line
    let inputString =
      'document' in this.source.input
        ? this.source.input.document
        : this.source.input.css
    let offset = sourceOffset(inputString, this.source.start)
    let end = offset + index

    for (let i = offset; i < end; i++) {
      if (inputString[i] === '\n') {
        column = 1
        line += 1
      } else {
        column += 1
      }
    }

    return { column, line, offset: end }
  }

  prev() {
    if (!this.parent) return undefined
    let index = this.parent.index(this)
    return this.parent.nodes[index - 1]
  }

  rangeBy(opts = {}) {
    let inputString =
      'document' in this.source.input
        ? this.source.input.document
        : this.source.input.css
    let start = {
      column: this.source.start.column,
      line: this.source.start.line,
      offset: sourceOffset(inputString, this.source.start)
    }
    let end = this.source.end
      ? {
          column: this.source.end.column + 1,
          line: this.source.end.line,
          offset:
            typeof this.source.end.offset === 'number'
              ? // `source.end.offset` is exclusive, so we don't need to add 1
                this.source.end.offset
              : // Since line/column in this.source.end is inclusive,
                // the `sourceOffset(... , this.source.end)` returns an inclusive offset.
                // So, we add 1 to convert it to exclusive.
                sourceOffset(inputString, this.source.end) + 1
        }
      : {
          column: start.column + 1,
          line: start.line,
          offset: start.offset + 1
        }

    if (opts.word) {
      let stringRepresentation = inputString.slice(
        sourceOffset(inputString, this.source.start),
        sourceOffset(inputString, this.source.end)
      )
      let index = stringRepresentation.indexOf(opts.word)
      if (index !== -1) {
        start = this.positionInside(index)
        end = this.positionInside(index + opts.word.length)
      }
    } else {
      if (opts.start) {
        start = {
          column: opts.start.column,
          line: opts.start.line,
          offset: sourceOffset(inputString, opts.start)
        }
      } else if (opts.index) {
        start = this.positionInside(opts.index)
      }

      if (opts.end) {
        end = {
          column: opts.end.column,
          line: opts.end.line,
          offset: sourceOffset(inputString, opts.end)
        }
      } else if (typeof opts.endIndex === 'number') {
        end = this.positionInside(opts.endIndex)
      } else if (opts.index) {
        end = this.positionInside(opts.index + 1)
      }
    }

    if (
      end.line < start.line ||
      (end.line === start.line && end.column <= start.column)
    ) {
      end = {
        column: start.column + 1,
        line: start.line,
        offset: start.offset + 1
      }
    }

    return { end, start }
  }

  raw(prop, defaultType) {
    let str = new Stringifier()
    return str.raw(this, prop, defaultType)
  }

  remove() {
    if (this.parent) {
      this.parent.removeChild(this)
    }
    this.parent = undefined
    return this
  }

  replaceWith(...nodes) {
    if (this.parent) {
      let bookmark = this
      let foundSelf = false
      for (let node of nodes) {
        if (node === this) {
          foundSelf = true
        } else if (foundSelf) {
          this.parent.insertAfter(bookmark, node)
          bookmark = node
        } else {
          this.parent.insertBefore(bookmark, node)
        }
      }

      if (!foundSelf) {
        this.remove()
      }
    }

    return this
  }

  root() {
    let result = this
    while (result.parent && result.parent.type !== 'document') {
      result = result.parent
    }
    return result
  }

  toJSON(_, inputs) {
    let fixed = {}
    let emitInputs = inputs == null
    inputs = inputs || new Map()
    let inputsNextIndex = 0

    for (let name in this) {
      if (!Object.prototype.hasOwnProperty.call(this, name)) {
        /* c8 ignore next 2 */
        continue
      }
      if (name === 'parent' || name === 'proxyCache') continue
      let value = this[name]

      if (Array.isArray(value)) {
        fixed[name] = value.map(i => {
          if (typeof i === 'object' && i.toJSON) {
            return i.toJSON(null, inputs)
          } else {
            return i
          }
        })
      } else if (typeof value === 'object' && value.toJSON) {
        fixed[name] = value.toJSON(null, inputs)
      } else if (name === 'source') {
        if (value == null) continue
        let inputId = inputs.get(value.input)
        if (inputId == null) {
          inputId = inputsNextIndex
          inputs.set(value.input, inputsNextIndex)
          inputsNextIndex++
        }
        fixed[name] = {
          end: value.end,
          inputId,
          start: value.start
        }
      } else {
        fixed[name] = value
      }
    }

    if (emitInputs) {
      fixed.inputs = [...inputs.keys()].map(input => input.toJSON())
    }

    return fixed
  }

  toProxy() {
    if (!this.proxyCache) {
      this.proxyCache = new Proxy(this, this.getProxyProcessor())
    }
    return this.proxyCache
  }

  toString(stringifier = stringify) {
    if (stringifier.stringify) stringifier = stringifier.stringify
    let result = ''
    stringifier(this, i => {
      result += i
    })
    return result
  }

  warn(result, text, opts = {}) {
    let data = { node: this }
    for (let i in opts) data[i] = opts[i]
    return result.warn(text, data)
  }
}

module.exports = Node
Node.default = Node


import {
  a as e,
  b as t,
  c as o
} from "./chunk-BVHSVHOK.js";

// src/node.ts
import { isatty as s } from "tty";
var r = process.env.FORCE_TTY !== void 0 || s(1);
function n() {
  return t(r);
}
function a() {
  return o(r);
}
var u = o(r);
export {
  a as createColors,
  u as default,
  e as getDefaultColors,
  n as isSupported
};


import * as vite from 'vite';
import { resolveConfig as resolveConfig$1, mergeConfig } from 'vite';
export { esbuildVersion, isCSSRequest, isFileServingAllowed, parseAst, parseAstAsync, rollupVersion, version as viteVersion } from 'vite';
import { V as Vitest, a as VitestPlugin, T as TestModule } from './chunks/cli-api.BkDphVBG.js';
export { G as GitNotFoundError, F as TestsNotFoundError, b as VitestPackageInstaller, e as createViteLogger, c as createVitest, i as isValidApiRequest, d as registerConsoleShortcuts, r as resolveFsAllow, s as startVitest } from './chunks/cli-api.BkDphVBG.js';
export { p as parseCLI } from './chunks/cac.Cb-PYCCB.js';
import { r as resolveConfig$2 } from './chunks/coverage.DL5VHqXY.js';
export { b as BaseSequencer, c as createMethodsRPC, g as getFilePoolName, a as resolveApiServerConfig } from './chunks/coverage.DL5VHqXY.js';
import { slash, deepClone } from '@vitest/utils';
import { f as findUp } from './chunks/index.X0nbfr6-.js';
import { resolve } from 'pathe';
import { c as configFiles } from './chunks/constants.DnKduX2e.js';
export { distDir, rootDir } from './path.js';
import createDebug from 'debug';
export { generateFileHash } from '@vitest/runner/utils';
import 'node:fs';
import './chunks/coverage.DVF1vEu8.js';
import 'node:path';
import '@vitest/snapshot/manager';
import 'vite-node/client';
import 'vite-node/server';
import './chunks/index.B521nVV-.js';
import './chunks/index.VByaPkjc.js';
import 'node:perf_hooks';
import '@vitest/utils/source-map';
import 'tinyrainbow';
import './chunks/env.D4Lgay0q.js';
import 'std-env';
import './chunks/typechecker.DRKU1-1g.js';
import 'node:os';
import 'tinyexec';
import 'node:util';
import 'node:fs/promises';
import 'node:console';
import 'node:stream';
import 'node:module';
import 'events';
import 'https';
import 'http';
import 'net';
import 'tls';
import 'crypto';
import 'stream';
import 'url';
import 'zlib';
import 'buffer';
import './chunks/_commonjsHelpers.BFTU3MAI.js';
import 'node:crypto';
import 'node:url';
import 'picomatch';
import 'tinyglobby';
import 'vite-node/utils';
import '@vitest/mocker/node';
import './chunks/defaults.B7q_naMc.js';
import 'magic-string';
import './chunks/index.BCWujgDG.js';
import 'node:assert';
import '@vitest/utils/error';
import 'node:readline';
import 'node:process';
import 'node:v8';
import 'node:tty';
import 'node:events';
import 'tinypool';
import 'node:worker_threads';
import 'readline';

// this is only exported as a public function and not used inside vitest
async function resolveConfig(options = {}, viteOverrides = {}) {
	const root = slash(resolve(options.root || process.cwd()));
	const configPath = options.config === false ? false : options.config ? resolve(root, options.config) : await findUp(configFiles, { cwd: root });
	options.config = configPath;
	const vitest = new Vitest("test", deepClone(options));
	const config = await resolveConfig$1(mergeConfig({
		configFile: configPath,
		mode: options.mode || "test",
		plugins: [await VitestPlugin(options, vitest)]
	}, mergeConfig(viteOverrides, { root: options.root })), "serve");
	// Reflect just to avoid type error
	const updatedOptions = Reflect.get(config, "_vitest");
	const vitestConfig = resolveConfig$2(vitest, updatedOptions, config);
	await vitest.close();
	return {
		viteConfig: config,
		vitestConfig
	};
}

function createDebugger(namespace) {
	const debug = createDebug(namespace);
	if (debug.enabled) return debug;
}

const version = Vitest.version;
/** @deprecated use `createViteServer` instead */
const createServer = vite.createServer;
const createViteServer = vite.createServer;
/**
* @deprecated Use `TestModule` instead
*/
const TestFile = TestModule;
// rolldownVersion is exported only by rolldown-vite
const rolldownVersion = vite.rolldownVersion;

export { TestFile, VitestPlugin, createDebugger, createServer, createViteServer, resolveConfig, rolldownVersion, version };


import { a as cleanUrl, c as createManualModuleSource } from './chunk-utils.js';
import MagicString from 'magic-string';
import { walk } from 'estree-walker';
import { createFilter } from 'vite';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path/posix';
import { M as MockerRegistry, a as ManualMockedModule } from './chunk-registry.js';
import { fileURLToPath } from 'node:url';
import { existsSync, readFileSync } from 'node:fs';
import { findMockRedirect } from './redirect.js';
import { i as isAbsolute, j as join$1, r as resolve } from './chunk-pathe.M-eThtNZ.js';
import 'node:module';

const isNodeInPatternWeakSet = new WeakSet();
function setIsNodeInPattern(node) {
	return isNodeInPatternWeakSet.add(node);
}
function isNodeInPattern(node) {
	return isNodeInPatternWeakSet.has(node);
}
/**
* Same logic from \@vue/compiler-core & \@vue/compiler-sfc
* Except this is using acorn AST
*/
function esmWalker(root, { onIdentifier, onImportMeta, onDynamicImport, onCallExpression }) {
	const parentStack = [];
	const varKindStack = [];
	const scopeMap = new WeakMap();
	const identifiers = [];
	const setScope = (node, name) => {
		let scopeIds = scopeMap.get(node);
		if (scopeIds && scopeIds.has(name)) {
			return;
		}
		if (!scopeIds) {
			scopeIds = new Set();
			scopeMap.set(node, scopeIds);
		}
		scopeIds.add(name);
	};
	function isInScope(name, parents) {
		return parents.some((node) => {
			var _scopeMap$get;
			return node && ((_scopeMap$get = scopeMap.get(node)) === null || _scopeMap$get === void 0 ? void 0 : _scopeMap$get.has(name));
		});
	}
	function handlePattern(p, parentScope) {
		if (p.type === "Identifier") {
			setScope(parentScope, p.name);
		} else if (p.type === "RestElement") {
			handlePattern(p.argument, parentScope);
		} else if (p.type === "ObjectPattern") {
			p.properties.forEach((property) => {
				if (property.type === "RestElement") {
					setScope(parentScope, property.argument.name);
				} else {
					handlePattern(property.value, parentScope);
				}
			});
		} else if (p.type === "ArrayPattern") {
			p.elements.forEach((element) => {
				if (element) {
					handlePattern(element, parentScope);
				}
			});
		} else if (p.type === "AssignmentPattern") {
			handlePattern(p.left, parentScope);
		} else {
			setScope(parentScope, p.name);
		}
	}
	walk(root, {
		enter(node, parent) {
			if (node.type === "ImportDeclaration") {
				return this.skip();
			}
			// track parent stack, skip for "else-if"/"else" branches as acorn nests
			// the ast within "if" nodes instead of flattening them
			if (parent && !(parent.type === "IfStatement" && node === parent.alternate)) {
				parentStack.unshift(parent);
			}
			// track variable declaration kind stack used by VariableDeclarator
			if (node.type === "VariableDeclaration") {
				varKindStack.unshift(node.kind);
			}
			if (node.type === "CallExpression") {
				onCallExpression === null || onCallExpression === void 0 ? void 0 : onCallExpression(node);
			}
			if (node.type === "MetaProperty" && node.meta.name === "import") {
				onImportMeta === null || onImportMeta === void 0 ? void 0 : onImportMeta(node);
			} else if (node.type === "ImportExpression") {
				onDynamicImport === null || onDynamicImport === void 0 ? void 0 : onDynamicImport(node);
			}
			if (node.type === "Identifier") {
				if (!isInScope(node.name, parentStack) && isRefIdentifier(node, parent, parentStack)) {
					// record the identifier, for DFS -> BFS
					identifiers.push([node, parentStack.slice(0)]);
				}
			} else if (isFunctionNode(node)) {
				// If it is a function declaration, it could be shadowing an import
				// Add its name to the scope so it won't get replaced
				if (node.type === "FunctionDeclaration") {
					const parentScope = findParentScope(parentStack);
					if (parentScope) {
						setScope(parentScope, node.id.name);
					}
				}
				// walk function expressions and add its arguments to known identifiers
				// so that we don't prefix them
				node.params.forEach((p) => {
					if (p.type === "ObjectPattern" || p.type === "ArrayPattern") {
						handlePattern(p, node);
						return;
					}
					walk(p.type === "AssignmentPattern" ? p.left : p, { enter(child, parent) {
						// skip params default value of destructure
						if ((parent === null || parent === void 0 ? void 0 : parent.type) === "AssignmentPattern" && (parent === null || parent === void 0 ? void 0 : parent.right) === child) {
							return this.skip();
						}
						if (child.type !== "Identifier") {
							return;
						}
						// do not record as scope variable if is a destructuring keyword
						if (isStaticPropertyKey(child, parent)) {
							return;
						}
						// do not record if this is a default value
						// assignment of a destructuring variable
						if ((parent === null || parent === void 0 ? void 0 : parent.type) === "TemplateLiteral" && (parent === null || parent === void 0 ? void 0 : parent.expressions.includes(child)) || (parent === null || parent === void 0 ? void 0 : parent.type) === "CallExpression" && (parent === null || parent === void 0 ? void 0 : parent.callee) === child) {
							return;
						}
						setScope(node, child.name);
					} });
				});
			} else if (node.type === "Property" && parent.type === "ObjectPattern") {
				// mark property in destructuring pattern
				setIsNodeInPattern(node);
			} else if (node.type === "VariableDeclarator") {
				const parentFunction = findParentScope(parentStack, varKindStack[0] === "var");
				if (parentFunction) {
					handlePattern(node.id, parentFunction);
				}
			} else if (node.type === "CatchClause" && node.param) {
				handlePattern(node.param, node);
			}
		},
		leave(node, parent) {
			// untrack parent stack from above
			if (parent && !(parent.type === "IfStatement" && node === parent.alternate)) {
				parentStack.shift();
			}
			if (node.type === "VariableDeclaration") {
				varKindStack.shift();
			}
		}
	});
	// emit the identifier events in BFS so the hoisted declarations
	// can be captured correctly
	identifiers.forEach(([node, stack]) => {
		if (!isInScope(node.name, stack)) {
			const parent = stack[0];
			const grandparent = stack[1];
			const hasBindingShortcut = isStaticProperty(parent) && parent.shorthand && (!isNodeInPattern(parent) || isInDestructuringAssignment(parent, parentStack));
			const classDeclaration = parent.type === "PropertyDefinition" && (grandparent === null || grandparent === void 0 ? void 0 : grandparent.type) === "ClassBody" || parent.type === "ClassDeclaration" && node === parent.superClass;
			const classExpression = parent.type === "ClassExpression" && node === parent.id;
			onIdentifier === null || onIdentifier === void 0 ? void 0 : onIdentifier(node, {
				hasBindingShortcut,
				classDeclaration,
				classExpression
			}, stack);
		}
	});
}
function isRefIdentifier(id, parent, parentStack) {
	// declaration id
	if (parent.type === "CatchClause" || (parent.type === "VariableDeclarator" || parent.type === "ClassDeclaration") && parent.id === id) {
		return false;
	}
	if (isFunctionNode(parent)) {
		// function declaration/expression id
		if (parent.id === id) {
			return false;
		}
		// params list
		if (parent.params.includes(id)) {
			return false;
		}
	}
	// class method name
	if (parent.type === "MethodDefinition" && !parent.computed) {
		return false;
	}
	// property key
	if (isStaticPropertyKey(id, parent)) {
		return false;
	}
	// object destructuring pattern
	if (isNodeInPattern(parent) && parent.value === id) {
		return false;
	}
	// non-assignment array destructuring pattern
	if (parent.type === "ArrayPattern" && !isInDestructuringAssignment(parent, parentStack)) {
		return false;
	}
	// member expression property
	if (parent.type === "MemberExpression" && parent.property === id && !parent.computed) {
		return false;
	}
	if (parent.type === "ExportSpecifier") {
		return false;
	}
	// is a special keyword but parsed as identifier
	if (id.name === "arguments") {
		return false;
	}
	return true;
}
function isStaticProperty(node) {
	return node && node.type === "Property" && !node.computed;
}
function isStaticPropertyKey(node, parent) {
	return isStaticProperty(parent) && parent.key === node;
}
const functionNodeTypeRE = /Function(?:Expression|Declaration)$|Method$/;
function isFunctionNode(node) {
	return functionNodeTypeRE.test(node.type);
}
const blockNodeTypeRE = /^BlockStatement$|^For(?:In|Of)?Statement$/;
function isBlock(node) {
	return blockNodeTypeRE.test(node.type);
}
function findParentScope(parentStack, isVar = false) {
	return parentStack.find(isVar ? isFunctionNode : isBlock);
}
function isInDestructuringAssignment(parent, parentStack) {
	if (parent && (parent.type === "Property" || parent.type === "ArrayPattern")) {
		return parentStack.some((i) => i.type === "AssignmentExpression");
	}
	return false;
}
function getArbitraryModuleIdentifier(node) {
	return node.type === "Identifier" ? node.name : node.raw;
}

function automockPlugin(options = {}) {
	return {
		name: "vitest:automock",
		enforce: "post",
		transform(code, id) {
			if (id.includes("mock=automock") || id.includes("mock=autospy")) {
				const mockType = id.includes("mock=automock") ? "automock" : "autospy";
				const ms = automockModule(code, mockType, this.parse, options);
				return {
					code: ms.toString(),
					map: ms.generateMap({
						hires: "boundary",
						source: cleanUrl(id)
					})
				};
			}
		}
	};
}
// TODO: better source map replacement
function automockModule(code, mockType, parse, options = {}) {
	const globalThisAccessor = options.globalThisAccessor || "\"__vitest_mocker__\"";
	const ast = parse(code);
	const m = new MagicString(code);
	const allSpecifiers = [];
	let importIndex = 0;
	for (const _node of ast.body) {
		if (_node.type === "ExportAllDeclaration") {
			throw new Error(`automocking files with \`export *\` is not supported in browser mode because it cannot be statically analysed`);
		}
		if (_node.type === "ExportNamedDeclaration") {
			const node = _node;
			const declaration = node.declaration;
			function traversePattern(expression) {
				// export const test = '1'
				if (expression.type === "Identifier") {
					allSpecifiers.push({ name: expression.name });
				} else if (expression.type === "ArrayPattern") {
					expression.elements.forEach((element) => {
						if (!element) {
							return;
						}
						traversePattern(element);
					});
				} else if (expression.type === "ObjectPattern") {
					expression.properties.forEach((property) => {
						// export const { ...rest } = {}
						if (property.type === "RestElement") {
							traversePattern(property);
						} else if (property.type === "Property") {
							traversePattern(property.value);
						} else ;
					});
				} else if (expression.type === "RestElement") {
					traversePattern(expression.argument);
				} else if (expression.type === "AssignmentPattern") {
					throw new Error(`AssignmentPattern is not supported. Please open a new bug report.`);
				} else if (expression.type === "MemberExpression") {
					throw new Error(`MemberExpression is not supported. Please open a new bug report.`);
				} else ;
			}
			if (declaration) {
				if (declaration.type === "FunctionDeclaration") {
					allSpecifiers.push({ name: declaration.id.name });
				} else if (declaration.type === "VariableDeclaration") {
					declaration.declarations.forEach((declaration) => {
						traversePattern(declaration.id);
					});
				} else if (declaration.type === "ClassDeclaration") {
					allSpecifiers.push({ name: declaration.id.name });
				} else ;
				m.remove(node.start, declaration.start);
			}
			const specifiers = node.specifiers || [];
			const source = node.source;
			if (!source && specifiers.length) {
				specifiers.forEach((specifier) => {
					allSpecifiers.push({
						alias: getArbitraryModuleIdentifier(specifier.exported),
						name: getArbitraryModuleIdentifier(specifier.local)
					});
				});
				m.remove(node.start, node.end);
			} else if (source && specifiers.length) {
				const importNames = [];
				specifiers.forEach((specifier) => {
					const importedName = `__vitest_imported_${importIndex++}__`;
					importNames.push([getArbitraryModuleIdentifier(specifier.local), importedName]);
					allSpecifiers.push({
						name: importedName,
						alias: getArbitraryModuleIdentifier(specifier.exported)
					});
				});
				const importString = `import { ${importNames.map(([name, alias]) => `${name} as ${alias}`).join(", ")} } from '${source.value}'`;
				m.overwrite(node.start, node.end, importString);
			}
		}
		if (_node.type === "ExportDefaultDeclaration") {
			const node = _node;
			const declaration = node.declaration;
			allSpecifiers.push({
				name: "__vitest_default",
				alias: "default"
			});
			m.overwrite(node.start, declaration.start, `const __vitest_default = `);
		}
	}
	const moduleObject = `
const __vitest_current_es_module__ = {
  __esModule: true,
  ${allSpecifiers.map(({ name }) => `["${name}"]: ${name},`).join("\n  ")}
}
const __vitest_mocked_module__ = globalThis[${globalThisAccessor}].mockObject(__vitest_current_es_module__, "${mockType}")
`;
	const assigning = allSpecifiers.map(({ name }, index) => {
		return `const __vitest_mocked_${index}__ = __vitest_mocked_module__["${name}"]`;
	}).join("\n");
	const redeclarations = allSpecifiers.map(({ name, alias }, index) => {
		return `  __vitest_mocked_${index}__ as ${alias || name},`;
	}).join("\n");
	const specifiersExports = `
export {
${redeclarations}
}
`;
	m.append(moduleObject + assigning + specifiersExports);
	return m;
}

const regexDynamicImport = /import\s*\(/;
function dynamicImportPlugin(options = {}) {
	return {
		name: "vitest:browser:esm-injector",
		enforce: "post",
		transform(source, id) {
			// TODO: test is not called for static imports
			if (!regexDynamicImport.test(source)) {
				return;
			}
			if (options.filter && !options.filter(id)) {
				return;
			}
			return injectDynamicImport(source, id, this.parse, options);
		}
	};
}
function injectDynamicImport(code, id, parse, options = {}) {
	const s = new MagicString(code);
	let ast;
	try {
		ast = parse(code);
	} catch (err) {
		console.error(`Cannot parse ${id}:\n${err.message}`);
		return;
	}
	// 3. convert references to import bindings & import.meta references
	esmWalker(ast, {
		onImportMeta() {
			// s.update(node.start, node.end, viImportMetaKey)
		},
		onDynamicImport(node) {
			const globalThisAccessor = options.globalThisAccessor || "\"__vitest_mocker__\"";
			const replaceString = `globalThis[${globalThisAccessor}].wrapDynamicImport(() => import(`;
			const importSubstring = code.substring(node.start, node.end);
			const hasIgnore = importSubstring.includes("/* @vite-ignore */");
			s.overwrite(node.start, node.source.start, replaceString + (hasIgnore ? "/* @vite-ignore */ " : ""));
			s.overwrite(node.end - 1, node.end, "))");
		}
	});
	return {
		code: s.toString(),
		map: s.generateMap({
			hires: "boundary",
			source: id
		})
	};
}

// AST walker module for ESTree compatible trees


function makeTest(test) {
  if (typeof test === "string")
    { return function (type) { return type === test; } }
  else if (!test)
    { return function () { return true; } }
  else
    { return test }
}

var Found = function Found(node, state) { this.node = node; this.state = state; };

// Find the innermost node of a given type that contains the given
// position. Interface similar to findNodeAt.
function findNodeAround(node, pos, test, baseVisitor, state) {
  test = makeTest(test);
  if (!baseVisitor) { baseVisitor = base; }
  try {
    (function c(node, st, override) {
      var type = override || node.type;
      if (node.start > pos || node.end < pos) { return }
      baseVisitor[type](node, st, c);
      if (test(type, node)) { throw new Found(node, st) }
    })(node, state);
  } catch (e) {
    if (e instanceof Found) { return e }
    throw e
  }
}

function skipThrough(node, st, c) { c(node, st); }
function ignore(_node, _st, _c) {}

// Node walkers.

var base = {};

base.Program = base.BlockStatement = base.StaticBlock = function (node, st, c) {
  for (var i = 0, list = node.body; i < list.length; i += 1)
    {
    var stmt = list[i];

    c(stmt, st, "Statement");
  }
};
base.Statement = skipThrough;
base.EmptyStatement = ignore;
base.ExpressionStatement = base.ParenthesizedExpression = base.ChainExpression =
  function (node, st, c) { return c(node.expression, st, "Expression"); };
base.IfStatement = function (node, st, c) {
  c(node.test, st, "Expression");
  c(node.consequent, st, "Statement");
  if (node.alternate) { c(node.alternate, st, "Statement"); }
};
base.LabeledStatement = function (node, st, c) { return c(node.body, st, "Statement"); };
base.BreakStatement = base.ContinueStatement = ignore;
base.WithStatement = function (node, st, c) {
  c(node.object, st, "Expression");
  c(node.body, st, "Statement");
};
base.SwitchStatement = function (node, st, c) {
  c(node.discriminant, st, "Expression");
  for (var i = 0, list = node.cases; i < list.length; i += 1) {
    var cs = list[i];

    c(cs, st);
  }
};
base.SwitchCase = function (node, st, c) {
  if (node.test) { c(node.test, st, "Expression"); }
  for (var i = 0, list = node.consequent; i < list.length; i += 1)
    {
    var cons = list[i];

    c(cons, st, "Statement");
  }
};
base.ReturnStatement = base.YieldExpression = base.AwaitExpression = function (node, st, c) {
  if (node.argument) { c(node.argument, st, "Expression"); }
};
base.ThrowStatement = base.SpreadElement =
  function (node, st, c) { return c(node.argument, st, "Expression"); };
base.TryStatement = function (node, st, c) {
  c(node.block, st, "Statement");
  if (node.handler) { c(node.handler, st); }
  if (node.finalizer) { c(node.finalizer, st, "Statement"); }
};
base.CatchClause = function (node, st, c) {
  if (node.param) { c(node.param, st, "Pattern"); }
  c(node.body, st, "Statement");
};
base.WhileStatement = base.DoWhileStatement = function (node, st, c) {
  c(node.test, st, "Expression");
  c(node.body, st, "Statement");
};
base.ForStatement = function (node, st, c) {
  if (node.init) { c(node.init, st, "ForInit"); }
  if (node.test) { c(node.test, st, "Expression"); }
  if (node.update) { c(node.update, st, "Expression"); }
  c(node.body, st, "Statement");
};
base.ForInStatement = base.ForOfStatement = function (node, st, c) {
  c(node.left, st, "ForInit");
  c(node.right, st, "Expression");
  c(node.body, st, "Statement");
};
base.ForInit = function (node, st, c) {
  if (node.type === "VariableDeclaration") { c(node, st); }
  else { c(node, st, "Expression"); }
};
base.DebuggerStatement = ignore;

base.FunctionDeclaration = function (node, st, c) { return c(node, st, "Function"); };
base.VariableDeclaration = function (node, st, c) {
  for (var i = 0, list = node.declarations; i < list.length; i += 1)
    {
    var decl = list[i];

    c(decl, st);
  }
};
base.VariableDeclarator = function (node, st, c) {
  c(node.id, st, "Pattern");
  if (node.init) { c(node.init, st, "Expression"); }
};

base.Function = function (node, st, c) {
  if (node.id) { c(node.id, st, "Pattern"); }
  for (var i = 0, list = node.params; i < list.length; i += 1)
    {
    var param = list[i];

    c(param, st, "Pattern");
  }
  c(node.body, st, node.expression ? "Expression" : "Statement");
};

base.Pattern = function (node, st, c) {
  if (node.type === "Identifier")
    { c(node, st, "VariablePattern"); }
  else if (node.type === "MemberExpression")
    { c(node, st, "MemberPattern"); }
  else
    { c(node, st); }
};
base.VariablePattern = ignore;
base.MemberPattern = skipThrough;
base.RestElement = function (node, st, c) { return c(node.argument, st, "Pattern"); };
base.ArrayPattern = function (node, st, c) {
  for (var i = 0, list = node.elements; i < list.length; i += 1) {
    var elt = list[i];

    if (elt) { c(elt, st, "Pattern"); }
  }
};
base.ObjectPattern = function (node, st, c) {
  for (var i = 0, list = node.properties; i < list.length; i += 1) {
    var prop = list[i];

    if (prop.type === "Property") {
      if (prop.computed) { c(prop.key, st, "Expression"); }
      c(prop.value, st, "Pattern");
    } else if (prop.type === "RestElement") {
      c(prop.argument, st, "Pattern");
    }
  }
};

base.Expression = skipThrough;
base.ThisExpression = base.Super = base.MetaProperty = ignore;
base.ArrayExpression = function (node, st, c) {
  for (var i = 0, list = node.elements; i < list.length; i += 1) {
    var elt = list[i];

    if (elt) { c(elt, st, "Expression"); }
  }
};
base.ObjectExpression = function (node, st, c) {
  for (var i = 0, list = node.properties; i < list.length; i += 1)
    {
    var prop = list[i];

    c(prop, st);
  }
};
base.FunctionExpression = base.ArrowFunctionExpression = base.FunctionDeclaration;
base.SequenceExpression = function (node, st, c) {
  for (var i = 0, list = node.expressions; i < list.length; i += 1)
    {
    var expr = list[i];

    c(expr, st, "Expression");
  }
};
base.TemplateLiteral = function (node, st, c) {
  for (var i = 0, list = node.quasis; i < list.length; i += 1)
    {
    var quasi = list[i];

    c(quasi, st);
  }

  for (var i$1 = 0, list$1 = node.expressions; i$1 < list$1.length; i$1 += 1)
    {
    var expr = list$1[i$1];

    c(expr, st, "Expression");
  }
};
base.TemplateElement = ignore;
base.UnaryExpression = base.UpdateExpression = function (node, st, c) {
  c(node.argument, st, "Expression");
};
base.BinaryExpression = base.LogicalExpression = function (node, st, c) {
  c(node.left, st, "Expression");
  c(node.right, st, "Expression");
};
base.AssignmentExpression = base.AssignmentPattern = function (node, st, c) {
  c(node.left, st, "Pattern");
  c(node.right, st, "Expression");
};
base.ConditionalExpression = function (node, st, c) {
  c(node.test, st, "Expression");
  c(node.consequent, st, "Expression");
  c(node.alternate, st, "Expression");
};
base.NewExpression = base.CallExpression = function (node, st, c) {
  c(node.callee, st, "Expression");
  if (node.arguments)
    { for (var i = 0, list = node.arguments; i < list.length; i += 1)
      {
        var arg = list[i];

        c(arg, st, "Expression");
      } }
};
base.MemberExpression = function (node, st, c) {
  c(node.object, st, "Expression");
  if (node.computed) { c(node.property, st, "Expression"); }
};
base.ExportNamedDeclaration = base.ExportDefaultDeclaration = function (node, st, c) {
  if (node.declaration)
    { c(node.declaration, st, node.type === "ExportNamedDeclaration" || node.declaration.id ? "Statement" : "Expression"); }
  if (node.source) { c(node.source, st, "Expression"); }
};
base.ExportAllDeclaration = function (node, st, c) {
  if (node.exported)
    { c(node.exported, st); }
  c(node.source, st, "Expression");
};
base.ImportDeclaration = function (node, st, c) {
  for (var i = 0, list = node.specifiers; i < list.length; i += 1)
    {
    var spec = list[i];

    c(spec, st);
  }
  c(node.source, st, "Expression");
};
base.ImportExpression = function (node, st, c) {
  c(node.source, st, "Expression");
};
base.ImportSpecifier = base.ImportDefaultSpecifier = base.ImportNamespaceSpecifier = base.Identifier = base.PrivateIdentifier = base.Literal = ignore;

base.TaggedTemplateExpression = function (node, st, c) {
  c(node.tag, st, "Expression");
  c(node.quasi, st, "Expression");
};
base.ClassDeclaration = base.ClassExpression = function (node, st, c) { return c(node, st, "Class"); };
base.Class = function (node, st, c) {
  if (node.id) { c(node.id, st, "Pattern"); }
  if (node.superClass) { c(node.superClass, st, "Expression"); }
  c(node.body, st);
};
base.ClassBody = function (node, st, c) {
  for (var i = 0, list = node.body; i < list.length; i += 1)
    {
    var elt = list[i];

    c(elt, st);
  }
};
base.MethodDefinition = base.PropertyDefinition = base.Property = function (node, st, c) {
  if (node.computed) { c(node.key, st, "Expression"); }
  if (node.value) { c(node.value, st, "Expression"); }
};

function hoistMocksPlugin(options = {}) {
	const filter = options.filter || createFilter(options.include, options.exclude);
	const { hoistableMockMethodNames = ["mock", "unmock"], dynamicImportMockMethodNames = [
		"mock",
		"unmock",
		"doMock",
		"doUnmock"
	], hoistedMethodNames = ["hoisted"], utilsObjectNames = ["vi", "vitest"] } = options;
	const methods = new Set([
		...hoistableMockMethodNames,
		...hoistedMethodNames,
		...dynamicImportMockMethodNames
	]);
	const regexpHoistable = new RegExp(`\\b(?:${utilsObjectNames.join("|")})\\s*\.\\s*(?:${Array.from(methods).join("|")})\\(`);
	return {
		name: "vitest:mocks",
		enforce: "post",
		transform(code, id) {
			if (!filter(id)) {
				return;
			}
			return hoistMocks(code, id, this.parse, {
				regexpHoistable,
				hoistableMockMethodNames,
				hoistedMethodNames,
				utilsObjectNames,
				dynamicImportMockMethodNames,
				...options
			});
		}
	};
}
const API_NOT_FOUND_ERROR = `There are some problems in resolving the mocks API.
You may encounter this issue when importing the mocks API from another module other than 'vitest'.
To fix this issue you can either:
- import the mocks API directly from 'vitest'
- enable the 'globals' options`;
function API_NOT_FOUND_CHECK(names) {
	return `\nif (${names.map((name) => `typeof globalThis["${name}"] === "undefined"`).join(" && ")}) ` + `{ throw new Error(${JSON.stringify(API_NOT_FOUND_ERROR)}) }\n`;
}
function isIdentifier(node) {
	return node.type === "Identifier";
}
function getNodeTail(code, node) {
	let end = node.end;
	if (code[node.end] === ";") {
		end += 1;
	}
	if (code[node.end] === "\n") {
		return end + 1;
	}
	if (code[node.end + 1] === "\n") {
		end += 1;
	}
	return end;
}
const regexpHoistable = /\b(?:vi|vitest)\s*\.\s*(?:mock|unmock|hoisted|doMock|doUnmock)\(/;
const hashbangRE = /^#!.*\n/;
// this is a fork of Vite SSR transform
function hoistMocks(code, id, parse, options = {}) {
	var _hashbangRE$exec;
	const needHoisting = (options.regexpHoistable || regexpHoistable).test(code);
	if (!needHoisting) {
		return;
	}
	const s = new MagicString(code);
	let ast;
	try {
		ast = parse(code);
	} catch (err) {
		console.error(`Cannot parse ${id}:\n${err.message}.`);
		return;
	}
	const { hoistableMockMethodNames = ["mock", "unmock"], dynamicImportMockMethodNames = [
		"mock",
		"unmock",
		"doMock",
		"doUnmock"
	], hoistedMethodNames = ["hoisted"], utilsObjectNames = ["vi", "vitest"], hoistedModule = "vitest" } = options;
	// hoist at the start of the file, after the hashbang
	let hoistIndex = ((_hashbangRE$exec = hashbangRE.exec(code)) === null || _hashbangRE$exec === void 0 ? void 0 : _hashbangRE$exec[0].length) ?? 0;
	let hoistedModuleImported = false;
	let uid = 0;
	const idToImportMap = new Map();
	const imports = [];
	// this will transform import statements into dynamic ones, if there are imports
	// it will keep the import as is, if we don't need to mock anything
	// in browser environment it will wrap the module value with "vitest_wrap_module" function
	// that returns a proxy to the module so that named exports can be mocked
	function defineImport(importNode) {
		const source = importNode.source.value;
		// always hoist vitest import to top of the file, so
		// "vi" helpers can access it
		if (hoistedModule === source) {
			hoistedModuleImported = true;
			return;
		}
		const importId = `__vi_import_${uid++}__`;
		imports.push({
			id: importId,
			node: importNode
		});
		return importId;
	}
	// 1. check all import statements and record id -> importName map
	for (const node of ast.body) {
		// import foo from 'foo' --> foo -> __import_foo__.default
		// import { baz } from 'foo' --> baz -> __import_foo__.baz
		// import * as ok from 'foo' --> ok -> __import_foo__
		if (node.type === "ImportDeclaration") {
			const importId = defineImport(node);
			if (!importId) {
				continue;
			}
			for (const spec of node.specifiers) {
				if (spec.type === "ImportSpecifier") {
					if (spec.imported.type === "Identifier") {
						idToImportMap.set(spec.local.name, `${importId}.${spec.imported.name}`);
					} else {
						idToImportMap.set(spec.local.name, `${importId}[${JSON.stringify(spec.imported.value)}]`);
					}
				} else if (spec.type === "ImportDefaultSpecifier") {
					idToImportMap.set(spec.local.name, `${importId}.default`);
				} else {
					// namespace specifier
					idToImportMap.set(spec.local.name, importId);
				}
			}
		}
	}
	const declaredConst = new Set();
	const hoistedNodes = [];
	function createSyntaxError(node, message) {
		const _error = new SyntaxError(message);
		Error.captureStackTrace(_error, createSyntaxError);
		const serializedError = {
			name: "SyntaxError",
			message: _error.message,
			stack: _error.stack
		};
		if (options.codeFrameGenerator) {
			serializedError.frame = options.codeFrameGenerator(node, id, code);
		}
		return serializedError;
	}
	function assertNotDefaultExport(node, error) {
		var _findNodeAround;
		const defaultExport = (_findNodeAround = findNodeAround(ast, node.start, "ExportDefaultDeclaration")) === null || _findNodeAround === void 0 ? void 0 : _findNodeAround.node;
		if ((defaultExport === null || defaultExport === void 0 ? void 0 : defaultExport.declaration) === node || (defaultExport === null || defaultExport === void 0 ? void 0 : defaultExport.declaration.type) === "AwaitExpression" && defaultExport.declaration.argument === node) {
			throw createSyntaxError(defaultExport, error);
		}
	}
	function assertNotNamedExport(node, error) {
		var _findNodeAround2;
		const nodeExported = (_findNodeAround2 = findNodeAround(ast, node.start, "ExportNamedDeclaration")) === null || _findNodeAround2 === void 0 ? void 0 : _findNodeAround2.node;
		if ((nodeExported === null || nodeExported === void 0 ? void 0 : nodeExported.declaration) === node) {
			throw createSyntaxError(nodeExported, error);
		}
	}
	function getVariableDeclaration(node) {
		var _findNodeAround3, _declarationNode$decl;
		const declarationNode = (_findNodeAround3 = findNodeAround(ast, node.start, "VariableDeclaration")) === null || _findNodeAround3 === void 0 ? void 0 : _findNodeAround3.node;
		const init = declarationNode === null || declarationNode === void 0 || (_declarationNode$decl = declarationNode.declarations[0]) === null || _declarationNode$decl === void 0 ? void 0 : _declarationNode$decl.init;
		if (init && (init === node || init.type === "AwaitExpression" && init.argument === node)) {
			return declarationNode;
		}
	}
	const usedUtilityExports = new Set();
	esmWalker(ast, {
		onIdentifier(id, info, parentStack) {
			const binding = idToImportMap.get(id.name);
			if (!binding) {
				return;
			}
			if (info.hasBindingShortcut) {
				s.appendLeft(id.end, `: ${binding}`);
			} else if (info.classDeclaration) {
				if (!declaredConst.has(id.name)) {
					declaredConst.add(id.name);
					// locate the top-most node containing the class declaration
					const topNode = parentStack[parentStack.length - 2];
					s.prependRight(topNode.start, `const ${id.name} = ${binding};\n`);
				}
			} else if (!info.classExpression) {
				s.update(id.start, id.end, binding);
			}
		},
		onCallExpression(node) {
			if (node.callee.type === "MemberExpression" && isIdentifier(node.callee.object) && utilsObjectNames.includes(node.callee.object.name) && isIdentifier(node.callee.property)) {
				const methodName = node.callee.property.name;
				usedUtilityExports.add(node.callee.object.name);
				if (hoistableMockMethodNames.includes(methodName)) {
					const method = `${node.callee.object.name}.${methodName}`;
					assertNotDefaultExport(node, `Cannot export the result of "${method}". Remove export declaration because "${method}" doesn\'t return anything.`);
					const declarationNode = getVariableDeclaration(node);
					if (declarationNode) {
						assertNotNamedExport(declarationNode, `Cannot export the result of "${method}". Remove export declaration because "${method}" doesn\'t return anything.`);
					}
					// rewrite vi.mock(import('..')) into vi.mock('..')
					if (node.type === "CallExpression" && node.callee.type === "MemberExpression" && dynamicImportMockMethodNames.includes(node.callee.property.name)) {
						const moduleInfo = node.arguments[0];
						// vi.mock(import('./path')) -> vi.mock('./path')
						if (moduleInfo.type === "ImportExpression") {
							const source = moduleInfo.source;
							s.overwrite(moduleInfo.start, moduleInfo.end, s.slice(source.start, source.end));
						}
						// vi.mock(await import('./path')) -> vi.mock('./path')
						if (moduleInfo.type === "AwaitExpression" && moduleInfo.argument.type === "ImportExpression") {
							const source = moduleInfo.argument.source;
							s.overwrite(moduleInfo.start, moduleInfo.end, s.slice(source.start, source.end));
						}
					}
					hoistedNodes.push(node);
				} else if (dynamicImportMockMethodNames.includes(methodName)) {
					const moduleInfo = node.arguments[0];
					let source = null;
					if (moduleInfo.type === "ImportExpression") {
						source = moduleInfo.source;
					}
					if (moduleInfo.type === "AwaitExpression" && moduleInfo.argument.type === "ImportExpression") {
						source = moduleInfo.argument.source;
					}
					if (source) {
						s.overwrite(moduleInfo.start, moduleInfo.end, s.slice(source.start, source.end));
					}
				}
				if (hoistedMethodNames.includes(methodName)) {
					assertNotDefaultExport(node, "Cannot export hoisted variable. You can control hoisting behavior by placing the import from this file first.");
					const declarationNode = getVariableDeclaration(node);
					if (declarationNode) {
						assertNotNamedExport(declarationNode, "Cannot export hoisted variable. You can control hoisting behavior by placing the import from this file first.");
						// hoist "const variable = vi.hoisted(() => {})"
						hoistedNodes.push(declarationNode);
					} else {
						var _findNodeAround4;
						const awaitedExpression = (_findNodeAround4 = findNodeAround(ast, node.start, "AwaitExpression")) === null || _findNodeAround4 === void 0 ? void 0 : _findNodeAround4.node;
						// hoist "await vi.hoisted(async () => {})" or "vi.hoisted(() => {})"
						const moveNode = (awaitedExpression === null || awaitedExpression === void 0 ? void 0 : awaitedExpression.argument) === node ? awaitedExpression : node;
						hoistedNodes.push(moveNode);
					}
				}
			}
		}
	});
	function getNodeName(node) {
		const callee = node.callee || {};
		if (callee.type === "MemberExpression" && isIdentifier(callee.property) && isIdentifier(callee.object)) {
			return `${callee.object.name}.${callee.property.name}()`;
		}
		return "\"hoisted method\"";
	}
	function getNodeCall(node) {
		if (node.type === "CallExpression") {
			return node;
		}
		if (node.type === "VariableDeclaration") {
			const { declarations } = node;
			const init = declarations[0].init;
			if (init) {
				return getNodeCall(init);
			}
		}
		if (node.type === "AwaitExpression") {
			const { argument } = node;
			if (argument.type === "CallExpression") {
				return getNodeCall(argument);
			}
		}
		return node;
	}
	function createError(outsideNode, insideNode) {
		const outsideCall = getNodeCall(outsideNode);
		const insideCall = getNodeCall(insideNode);
		throw createSyntaxError(insideCall, `Cannot call ${getNodeName(insideCall)} inside ${getNodeName(outsideCall)}: both methods are hoisted to the top of the file and not actually called inside each other.`);
	}
	// validate hoistedNodes doesn't have nodes inside other nodes
	for (let i = 0; i < hoistedNodes.length; i++) {
		const node = hoistedNodes[i];
		for (let j = i + 1; j < hoistedNodes.length; j++) {
			const otherNode = hoistedNodes[j];
			if (node.start >= otherNode.start && node.end <= otherNode.end) {
				throw createError(otherNode, node);
			}
			if (otherNode.start >= node.start && otherNode.end <= node.end) {
				throw createError(node, otherNode);
			}
		}
	}
	// hoist vi.mock/vi.hoisted
	for (const node of hoistedNodes) {
		const end = getNodeTail(code, node);
		// don't hoist into itself if it's already at the top
		if (hoistIndex === end || hoistIndex === node.start) {
			hoistIndex = end;
		} else {
			s.move(node.start, end, hoistIndex);
		}
	}
	// hoist actual dynamic imports last so they are inserted after all hoisted mocks
	for (const { node: importNode, id: importId } of imports) {
		const source = importNode.source.value;
		s.update(importNode.start, importNode.end, `const ${importId} = await import(${JSON.stringify(source)});\n`);
		if (importNode.start === hoistIndex) {
			// no need to hoist, but update hoistIndex to keep the order
			hoistIndex = importNode.end;
		} else {
			// There will be an error if the module is called before it is imported,
			// so the module import statement is hoisted to the top
			s.move(importNode.start, importNode.end, hoistIndex);
		}
	}
	if (!hoistedModuleImported && hoistedNodes.length) {
		const utilityImports = [...usedUtilityExports];
		// "vi" or "vitest" is imported from a module other than "vitest"
		if (utilityImports.some((name) => idToImportMap.has(name))) {
			s.prepend(API_NOT_FOUND_CHECK(utilityImports));
		} else if (utilityImports.length) {
			s.prepend(`import { ${[...usedUtilityExports].join(", ")} } from ${JSON.stringify(hoistedModule)}\n`);
		}
	}
	return {
		code: s.toString(),
		map: s.generateMap({
			hires: "boundary",
			source: id
		})
	};
}

function interceptorPlugin(options = {}) {
	const registry = options.registry || new MockerRegistry();
	return {
		name: "vitest:mocks:interceptor",
		enforce: "pre",
		load: {
			order: "pre",
			async handler(id) {
				const mock = registry.getById(id);
				if (!mock) {
					return;
				}
				if (mock.type === "manual") {
					const exports = Object.keys(await mock.resolve());
					const accessor = options.globalThisAccessor || "\"__vitest_mocker__\"";
					return createManualModuleSource(mock.url, exports, accessor);
				}
				if (mock.type === "redirect") {
					return readFile(mock.redirect, "utf-8");
				}
			}
		},
		transform: {
			order: "post",
			handler(code, id) {
				const mock = registry.getById(id);
				if (!mock) {
					return;
				}
				if (mock.type === "automock" || mock.type === "autospy") {
					const m = automockModule(code, mock.type, this.parse, { globalThisAccessor: options.globalThisAccessor });
					return {
						code: m.toString(),
						map: m.generateMap({
							hires: "boundary",
							source: cleanUrl(id)
						})
					};
				}
			}
		},
		configureServer(server) {
			server.ws.on("vitest:interceptor:register", (event) => {
				if (event.type === "manual") {
					const module = ManualMockedModule.fromJSON(event, async () => {
						const keys = await getFactoryExports(event.url);
						return Object.fromEntries(keys.map((key) => [key, null]));
					});
					registry.add(module);
				} else {
					if (event.type === "redirect") {
						const redirectUrl = new URL(event.redirect);
						event.redirect = join(server.config.root, redirectUrl.pathname);
					}
					registry.register(event);
				}
				server.ws.send("vitest:interceptor:register:result");
			});
			server.ws.on("vitest:interceptor:delete", (id) => {
				registry.delete(id);
				server.ws.send("vitest:interceptor:delete:result");
			});
			server.ws.on("vitest:interceptor:invalidate", () => {
				registry.clear();
				server.ws.send("vitest:interceptor:invalidate:result");
			});
			function getFactoryExports(url) {
				server.ws.send("vitest:interceptor:resolve", url);
				let timeout;
				return new Promise((resolve, reject) => {
					timeout = setTimeout(() => {
						reject(new Error(`Timeout while waiting for factory exports of ${url}`));
					}, 1e4);
					server.ws.on("vitest:interceptor:resolved", ({ url: resolvedUrl, keys }) => {
						if (resolvedUrl === url) {
							clearTimeout(timeout);
							resolve(keys);
						}
					});
				});
			}
		}
	};
}

const VALID_ID_PREFIX = "/@id/";
class ServerMockResolver {
	constructor(server, options = {}) {
		this.server = server;
		this.options = options;
	}
	async resolveMock(rawId, importer, options) {
		const { id, fsPath, external } = await this.resolveMockId(rawId, importer);
		const resolvedUrl = this.normalizeResolveIdToUrl({ id }).url;
		if (options.mock === "factory") {
			var _manifest$fsPath;
			const manifest = getViteDepsManifest(this.server.config);
			const needsInterop = (manifest === null || manifest === void 0 || (_manifest$fsPath = manifest[fsPath]) === null || _manifest$fsPath === void 0 ? void 0 : _manifest$fsPath.needsInterop) ?? false;
			return {
				mockType: "manual",
				resolvedId: id,
				resolvedUrl,
				needsInterop
			};
		}
		if (options.mock === "spy") {
			return {
				mockType: "autospy",
				resolvedId: id,
				resolvedUrl
			};
		}
		const redirectUrl = findMockRedirect(this.server.config.root, fsPath, external);
		return {
			mockType: redirectUrl === null ? "automock" : "redirect",
			redirectUrl,
			resolvedId: id,
			resolvedUrl
		};
	}
	invalidate(ids) {
		ids.forEach((id) => {
			const moduleGraph = this.server.moduleGraph;
			const module = moduleGraph.getModuleById(id);
			if (module) {
				module.transformResult = null;
			}
		});
	}
	async resolveId(id, importer) {
		const resolved = await this.server.pluginContainer.resolveId(id, importer, { ssr: false });
		if (!resolved) {
			return null;
		}
		return this.normalizeResolveIdToUrl(resolved);
	}
	normalizeResolveIdToUrl(resolved) {
		const isOptimized = resolved.id.startsWith(withTrailingSlash(this.server.config.cacheDir));
		let url;
		// normalise the URL to be acceptable by the browser
		// https://github.com/vitejs/vite/blob/14027b0f2a9b01c14815c38aab22baf5b29594bb/packages/vite/src/node/plugins/importAnalysis.ts#L103
		const root = this.server.config.root;
		if (resolved.id.startsWith(withTrailingSlash(root))) {
			url = resolved.id.slice(root.length);
		} else if (resolved.id !== "/@react-refresh" && isAbsolute(resolved.id) && existsSync(cleanUrl(resolved.id))) {
			url = join$1("/@fs/", resolved.id);
		} else {
			url = resolved.id;
		}
		if (url[0] !== "." && url[0] !== "/") {
			url = resolved.id.startsWith(VALID_ID_PREFIX) ? resolved.id : VALID_ID_PREFIX + resolved.id.replace("\0", "__x00__");
		}
		return {
			id: resolved.id,
			url,
			optimized: isOptimized
		};
	}
	async resolveMockId(rawId, importer) {
		if (!this.server.moduleGraph.getModuleById(importer) && !importer.startsWith(this.server.config.root)) {
			importer = join$1(this.server.config.root, importer);
		}
		const resolved = await this.server.pluginContainer.resolveId(rawId, importer, { ssr: false });
		return this.resolveModule(rawId, resolved);
	}
	resolveModule(rawId, resolved) {
		const id = (resolved === null || resolved === void 0 ? void 0 : resolved.id) || rawId;
		const external = !isAbsolute(id) || isModuleDirectory(this.options, id) ? rawId : null;
		return {
			id,
			fsPath: cleanUrl(id),
			external
		};
	}
}
function isModuleDirectory(config, path) {
	const moduleDirectories = config.moduleDirectories || ["/node_modules/"];
	return moduleDirectories.some((dir) => path.includes(dir));
}
const metadata = new WeakMap();
function getViteDepsManifest(config) {
	if (metadata.has(config)) {
		return metadata.get(config);
	}
	const cacheDirPath = getDepsCacheDir(config);
	const metadataPath = resolve(cacheDirPath, "_metadata.json");
	if (!existsSync(metadataPath)) {
		return null;
	}
	const { optimized } = JSON.parse(readFileSync(metadataPath, "utf-8"));
	const newManifest = {};
	for (const name in optimized) {
		const dep = optimized[name];
		const file = resolve(cacheDirPath, dep.file);
		newManifest[file] = {
			hash: dep.fileHash,
			needsInterop: dep.needsInterop
		};
	}
	metadata.set(config, newManifest);
	return newManifest;
}
function getDepsCacheDir(config) {
	return resolve(config.cacheDir, "deps");
}
function withTrailingSlash(path) {
	if (path[path.length - 1] !== "/") {
		return `${path}/`;
	}
	return path;
}

// this is an implementation for public usage
// vitest doesn't use this plugin directly
function mockerPlugin(options = {}) {
	let server;
	const registerPath = resolve(fileURLToPath(new URL("./register.js", import.meta.url)));
	return [
		{
			name: "vitest:mocker:ws-rpc",
			config(_, { command }) {
				if (command !== "serve") {
					return;
				}
				return {
					server: { preTransformRequests: false },
					optimizeDeps: { exclude: ["@vitest/mocker/register", "@vitest/mocker/browser"] }
				};
			},
			configureServer(server_) {
				server = server_;
				const mockResolver = new ServerMockResolver(server);
				server.ws.on("vitest:mocks:resolveId", async ({ id, importer }) => {
					const resolved = await mockResolver.resolveId(id, importer);
					server.ws.send("vitest:mocks:resolvedId:result", resolved);
				});
				server.ws.on("vitest:mocks:resolveMock", async ({ id, importer, options }) => {
					const resolved = await mockResolver.resolveMock(id, importer, options);
					server.ws.send("vitest:mocks:resolveMock:result", resolved);
				});
				server.ws.on("vitest:mocks:invalidate", async ({ ids }) => {
					mockResolver.invalidate(ids);
					server.ws.send("vitest:mocks:invalidate:result");
				});
			},
			async load(id) {
				if (id !== registerPath) {
					return;
				}
				if (!server) {
					// mocker doesn't work during build
					return "export {}";
				}
				const content = await readFile(registerPath, "utf-8");
				const result = content.replace(/__VITEST_GLOBAL_THIS_ACCESSOR__/g, options.globalThisAccessor ?? "\"__vitest_mocker__\"").replace("__VITEST_MOCKER_ROOT__", JSON.stringify(server.config.root));
				return result;
			}
		},
		hoistMocksPlugin(options.hoistMocks),
		interceptorPlugin(options),
		automockPlugin(options),
		dynamicImportPlugin(options)
	];
}

export { ServerMockResolver, automockModule, automockPlugin, createManualModuleSource, dynamicImportPlugin, findMockRedirect, hoistMocks, hoistMocksPlugin, interceptorPlugin, mockerPlugin };


/**
 * Module dependencies.
 */

const tty = require('tty');
const util = require('util');

/**
 * This is the Node.js implementation of `debug()`.
 */

exports.init = init;
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.destroy = util.deprecate(
	() => {},
	'Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.'
);

/**
 * Colors.
 */

exports.colors = [6, 2, 3, 4, 5, 1];

try {
	// Optional dependency (as in, doesn't need to be installed, NOT like optionalDependencies in package.json)
	// eslint-disable-next-line import/no-extraneous-dependencies
	const supportsColor = require('supports-color');

	if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
		exports.colors = [
			20,
			21,
			26,
			27,
			32,
			33,
			38,
			39,
			40,
			41,
			42,
			43,
			44,
			45,
			56,
			57,
			62,
			63,
			68,
			69,
			74,
			75,
			76,
			77,
			78,
			79,
			80,
			81,
			92,
			93,
			98,
			99,
			112,
			113,
			128,
			129,
			134,
			135,
			148,
			149,
			160,
			161,
			162,
			163,
			164,
			165,
			166,
			167,
			168,
			169,
			170,
			171,
			172,
			173,
			178,
			179,
			184,
			185,
			196,
			197,
			198,
			199,
			200,
			201,
			202,
			203,
			204,
			205,
			206,
			207,
			208,
			209,
			214,
			215,
			220,
			221
		];
	}
} catch (error) {
	// Swallow - we only care if `supports-color` is available; it doesn't have to be.
}

/**
 * Build up the default `inspectOpts` object from the environment variables.
 *
 *   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
 */

exports.inspectOpts = Object.keys(process.env).filter(key => {
	return /^debug_/i.test(key);
}).reduce((obj, key) => {
	// Camel-case
	const prop = key
		.substring(6)
		.toLowerCase()
		.replace(/_([a-z])/g, (_, k) => {
			return k.toUpperCase();
		});

	// Coerce string value into JS value
	let val = process.env[key];
	if (/^(yes|on|true|enabled)$/i.test(val)) {
		val = true;
	} else if (/^(no|off|false|disabled)$/i.test(val)) {
		val = false;
	} else if (val === 'null') {
		val = null;
	} else {
		val = Number(val);
	}

	obj[prop] = val;
	return obj;
}, {});

/**
 * Is stdout a TTY? Colored output is enabled when `true`.
 */

function useColors() {
	return 'colors' in exports.inspectOpts ?
		Boolean(exports.inspectOpts.colors) :
		tty.isatty(process.stderr.fd);
}

/**
 * Adds ANSI color escape codes if enabled.
 *
 * @api public
 */

function formatArgs(args) {
	const {namespace: name, useColors} = this;

	if (useColors) {
		const c = this.color;
		const colorCode = '\u001B[3' + (c < 8 ? c : '8;5;' + c);
		const prefix = `  ${colorCode};1m${name} \u001B[0m`;

		args[0] = prefix + args[0].split('\n').join('\n' + prefix);
		args.push(colorCode + 'm+' + module.exports.humanize(this.diff) + '\u001B[0m');
	} else {
		args[0] = getDate() + name + ' ' + args[0];
	}
}

function getDate() {
	if (exports.inspectOpts.hideDate) {
		return '';
	}
	return new Date().toISOString() + ' ';
}

/**
 * Invokes `util.formatWithOptions()` with the specified arguments and writes to stderr.
 */

function log(...args) {
	return process.stderr.write(util.formatWithOptions(exports.inspectOpts, ...args) + '\n');
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */
function save(namespaces) {
	if (namespaces) {
		process.env.DEBUG = namespaces;
	} else {
		// If you set a process.env field to null or undefined, it gets cast to the
		// string 'null' or 'undefined'. Just delete instead.
		delete process.env.DEBUG;
	}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
	return process.env.DEBUG;
}

/**
 * Init logic for `debug` instances.
 *
 * Create a new `inspectOpts` object in case `useColors` is set
 * differently for a particular `debug` instance.
 */

function init(debug) {
	debug.inspectOpts = {};

	const keys = Object.keys(exports.inspectOpts);
	for (let i = 0; i < keys.length; i++) {
		debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
	}
}

module.exports = require('./common')(exports);

const {formatters} = module.exports;

/**
 * Map %o to `util.inspect()`, all on a single line.
 */

formatters.o = function (v) {
	this.inspectOpts.colors = this.useColors;
	return util.inspect(v, this.inspectOpts)
		.split('\n')
		.map(str => str.trim())
		.join(' ');
};

/**
 * Map %O to `util.inspect()`, allowing multiple lines if needed.
 */

formatters.O = function (v) {
	this.inspectOpts.colors = this.useColors;
	return util.inspect(v, this.inspectOpts);
};


'use strict'

let CssSyntaxError = require('./css-syntax-error')
let Stringifier = require('./stringifier')
let stringify = require('./stringify')
let { isClean, my } = require('./symbols')

function cloneNode(obj, parent) {
  let cloned = new obj.constructor()

  for (let i in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, i)) {
      /* c8 ignore next 2 */
      continue
    }
    if (i === 'proxyCache') continue
    let value = obj[i]
    let type = typeof value

    if (i === 'parent' && type === 'object') {
      if (parent) cloned[i] = parent
    } else if (i === 'source') {
      cloned[i] = value
    } else if (Array.isArray(value)) {
      cloned[i] = value.map(j => cloneNode(j, cloned))
    } else {
      if (type === 'object' && value !== null) value = cloneNode(value)
      cloned[i] = value
    }
  }

  return cloned
}

function sourceOffset(inputCSS, position) {
  // Not all custom syntaxes support `offset` in `source.start` and `source.end`
  if (position && typeof position.offset !== 'undefined') {
    return position.offset
  }

  let column = 1
  let line = 1
  let offset = 0

  for (let i = 0; i < inputCSS.length; i++) {
    if (line === position.line && column === position.column) {
      offset = i
      break
    }

    if (inputCSS[i] === '\n') {
      column = 1
      line += 1
    } else {
      column += 1
    }
  }

  return offset
}

class Node {
  get proxyOf() {
    return this
  }

  constructor(defaults = {}) {
    this.raws = {}
    this[isClean] = false
    this[my] = true

    for (let name in defaults) {
      if (name === 'nodes') {
        this.nodes = []
        for (let node of defaults[name]) {
          if (typeof node.clone === 'function') {
            this.append(node.clone())
          } else {
            this.append(node)
          }
        }
      } else {
        this[name] = defaults[name]
      }
    }
  }

  addToError(error) {
    error.postcssNode = this
    if (error.stack && this.source && /\n\s{4}at /.test(error.stack)) {
      let s = this.source
      error.stack = error.stack.replace(
        /\n\s{4}at /,
        `$&${s.input.from}:${s.start.line}:${s.start.column}$&`
      )
    }
    return error
  }

  after(add) {
    this.parent.insertAfter(this, add)
    return this
  }

  assign(overrides = {}) {
    for (let name in overrides) {
      this[name] = overrides[name]
    }
    return this
  }

  before(add) {
    this.parent.insertBefore(this, add)
    return this
  }

  cleanRaws(keepBetween) {
    delete this.raws.before
    delete this.raws.after
    if (!keepBetween) delete this.raws.between
  }

  clone(overrides = {}) {
    let cloned = cloneNode(this)
    for (let name in overrides) {
      cloned[name] = overrides[name]
    }
    return cloned
  }

  cloneAfter(overrides = {}) {
    let cloned = this.clone(overrides)
    this.parent.insertAfter(this, cloned)
    return cloned
  }

  cloneBefore(overrides = {}) {
    let cloned = this.clone(overrides)
    this.parent.insertBefore(this, cloned)
    return cloned
  }

  error(message, opts = {}) {
    if (this.source) {
      let { end, start } = this.rangeBy(opts)
      return this.source.input.error(
        message,
        { column: start.column, line: start.line },
        { column: end.column, line: end.line },
        opts
      )
    }
    return new CssSyntaxError(message)
  }

  getProxyProcessor() {
    return {
      get(node, prop) {
        if (prop === 'proxyOf') {
          return node
        } else if (prop === 'root') {
          return () => node.root().toProxy()
        } else {
          return node[prop]
        }
      },

      set(node, prop, value) {
        if (node[prop] === value) return true
        node[prop] = value
        if (
          prop === 'prop' ||
          prop === 'value' ||
          prop === 'name' ||
          prop === 'params' ||
          prop === 'important' ||
          /* c8 ignore next */
          prop === 'text'
        ) {
          node.markDirty()
        }
        return true
      }
    }
  }

  /* c8 ignore next 3 */
  markClean() {
    this[isClean] = true
  }

  markDirty() {
    if (this[isClean]) {
      this[isClean] = false
      let next = this
      while ((next = next.parent)) {
        next[isClean] = false
      }
    }
  }

  next() {
    if (!this.parent) return undefined
    let index = this.parent.index(this)
    return this.parent.nodes[index + 1]
  }

  positionBy(opts = {}) {
    let pos = this.source.start
    if (opts.index) {
      pos = this.positionInside(opts.index)
    } else if (opts.word) {
      let inputString =
        'document' in this.source.input
          ? this.source.input.document
          : this.source.input.css
      let stringRepresentation = inputString.slice(
        sourceOffset(inputString, this.source.start),
        sourceOffset(inputString, this.source.end)
      )
      let index = stringRepresentation.indexOf(opts.word)
      if (index !== -1) pos = this.positionInside(index)
    }
    return pos
  }

  positionInside(index) {
    let column = this.source.start.column
    let line = this.source.start.line
    let inputString =
      'document' in this.source.input
        ? this.source.input.document
        : this.source.input.css
    let offset = sourceOffset(inputString, this.source.start)
    let end = offset + index

    for (let i = offset; i < end; i++) {
      if (inputString[i] === '\n') {
        column = 1
        line += 1
      } else {
        column += 1
      }
    }

    return { column, line, offset: end }
  }

  prev() {
    if (!this.parent) return undefined
    let index = this.parent.index(this)
    return this.parent.nodes[index - 1]
  }

  rangeBy(opts = {}) {
    let inputString =
      'document' in this.source.input
        ? this.source.input.document
        : this.source.input.css
    let start = {
      column: this.source.start.column,
      line: this.source.start.line,
      offset: sourceOffset(inputString, this.source.start)
    }
    let end = this.source.end
      ? {
          column: this.source.end.column + 1,
          line: this.source.end.line,
          offset:
            typeof this.source.end.offset === 'number'
              ? // `source.end.offset` is exclusive, so we don't need to add 1
                this.source.end.offset
              : // Since line/column in this.source.end is inclusive,
                // the `sourceOffset(... , this.source.end)` returns an inclusive offset.
                // So, we add 1 to convert it to exclusive.
                sourceOffset(inputString, this.source.end) + 1
        }
      : {
          column: start.column + 1,
          line: start.line,
          offset: start.offset + 1
        }

    if (opts.word) {
      let stringRepresentation = inputString.slice(
        sourceOffset(inputString, this.source.start),
        sourceOffset(inputString, this.source.end)
      )
      let index = stringRepresentation.indexOf(opts.word)
      if (index !== -1) {
        start = this.positionInside(index)
        end = this.positionInside(index + opts.word.length)
      }
    } else {
      if (opts.start) {
        start = {
          column: opts.start.column,
          line: opts.start.line,
          offset: sourceOffset(inputString, opts.start)
        }
      } else if (opts.index) {
        start = this.positionInside(opts.index)
      }

      if (opts.end) {
        end = {
          column: opts.end.column,
          line: opts.end.line,
          offset: sourceOffset(inputString, opts.end)
        }
      } else if (typeof opts.endIndex === 'number') {
        end = this.positionInside(opts.endIndex)
      } else if (opts.index) {
        end = this.positionInside(opts.index + 1)
      }
    }

    if (
      end.line < start.line ||
      (end.line === start.line && end.column <= start.column)
    ) {
      end = {
        column: start.column + 1,
        line: start.line,
        offset: start.offset + 1
      }
    }

    return { end, start }
  }

  raw(prop, defaultType) {
    let str = new Stringifier()
    return str.raw(this, prop, defaultType)
  }

  remove() {
    if (this.parent) {
      this.parent.removeChild(this)
    }
    this.parent = undefined
    return this
  }

  replaceWith(...nodes) {
    if (this.parent) {
      let bookmark = this
      let foundSelf = false
      for (let node of nodes) {
        if (node === this) {
          foundSelf = true
        } else if (foundSelf) {
          this.parent.insertAfter(bookmark, node)
          bookmark = node
        } else {
          this.parent.insertBefore(bookmark, node)
        }
      }

      if (!foundSelf) {
        this.remove()
      }
    }

    return this
  }

  root() {
    let result = this
    while (result.parent && result.parent.type !== 'document') {
      result = result.parent
    }
    return result
  }

  toJSON(_, inputs) {
    let fixed = {}
    let emitInputs = inputs == null
    inputs = inputs || new Map()
    let inputsNextIndex = 0

    for (let name in this) {
      if (!Object.prototype.hasOwnProperty.call(this, name)) {
        /* c8 ignore next 2 */
        continue
      }
      if (name === 'parent' || name === 'proxyCache') continue
      let value = this[name]

      if (Array.isArray(value)) {
        fixed[name] = value.map(i => {
          if (typeof i === 'object' && i.toJSON) {
            return i.toJSON(null, inputs)
          } else {
            return i
          }
        })
      } else if (typeof value === 'object' && value.toJSON) {
        fixed[name] = value.toJSON(null, inputs)
      } else if (name === 'source') {
        if (value == null) continue
        let inputId = inputs.get(value.input)
        if (inputId == null) {
          inputId = inputsNextIndex
          inputs.set(value.input, inputsNextIndex)
          inputsNextIndex++
        }
        fixed[name] = {
          end: value.end,
          inputId,
          start: value.start
        }
      } else {
        fixed[name] = value
      }
    }

    if (emitInputs) {
      fixed.inputs = [...inputs.keys()].map(input => input.toJSON())
    }

    return fixed
  }

  toProxy() {
    if (!this.proxyCache) {
      this.proxyCache = new Proxy(this, this.getProxyProcessor())
    }
    return this.proxyCache
  }

  toString(stringifier = stringify) {
    if (stringifier.stringify) stringifier = stringifier.stringify
    let result = ''
    stringifier(this, i => {
      result += i
    })
    return result
  }

  warn(result, text, opts = {}) {
    let data = { node: this }
    for (let i in opts) data[i] = opts[i]
    return result.warn(text, data)
  }
}

module.exports = Node
Node.default = Node


"use strict";

exports.__esModule = true;
exports["default"] = void 0;
var _util = require("../util");
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
var cloneNode = function cloneNode(obj, parent) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  var cloned = new obj.constructor();
  for (var i in obj) {
    if (!obj.hasOwnProperty(i)) {
      continue;
    }
    var value = obj[i];
    var type = typeof value;
    if (i === 'parent' && type === 'object') {
      if (parent) {
        cloned[i] = parent;
      }
    } else if (value instanceof Array) {
      cloned[i] = value.map(function (j) {
        return cloneNode(j, cloned);
      });
    } else {
      cloned[i] = cloneNode(value, cloned);
    }
  }
  return cloned;
};
var Node = /*#__PURE__*/function () {
  function Node(opts) {
    if (opts === void 0) {
      opts = {};
    }
    Object.assign(this, opts);
    this.spaces = this.spaces || {};
    this.spaces.before = this.spaces.before || '';
    this.spaces.after = this.spaces.after || '';
  }
  var _proto = Node.prototype;
  _proto.remove = function remove() {
    if (this.parent) {
      this.parent.removeChild(this);
    }
    this.parent = undefined;
    return this;
  };
  _proto.replaceWith = function replaceWith() {
    if (this.parent) {
      for (var index in arguments) {
        this.parent.insertBefore(this, arguments[index]);
      }
      this.remove();
    }
    return this;
  };
  _proto.next = function next() {
    return this.parent.at(this.parent.index(this) + 1);
  };
  _proto.prev = function prev() {
    return this.parent.at(this.parent.index(this) - 1);
  };
  _proto.clone = function clone(overrides) {
    if (overrides === void 0) {
      overrides = {};
    }
    var cloned = cloneNode(this);
    for (var name in overrides) {
      cloned[name] = overrides[name];
    }
    return cloned;
  }

  /**
   * Some non-standard syntax doesn't follow normal escaping rules for css.
   * This allows non standard syntax to be appended to an existing property
   * by specifying the escaped value. By specifying the escaped value,
   * illegal characters are allowed to be directly inserted into css output.
   * @param {string} name the property to set
   * @param {any} value the unescaped value of the property
   * @param {string} valueEscaped optional. the escaped value of the property.
   */;
  _proto.appendToPropertyAndEscape = function appendToPropertyAndEscape(name, value, valueEscaped) {
    if (!this.raws) {
      this.raws = {};
    }
    var originalValue = this[name];
    var originalEscaped = this.raws[name];
    this[name] = originalValue + value; // this may trigger a setter that updates raws, so it has to be set first.
    if (originalEscaped || valueEscaped !== value) {
      this.raws[name] = (originalEscaped || originalValue) + valueEscaped;
    } else {
      delete this.raws[name]; // delete any escaped value that was created by the setter.
    }
  }

  /**
   * Some non-standard syntax doesn't follow normal escaping rules for css.
   * This allows the escaped value to be specified directly, allowing illegal
   * characters to be directly inserted into css output.
   * @param {string} name the property to set
   * @param {any} value the unescaped value of the property
   * @param {string} valueEscaped the escaped value of the property.
   */;
  _proto.setPropertyAndEscape = function setPropertyAndEscape(name, value, valueEscaped) {
    if (!this.raws) {
      this.raws = {};
    }
    this[name] = value; // this may trigger a setter that updates raws, so it has to be set first.
    this.raws[name] = valueEscaped;
  }

  /**
   * When you want a value to passed through to CSS directly. This method
   * deletes the corresponding raw value causing the stringifier to fallback
   * to the unescaped value.
   * @param {string} name the property to set.
   * @param {any} value The value that is both escaped and unescaped.
   */;
  _proto.setPropertyWithoutEscape = function setPropertyWithoutEscape(name, value) {
    this[name] = value; // this may trigger a setter that updates raws, so it has to be set first.
    if (this.raws) {
      delete this.raws[name];
    }
  }

  /**
   *
   * @param {number} line The number (starting with 1)
   * @param {number} column The column number (starting with 1)
   */;
  _proto.isAtPosition = function isAtPosition(line, column) {
    if (this.source && this.source.start && this.source.end) {
      if (this.source.start.line > line) {
        return false;
      }
      if (this.source.end.line < line) {
        return false;
      }
      if (this.source.start.line === line && this.source.start.column > column) {
        return false;
      }
      if (this.source.end.line === line && this.source.end.column < column) {
        return false;
      }
      return true;
    }
    return undefined;
  };
  _proto.stringifyProperty = function stringifyProperty(name) {
    return this.raws && this.raws[name] || this[name];
  };
  _proto.valueToString = function valueToString() {
    return String(this.stringifyProperty("value"));
  };
  _proto.toString = function toString() {
    return [this.rawSpaceBefore, this.valueToString(), this.rawSpaceAfter].join('');
  };
  _createClass(Node, [{
    key: "rawSpaceBefore",
    get: function get() {
      var rawSpace = this.raws && this.raws.spaces && this.raws.spaces.before;
      if (rawSpace === undefined) {
        rawSpace = this.spaces && this.spaces.before;
      }
      return rawSpace || "";
    },
    set: function set(raw) {
      (0, _util.ensureObject)(this, "raws", "spaces");
      this.raws.spaces.before = raw;
    }
  }, {
    key: "rawSpaceAfter",
    get: function get() {
      var rawSpace = this.raws && this.raws.spaces && this.raws.spaces.after;
      if (rawSpace === undefined) {
        rawSpace = this.spaces.after;
      }
      return rawSpace || "";
    },
    set: function set(raw) {
      (0, _util.ensureObject)(this, "raws", "spaces");
      this.raws.spaces.after = raw;
    }
  }]);
  return Node;
}();
exports["default"] = Node;
module.exports = exports.default;

import {
  a as e,
  b as t,
  c as o
} from "./chunk-BVHSVHOK.js";

// src/node.ts
import { isatty as s } from "tty";
var r = process.env.FORCE_TTY !== void 0 || s(1);
function n() {
  return t(r);
}
function a() {
  return o(r);
}
var u = o(r);
export {
  a as createColors,
  u as default,
  e as getDefaultColors,
  n as isSupported
};



/**
 * For Node.js, simply re-export the core `util.deprecate` function.
 */

module.exports = require('util').deprecate;


import * as vite from 'vite';
import { resolveConfig as resolveConfig$1, mergeConfig } from 'vite';
export { esbuildVersion, isCSSRequest, isFileServingAllowed, parseAst, parseAstAsync, rollupVersion, version as viteVersion } from 'vite';
import { V as Vitest, a as VitestPlugin, T as TestModule } from './chunks/cli-api.BkDphVBG.js';
export { G as GitNotFoundError, F as TestsNotFoundError, b as VitestPackageInstaller, e as createViteLogger, c as createVitest, i as isValidApiRequest, d as registerConsoleShortcuts, r as resolveFsAllow, s as startVitest } from './chunks/cli-api.BkDphVBG.js';
export { p as parseCLI } from './chunks/cac.Cb-PYCCB.js';
import { r as resolveConfig$2 } from './chunks/coverage.DL5VHqXY.js';
export { b as BaseSequencer, c as createMethodsRPC, g as getFilePoolName, a as resolveApiServerConfig } from './chunks/coverage.DL5VHqXY.js';
import { slash, deepClone } from '@vitest/utils';
import { f as findUp } from './chunks/index.X0nbfr6-.js';
import { resolve } from 'pathe';
import { c as configFiles } from './chunks/constants.DnKduX2e.js';
export { distDir, rootDir } from './path.js';
import createDebug from 'debug';
export { generateFileHash } from '@vitest/runner/utils';
import 'node:fs';
import './chunks/coverage.DVF1vEu8.js';
import 'node:path';
import '@vitest/snapshot/manager';
import 'vite-node/client';
import 'vite-node/server';
import './chunks/index.B521nVV-.js';
import './chunks/index.VByaPkjc.js';
import 'node:perf_hooks';
import '@vitest/utils/source-map';
import 'tinyrainbow';
import './chunks/env.D4Lgay0q.js';
import 'std-env';
import './chunks/typechecker.DRKU1-1g.js';
import 'node:os';
import 'tinyexec';
import 'node:util';
import 'node:fs/promises';
import 'node:console';
import 'node:stream';
import 'node:module';
import 'events';
import 'https';
import 'http';
import 'net';
import 'tls';
import 'crypto';
import 'stream';
import 'url';
import 'zlib';
import 'buffer';
import './chunks/_commonjsHelpers.BFTU3MAI.js';
import 'node:crypto';
import 'node:url';
import 'picomatch';
import 'tinyglobby';
import 'vite-node/utils';
import '@vitest/mocker/node';
import './chunks/defaults.B7q_naMc.js';
import 'magic-string';
import './chunks/index.BCWujgDG.js';
import 'node:assert';
import '@vitest/utils/error';
import 'node:readline';
import 'node:process';
import 'node:v8';
import 'node:tty';
import 'node:events';
import 'tinypool';
import 'node:worker_threads';
import 'readline';

// this is only exported as a public function and not used inside vitest
async function resolveConfig(options = {}, viteOverrides = {}) {
	const root = slash(resolve(options.root || process.cwd()));
	const configPath = options.config === false ? false : options.config ? resolve(root, options.config) : await findUp(configFiles, { cwd: root });
	options.config = configPath;
	const vitest = new Vitest("test", deepClone(options));
	const config = await resolveConfig$1(mergeConfig({
		configFile: configPath,
		mode: options.mode || "test",
		plugins: [await VitestPlugin(options, vitest)]
	}, mergeConfig(viteOverrides, { root: options.root })), "serve");
	// Reflect just to avoid type error
	const updatedOptions = Reflect.get(config, "_vitest");
	const vitestConfig = resolveConfig$2(vitest, updatedOptions, config);
	await vitest.close();
	return {
		viteConfig: config,
		vitestConfig
	};
}

function createDebugger(namespace) {
	const debug = createDebug(namespace);
	if (debug.enabled) return debug;
}

const version = Vitest.version;
/** @deprecated use `createViteServer` instead */
const createServer = vite.createServer;
const createViteServer = vite.createServer;
/**
* @deprecated Use `TestModule` instead
*/
const TestFile = TestModule;
// rolldownVersion is exported only by rolldown-vite
const rolldownVersion = vite.rolldownVersion;

export { TestFile, VitestPlugin, createDebugger, createServer, createViteServer, resolveConfig, rolldownVersion, version };
