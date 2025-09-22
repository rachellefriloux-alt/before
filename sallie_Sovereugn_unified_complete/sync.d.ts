/** @typedef { import('estree').BaseNode} BaseNode */
/** @typedef { import('./walker.js').WalkerContext} WalkerContext */
/** @typedef {(
 *    this: WalkerContext,
 *    node: BaseNode,
 *    parent: BaseNode,
 *    key: string,
 *    index: number
 * ) => void} SyncHandler */
export class SyncWalker extends WalkerBase {
    /**
     *
     * @param {SyncHandler} enter
     * @param {SyncHandler} leave
     */
    constructor(enter: (this: {
        skip: () => void;
        remove: () => void;
        replace: (node: import("estree").BaseNode) => void;
    }, node: import("estree").BaseNode, parent: import("estree").BaseNode, key: string, index: number) => void, leave: (this: {
        skip: () => void;
        remove: () => void;
        replace: (node: import("estree").BaseNode) => void;
    }, node: import("estree").BaseNode, parent: import("estree").BaseNode, key: string, index: number) => void);
    /** @type {SyncHandler} */
    enter: SyncHandler;
    /** @type {SyncHandler} */
    leave: SyncHandler;
    /**
     *
     * @param {BaseNode} node
     * @param {BaseNode} parent
     * @param {string} [prop]
     * @param {number} [index]
     * @returns {BaseNode}
     */
    visit(node: import("estree").BaseNode, parent: import("estree").BaseNode, prop?: string, index?: number): import("estree").BaseNode;
    should_skip: any;
    should_remove: any;
    replacement: any;
}
export type BaseNode = import("estree").BaseNode;
export type WalkerContext = {
    skip: () => void;
    remove: () => void;
    replace: (node: import("estree").BaseNode) => void;
};
export type SyncHandler = (this: {
    skip: () => void;
    remove: () => void;
    replace: (node: import("estree").BaseNode) => void;
}, node: import("estree").BaseNode, parent: import("estree").BaseNode, key: string, index: number) => void;
import { WalkerBase } from "./walker.js";


/** @typedef { import('estree').BaseNode} BaseNode */
/** @typedef { import('./walker.js').WalkerContext} WalkerContext */
/** @typedef {(
 *    this: WalkerContext,
 *    node: BaseNode,
 *    parent: BaseNode,
 *    key: string,
 *    index: number
 * ) => void} SyncHandler */
export class SyncWalker extends WalkerBase {
    /**
     *
     * @param {SyncHandler} enter
     * @param {SyncHandler} leave
     */
    constructor(enter: (this: {
        skip: () => void;
        remove: () => void;
        replace: (node: import("estree").BaseNode) => void;
    }, node: import("estree").BaseNode, parent: import("estree").BaseNode, key: string, index: number) => void, leave: (this: {
        skip: () => void;
        remove: () => void;
        replace: (node: import("estree").BaseNode) => void;
    }, node: import("estree").BaseNode, parent: import("estree").BaseNode, key: string, index: number) => void);
    /** @type {SyncHandler} */
    enter: SyncHandler;
    /** @type {SyncHandler} */
    leave: SyncHandler;
    /**
     *
     * @param {BaseNode} node
     * @param {BaseNode} parent
     * @param {string} [prop]
     * @param {number} [index]
     * @returns {BaseNode}
     */
    visit(node: import("estree").BaseNode, parent: import("estree").BaseNode, prop?: string, index?: number): import("estree").BaseNode;
    should_skip: any;
    should_remove: any;
    replacement: any;
}
export type BaseNode = import("estree").BaseNode;
export type WalkerContext = {
    skip: () => void;
    remove: () => void;
    replace: (node: import("estree").BaseNode) => void;
};
export type SyncHandler = (this: {
    skip: () => void;
    remove: () => void;
    replace: (node: import("estree").BaseNode) => void;
}, node: import("estree").BaseNode, parent: import("estree").BaseNode, key: string, index: number) => void;
import { WalkerBase } from "./walker.js";


/**
 * @typedef { import('estree').Node} Node
 * @typedef { import('./walker.js').WalkerContext} WalkerContext
 * @typedef {(
 *    this: WalkerContext,
 *    node: Node,
 *    parent: Node | null,
 *    key: string | number | symbol | null | undefined,
 *    index: number | null | undefined
 * ) => void} SyncHandler
 */
export class SyncWalker extends WalkerBase {
    /**
     *
     * @param {SyncHandler} [enter]
     * @param {SyncHandler} [leave]
     */
    constructor(enter?: SyncHandler | undefined, leave?: SyncHandler | undefined);
    /** @type {SyncHandler | undefined} */
    enter: SyncHandler | undefined;
    /** @type {SyncHandler | undefined} */
    leave: SyncHandler | undefined;
    /**
     * @template {Node} Parent
     * @param {Node} node
     * @param {Parent | null} parent
     * @param {keyof Parent} [prop]
     * @param {number | null} [index]
     * @returns {Node | null}
     */
    visit<Parent extends import("estree").Node>(node: Node, parent: Parent | null, prop?: keyof Parent | undefined, index?: number | null | undefined): Node | null;
}
export type Node = import('estree').Node;
export type WalkerContext = import('./walker.js').WalkerContext;
export type SyncHandler = (this: WalkerContext, node: Node, parent: Node | null, key: string | number | symbol | null | undefined, index: number | null | undefined) => void;
import { WalkerBase } from "./walker.js";


/** @typedef { import('estree').BaseNode} BaseNode */
/** @typedef { import('./walker.js').WalkerContext} WalkerContext */
/** @typedef {(
 *    this: WalkerContext,
 *    node: BaseNode,
 *    parent: BaseNode,
 *    key: string,
 *    index: number
 * ) => void} SyncHandler */
export class SyncWalker extends WalkerBase {
    /**
     *
     * @param {SyncHandler} enter
     * @param {SyncHandler} leave
     */
    constructor(enter: (this: {
        skip: () => void;
        remove: () => void;
        replace: (node: import("estree").BaseNode) => void;
    }, node: import("estree").BaseNode, parent: import("estree").BaseNode, key: string, index: number) => void, leave: (this: {
        skip: () => void;
        remove: () => void;
        replace: (node: import("estree").BaseNode) => void;
    }, node: import("estree").BaseNode, parent: import("estree").BaseNode, key: string, index: number) => void);
    /** @type {SyncHandler} */
    enter: SyncHandler;
    /** @type {SyncHandler} */
    leave: SyncHandler;
    /**
     *
     * @param {BaseNode} node
     * @param {BaseNode} parent
     * @param {string} [prop]
     * @param {number} [index]
     * @returns {BaseNode}
     */
    visit(node: import("estree").BaseNode, parent: import("estree").BaseNode, prop?: string, index?: number): import("estree").BaseNode;
    should_skip: any;
    should_remove: any;
    replacement: any;
}
export type BaseNode = import("estree").BaseNode;
export type WalkerContext = {
    skip: () => void;
    remove: () => void;
    replace: (node: import("estree").BaseNode) => void;
};
export type SyncHandler = (this: {
    skip: () => void;
    remove: () => void;
    replace: (node: import("estree").BaseNode) => void;
}, node: import("estree").BaseNode, parent: import("estree").BaseNode, key: string, index: number) => void;
import { WalkerBase } from "./walker.js";


/** @typedef { import('estree').BaseNode} BaseNode */
/** @typedef { import('./walker.js').WalkerContext} WalkerContext */
/** @typedef {(
 *    this: WalkerContext,
 *    node: BaseNode,
 *    parent: BaseNode,
 *    key: string,
 *    index: number
 * ) => void} SyncHandler */
export class SyncWalker extends WalkerBase {
    /**
     *
     * @param {SyncHandler} enter
     * @param {SyncHandler} leave
     */
    constructor(enter: (this: {
        skip: () => void;
        remove: () => void;
        replace: (node: import("estree").BaseNode) => void;
    }, node: import("estree").BaseNode, parent: import("estree").BaseNode, key: string, index: number) => void, leave: (this: {
        skip: () => void;
        remove: () => void;
        replace: (node: import("estree").BaseNode) => void;
    }, node: import("estree").BaseNode, parent: import("estree").BaseNode, key: string, index: number) => void);
    /** @type {SyncHandler} */
    enter: SyncHandler;
    /** @type {SyncHandler} */
    leave: SyncHandler;
    /**
     *
     * @param {BaseNode} node
     * @param {BaseNode} parent
     * @param {string} [prop]
     * @param {number} [index]
     * @returns {BaseNode}
     */
    visit(node: import("estree").BaseNode, parent: import("estree").BaseNode, prop?: string, index?: number): import("estree").BaseNode;
    should_skip: any;
    should_remove: any;
    replacement: any;
}
export type BaseNode = import("estree").BaseNode;
export type WalkerContext = {
    skip: () => void;
    remove: () => void;
    replace: (node: import("estree").BaseNode) => void;
};
export type SyncHandler = (this: {
    skip: () => void;
    remove: () => void;
    replace: (node: import("estree").BaseNode) => void;
}, node: import("estree").BaseNode, parent: import("estree").BaseNode, key: string, index: number) => void;
import { WalkerBase } from "./walker.js";


/**
 * @typedef { import('estree').Node} Node
 * @typedef { import('./walker.js').WalkerContext} WalkerContext
 * @typedef {(
 *    this: WalkerContext,
 *    node: Node,
 *    parent: Node | null,
 *    key: string | number | symbol | null | undefined,
 *    index: number | null | undefined
 * ) => void} SyncHandler
 */
export class SyncWalker extends WalkerBase {
    /**
     *
     * @param {SyncHandler} [enter]
     * @param {SyncHandler} [leave]
     */
    constructor(enter?: SyncHandler | undefined, leave?: SyncHandler | undefined);
    /** @type {SyncHandler | undefined} */
    enter: SyncHandler | undefined;
    /** @type {SyncHandler | undefined} */
    leave: SyncHandler | undefined;
    /**
     * @template {Node} Parent
     * @param {Node} node
     * @param {Parent | null} parent
     * @param {keyof Parent} [prop]
     * @param {number | null} [index]
     * @returns {Node | null}
     */
    visit<Parent extends import("estree").Node>(node: Node, parent: Parent | null, prop?: keyof Parent | undefined, index?: number | null | undefined): Node | null;
}
export type Node = import('estree').Node;
export type WalkerContext = import('./walker.js').WalkerContext;
export type SyncHandler = (this: WalkerContext, node: Node, parent: Node | null, key: string | number | symbol | null | undefined, index: number | null | undefined) => void;
import { WalkerBase } from "./walker.js";
