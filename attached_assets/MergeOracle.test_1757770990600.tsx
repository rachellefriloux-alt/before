import { MergeOracle, MergePlan, MergeAction } from '../core/merge/MergeOracle';

describe('MergeOracle', () => {
  it('should detect no changes for identical code', () => {
    const code = `function hello() { return 1; }`;
    const plan: MergePlan = MergeOracle.planMerge(code, code, 'v1', 'v2');
    expect(plan.actions).toHaveLength(0);
    expect(plan.explanation).toBe('No conflicts detected');
    expect(plan.provenance).toEqual({ baseVersion: 'v1', incomingVersion: 'v2' });
  });

  it('should detect added function', () => {
    const base = `function a() {}`;
    const incoming = `function a() {}\nfunction b() {}`;
    const plan = MergeOracle.planMerge(base, incoming);
    const addActions = plan.actions.filter(a => a.type === 'add');
    expect(addActions.length).toBe(1);
    expect(addActions[0].nodeType).toBe('FunctionDeclaration');
    expect(addActions[0].description).toMatch(/Add FunctionDeclaration/);
    expect(plan.explanation).toBe('No conflicts detected');
  });

  it('should detect removed variable', () => {
    const base = `const x = 5;`;
    const incoming = ``;
    const plan = MergeOracle.planMerge(base, incoming);
    const remActions = plan.actions.filter(a => a.type === 'remove');
    expect(remActions.length).toBe(1);
    expect(remActions[0].nodeType).toBe('VariableDeclaration');
    expect(remActions[0].description).toMatch(/Remove VariableDeclaration/);
  });

  it('should detect modified class', () => {
    const base = `class C { m() { return 1; } }`;
    const incoming = `class C { m() { return 2; } }`;
    const plan = MergeOracle.planMerge(base, incoming);
    const mod = plan.actions.find(a => a.type === 'modify');
    expect(mod).toBeDefined();
    expect(mod!.nodeType).toBe('ClassDeclaration');
    expect(plan.explanation).toBe('No conflicts detected');
  });

  it('should detect simple line conflict', () => {
    const base = `let x = 1;`;
    const incoming = `let x = 2;`;
    const plan = MergeOracle.planMerge(base, incoming);
    expect(plan.actions.some(a => a.conflict)).toBe(true);
    expect(plan.explanation).toMatch(/Conflict at lines/);
  });
});