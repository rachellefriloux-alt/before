/*
Test suite for CognitiveModule
Covers: persistent memory, learning, adaptation, problem-solving, and creative reasoning
*/
import { CognitiveModule } from './CognitiveModule';

describe('CognitiveModule', () => {
  let module: CognitiveModule;
  const userId = 'user123';

  beforeEach(() => {
    module = new CognitiveModule();
  });

  it('should log and recall past interactions', () => {
    module.logInteraction(userId, 'Hello', 'Hi there!');
    module.logInteraction(userId, 'How are you?', 'I am well!');
    const interactions = module.recallPastInteractions(userId);
    expect(interactions.length).toBe(2);
    expect(interactions[0].message).toBe('Hello');
    expect(interactions[1].response).toBe('I am well!');
  });

  it('should learn and recall knowledge', () => {
    module.learn(userId, 'favoriteColor', 'blue');
    expect(module.recallKnowledge(userId, 'favoriteColor')).toBe('blue');
  });

  it('should solve problems using context', () => {
    module.learn(userId, 'mathSkill', 'advanced');
    const solution = module.solveProblem('Solve 2+2', { userId });
    expect(solution).toContain('Based on your history');
  });

  it('should generate creative solutions', () => {
    const idea = module.generateCreativeSolution('new project');
    expect(typeof idea).toBe('string');
    expect(idea.length).toBeGreaterThan(0);
  });

  it('should adapt response based on feedback', () => {
    expect(module.adaptResponse(userId, 'That was helpful')).toContain('Glad I could help');
    expect(module.adaptResponse(userId, 'That was confusing')).toContain('Sorry for the confusion');
    expect(module.adaptResponse(userId, 'Thanks')).toContain('Thanks for your feedback');
  });
});
