/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: MergeOracle for intent-aware code merging, conflict explanation, and provenance linking.
 * Got it, love.
 */

import { parse } from '@babel/parser';
import traverse, { NodePath } from '@babel/traverse';
import generate from '@babel/generator';
import { diffLines, Change } from 'diff';

/**
 * Describes a single merge action.
 */
export interface MergeAction {
  type: 'add' | 'remove' | 'modify';
  nodeType: string;
  location: string;
  description: string;
  conflict?: boolean;
}

/**
 * A merge plan containing actions, conflict explanations, and provenance metadata.
 */
export interface MergePlan {
  actions: MergeAction[];
  explanation: string;
  provenance: {
    baseVersion?: string;
    incomingVersion?: string;
  };
}

/**
 * MergeOracle performs AST-based code merging with conflict detection and provenance.
 */
export class MergeOracle {
  /**
   * Plan a merge between base and incoming code.
   * @param baseCode Original code string.
   * @param incomingCode New code string to merge into base.
   * @param baseVersion Optional identifier for base revision.
   * @param incomingVersion Optional identifier for incoming revision.
   */
  public static planMerge(
    baseCode: string,
    incomingCode: string,
    baseVersion?: string,
    incomingVersion?: string
  ): MergePlan {
    // Parse both code strings to ASTs
    const baseAst = parse(baseCode, { sourceType: 'module', plugins: ['typescript', 'jsx'] });
    const incomingAst = parse(incomingCode, { sourceType: 'module', plugins: ['typescript', 'jsx'] });

    // Collect node signatures for both ASTs
    const baseNodes = this.extractNodeSignatures(baseAst);
    const incomingNodes = this.extractNodeSignatures(incomingAst);

    const actions: MergeAction[] = [];

    // Compare node maps to detect additions, removals, modifications
    Object.keys(incomingNodes).forEach(signature => {
      if (!baseNodes[signature]) {
        // Added node
        actions.push({
          type: 'add',
          nodeType: incomingNodes[signature].type,
          location: incomingNodes[signature].location,
          description: `Add ${incomingNodes[signature].type} at ${incomingNodes[signature].location}`
        });
      } else if (baseNodes[signature].body !== incomingNodes[signature].body) {
        // Modified node
        actions.push({
          type: 'modify',
          nodeType: incomingNodes[signature].type,
          location: incomingNodes[signature].location,
          description: `Modify ${incomingNodes[signature].type} at ${incomingNodes[signature].location}`
        });
      }
    });

    Object.keys(baseNodes).forEach(signature => {
      if (!incomingNodes[signature]) {
        // Removed node
        actions.push({
          type: 'remove',
          nodeType: baseNodes[signature].type,
          location: baseNodes[signature].location,
          description: `Remove ${baseNodes[signature].type} at ${baseNodes[signature].location}`
        });
      }
    });

    // Detect line-based conflicts
    const lineChanges: Change[] = diffLines(baseCode, incomingCode);
    let explanation = '';
    let pointer = 0;
    lineChanges.forEach(change => {
      if (change.added && change.removed) {
        // conflict
        const conflictDesc = `Conflict at lines ~${pointer}-${pointer + change.count}: ${change.value.trim()}`;
        explanation += conflictDesc + '\n';
        // mark relevant actions
        actions.forEach(act => {
          if (act.location.includes(`${pointer}`)) {
            act.conflict = true;
          }
        });
      }
      if (!change.removed) {
        pointer += change.count || 0;
      }
    });

    if (!explanation) {
      explanation = 'No conflicts detected';
    }

    // Build provenance metadata
    const provenance = { baseVersion, incomingVersion };

    return { actions, explanation, provenance };
  }

  /**
   * Extract simple signatures (type, body, and location) for top-level AST nodes.
   */
  private static extractNodeSignatures(ast: any): Record<string, { type: string; body: string; location: string }> {
    const signatures: Record<string, { type: string; body: string; location: string }> = {};
    traverse(ast, {
      enter(path: NodePath) {
        if (path.node.type && path.node.loc && (path.isFunctionDeclaration() || path.isClassDeclaration() || path.isVariableDeclaration())) {
          const { type } = path.node;
          const loc = `${path.node.loc.start.line}:${path.node.loc.start.column}`;
          const codeSnippet = generate(path.node).code;
          const key = `${type}@${loc}`;
          signatures[key] = { type, body: codeSnippet, location: loc };
        }
      }
    });
    return signatures;
  }
}
