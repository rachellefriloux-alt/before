import { Plugin, Rollup, ViteDevServer } from 'vite';
import MagicString, { SourceMap } from 'magic-string';
import { c as MockerRegistry } from './registry.d-D765pazg.js';
export { findMockRedirect } from './redirect.js';

declare function createManualModuleSource(moduleUrl: string, exports: string[], globalAccessor?: string): string;

interface AutomockPluginOptions {
	/**
	* @default "__vitest_mocker__"
	*/
	globalThisAccessor?: string;
}
declare function automockPlugin(options?: AutomockPluginOptions): Plugin;
// TODO: better source map replacement
declare function automockModule(code: string, mockType: "automock" | "autospy", parse: (code: string) => any, options?: AutomockPluginOptions): MagicString;

interface DynamicImportPluginOptions {
	/**
	* @default `"__vitest_mocker__"`
	*/
	globalThisAccessor?: string;
	filter?: (id: string) => boolean;
}
declare function dynamicImportPlugin(options?: DynamicImportPluginOptions): Plugin;

// This definition file follows a somewhat unusual format. ESTree allows
// runtime type checks based on the `type` parameter. In order to explain this
// to typescript we want to use discriminated union types:
// https://github.com/Microsoft/TypeScript/pull/9163
//
// For ESTree this is a bit tricky because the high level interfaces like
// Node or Function are pulling double duty. We want to pass common fields down
// to the interfaces that extend them (like Identifier or
// ArrowFunctionExpression), but you can't extend a type union or enforce
// common fields on them. So we've split the high level interfaces into two
// types, a base type which passes down inherited fields, and a type union of
// all types which extend the base type. Only the type union is exported, and
// the union is how other types refer to the collection of inheriting types.
//
// This makes the definitions file here somewhat more difficult to maintain,
// but it has the notable advantage of making ESTree much easier to use as
// an end user.

interface BaseNodeWithoutComments {
    // Every leaf interface that extends BaseNode must specify a type property.
    // The type property should be a string literal. For example, Identifier
    // has: `type: "Identifier"`
    type: string;
    loc?: SourceLocation | null | undefined;
    range?: [number, number] | undefined;
}

interface BaseNode extends BaseNodeWithoutComments {
    leadingComments?: Comment[] | undefined;
    trailingComments?: Comment[] | undefined;
}

interface NodeMap {
    AssignmentProperty: AssignmentProperty;
    CatchClause: CatchClause;
    Class: Class;
    ClassBody: ClassBody;
    Expression: Expression;
    Function: Function;
    Identifier: Identifier;
    Literal: Literal;
    MethodDefinition: MethodDefinition;
    ModuleDeclaration: ModuleDeclaration;
    ModuleSpecifier: ModuleSpecifier;
    Pattern: Pattern;
    PrivateIdentifier: PrivateIdentifier;
    Program: Program;
    Property: Property;
    PropertyDefinition: PropertyDefinition;
    SpreadElement: SpreadElement;
    Statement: Statement;
    Super: Super;
    SwitchCase: SwitchCase;
    TemplateElement: TemplateElement;
    VariableDeclarator: VariableDeclarator;
}

type Node$1 = NodeMap[keyof NodeMap];

interface Comment extends BaseNodeWithoutComments {
    type: "Line" | "Block";
    value: string;
}

interface SourceLocation {
    source?: string | null | undefined;
    start: Position;
    end: Position;
}

interface Position {
    /** >= 1 */
    line: number;
    /** >= 0 */
    column: number;
}

interface Program extends BaseNode {
    type: "Program";
    sourceType: "script" | "module";
    body: Array<Directive | Statement | ModuleDeclaration>;
    comments?: Comment[] | undefined;
}

interface Directive extends BaseNode {
    type: "ExpressionStatement";
    expression: Literal;
    directive: string;
}

interface BaseFunction extends BaseNode {
    params: Pattern[];
    generator?: boolean | undefined;
    async?: boolean | undefined;
    // The body is either BlockStatement or Expression because arrow functions
    // can have a body that's either. FunctionDeclarations and
    // FunctionExpressions have only BlockStatement bodies.
    body: BlockStatement | Expression;
}

type Function = FunctionDeclaration | FunctionExpression | ArrowFunctionExpression;

type Statement =
    | ExpressionStatement
    | BlockStatement
    | StaticBlock
    | EmptyStatement
    | DebuggerStatement
    | WithStatement
    | ReturnStatement
    | LabeledStatement
    | BreakStatement
    | ContinueStatement
    | IfStatement
    | SwitchStatement
    | ThrowStatement
    | TryStatement
    | WhileStatement
    | DoWhileStatement
    | ForStatement
    | ForInStatement
    | ForOfStatement
    | Declaration;

interface BaseStatement extends BaseNode {}

interface EmptyStatement extends BaseStatement {
    type: "EmptyStatement";
}

interface BlockStatement extends BaseStatement {
    type: "BlockStatement";
    body: Statement[];
    innerComments?: Comment[] | undefined;
}

interface StaticBlock extends Omit<BlockStatement, "type"> {
    type: "StaticBlock";
}

interface ExpressionStatement extends BaseStatement {
    type: "ExpressionStatement";
    expression: Expression;
}

interface IfStatement extends BaseStatement {
    type: "IfStatement";
    test: Expression;
    consequent: Statement;
    alternate?: Statement | null | undefined;
}

interface LabeledStatement extends BaseStatement {
    type: "LabeledStatement";
    label: Identifier;
    body: Statement;
}

interface BreakStatement extends BaseStatement {
    type: "BreakStatement";
    label?: Identifier | null | undefined;
}

interface ContinueStatement extends BaseStatement {
    type: "ContinueStatement";
    label?: Identifier | null | undefined;
}

interface WithStatement extends BaseStatement {
    type: "WithStatement";
    object: Expression;
    body: Statement;
}

interface SwitchStatement extends BaseStatement {
    type: "SwitchStatement";
    discriminant: Expression;
    cases: SwitchCase[];
}

interface ReturnStatement extends BaseStatement {
    type: "ReturnStatement";
    argument?: Expression | null | undefined;
}

interface ThrowStatement extends BaseStatement {
    type: "ThrowStatement";
    argument: Expression;
}

interface TryStatement extends BaseStatement {
    type: "TryStatement";
    block: BlockStatement;
    handler?: CatchClause | null | undefined;
    finalizer?: BlockStatement | null | undefined;
}

interface WhileStatement extends BaseStatement {
    type: "WhileStatement";
    test: Expression;
    body: Statement;
}

interface DoWhileStatement extends BaseStatement {
    type: "DoWhileStatement";
    body: Statement;
    test: Expression;
}

interface ForStatement extends BaseStatement {
    type: "ForStatement";
    init?: VariableDeclaration | Expression | null | undefined;
    test?: Expression | null | undefined;
    update?: Expression | null | undefined;
    body: Statement;
}

interface BaseForXStatement extends BaseStatement {
    left: VariableDeclaration | Pattern;
    right: Expression;
    body: Statement;
}

interface ForInStatement extends BaseForXStatement {
    type: "ForInStatement";
}

interface DebuggerStatement extends BaseStatement {
    type: "DebuggerStatement";
}

type Declaration = FunctionDeclaration | VariableDeclaration | ClassDeclaration;

interface BaseDeclaration extends BaseStatement {}

interface MaybeNamedFunctionDeclaration extends BaseFunction, BaseDeclaration {
    type: "FunctionDeclaration";
    /** It is null when a function declaration is a part of the `export default function` statement */
    id: Identifier | null;
    body: BlockStatement;
}

interface FunctionDeclaration extends MaybeNamedFunctionDeclaration {
    id: Identifier;
}

interface VariableDeclaration extends BaseDeclaration {
    type: "VariableDeclaration";
    declarations: VariableDeclarator[];
    kind: "var" | "let" | "const" | "using" | "await using";
}

interface VariableDeclarator extends BaseNode {
    type: "VariableDeclarator";
    id: Pattern;
    init?: Expression | null | undefined;
}

interface ExpressionMap {
    ArrayExpression: ArrayExpression;
    ArrowFunctionExpression: ArrowFunctionExpression;
    AssignmentExpression: AssignmentExpression;
    AwaitExpression: AwaitExpression;
    BinaryExpression: BinaryExpression;
    CallExpression: CallExpression;
    ChainExpression: ChainExpression;
    ClassExpression: ClassExpression;
    ConditionalExpression: ConditionalExpression;
    FunctionExpression: FunctionExpression;
    Identifier: Identifier;
    ImportExpression: ImportExpression;
    Literal: Literal;
    LogicalExpression: LogicalExpression;
    MemberExpression: MemberExpression;
    MetaProperty: MetaProperty;
    NewExpression: NewExpression;
    ObjectExpression: ObjectExpression;
    SequenceExpression: SequenceExpression;
    TaggedTemplateExpression: TaggedTemplateExpression;
    TemplateLiteral: TemplateLiteral;
    ThisExpression: ThisExpression;
    UnaryExpression: UnaryExpression;
    UpdateExpression: UpdateExpression;
    YieldExpression: YieldExpression;
}

type Expression = ExpressionMap[keyof ExpressionMap];

interface BaseExpression extends BaseNode {}

type ChainElement = SimpleCallExpression | MemberExpression;

interface ChainExpression extends BaseExpression {
    type: "ChainExpression";
    expression: ChainElement;
}

interface ThisExpression extends BaseExpression {
    type: "ThisExpression";
}

interface ArrayExpression extends BaseExpression {
    type: "ArrayExpression";
    elements: Array<Expression | SpreadElement | null>;
}

interface ObjectExpression extends BaseExpression {
    type: "ObjectExpression";
    properties: Array<Property | SpreadElement>;
}

interface PrivateIdentifier extends BaseNode {
    type: "PrivateIdentifier";
    name: string;
}

interface Property extends BaseNode {
    type: "Property";
    key: Expression | PrivateIdentifier;
    value: Expression | Pattern; // Could be an AssignmentProperty
    kind: "init" | "get" | "set";
    method: boolean;
    shorthand: boolean;
    computed: boolean;
}

interface PropertyDefinition extends BaseNode {
    type: "PropertyDefinition";
    key: Expression | PrivateIdentifier;
    value?: Expression | null | undefined;
    computed: boolean;
    static: boolean;
}

interface FunctionExpression extends BaseFunction, BaseExpression {
    id?: Identifier | null | undefined;
    type: "FunctionExpression";
    body: BlockStatement;
}

interface SequenceExpression extends BaseExpression {
    type: "SequenceExpression";
    expressions: Expression[];
}

interface UnaryExpression extends BaseExpression {
    type: "UnaryExpression";
    operator: UnaryOperator;
    prefix: true;
    argument: Expression;
}

interface BinaryExpression extends BaseExpression {
    type: "BinaryExpression";
    operator: BinaryOperator;
    left: Expression | PrivateIdentifier;
    right: Expression;
}

interface AssignmentExpression extends BaseExpression {
    type: "AssignmentExpression";
    operator: AssignmentOperator;
    left: Pattern | MemberExpression;
    right: Expression;
}

interface UpdateExpression extends BaseExpression {
    type: "UpdateExpression";
    operator: UpdateOperator;
    argument: Expression;
    prefix: boolean;
}

interface LogicalExpression extends BaseExpression {
    type: "LogicalExpression";
    operator: LogicalOperator;
    left: Expression;
    right: Expression;
}

interface ConditionalExpression extends BaseExpression {
    type: "ConditionalExpression";
    test: Expression;
    alternate: Expression;
    consequent: Expression;
}

interface BaseCallExpression extends BaseExpression {
    callee: Expression | Super;
    arguments: Array<Expression | SpreadElement>;
}
type CallExpression = SimpleCallExpression | NewExpression;

interface SimpleCallExpression extends BaseCallExpression {
    type: "CallExpression";
    optional: boolean;
}

interface NewExpression extends BaseCallExpression {
    type: "NewExpression";
}

interface MemberExpression extends BaseExpression, BasePattern {
    type: "MemberExpression";
    object: Expression | Super;
    property: Expression | PrivateIdentifier;
    computed: boolean;
    optional: boolean;
}

type Pattern = Identifier | ObjectPattern | ArrayPattern | RestElement | AssignmentPattern | MemberExpression;

interface BasePattern extends BaseNode {}

interface SwitchCase extends BaseNode {
    type: "SwitchCase";
    test?: Expression | null | undefined;
    consequent: Statement[];
}

interface CatchClause extends BaseNode {
    type: "CatchClause";
    param: Pattern | null;
    body: BlockStatement;
}

interface Identifier extends BaseNode, BaseExpression, BasePattern {
    type: "Identifier";
    name: string;
}

type Literal = SimpleLiteral | RegExpLiteral | BigIntLiteral;

interface SimpleLiteral extends BaseNode, BaseExpression {
    type: "Literal";
    value: string | boolean | number | null;
    raw?: string | undefined;
}

interface RegExpLiteral extends BaseNode, BaseExpression {
    type: "Literal";
    value?: RegExp | null | undefined;
    regex: {
        pattern: string;
        flags: string;
    };
    raw?: string | undefined;
}

interface BigIntLiteral extends BaseNode, BaseExpression {
    type: "Literal";
    value?: bigint | null | undefined;
    bigint: string;
    raw?: string | undefined;
}

type UnaryOperator = "-" | "+" | "!" | "~" | "typeof" | "void" | "delete";

type BinaryOperator =
    | "=="
    | "!="
    | "==="
    | "!=="
    | "<"
    | "<="
    | ">"
    | ">="
    | "<<"
    | ">>"
    | ">>>"
    | "+"
    | "-"
    | "*"
    | "/"
    | "%"
    | "**"
    | "|"
    | "^"
    | "&"
    | "in"
    | "instanceof";

type LogicalOperator = "||" | "&&" | "??";

type AssignmentOperator =
    | "="
    | "+="
    | "-="
    | "*="
    | "/="
    | "%="
    | "**="
    | "<<="
    | ">>="
    | ">>>="
    | "|="
    | "^="
    | "&="
    | "||="
    | "&&="
    | "??=";

type UpdateOperator = "++" | "--";

interface ForOfStatement extends BaseForXStatement {
    type: "ForOfStatement";
    await: boolean;
}

interface Super extends BaseNode {
    type: "Super";
}

interface SpreadElement extends BaseNode {
    type: "SpreadElement";
    argument: Expression;
}

interface ArrowFunctionExpression extends BaseExpression, BaseFunction {
    type: "ArrowFunctionExpression";
    expression: boolean;
    body: BlockStatement | Expression;
}

interface YieldExpression extends BaseExpression {
    type: "YieldExpression";
    argument?: Expression | null | undefined;
    delegate: boolean;
}

interface TemplateLiteral extends BaseExpression {
    type: "TemplateLiteral";
    quasis: TemplateElement[];
    expressions: Expression[];
}

interface TaggedTemplateExpression extends BaseExpression {
    type: "TaggedTemplateExpression";
    tag: Expression;
    quasi: TemplateLiteral;
}

interface TemplateElement extends BaseNode {
    type: "TemplateElement";
    tail: boolean;
    value: {
        /** It is null when the template literal is tagged and the text has an invalid escape (e.g. - tag`\unicode and \u{55}`) */
        cooked?: string | null | undefined;
        raw: string;
    };
}

interface AssignmentProperty extends Property {
    value: Pattern;
    kind: "init";
    method: boolean; // false
}

interface ObjectPattern extends BasePattern {
    type: "ObjectPattern";
    properties: Array<AssignmentProperty | RestElement>;
}

interface ArrayPattern extends BasePattern {
    type: "ArrayPattern";
    elements: Array<Pattern | null>;
}

interface RestElement extends BasePattern {
    type: "RestElement";
    argument: Pattern;
}

interface AssignmentPattern extends BasePattern {
    type: "AssignmentPattern";
    left: Pattern;
    right: Expression;
}

type Class = ClassDeclaration | ClassExpression;
interface BaseClass extends BaseNode {
    superClass?: Expression | null | undefined;
    body: ClassBody;
}

interface ClassBody extends BaseNode {
    type: "ClassBody";
    body: Array<MethodDefinition | PropertyDefinition | StaticBlock>;
}

interface MethodDefinition extends BaseNode {
    type: "MethodDefinition";
    key: Expression | PrivateIdentifier;
    value: FunctionExpression;
    kind: "constructor" | "method" | "get" | "set";
    computed: boolean;
    static: boolean;
}

interface MaybeNamedClassDeclaration extends BaseClass, BaseDeclaration {
    type: "ClassDeclaration";
    /** It is null when a class declaration is a part of the `export default class` statement */
    id: Identifier | null;
}

interface ClassDeclaration extends MaybeNamedClassDeclaration {
    id: Identifier;
}

interface ClassExpression extends BaseClass, BaseExpression {
    type: "ClassExpression";
    id?: Identifier | null | undefined;
}

interface MetaProperty extends BaseExpression {
    type: "MetaProperty";
    meta: Identifier;
    property: Identifier;
}

type ModuleDeclaration =
    | ImportDeclaration
    | ExportNamedDeclaration
    | ExportDefaultDeclaration
    | ExportAllDeclaration;
interface BaseModuleDeclaration extends BaseNode {}

type ModuleSpecifier = ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier | ExportSpecifier;
interface BaseModuleSpecifier extends BaseNode {
    local: Identifier;
}

interface ImportDeclaration extends BaseModuleDeclaration {
    type: "ImportDeclaration";
    specifiers: Array<ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier>;
    attributes: ImportAttribute[];
    source: Literal;
}

interface ImportSpecifier extends BaseModuleSpecifier {
    type: "ImportSpecifier";
    imported: Identifier | Literal;
}

interface ImportAttribute extends BaseNode {
    type: "ImportAttribute";
    key: Identifier | Literal;
    value: Literal;
}

interface ImportExpression extends BaseExpression {
    type: "ImportExpression";
    source: Expression;
    options?: Expression | null | undefined;
}

interface ImportDefaultSpecifier extends BaseModuleSpecifier {
    type: "ImportDefaultSpecifier";
}

interface ImportNamespaceSpecifier extends BaseModuleSpecifier {
    type: "ImportNamespaceSpecifier";
}

interface ExportNamedDeclaration extends BaseModuleDeclaration {
    type: "ExportNamedDeclaration";
    declaration?: Declaration | null | undefined;
    specifiers: ExportSpecifier[];
    attributes: ImportAttribute[];
    source?: Literal | null | undefined;
}

interface ExportSpecifier extends Omit<BaseModuleSpecifier, "local"> {
    type: "ExportSpecifier";
    local: Identifier | Literal;
    exported: Identifier | Literal;
}

interface ExportDefaultDeclaration extends BaseModuleDeclaration {
    type: "ExportDefaultDeclaration";
    declaration: MaybeNamedFunctionDeclaration | MaybeNamedClassDeclaration | Expression;
}

interface ExportAllDeclaration extends BaseModuleDeclaration {
    type: "ExportAllDeclaration";
    exported: Identifier | Literal | null;
    attributes: ImportAttribute[];
    source: Literal;
}

interface AwaitExpression extends BaseExpression {
    type: "AwaitExpression";
    argument: Expression;
}

type Positioned<T> = T & {
	start: number
	end: number
};
type Node = Positioned<Node$1>;

interface HoistMocksOptions {
	/**
	* List of modules that should always be imported before compiler hints.
	* @default 'vitest'
	*/
	hoistedModule?: string;
	/**
	* @default ["vi", "vitest"]
	*/
	utilsObjectNames?: string[];
	/**
	* @default ["mock", "unmock"]
	*/
	hoistableMockMethodNames?: string[];
	/**
	* @default ["mock", "unmock", "doMock", "doUnmock"]
	*/
	dynamicImportMockMethodNames?: string[];
	/**
	* @default ["hoisted"]
	*/
	hoistedMethodNames?: string[];
	regexpHoistable?: RegExp;
	codeFrameGenerator?: CodeFrameGenerator;
}
interface HoistMocksPluginOptions extends Omit<HoistMocksOptions, "regexpHoistable"> {
	include?: string | RegExp | (string | RegExp)[];
	exclude?: string | RegExp | (string | RegExp)[];
	/**
	* overrides include/exclude options
	*/
	filter?: (id: string) => boolean;
}
declare function hoistMocksPlugin(options?: HoistMocksPluginOptions): Plugin;
interface HoistMocksResult {
	code: string;
	map: SourceMap;
}
interface CodeFrameGenerator {
	(node: Positioned<Node>, id: string, code: string): string;
}
// this is a fork of Vite SSR transform
declare function hoistMocks(code: string, id: string, parse: Rollup.PluginContext["parse"], options?: HoistMocksOptions): HoistMocksResult | undefined;

interface InterceptorPluginOptions {
	/**
	* @default "__vitest_mocker__"
	*/
	globalThisAccessor?: string;
	registry?: MockerRegistry;
}
declare function interceptorPlugin(options?: InterceptorPluginOptions): Plugin;

interface MockerPluginOptions extends AutomockPluginOptions {
	hoistMocks?: HoistMocksPluginOptions;
}
// this is an implementation for public usage
// vitest doesn't use this plugin directly
declare function mockerPlugin(options?: MockerPluginOptions): Plugin[];

interface ServerResolverOptions {
	/**
	* @default ['/node_modules/']
	*/
	moduleDirectories?: string[];
}
declare class ServerMockResolver {
	private server;
	private options;
	constructor(server: ViteDevServer, options?: ServerResolverOptions);
	resolveMock(rawId: string, importer: string, options: {
		mock: "spy" | "factory" | "auto"
	}): Promise<ServerMockResolution>;
	invalidate(ids: string[]): void;
	resolveId(id: string, importer?: string): Promise<ServerIdResolution | null>;
	private normalizeResolveIdToUrl;
	private resolveMockId;
	private resolveModule;
}
interface ServerMockResolution {
	mockType: "manual" | "redirect" | "automock" | "autospy";
	resolvedId: string;
	resolvedUrl: string;
	needsInterop?: boolean;
	redirectUrl?: string | null;
}
interface ServerIdResolution {
	id: string;
	url: string;
	optimized: boolean;
}

export { ServerMockResolver, automockModule, automockPlugin, createManualModuleSource, dynamicImportPlugin, hoistMocks, hoistMocksPlugin, interceptorPlugin, mockerPlugin };
export type { AutomockPluginOptions, HoistMocksPluginOptions, HoistMocksResult, InterceptorPluginOptions, ServerIdResolution, ServerMockResolution, ServerResolverOptions };


import AtRule = require('./at-rule.js')
import { AtRuleProps } from './at-rule.js'
import Comment, { CommentProps } from './comment.js'
import Container, { NewChild } from './container.js'
import CssSyntaxError from './css-syntax-error.js'
import Declaration, { DeclarationProps } from './declaration.js'
import Document from './document.js'
import Input from './input.js'
import { Stringifier, Syntax } from './postcss.js'
import Result from './result.js'
import Root from './root.js'
import Rule, { RuleProps } from './rule.js'
import Warning, { WarningOptions } from './warning.js'

declare namespace Node {
  export type ChildNode = AtRule.default | Comment | Declaration | Rule

  export type AnyNode =
    | AtRule.default
    | Comment
    | Declaration
    | Document
    | Root
    | Rule

  export type ChildProps =
    | AtRuleProps
    | CommentProps
    | DeclarationProps
    | RuleProps

  export interface Position {
    /**
     * Source line in file. In contrast to `offset` it starts from 1.
     */
    column: number

    /**
     * Source column in file.
     */
    line: number

    /**
     * Source offset in file. It starts from 0.
     */
    offset: number
  }

  export interface Range {
    /**
     * End position, exclusive.
     */
    end: Position

    /**
     * Start position, inclusive.
     */
    start: Position
  }

  /**
   * Source represents an interface for the {@link Node.source} property.
   */
  export interface Source {
    /**
     * The inclusive ending position for the source
     * code of a node.
     *
     * However, `end.offset` of a non `Root` node is the exclusive position.
     * See https://github.com/postcss/postcss/pull/1879 for details.
     *
     * ```js
     * const root = postcss.parse('a { color: black }')
     * const a = root.first
     * const color = a.first
     *
     * // The offset of `Root` node is the inclusive position
     * css.source.end   // { line: 1, column: 19, offset: 18 }
     *
     * // The offset of non `Root` node is the exclusive position
     * a.source.end     // { line: 1, column: 18, offset: 18 }
     * color.source.end // { line: 1, column: 16, offset: 16 }
     * ```
     */
    end?: Position

    /**
     * The source file from where a node has originated.
     */
    input: Input

    /**
     * The inclusive starting position for the source
     * code of a node.
     */
    start?: Position
  }

  /**
   * Interface represents an interface for an object received
   * as parameter by Node class constructor.
   */
  export interface NodeProps {
    source?: Source
  }

  export interface NodeErrorOptions {
    /**
     * An ending index inside a node's string that should be highlighted as
     * source of error.
     */
    endIndex?: number
    /**
     * An index inside a node's string that should be highlighted as source
     * of error.
     */
    index?: number
    /**
     * Plugin name that created this error. PostCSS will set it automatically.
     */
    plugin?: string
    /**
     * A word inside a node's string, that should be highlighted as source
     * of error.
     */
    word?: string
  }

  // eslint-disable-next-line @typescript-eslint/no-shadow
  class Node extends Node_ {}
  export { Node as default }
}

/**
 * It represents an abstract class that handles common
 * methods for other CSS abstract syntax tree nodes.
 *
 * Any node that represents CSS selector or value should
 * not extend the `Node` class.
 */
declare abstract class Node_ {
  /**
   * It represents parent of the current node.
   *
   * ```js
   * root.nodes[0].parent === root //=> true
   * ```
   */
  parent: Container | Document | undefined

  /**
   * It represents unnecessary whitespace and characters present
   * in the css source code.
   *
   * Information to generate byte-to-byte equal node string as it was
   * in the origin input.
   *
   * The properties of the raws object are decided by parser,
   * the default parser uses the following properties:
   *
   * * `before`: the space symbols before the node. It also stores `*`
   *   and `_` symbols before the declaration (IE hack).
   * * `after`: the space symbols after the last child of the node
   *   to the end of the node.
   * * `between`: the symbols between the property and value
   *   for declarations, selector and `{` for rules, or last parameter
   *   and `{` for at-rules.
   * * `semicolon`: contains true if the last child has
   *   an (optional) semicolon.
   * * `afterName`: the space between the at-rule name and its parameters.
   * * `left`: the space symbols between `/*` and the comment’s text.
   * * `right`: the space symbols between the comment’s text
   *   and <code>*&#47;</code>.
   * - `important`: the content of the important statement,
   *   if it is not just `!important`.
   *
   * PostCSS filters out the comments inside selectors, declaration values
   * and at-rule parameters but it stores the origin content in raws.
   *
   * ```js
   * const root = postcss.parse('a {\n  color:black\n}')
   * root.first.first.raws //=> { before: '\n  ', between: ':' }
   * ```
   */
  raws: any

  /**
   * It represents information related to origin of a node and is required
   * for generating source maps.
   *
   * The nodes that are created manually using the public APIs
   * provided by PostCSS will have `source` undefined and
   * will be absent in the source map.
   *
   * For this reason, the plugin developer should consider
   * duplicating nodes as the duplicate node will have the
   * same source as the original node by default or assign
   * source to a node created manually.
   *
   * ```js
   * decl.source.input.from //=> '/home/ai/source.css'
   * decl.source.start      //=> { line: 10, column: 2 }
   * decl.source.end        //=> { line: 10, column: 12 }
   * ```
   *
   * ```js
   * // Incorrect method, source not specified!
   * const prefixed = postcss.decl({
   *   prop: '-moz-' + decl.prop,
   *   value: decl.value
   * })
   *
   * // Correct method, source is inherited when duplicating.
   * const prefixed = decl.clone({
   *   prop: '-moz-' + decl.prop
   * })
   * ```
   *
   * ```js
   * if (atrule.name === 'add-link') {
   *   const rule = postcss.rule({
   *     selector: 'a',
   *     source: atrule.source
   *   })
   *
   *  atrule.parent.insertBefore(atrule, rule)
   * }
   * ```
   */
  source?: Node.Source

  /**
   * It represents type of a node in
   * an abstract syntax tree.
   *
   * A type of node helps in identification of a node
   * and perform operation based on it's type.
   *
   * ```js
   * const declaration = new Declaration({
   *   prop: 'color',
   *   value: 'black'
   * })
   *
   * declaration.type //=> 'decl'
   * ```
   */
  type: string

  constructor(defaults?: object)

  /**
   * Insert new node after current node to current node’s parent.
   *
   * Just alias for `node.parent.insertAfter(node, add)`.
   *
   * ```js
   * decl.after('color: black')
   * ```
   *
   * @param newNode New node.
   * @return This node for methods chain.
   */
  after(
    newNode: Node | Node.ChildProps | readonly Node[] | string | undefined
  ): this

  /**
   * It assigns properties to an existing node instance.
   *
   * ```js
   * decl.assign({ prop: 'word-wrap', value: 'break-word' })
   * ```
   *
   * @param overrides New properties to override the node.
   *
   * @return `this` for method chaining.
   */
  assign(overrides: object): this

  /**
   * Insert new node before current node to current node’s parent.
   *
   * Just alias for `node.parent.insertBefore(node, add)`.
   *
   * ```js
   * decl.before('content: ""')
   * ```
   *
   * @param newNode New node.
   * @return This node for methods chain.
   */
  before(
    newNode: Node | Node.ChildProps | readonly Node[] | string | undefined
  ): this

  /**
   * Clear the code style properties for the node and its children.
   *
   * ```js
   * node.raws.before  //=> ' '
   * node.cleanRaws()
   * node.raws.before  //=> undefined
   * ```
   *
   * @param keepBetween Keep the `raws.between` symbols.
   */
  cleanRaws(keepBetween?: boolean): void

  /**
   * It creates clone of an existing node, which includes all the properties
   * and their values, that includes `raws` but not `type`.
   *
   * ```js
   * decl.raws.before    //=> "\n  "
   * const cloned = decl.clone({ prop: '-moz-' + decl.prop })
   * cloned.raws.before  //=> "\n  "
   * cloned.toString()   //=> -moz-transform: scale(0)
   * ```
   *
   * @param overrides New properties to override in the clone.
   *
   * @return Duplicate of the node instance.
   */
  clone(overrides?: object): this

  /**
   * Shortcut to clone the node and insert the resulting cloned node
   * after the current node.
   *
   * @param overrides New properties to override in the clone.
   * @return New node.
   */
  cloneAfter(overrides?: object): this

  /**
   * Shortcut to clone the node and insert the resulting cloned node
   * before the current node.
   *
   * ```js
   * decl.cloneBefore({ prop: '-moz-' + decl.prop })
   * ```
   *
   * @param overrides Mew properties to override in the clone.
   *
   * @return New node
   */
  cloneBefore(overrides?: object): this

  /**
   * It creates an instance of the class `CssSyntaxError` and parameters passed
   * to this method are assigned to the error instance.
   *
   * The error instance will have description for the
   * error, original position of the node in the
   * source, showing line and column number.
   *
   * If any previous map is present, it would be used
   * to get original position of the source.
   *
   * The Previous Map here is referred to the source map
   * generated by previous compilation, example: Less,
   * Stylus and Sass.
   *
   * This method returns the error instance instead of
   * throwing it.
   *
   * ```js
   * if (!variables[name]) {
   *   throw decl.error(`Unknown variable ${name}`, { word: name })
   *   // CssSyntaxError: postcss-vars:a.sass:4:3: Unknown variable $black
   *   //   color: $black
   *   // a
   *   //          ^
   *   //   background: white
   * }
   * ```
   *
   * @param message Description for the error instance.
   * @param options Options for the error instance.
   *
   * @return Error instance is returned.
   */
  error(message: string, options?: Node.NodeErrorOptions): CssSyntaxError

  /**
   * Returns the next child of the node’s parent.
   * Returns `undefined` if the current node is the last child.
   *
   * ```js
   * if (comment.text === 'delete next') {
   *   const next = comment.next()
   *   if (next) {
   *     next.remove()
   *   }
   * }
   * ```
   *
   * @return Next node.
   */
  next(): Node.ChildNode | undefined

  /**
   * Get the position for a word or an index inside the node.
   *
   * @param opts Options.
   * @return Position.
   */
  positionBy(opts?: Pick<WarningOptions, 'index' | 'word'>): Node.Position

  /**
   * Convert string index to line/column.
   *
   * @param index The symbol number in the node’s string.
   * @return Symbol position in file.
   */
  positionInside(index: number): Node.Position

  /**
   * Returns the previous child of the node’s parent.
   * Returns `undefined` if the current node is the first child.
   *
   * ```js
   * const annotation = decl.prev()
   * if (annotation.type === 'comment') {
   *   readAnnotation(annotation.text)
   * }
   * ```
   *
   * @return Previous node.
   */
  prev(): Node.ChildNode | undefined

  /**
   * Get the range for a word or start and end index inside the node.
   * The start index is inclusive; the end index is exclusive.
   *
   * @param opts Options.
   * @return Range.
   */
  rangeBy(
    opts?: Pick<WarningOptions, 'end' | 'endIndex' | 'index' | 'start' | 'word'>
  ): Node.Range

  /**
   * Returns a `raws` value. If the node is missing
   * the code style property (because the node was manually built or cloned),
   * PostCSS will try to autodetect the code style property by looking
   * at other nodes in the tree.
   *
   * ```js
   * const root = postcss.parse('a { background: white }')
   * root.nodes[0].append({ prop: 'color', value: 'black' })
   * root.nodes[0].nodes[1].raws.before   //=> undefined
   * root.nodes[0].nodes[1].raw('before') //=> ' '
   * ```
   *
   * @param prop        Name of code style property.
   * @param defaultType Name of default value, it can be missed
   *                    if the value is the same as prop.
   * @return {string} Code style value.
   */
  raw(prop: string, defaultType?: string): string

  /**
   * It removes the node from its parent and deletes its parent property.
   *
   * ```js
   * if (decl.prop.match(/^-webkit-/)) {
   *   decl.remove()
   * }
   * ```
   *
   * @return `this` for method chaining.
   */
  remove(): this

  /**
   * Inserts node(s) before the current node and removes the current node.
   *
   * ```js
   * AtRule: {
   *   mixin: atrule => {
   *     atrule.replaceWith(mixinRules[atrule.params])
   *   }
   * }
   * ```
   *
   * @param nodes Mode(s) to replace current one.
   * @return Current node to methods chain.
   */
  replaceWith(...nodes: NewChild[]): this

  /**
   * Finds the Root instance of the node’s tree.
   *
   * ```js
   * root.nodes[0].nodes[0].root() === root
   * ```
   *
   * @return Root parent.
   */
  root(): Root

  /**
   * Fix circular links on `JSON.stringify()`.
   *
   * @return Cleaned object.
   */
  toJSON(): object

  /**
   * It compiles the node to browser readable cascading style sheets string
   * depending on it's type.
   *
   * ```js
   * new Rule({ selector: 'a' }).toString() //=> "a {}"
   * ```
   *
   * @param stringifier A syntax to use in string generation.
   * @return CSS string of this node.
   */
  toString(stringifier?: Stringifier | Syntax): string

  /**
   * It is a wrapper for {@link Result#warn}, providing convenient
   * way of generating warnings.
   *
   * ```js
   *   Declaration: {
   *     bad: (decl, { result }) => {
   *       decl.warn(result, 'Deprecated property: bad')
   *     }
   *   }
   * ```
   *
   * @param result The `Result` instance that will receive the warning.
   * @param message Description for the warning.
   * @param options Options for the warning.
   *
   * @return `Warning` instance is returned
   */
  warn(result: Result, message: string, options?: WarningOptions): Warning

  /**
   * If this node isn't already dirty, marks it and its ancestors as such. This
   * indicates to the LazyResult processor that the {@link Root} has been
   * modified by the current plugin and may need to be processed again by other
   * plugins.
   */
  protected markDirty(): void
}

declare class Node extends Node_ {}

export = Node


import { C as Colors } from './index-8b61d5bc.js';
export { F as Formatter, g as getDefaultColors } from './index-8b61d5bc.js';

declare function isSupported(): boolean;
declare function createColors(): Colors;
declare const _default: Colors;

export { Colors, createColors, _default as default, isSupported };


import { z as ResolvedConfig, y as UserConfig, v as VitestRunMode, H as VitestOptions, V as Vitest, A as ApiConfig, T as TestProject, J as TestSequencer, K as TestSpecification, L as Logger, M as TestModule, N as ModuleDiagnostic } from './chunks/reporters.d.BFLkQcL6.js';
export { B as BaseCoverageOptions, F as BenchmarkUserOptions, ag as BrowserBuiltinProvider, ah as BrowserCommand, ai as BrowserCommandContext, q as BrowserConfigOptions, aj as BrowserInstanceOption, ak as BrowserModuleMocker, al as BrowserOrchestrator, am as BrowserProvider, an as BrowserProviderInitializationOptions, ao as BrowserProviderModule, ap as BrowserProviderOptions, p as BrowserScript, aq as BrowserServerState, ar as BrowserServerStateSession, r as BuiltinEnvironment, as as CDPSession, u as CSSModuleScopeStrategy, m as CoverageIstanbulOptions, l as CoverageOptions, h as CoverageProvider, i as CoverageProviderModule, j as CoverageReporter, c as CoverageV8Options, n as CustomProviderOptions, D as DepsOptimizationOptions, a0 as HTMLOptions, I as InlineConfig, a2 as JUnitOptions, a1 as JsonOptions, O as OnServerRestartHandler, Q as OnTestsRerunHandler, at as ParentProjectBrowser, P as Pool, t as PoolOptions, Y as ProcessPool, au as ProjectBrowser, E as ProjectConfig, a as ReportContext, aA as ReportedHookContext, o as Reporter, ax as ResolveSnapshotPathHandler, ay as ResolveSnapshotPathHandlerContext, av as ResolvedBrowserOptions, R as ResolvedCoverageOptions, aw as ResolvedProjectConfig, $ as SerializedTestProject, a3 as TaskOptions, a4 as TestCase, a5 as TestCollection, a6 as TestDiagnostic, a7 as TestModuleState, a8 as TestResult, a9 as TestResultFailed, aa as TestResultPassed, ab as TestResultSkipped, aB as TestRunEndReason, az as TestRunResult, af as TestSequencerConstructor, ac as TestState, ad as TestSuite, ae as TestSuiteState, w as TransformModePatterns, x as TypecheckConfig, U as UserWorkspaceConfig, s as VitestEnvironment, X as VitestPackageInstaller, g as WatcherTriggerPattern, Z as WorkspaceSpec, _ as getFilePoolName } from './chunks/reporters.d.BFLkQcL6.js';
import * as vite from 'vite';
import { InlineConfig, UserConfig as UserConfig$1, Plugin, ResolvedConfig as ResolvedConfig$1, LogLevel, LoggerOptions, Logger as Logger$1 } from 'vite';
export { vite as Vite };
export { esbuildVersion, isCSSRequest, isFileServingAllowed, parseAst, parseAstAsync, rollupVersion, version as viteVersion } from 'vite';
import { IncomingMessage } from 'node:http';
import { R as RuntimeRPC } from './chunks/worker.d.1GmBbd7G.js';
export { T as TestExecutionType } from './chunks/worker.d.1GmBbd7G.js';
import { Writable } from 'node:stream';
export { V as VitestPluginContext } from './chunks/vite.d.CMLlLIFP.js';
export { W as WorkerContext } from './chunks/worker.d.CKwWzBSj.js';
export { C as TypeCheckCollectLineNumbers, a as TypeCheckCollectLines, c as TypeCheckContext, T as TypeCheckErrorInfo, R as TypeCheckRawErrorsMap, b as TypeCheckRootAndTarget } from './chunks/global.d.MAmajcmJ.js';
import { Debugger } from 'debug';
export { Task as RunnerTask, TaskResult as RunnerTaskResult, TaskResultPack as RunnerTaskResultPack, Test as RunnerTestCase, File as RunnerTestFile, Suite as RunnerTestSuite, SequenceHooks, SequenceSetupFiles } from '@vitest/runner';
export { f as EnvironmentOptions, H as HappyDOMOptions, J as JSDOMOptions } from './chunks/environment.d.cL3nLXbE.js';
export { SerializedError } from '@vitest/utils';
export { b as RuntimeConfig } from './chunks/config.d.D2ROskhv.js';
export { generateFileHash } from '@vitest/runner/utils';
import 'node:console';
import '@vitest/mocker';
import '@vitest/utils/source-map';
import '@vitest/pretty-format';
import '@vitest/snapshot';
import '@vitest/utils/diff';
import 'vite-node';
import 'chai';
import './chunks/benchmark.d.BwvBVTda.js';
import 'tinybench';
import './chunks/coverage.d.S9RMNXIe.js';
import 'vite-node/client';
import '@vitest/snapshot/manager';
import 'node:fs';
import 'node:worker_threads';
import '@vitest/expect';
import 'vitest/optional-types.js';
import '@vitest/snapshot/environment';

declare function isValidApiRequest(config: ResolvedConfig, req: IncomingMessage): boolean;

interface CliOptions extends UserConfig {
	/**
	* Override the watch mode
	*/
	run?: boolean;
	/**
	* Removes colors from the console output
	*/
	color?: boolean;
	/**
	* Output collected tests as JSON or to a file
	*/
	json?: string | boolean;
	/**
	* Output collected test files only
	*/
	filesOnly?: boolean;
	/**
	* Override vite config's configLoader from cli.
	* Use `bundle` to bundle the config with esbuild or `runner` (experimental) to process it on the fly (default: `bundle`).
	* This is only available with **vite version 6.1.0** and above.
	* @experimental
	*/
	configLoader?: InlineConfig extends {
		configLoader?: infer T
	} ? T : never;
}
/**
* Start Vitest programmatically
*
* Returns a Vitest instance if initialized successfully.
*/
declare function startVitest(mode: VitestRunMode, cliFilters?: string[], options?: CliOptions, viteOverrides?: UserConfig$1, vitestOptions?: VitestOptions): Promise<Vitest>;

interface CliParseOptions {
	allowUnknownOptions?: boolean;
}
declare function parseCLI(argv: string | string[], config?: CliParseOptions): {
	filter: string[]
	options: CliOptions
};

declare function resolveApiServerConfig<Options extends ApiConfig & UserConfig>(options: Options, defaultPort: number): ApiConfig | undefined;

declare function createVitest(mode: VitestRunMode, options: CliOptions, viteOverrides?: UserConfig$1, vitestOptions?: VitestOptions): Promise<Vitest>;

declare class FilesNotFoundError extends Error {
	code: string;
	constructor(mode: "test" | "benchmark");
}
declare class GitNotFoundError extends Error {
	code: string;
	constructor();
}

/** @deprecated use `TestProject` instead */
type GlobalSetupContext = TestProject;

declare function VitestPlugin(options?: UserConfig, vitest?: Vitest): Promise<Plugin[]>;

// this is only exported as a public function and not used inside vitest
declare function resolveConfig(options?: UserConfig, viteOverrides?: UserConfig$1): Promise<{
	vitestConfig: ResolvedConfig
	viteConfig: ResolvedConfig$1
}>;

declare function resolveFsAllow(projectRoot: string, rootConfigFile: string | false | undefined): string[];

interface MethodsOptions {
	cacheFs?: boolean;
	// do not report files
	collect?: boolean;
}
declare function createMethodsRPC(project: TestProject, options?: MethodsOptions): RuntimeRPC;

declare class BaseSequencer implements TestSequencer {
	protected ctx: Vitest;
	constructor(ctx: Vitest);
	// async so it can be extended by other sequelizers
	shard(files: TestSpecification[]): Promise<TestSpecification[]>;
	// async so it can be extended by other sequelizers
	sort(files: TestSpecification[]): Promise<TestSpecification[]>;
}

declare function registerConsoleShortcuts(ctx: Vitest, stdin: NodeJS.ReadStream | undefined, stdout: NodeJS.WriteStream | Writable): () => void;

// This is copy-pasted and needs to be synced from time to time. Ideally, Vite's `createLogger` should accept a custom `console`
// https://github.com/vitejs/vite/blob/main/packages/vite/src/node/logger.ts?rgh-link-date=2024-10-16T23%3A29%3A19Z
// When Vitest supports only Vite 6 and above, we can use Vite's `createLogger({ console })`
// https://github.com/vitejs/vite/pull/18379
declare function createViteLogger(console: Logger, level?: LogLevel, options?: LoggerOptions): Logger$1;

declare const rootDir: string;
declare const distDir: string;

declare function createDebugger(namespace: `vitest:${string}`): Debugger | undefined;

declare const version: string;

/** @deprecated use `createViteServer` instead */
declare const createServer: typeof vite.createServer;
declare const createViteServer: typeof vite.createServer;

/**
* @deprecated Use `TestModule` instead
*/
declare const TestFile: typeof TestModule;

/**
* @deprecated Use `ModuleDiagnostic` instead
*/
type FileDiagnostic = ModuleDiagnostic;

// rolldownVersion is exported only by rolldown-vite
declare const rolldownVersion: string | undefined;

export { ApiConfig, BaseSequencer, GitNotFoundError, ModuleDiagnostic, ResolvedConfig, TestFile, TestModule, TestProject, TestSequencer, TestSpecification, FilesNotFoundError as TestsNotFoundError, UserConfig, Vitest, VitestOptions, VitestPlugin, VitestRunMode, TestProject as WorkspaceProject, createDebugger, createMethodsRPC, createServer, createViteLogger, createViteServer, createVitest, distDir, isValidApiRequest, parseCLI, registerConsoleShortcuts, resolveApiServerConfig, resolveConfig, resolveFsAllow, rolldownVersion, rootDir, startVitest, version };
export type { CliParseOptions, FileDiagnostic, GlobalSetupContext };


export * from './dist/node.js'


import { Plugin, Rollup, ViteDevServer } from 'vite';
import MagicString, { SourceMap } from 'magic-string';
import { c as MockerRegistry } from './registry.d-D765pazg.js';
export { findMockRedirect } from './redirect.js';

declare function createManualModuleSource(moduleUrl: string, exports: string[], globalAccessor?: string): string;

interface AutomockPluginOptions {
	/**
	* @default "__vitest_mocker__"
	*/
	globalThisAccessor?: string;
}
declare function automockPlugin(options?: AutomockPluginOptions): Plugin;
// TODO: better source map replacement
declare function automockModule(code: string, mockType: "automock" | "autospy", parse: (code: string) => any, options?: AutomockPluginOptions): MagicString;

interface DynamicImportPluginOptions {
	/**
	* @default `"__vitest_mocker__"`
	*/
	globalThisAccessor?: string;
	filter?: (id: string) => boolean;
}
declare function dynamicImportPlugin(options?: DynamicImportPluginOptions): Plugin;

// This definition file follows a somewhat unusual format. ESTree allows
// runtime type checks based on the `type` parameter. In order to explain this
// to typescript we want to use discriminated union types:
// https://github.com/Microsoft/TypeScript/pull/9163
//
// For ESTree this is a bit tricky because the high level interfaces like
// Node or Function are pulling double duty. We want to pass common fields down
// to the interfaces that extend them (like Identifier or
// ArrowFunctionExpression), but you can't extend a type union or enforce
// common fields on them. So we've split the high level interfaces into two
// types, a base type which passes down inherited fields, and a type union of
// all types which extend the base type. Only the type union is exported, and
// the union is how other types refer to the collection of inheriting types.
//
// This makes the definitions file here somewhat more difficult to maintain,
// but it has the notable advantage of making ESTree much easier to use as
// an end user.

interface BaseNodeWithoutComments {
    // Every leaf interface that extends BaseNode must specify a type property.
    // The type property should be a string literal. For example, Identifier
    // has: `type: "Identifier"`
    type: string;
    loc?: SourceLocation | null | undefined;
    range?: [number, number] | undefined;
}

interface BaseNode extends BaseNodeWithoutComments {
    leadingComments?: Comment[] | undefined;
    trailingComments?: Comment[] | undefined;
}

interface NodeMap {
    AssignmentProperty: AssignmentProperty;
    CatchClause: CatchClause;
    Class: Class;
    ClassBody: ClassBody;
    Expression: Expression;
    Function: Function;
    Identifier: Identifier;
    Literal: Literal;
    MethodDefinition: MethodDefinition;
    ModuleDeclaration: ModuleDeclaration;
    ModuleSpecifier: ModuleSpecifier;
    Pattern: Pattern;
    PrivateIdentifier: PrivateIdentifier;
    Program: Program;
    Property: Property;
    PropertyDefinition: PropertyDefinition;
    SpreadElement: SpreadElement;
    Statement: Statement;
    Super: Super;
    SwitchCase: SwitchCase;
    TemplateElement: TemplateElement;
    VariableDeclarator: VariableDeclarator;
}

type Node$1 = NodeMap[keyof NodeMap];

interface Comment extends BaseNodeWithoutComments {
    type: "Line" | "Block";
    value: string;
}

interface SourceLocation {
    source?: string | null | undefined;
    start: Position;
    end: Position;
}

interface Position {
    /** >= 1 */
    line: number;
    /** >= 0 */
    column: number;
}

interface Program extends BaseNode {
    type: "Program";
    sourceType: "script" | "module";
    body: Array<Directive | Statement | ModuleDeclaration>;
    comments?: Comment[] | undefined;
}

interface Directive extends BaseNode {
    type: "ExpressionStatement";
    expression: Literal;
    directive: string;
}

interface BaseFunction extends BaseNode {
    params: Pattern[];
    generator?: boolean | undefined;
    async?: boolean | undefined;
    // The body is either BlockStatement or Expression because arrow functions
    // can have a body that's either. FunctionDeclarations and
    // FunctionExpressions have only BlockStatement bodies.
    body: BlockStatement | Expression;
}

type Function = FunctionDeclaration | FunctionExpression | ArrowFunctionExpression;

type Statement =
    | ExpressionStatement
    | BlockStatement
    | StaticBlock
    | EmptyStatement
    | DebuggerStatement
    | WithStatement
    | ReturnStatement
    | LabeledStatement
    | BreakStatement
    | ContinueStatement
    | IfStatement
    | SwitchStatement
    | ThrowStatement
    | TryStatement
    | WhileStatement
    | DoWhileStatement
    | ForStatement
    | ForInStatement
    | ForOfStatement
    | Declaration;

interface BaseStatement extends BaseNode {}

interface EmptyStatement extends BaseStatement {
    type: "EmptyStatement";
}

interface BlockStatement extends BaseStatement {
    type: "BlockStatement";
    body: Statement[];
    innerComments?: Comment[] | undefined;
}

interface StaticBlock extends Omit<BlockStatement, "type"> {
    type: "StaticBlock";
}

interface ExpressionStatement extends BaseStatement {
    type: "ExpressionStatement";
    expression: Expression;
}

interface IfStatement extends BaseStatement {
    type: "IfStatement";
    test: Expression;
    consequent: Statement;
    alternate?: Statement | null | undefined;
}

interface LabeledStatement extends BaseStatement {
    type: "LabeledStatement";
    label: Identifier;
    body: Statement;
}

interface BreakStatement extends BaseStatement {
    type: "BreakStatement";
    label?: Identifier | null | undefined;
}

interface ContinueStatement extends BaseStatement {
    type: "ContinueStatement";
    label?: Identifier | null | undefined;
}

interface WithStatement extends BaseStatement {
    type: "WithStatement";
    object: Expression;
    body: Statement;
}

interface SwitchStatement extends BaseStatement {
    type: "SwitchStatement";
    discriminant: Expression;
    cases: SwitchCase[];
}

interface ReturnStatement extends BaseStatement {
    type: "ReturnStatement";
    argument?: Expression | null | undefined;
}

interface ThrowStatement extends BaseStatement {
    type: "ThrowStatement";
    argument: Expression;
}

interface TryStatement extends BaseStatement {
    type: "TryStatement";
    block: BlockStatement;
    handler?: CatchClause | null | undefined;
    finalizer?: BlockStatement | null | undefined;
}

interface WhileStatement extends BaseStatement {
    type: "WhileStatement";
    test: Expression;
    body: Statement;
}

interface DoWhileStatement extends BaseStatement {
    type: "DoWhileStatement";
    body: Statement;
    test: Expression;
}

interface ForStatement extends BaseStatement {
    type: "ForStatement";
    init?: VariableDeclaration | Expression | null | undefined;
    test?: Expression | null | undefined;
    update?: Expression | null | undefined;
    body: Statement;
}

interface BaseForXStatement extends BaseStatement {
    left: VariableDeclaration | Pattern;
    right: Expression;
    body: Statement;
}

interface ForInStatement extends BaseForXStatement {
    type: "ForInStatement";
}

interface DebuggerStatement extends BaseStatement {
    type: "DebuggerStatement";
}

type Declaration = FunctionDeclaration | VariableDeclaration | ClassDeclaration;

interface BaseDeclaration extends BaseStatement {}

interface MaybeNamedFunctionDeclaration extends BaseFunction, BaseDeclaration {
    type: "FunctionDeclaration";
    /** It is null when a function declaration is a part of the `export default function` statement */
    id: Identifier | null;
    body: BlockStatement;
}

interface FunctionDeclaration extends MaybeNamedFunctionDeclaration {
    id: Identifier;
}

interface VariableDeclaration extends BaseDeclaration {
    type: "VariableDeclaration";
    declarations: VariableDeclarator[];
    kind: "var" | "let" | "const" | "using" | "await using";
}

interface VariableDeclarator extends BaseNode {
    type: "VariableDeclarator";
    id: Pattern;
    init?: Expression | null | undefined;
}

interface ExpressionMap {
    ArrayExpression: ArrayExpression;
    ArrowFunctionExpression: ArrowFunctionExpression;
    AssignmentExpression: AssignmentExpression;
    AwaitExpression: AwaitExpression;
    BinaryExpression: BinaryExpression;
    CallExpression: CallExpression;
    ChainExpression: ChainExpression;
    ClassExpression: ClassExpression;
    ConditionalExpression: ConditionalExpression;
    FunctionExpression: FunctionExpression;
    Identifier: Identifier;
    ImportExpression: ImportExpression;
    Literal: Literal;
    LogicalExpression: LogicalExpression;
    MemberExpression: MemberExpression;
    MetaProperty: MetaProperty;
    NewExpression: NewExpression;
    ObjectExpression: ObjectExpression;
    SequenceExpression: SequenceExpression;
    TaggedTemplateExpression: TaggedTemplateExpression;
    TemplateLiteral: TemplateLiteral;
    ThisExpression: ThisExpression;
    UnaryExpression: UnaryExpression;
    UpdateExpression: UpdateExpression;
    YieldExpression: YieldExpression;
}

type Expression = ExpressionMap[keyof ExpressionMap];

interface BaseExpression extends BaseNode {}

type ChainElement = SimpleCallExpression | MemberExpression;

interface ChainExpression extends BaseExpression {
    type: "ChainExpression";
    expression: ChainElement;
}

interface ThisExpression extends BaseExpression {
    type: "ThisExpression";
}

interface ArrayExpression extends BaseExpression {
    type: "ArrayExpression";
    elements: Array<Expression | SpreadElement | null>;
}

interface ObjectExpression extends BaseExpression {
    type: "ObjectExpression";
    properties: Array<Property | SpreadElement>;
}

interface PrivateIdentifier extends BaseNode {
    type: "PrivateIdentifier";
    name: string;
}

interface Property extends BaseNode {
    type: "Property";
    key: Expression | PrivateIdentifier;
    value: Expression | Pattern; // Could be an AssignmentProperty
    kind: "init" | "get" | "set";
    method: boolean;
    shorthand: boolean;
    computed: boolean;
}

interface PropertyDefinition extends BaseNode {
    type: "PropertyDefinition";
    key: Expression | PrivateIdentifier;
    value?: Expression | null | undefined;
    computed: boolean;
    static: boolean;
}

interface FunctionExpression extends BaseFunction, BaseExpression {
    id?: Identifier | null | undefined;
    type: "FunctionExpression";
    body: BlockStatement;
}

interface SequenceExpression extends BaseExpression {
    type: "SequenceExpression";
    expressions: Expression[];
}

interface UnaryExpression extends BaseExpression {
    type: "UnaryExpression";
    operator: UnaryOperator;
    prefix: true;
    argument: Expression;
}

interface BinaryExpression extends BaseExpression {
    type: "BinaryExpression";
    operator: BinaryOperator;
    left: Expression | PrivateIdentifier;
    right: Expression;
}

interface AssignmentExpression extends BaseExpression {
    type: "AssignmentExpression";
    operator: AssignmentOperator;
    left: Pattern | MemberExpression;
    right: Expression;
}

interface UpdateExpression extends BaseExpression {
    type: "UpdateExpression";
    operator: UpdateOperator;
    argument: Expression;
    prefix: boolean;
}

interface LogicalExpression extends BaseExpression {
    type: "LogicalExpression";
    operator: LogicalOperator;
    left: Expression;
    right: Expression;
}

interface ConditionalExpression extends BaseExpression {
    type: "ConditionalExpression";
    test: Expression;
    alternate: Expression;
    consequent: Expression;
}

interface BaseCallExpression extends BaseExpression {
    callee: Expression | Super;
    arguments: Array<Expression | SpreadElement>;
}
type CallExpression = SimpleCallExpression | NewExpression;

interface SimpleCallExpression extends BaseCallExpression {
    type: "CallExpression";
    optional: boolean;
}

interface NewExpression extends BaseCallExpression {
    type: "NewExpression";
}

interface MemberExpression extends BaseExpression, BasePattern {
    type: "MemberExpression";
    object: Expression | Super;
    property: Expression | PrivateIdentifier;
    computed: boolean;
    optional: boolean;
}

type Pattern = Identifier | ObjectPattern | ArrayPattern | RestElement | AssignmentPattern | MemberExpression;

interface BasePattern extends BaseNode {}

interface SwitchCase extends BaseNode {
    type: "SwitchCase";
    test?: Expression | null | undefined;
    consequent: Statement[];
}

interface CatchClause extends BaseNode {
    type: "CatchClause";
    param: Pattern | null;
    body: BlockStatement;
}

interface Identifier extends BaseNode, BaseExpression, BasePattern {
    type: "Identifier";
    name: string;
}

type Literal = SimpleLiteral | RegExpLiteral | BigIntLiteral;

interface SimpleLiteral extends BaseNode, BaseExpression {
    type: "Literal";
    value: string | boolean | number | null;
    raw?: string | undefined;
}

interface RegExpLiteral extends BaseNode, BaseExpression {
    type: "Literal";
    value?: RegExp | null | undefined;
    regex: {
        pattern: string;
        flags: string;
    };
    raw?: string | undefined;
}

interface BigIntLiteral extends BaseNode, BaseExpression {
    type: "Literal";
    value?: bigint | null | undefined;
    bigint: string;
    raw?: string | undefined;
}

type UnaryOperator = "-" | "+" | "!" | "~" | "typeof" | "void" | "delete";

type BinaryOperator =
    | "=="
    | "!="
    | "==="
    | "!=="
    | "<"
    | "<="
    | ">"
    | ">="
    | "<<"
    | ">>"
    | ">>>"
    | "+"
    | "-"
    | "*"
    | "/"
    | "%"
    | "**"
    | "|"
    | "^"
    | "&"
    | "in"
    | "instanceof";

type LogicalOperator = "||" | "&&" | "??";

type AssignmentOperator =
    | "="
    | "+="
    | "-="
    | "*="
    | "/="
    | "%="
    | "**="
    | "<<="
    | ">>="
    | ">>>="
    | "|="
    | "^="
    | "&="
    | "||="
    | "&&="
    | "??=";

type UpdateOperator = "++" | "--";

interface ForOfStatement extends BaseForXStatement {
    type: "ForOfStatement";
    await: boolean;
}

interface Super extends BaseNode {
    type: "Super";
}

interface SpreadElement extends BaseNode {
    type: "SpreadElement";
    argument: Expression;
}

interface ArrowFunctionExpression extends BaseExpression, BaseFunction {
    type: "ArrowFunctionExpression";
    expression: boolean;
    body: BlockStatement | Expression;
}

interface YieldExpression extends BaseExpression {
    type: "YieldExpression";
    argument?: Expression | null | undefined;
    delegate: boolean;
}

interface TemplateLiteral extends BaseExpression {
    type: "TemplateLiteral";
    quasis: TemplateElement[];
    expressions: Expression[];
}

interface TaggedTemplateExpression extends BaseExpression {
    type: "TaggedTemplateExpression";
    tag: Expression;
    quasi: TemplateLiteral;
}

interface TemplateElement extends BaseNode {
    type: "TemplateElement";
    tail: boolean;
    value: {
        /** It is null when the template literal is tagged and the text has an invalid escape (e.g. - tag`\unicode and \u{55}`) */
        cooked?: string | null | undefined;
        raw: string;
    };
}

interface AssignmentProperty extends Property {
    value: Pattern;
    kind: "init";
    method: boolean; // false
}

interface ObjectPattern extends BasePattern {
    type: "ObjectPattern";
    properties: Array<AssignmentProperty | RestElement>;
}

interface ArrayPattern extends BasePattern {
    type: "ArrayPattern";
    elements: Array<Pattern | null>;
}

interface RestElement extends BasePattern {
    type: "RestElement";
    argument: Pattern;
}

interface AssignmentPattern extends BasePattern {
    type: "AssignmentPattern";
    left: Pattern;
    right: Expression;
}

type Class = ClassDeclaration | ClassExpression;
interface BaseClass extends BaseNode {
    superClass?: Expression | null | undefined;
    body: ClassBody;
}

interface ClassBody extends BaseNode {
    type: "ClassBody";
    body: Array<MethodDefinition | PropertyDefinition | StaticBlock>;
}

interface MethodDefinition extends BaseNode {
    type: "MethodDefinition";
    key: Expression | PrivateIdentifier;
    value: FunctionExpression;
    kind: "constructor" | "method" | "get" | "set";
    computed: boolean;
    static: boolean;
}

interface MaybeNamedClassDeclaration extends BaseClass, BaseDeclaration {
    type: "ClassDeclaration";
    /** It is null when a class declaration is a part of the `export default class` statement */
    id: Identifier | null;
}

interface ClassDeclaration extends MaybeNamedClassDeclaration {
    id: Identifier;
}

interface ClassExpression extends BaseClass, BaseExpression {
    type: "ClassExpression";
    id?: Identifier | null | undefined;
}

interface MetaProperty extends BaseExpression {
    type: "MetaProperty";
    meta: Identifier;
    property: Identifier;
}

type ModuleDeclaration =
    | ImportDeclaration
    | ExportNamedDeclaration
    | ExportDefaultDeclaration
    | ExportAllDeclaration;
interface BaseModuleDeclaration extends BaseNode {}

type ModuleSpecifier = ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier | ExportSpecifier;
interface BaseModuleSpecifier extends BaseNode {
    local: Identifier;
}

interface ImportDeclaration extends BaseModuleDeclaration {
    type: "ImportDeclaration";
    specifiers: Array<ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier>;
    attributes: ImportAttribute[];
    source: Literal;
}

interface ImportSpecifier extends BaseModuleSpecifier {
    type: "ImportSpecifier";
    imported: Identifier | Literal;
}

interface ImportAttribute extends BaseNode {
    type: "ImportAttribute";
    key: Identifier | Literal;
    value: Literal;
}

interface ImportExpression extends BaseExpression {
    type: "ImportExpression";
    source: Expression;
    options?: Expression | null | undefined;
}

interface ImportDefaultSpecifier extends BaseModuleSpecifier {
    type: "ImportDefaultSpecifier";
}

interface ImportNamespaceSpecifier extends BaseModuleSpecifier {
    type: "ImportNamespaceSpecifier";
}

interface ExportNamedDeclaration extends BaseModuleDeclaration {
    type: "ExportNamedDeclaration";
    declaration?: Declaration | null | undefined;
    specifiers: ExportSpecifier[];
    attributes: ImportAttribute[];
    source?: Literal | null | undefined;
}

interface ExportSpecifier extends Omit<BaseModuleSpecifier, "local"> {
    type: "ExportSpecifier";
    local: Identifier | Literal;
    exported: Identifier | Literal;
}

interface ExportDefaultDeclaration extends BaseModuleDeclaration {
    type: "ExportDefaultDeclaration";
    declaration: MaybeNamedFunctionDeclaration | MaybeNamedClassDeclaration | Expression;
}

interface ExportAllDeclaration extends BaseModuleDeclaration {
    type: "ExportAllDeclaration";
    exported: Identifier | Literal | null;
    attributes: ImportAttribute[];
    source: Literal;
}

interface AwaitExpression extends BaseExpression {
    type: "AwaitExpression";
    argument: Expression;
}

type Positioned<T> = T & {
	start: number
	end: number
};
type Node = Positioned<Node$1>;

interface HoistMocksOptions {
	/**
	* List of modules that should always be imported before compiler hints.
	* @default 'vitest'
	*/
	hoistedModule?: string;
	/**
	* @default ["vi", "vitest"]
	*/
	utilsObjectNames?: string[];
	/**
	* @default ["mock", "unmock"]
	*/
	hoistableMockMethodNames?: string[];
	/**
	* @default ["mock", "unmock", "doMock", "doUnmock"]
	*/
	dynamicImportMockMethodNames?: string[];
	/**
	* @default ["hoisted"]
	*/
	hoistedMethodNames?: string[];
	regexpHoistable?: RegExp;
	codeFrameGenerator?: CodeFrameGenerator;
}
interface HoistMocksPluginOptions extends Omit<HoistMocksOptions, "regexpHoistable"> {
	include?: string | RegExp | (string | RegExp)[];
	exclude?: string | RegExp | (string | RegExp)[];
	/**
	* overrides include/exclude options
	*/
	filter?: (id: string) => boolean;
}
declare function hoistMocksPlugin(options?: HoistMocksPluginOptions): Plugin;
interface HoistMocksResult {
	code: string;
	map: SourceMap;
}
interface CodeFrameGenerator {
	(node: Positioned<Node>, id: string, code: string): string;
}
// this is a fork of Vite SSR transform
declare function hoistMocks(code: string, id: string, parse: Rollup.PluginContext["parse"], options?: HoistMocksOptions): HoistMocksResult | undefined;

interface InterceptorPluginOptions {
	/**
	* @default "__vitest_mocker__"
	*/
	globalThisAccessor?: string;
	registry?: MockerRegistry;
}
declare function interceptorPlugin(options?: InterceptorPluginOptions): Plugin;

interface MockerPluginOptions extends AutomockPluginOptions {
	hoistMocks?: HoistMocksPluginOptions;
}
// this is an implementation for public usage
// vitest doesn't use this plugin directly
declare function mockerPlugin(options?: MockerPluginOptions): Plugin[];

interface ServerResolverOptions {
	/**
	* @default ['/node_modules/']
	*/
	moduleDirectories?: string[];
}
declare class ServerMockResolver {
	private server;
	private options;
	constructor(server: ViteDevServer, options?: ServerResolverOptions);
	resolveMock(rawId: string, importer: string, options: {
		mock: "spy" | "factory" | "auto"
	}): Promise<ServerMockResolution>;
	invalidate(ids: string[]): void;
	resolveId(id: string, importer?: string): Promise<ServerIdResolution | null>;
	private normalizeResolveIdToUrl;
	private resolveMockId;
	private resolveModule;
}
interface ServerMockResolution {
	mockType: "manual" | "redirect" | "automock" | "autospy";
	resolvedId: string;
	resolvedUrl: string;
	needsInterop?: boolean;
	redirectUrl?: string | null;
}
interface ServerIdResolution {
	id: string;
	url: string;
	optimized: boolean;
}

export { ServerMockResolver, automockModule, automockPlugin, createManualModuleSource, dynamicImportPlugin, hoistMocks, hoistMocksPlugin, interceptorPlugin, mockerPlugin };
export type { AutomockPluginOptions, HoistMocksPluginOptions, HoistMocksResult, InterceptorPluginOptions, ServerIdResolution, ServerMockResolution, ServerResolverOptions };


import AtRule = require('./at-rule.js')
import { AtRuleProps } from './at-rule.js'
import Comment, { CommentProps } from './comment.js'
import Container, { NewChild } from './container.js'
import CssSyntaxError from './css-syntax-error.js'
import Declaration, { DeclarationProps } from './declaration.js'
import Document from './document.js'
import Input from './input.js'
import { Stringifier, Syntax } from './postcss.js'
import Result from './result.js'
import Root from './root.js'
import Rule, { RuleProps } from './rule.js'
import Warning, { WarningOptions } from './warning.js'

declare namespace Node {
  export type ChildNode = AtRule.default | Comment | Declaration | Rule

  export type AnyNode =
    | AtRule.default
    | Comment
    | Declaration
    | Document
    | Root
    | Rule

  export type ChildProps =
    | AtRuleProps
    | CommentProps
    | DeclarationProps
    | RuleProps

  export interface Position {
    /**
     * Source line in file. In contrast to `offset` it starts from 1.
     */
    column: number

    /**
     * Source column in file.
     */
    line: number

    /**
     * Source offset in file. It starts from 0.
     */
    offset: number
  }

  export interface Range {
    /**
     * End position, exclusive.
     */
    end: Position

    /**
     * Start position, inclusive.
     */
    start: Position
  }

  /**
   * Source represents an interface for the {@link Node.source} property.
   */
  export interface Source {
    /**
     * The inclusive ending position for the source
     * code of a node.
     *
     * However, `end.offset` of a non `Root` node is the exclusive position.
     * See https://github.com/postcss/postcss/pull/1879 for details.
     *
     * ```js
     * const root = postcss.parse('a { color: black }')
     * const a = root.first
     * const color = a.first
     *
     * // The offset of `Root` node is the inclusive position
     * css.source.end   // { line: 1, column: 19, offset: 18 }
     *
     * // The offset of non `Root` node is the exclusive position
     * a.source.end     // { line: 1, column: 18, offset: 18 }
     * color.source.end // { line: 1, column: 16, offset: 16 }
     * ```
     */
    end?: Position

    /**
     * The source file from where a node has originated.
     */
    input: Input

    /**
     * The inclusive starting position for the source
     * code of a node.
     */
    start?: Position
  }

  /**
   * Interface represents an interface for an object received
   * as parameter by Node class constructor.
   */
  export interface NodeProps {
    source?: Source
  }

  export interface NodeErrorOptions {
    /**
     * An ending index inside a node's string that should be highlighted as
     * source of error.
     */
    endIndex?: number
    /**
     * An index inside a node's string that should be highlighted as source
     * of error.
     */
    index?: number
    /**
     * Plugin name that created this error. PostCSS will set it automatically.
     */
    plugin?: string
    /**
     * A word inside a node's string, that should be highlighted as source
     * of error.
     */
    word?: string
  }

  // eslint-disable-next-line @typescript-eslint/no-shadow
  class Node extends Node_ {}
  export { Node as default }
}

/**
 * It represents an abstract class that handles common
 * methods for other CSS abstract syntax tree nodes.
 *
 * Any node that represents CSS selector or value should
 * not extend the `Node` class.
 */
declare abstract class Node_ {
  /**
   * It represents parent of the current node.
   *
   * ```js
   * root.nodes[0].parent === root //=> true
   * ```
   */
  parent: Container | Document | undefined

  /**
   * It represents unnecessary whitespace and characters present
   * in the css source code.
   *
   * Information to generate byte-to-byte equal node string as it was
   * in the origin input.
   *
   * The properties of the raws object are decided by parser,
   * the default parser uses the following properties:
   *
   * * `before`: the space symbols before the node. It also stores `*`
   *   and `_` symbols before the declaration (IE hack).
   * * `after`: the space symbols after the last child of the node
   *   to the end of the node.
   * * `between`: the symbols between the property and value
   *   for declarations, selector and `{` for rules, or last parameter
   *   and `{` for at-rules.
   * * `semicolon`: contains true if the last child has
   *   an (optional) semicolon.
   * * `afterName`: the space between the at-rule name and its parameters.
   * * `left`: the space symbols between `/*` and the comment’s text.
   * * `right`: the space symbols between the comment’s text
   *   and <code>*&#47;</code>.
   * - `important`: the content of the important statement,
   *   if it is not just `!important`.
   *
   * PostCSS filters out the comments inside selectors, declaration values
   * and at-rule parameters but it stores the origin content in raws.
   *
   * ```js
   * const root = postcss.parse('a {\n  color:black\n}')
   * root.first.first.raws //=> { before: '\n  ', between: ':' }
   * ```
   */
  raws: any

  /**
   * It represents information related to origin of a node and is required
   * for generating source maps.
   *
   * The nodes that are created manually using the public APIs
   * provided by PostCSS will have `source` undefined and
   * will be absent in the source map.
   *
   * For this reason, the plugin developer should consider
   * duplicating nodes as the duplicate node will have the
   * same source as the original node by default or assign
   * source to a node created manually.
   *
   * ```js
   * decl.source.input.from //=> '/home/ai/source.css'
   * decl.source.start      //=> { line: 10, column: 2 }
   * decl.source.end        //=> { line: 10, column: 12 }
   * ```
   *
   * ```js
   * // Incorrect method, source not specified!
   * const prefixed = postcss.decl({
   *   prop: '-moz-' + decl.prop,
   *   value: decl.value
   * })
   *
   * // Correct method, source is inherited when duplicating.
   * const prefixed = decl.clone({
   *   prop: '-moz-' + decl.prop
   * })
   * ```
   *
   * ```js
   * if (atrule.name === 'add-link') {
   *   const rule = postcss.rule({
   *     selector: 'a',
   *     source: atrule.source
   *   })
   *
   *  atrule.parent.insertBefore(atrule, rule)
   * }
   * ```
   */
  source?: Node.Source

  /**
   * It represents type of a node in
   * an abstract syntax tree.
   *
   * A type of node helps in identification of a node
   * and perform operation based on it's type.
   *
   * ```js
   * const declaration = new Declaration({
   *   prop: 'color',
   *   value: 'black'
   * })
   *
   * declaration.type //=> 'decl'
   * ```
   */
  type: string

  constructor(defaults?: object)

  /**
   * Insert new node after current node to current node’s parent.
   *
   * Just alias for `node.parent.insertAfter(node, add)`.
   *
   * ```js
   * decl.after('color: black')
   * ```
   *
   * @param newNode New node.
   * @return This node for methods chain.
   */
  after(
    newNode: Node | Node.ChildProps | readonly Node[] | string | undefined
  ): this

  /**
   * It assigns properties to an existing node instance.
   *
   * ```js
   * decl.assign({ prop: 'word-wrap', value: 'break-word' })
   * ```
   *
   * @param overrides New properties to override the node.
   *
   * @return `this` for method chaining.
   */
  assign(overrides: object): this

  /**
   * Insert new node before current node to current node’s parent.
   *
   * Just alias for `node.parent.insertBefore(node, add)`.
   *
   * ```js
   * decl.before('content: ""')
   * ```
   *
   * @param newNode New node.
   * @return This node for methods chain.
   */
  before(
    newNode: Node | Node.ChildProps | readonly Node[] | string | undefined
  ): this

  /**
   * Clear the code style properties for the node and its children.
   *
   * ```js
   * node.raws.before  //=> ' '
   * node.cleanRaws()
   * node.raws.before  //=> undefined
   * ```
   *
   * @param keepBetween Keep the `raws.between` symbols.
   */
  cleanRaws(keepBetween?: boolean): void

  /**
   * It creates clone of an existing node, which includes all the properties
   * and their values, that includes `raws` but not `type`.
   *
   * ```js
   * decl.raws.before    //=> "\n  "
   * const cloned = decl.clone({ prop: '-moz-' + decl.prop })
   * cloned.raws.before  //=> "\n  "
   * cloned.toString()   //=> -moz-transform: scale(0)
   * ```
   *
   * @param overrides New properties to override in the clone.
   *
   * @return Duplicate of the node instance.
   */
  clone(overrides?: object): this

  /**
   * Shortcut to clone the node and insert the resulting cloned node
   * after the current node.
   *
   * @param overrides New properties to override in the clone.
   * @return New node.
   */
  cloneAfter(overrides?: object): this

  /**
   * Shortcut to clone the node and insert the resulting cloned node
   * before the current node.
   *
   * ```js
   * decl.cloneBefore({ prop: '-moz-' + decl.prop })
   * ```
   *
   * @param overrides Mew properties to override in the clone.
   *
   * @return New node
   */
  cloneBefore(overrides?: object): this

  /**
   * It creates an instance of the class `CssSyntaxError` and parameters passed
   * to this method are assigned to the error instance.
   *
   * The error instance will have description for the
   * error, original position of the node in the
   * source, showing line and column number.
   *
   * If any previous map is present, it would be used
   * to get original position of the source.
   *
   * The Previous Map here is referred to the source map
   * generated by previous compilation, example: Less,
   * Stylus and Sass.
   *
   * This method returns the error instance instead of
   * throwing it.
   *
   * ```js
   * if (!variables[name]) {
   *   throw decl.error(`Unknown variable ${name}`, { word: name })
   *   // CssSyntaxError: postcss-vars:a.sass:4:3: Unknown variable $black
   *   //   color: $black
   *   // a
   *   //          ^
   *   //   background: white
   * }
   * ```
   *
   * @param message Description for the error instance.
   * @param options Options for the error instance.
   *
   * @return Error instance is returned.
   */
  error(message: string, options?: Node.NodeErrorOptions): CssSyntaxError

  /**
   * Returns the next child of the node’s parent.
   * Returns `undefined` if the current node is the last child.
   *
   * ```js
   * if (comment.text === 'delete next') {
   *   const next = comment.next()
   *   if (next) {
   *     next.remove()
   *   }
   * }
   * ```
   *
   * @return Next node.
   */
  next(): Node.ChildNode | undefined

  /**
   * Get the position for a word or an index inside the node.
   *
   * @param opts Options.
   * @return Position.
   */
  positionBy(opts?: Pick<WarningOptions, 'index' | 'word'>): Node.Position

  /**
   * Convert string index to line/column.
   *
   * @param index The symbol number in the node’s string.
   * @return Symbol position in file.
   */
  positionInside(index: number): Node.Position

  /**
   * Returns the previous child of the node’s parent.
   * Returns `undefined` if the current node is the first child.
   *
   * ```js
   * const annotation = decl.prev()
   * if (annotation.type === 'comment') {
   *   readAnnotation(annotation.text)
   * }
   * ```
   *
   * @return Previous node.
   */
  prev(): Node.ChildNode | undefined

  /**
   * Get the range for a word or start and end index inside the node.
   * The start index is inclusive; the end index is exclusive.
   *
   * @param opts Options.
   * @return Range.
   */
  rangeBy(
    opts?: Pick<WarningOptions, 'end' | 'endIndex' | 'index' | 'start' | 'word'>
  ): Node.Range

  /**
   * Returns a `raws` value. If the node is missing
   * the code style property (because the node was manually built or cloned),
   * PostCSS will try to autodetect the code style property by looking
   * at other nodes in the tree.
   *
   * ```js
   * const root = postcss.parse('a { background: white }')
   * root.nodes[0].append({ prop: 'color', value: 'black' })
   * root.nodes[0].nodes[1].raws.before   //=> undefined
   * root.nodes[0].nodes[1].raw('before') //=> ' '
   * ```
   *
   * @param prop        Name of code style property.
   * @param defaultType Name of default value, it can be missed
   *                    if the value is the same as prop.
   * @return {string} Code style value.
   */
  raw(prop: string, defaultType?: string): string

  /**
   * It removes the node from its parent and deletes its parent property.
   *
   * ```js
   * if (decl.prop.match(/^-webkit-/)) {
   *   decl.remove()
   * }
   * ```
   *
   * @return `this` for method chaining.
   */
  remove(): this

  /**
   * Inserts node(s) before the current node and removes the current node.
   *
   * ```js
   * AtRule: {
   *   mixin: atrule => {
   *     atrule.replaceWith(mixinRules[atrule.params])
   *   }
   * }
   * ```
   *
   * @param nodes Mode(s) to replace current one.
   * @return Current node to methods chain.
   */
  replaceWith(...nodes: NewChild[]): this

  /**
   * Finds the Root instance of the node’s tree.
   *
   * ```js
   * root.nodes[0].nodes[0].root() === root
   * ```
   *
   * @return Root parent.
   */
  root(): Root

  /**
   * Fix circular links on `JSON.stringify()`.
   *
   * @return Cleaned object.
   */
  toJSON(): object

  /**
   * It compiles the node to browser readable cascading style sheets string
   * depending on it's type.
   *
   * ```js
   * new Rule({ selector: 'a' }).toString() //=> "a {}"
   * ```
   *
   * @param stringifier A syntax to use in string generation.
   * @return CSS string of this node.
   */
  toString(stringifier?: Stringifier | Syntax): string

  /**
   * It is a wrapper for {@link Result#warn}, providing convenient
   * way of generating warnings.
   *
   * ```js
   *   Declaration: {
   *     bad: (decl, { result }) => {
   *       decl.warn(result, 'Deprecated property: bad')
   *     }
   *   }
   * ```
   *
   * @param result The `Result` instance that will receive the warning.
   * @param message Description for the warning.
   * @param options Options for the warning.
   *
   * @return `Warning` instance is returned
   */
  warn(result: Result, message: string, options?: WarningOptions): Warning

  /**
   * If this node isn't already dirty, marks it and its ancestors as such. This
   * indicates to the LazyResult processor that the {@link Root} has been
   * modified by the current plugin and may need to be processed again by other
   * plugins.
   */
  protected markDirty(): void
}

declare class Node extends Node_ {}

export = Node


import { C as Colors } from './index-8b61d5bc.js';
export { F as Formatter, g as getDefaultColors } from './index-8b61d5bc.js';

declare function isSupported(): boolean;
declare function createColors(): Colors;
declare const _default: Colors;

export { Colors, createColors, _default as default, isSupported };


import { z as ResolvedConfig, y as UserConfig, v as VitestRunMode, H as VitestOptions, V as Vitest, A as ApiConfig, T as TestProject, J as TestSequencer, K as TestSpecification, L as Logger, M as TestModule, N as ModuleDiagnostic } from './chunks/reporters.d.BFLkQcL6.js';
export { B as BaseCoverageOptions, F as BenchmarkUserOptions, ag as BrowserBuiltinProvider, ah as BrowserCommand, ai as BrowserCommandContext, q as BrowserConfigOptions, aj as BrowserInstanceOption, ak as BrowserModuleMocker, al as BrowserOrchestrator, am as BrowserProvider, an as BrowserProviderInitializationOptions, ao as BrowserProviderModule, ap as BrowserProviderOptions, p as BrowserScript, aq as BrowserServerState, ar as BrowserServerStateSession, r as BuiltinEnvironment, as as CDPSession, u as CSSModuleScopeStrategy, m as CoverageIstanbulOptions, l as CoverageOptions, h as CoverageProvider, i as CoverageProviderModule, j as CoverageReporter, c as CoverageV8Options, n as CustomProviderOptions, D as DepsOptimizationOptions, a0 as HTMLOptions, I as InlineConfig, a2 as JUnitOptions, a1 as JsonOptions, O as OnServerRestartHandler, Q as OnTestsRerunHandler, at as ParentProjectBrowser, P as Pool, t as PoolOptions, Y as ProcessPool, au as ProjectBrowser, E as ProjectConfig, a as ReportContext, aA as ReportedHookContext, o as Reporter, ax as ResolveSnapshotPathHandler, ay as ResolveSnapshotPathHandlerContext, av as ResolvedBrowserOptions, R as ResolvedCoverageOptions, aw as ResolvedProjectConfig, $ as SerializedTestProject, a3 as TaskOptions, a4 as TestCase, a5 as TestCollection, a6 as TestDiagnostic, a7 as TestModuleState, a8 as TestResult, a9 as TestResultFailed, aa as TestResultPassed, ab as TestResultSkipped, aB as TestRunEndReason, az as TestRunResult, af as TestSequencerConstructor, ac as TestState, ad as TestSuite, ae as TestSuiteState, w as TransformModePatterns, x as TypecheckConfig, U as UserWorkspaceConfig, s as VitestEnvironment, X as VitestPackageInstaller, g as WatcherTriggerPattern, Z as WorkspaceSpec, _ as getFilePoolName } from './chunks/reporters.d.BFLkQcL6.js';
import * as vite from 'vite';
import { InlineConfig, UserConfig as UserConfig$1, Plugin, ResolvedConfig as ResolvedConfig$1, LogLevel, LoggerOptions, Logger as Logger$1 } from 'vite';
export { vite as Vite };
export { esbuildVersion, isCSSRequest, isFileServingAllowed, parseAst, parseAstAsync, rollupVersion, version as viteVersion } from 'vite';
import { IncomingMessage } from 'node:http';
import { R as RuntimeRPC } from './chunks/worker.d.1GmBbd7G.js';
export { T as TestExecutionType } from './chunks/worker.d.1GmBbd7G.js';
import { Writable } from 'node:stream';
export { V as VitestPluginContext } from './chunks/vite.d.CMLlLIFP.js';
export { W as WorkerContext } from './chunks/worker.d.CKwWzBSj.js';
export { C as TypeCheckCollectLineNumbers, a as TypeCheckCollectLines, c as TypeCheckContext, T as TypeCheckErrorInfo, R as TypeCheckRawErrorsMap, b as TypeCheckRootAndTarget } from './chunks/global.d.MAmajcmJ.js';
import { Debugger } from 'debug';
export { Task as RunnerTask, TaskResult as RunnerTaskResult, TaskResultPack as RunnerTaskResultPack, Test as RunnerTestCase, File as RunnerTestFile, Suite as RunnerTestSuite, SequenceHooks, SequenceSetupFiles } from '@vitest/runner';
export { f as EnvironmentOptions, H as HappyDOMOptions, J as JSDOMOptions } from './chunks/environment.d.cL3nLXbE.js';
export { SerializedError } from '@vitest/utils';
export { b as RuntimeConfig } from './chunks/config.d.D2ROskhv.js';
export { generateFileHash } from '@vitest/runner/utils';
import 'node:console';
import '@vitest/mocker';
import '@vitest/utils/source-map';
import '@vitest/pretty-format';
import '@vitest/snapshot';
import '@vitest/utils/diff';
import 'vite-node';
import 'chai';
import './chunks/benchmark.d.BwvBVTda.js';
import 'tinybench';
import './chunks/coverage.d.S9RMNXIe.js';
import 'vite-node/client';
import '@vitest/snapshot/manager';
import 'node:fs';
import 'node:worker_threads';
import '@vitest/expect';
import 'vitest/optional-types.js';
import '@vitest/snapshot/environment';

declare function isValidApiRequest(config: ResolvedConfig, req: IncomingMessage): boolean;

interface CliOptions extends UserConfig {
	/**
	* Override the watch mode
	*/
	run?: boolean;
	/**
	* Removes colors from the console output
	*/
	color?: boolean;
	/**
	* Output collected tests as JSON or to a file
	*/
	json?: string | boolean;
	/**
	* Output collected test files only
	*/
	filesOnly?: boolean;
	/**
	* Override vite config's configLoader from cli.
	* Use `bundle` to bundle the config with esbuild or `runner` (experimental) to process it on the fly (default: `bundle`).
	* This is only available with **vite version 6.1.0** and above.
	* @experimental
	*/
	configLoader?: InlineConfig extends {
		configLoader?: infer T
	} ? T : never;
}
/**
* Start Vitest programmatically
*
* Returns a Vitest instance if initialized successfully.
*/
declare function startVitest(mode: VitestRunMode, cliFilters?: string[], options?: CliOptions, viteOverrides?: UserConfig$1, vitestOptions?: VitestOptions): Promise<Vitest>;

interface CliParseOptions {
	allowUnknownOptions?: boolean;
}
declare function parseCLI(argv: string | string[], config?: CliParseOptions): {
	filter: string[]
	options: CliOptions
};

declare function resolveApiServerConfig<Options extends ApiConfig & UserConfig>(options: Options, defaultPort: number): ApiConfig | undefined;

declare function createVitest(mode: VitestRunMode, options: CliOptions, viteOverrides?: UserConfig$1, vitestOptions?: VitestOptions): Promise<Vitest>;

declare class FilesNotFoundError extends Error {
	code: string;
	constructor(mode: "test" | "benchmark");
}
declare class GitNotFoundError extends Error {
	code: string;
	constructor();
}

/** @deprecated use `TestProject` instead */
type GlobalSetupContext = TestProject;

declare function VitestPlugin(options?: UserConfig, vitest?: Vitest): Promise<Plugin[]>;

// this is only exported as a public function and not used inside vitest
declare function resolveConfig(options?: UserConfig, viteOverrides?: UserConfig$1): Promise<{
	vitestConfig: ResolvedConfig
	viteConfig: ResolvedConfig$1
}>;

declare function resolveFsAllow(projectRoot: string, rootConfigFile: string | false | undefined): string[];

interface MethodsOptions {
	cacheFs?: boolean;
	// do not report files
	collect?: boolean;
}
declare function createMethodsRPC(project: TestProject, options?: MethodsOptions): RuntimeRPC;

declare class BaseSequencer implements TestSequencer {
	protected ctx: Vitest;
	constructor(ctx: Vitest);
	// async so it can be extended by other sequelizers
	shard(files: TestSpecification[]): Promise<TestSpecification[]>;
	// async so it can be extended by other sequelizers
	sort(files: TestSpecification[]): Promise<TestSpecification[]>;
}

declare function registerConsoleShortcuts(ctx: Vitest, stdin: NodeJS.ReadStream | undefined, stdout: NodeJS.WriteStream | Writable): () => void;

// This is copy-pasted and needs to be synced from time to time. Ideally, Vite's `createLogger` should accept a custom `console`
// https://github.com/vitejs/vite/blob/main/packages/vite/src/node/logger.ts?rgh-link-date=2024-10-16T23%3A29%3A19Z
// When Vitest supports only Vite 6 and above, we can use Vite's `createLogger({ console })`
// https://github.com/vitejs/vite/pull/18379
declare function createViteLogger(console: Logger, level?: LogLevel, options?: LoggerOptions): Logger$1;

declare const rootDir: string;
declare const distDir: string;

declare function createDebugger(namespace: `vitest:${string}`): Debugger | undefined;

declare const version: string;

/** @deprecated use `createViteServer` instead */
declare const createServer: typeof vite.createServer;
declare const createViteServer: typeof vite.createServer;

/**
* @deprecated Use `TestModule` instead
*/
declare const TestFile: typeof TestModule;

/**
* @deprecated Use `ModuleDiagnostic` instead
*/
type FileDiagnostic = ModuleDiagnostic;

// rolldownVersion is exported only by rolldown-vite
declare const rolldownVersion: string | undefined;

export { ApiConfig, BaseSequencer, GitNotFoundError, ModuleDiagnostic, ResolvedConfig, TestFile, TestModule, TestProject, TestSequencer, TestSpecification, FilesNotFoundError as TestsNotFoundError, UserConfig, Vitest, VitestOptions, VitestPlugin, VitestRunMode, TestProject as WorkspaceProject, createDebugger, createMethodsRPC, createServer, createViteLogger, createViteServer, createVitest, distDir, isValidApiRequest, parseCLI, registerConsoleShortcuts, resolveApiServerConfig, resolveConfig, resolveFsAllow, rolldownVersion, rootDir, startVitest, version };
export type { CliParseOptions, FileDiagnostic, GlobalSetupContext };


export * from './dist/node.js'
