/*
 * Persona: Tough love meets soul care.
 * Module: Core Tests
 * Intent: Test core system functionality.
 * Provenance-ID: 550e8400-e29b-41d4-a716-446655440007
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

const { describe, it, expect } = require('@jest/globals');
const { ContextEngine } = require('../core/ContextEngine.js');
const { EmotionalArc } = require('../core/EmotionalArc.js');
const { SymbolicResonance } = require('../core/SymbolicResonance.js');

describe('ContextEngine', () => {
  it('should initialize user context', () => {
    const engine = new ContextEngine();
    const context = engine.initializeUserContext('user1');
    
    expect(context).toHaveProperty('userId', 'user1');
    expect(context).toHaveProperty('sessionStart');
    expect(context).toHaveProperty('emotionalState', 'neutral');
  });

  it('should update context', () => {
    const engine = new ContextEngine();
    engine.initializeUserContext('user1');
    
    const updated = engine.updateContext('user1', { emotionalState: 'happy' });
    expect(updated.emotionalState).toBe('happy');
  });
});

describe('EmotionalArc', () => {
  it('should initialize emotional arc', () => {
    const arc = new EmotionalArc();
    const emotionalArc = arc.initializeEmotionalArc('user1');
    
    expect(emotionalArc).toHaveProperty('userId', 'user1');
    expect(emotionalArc).toHaveProperty('emotionalJourney');
  });

  it('should update emotional state', () => {
    const arc = new EmotionalArc();
    arc.initializeEmotionalArc('user1');
    
    const updated = arc.updateEmotionalState('user1', 'excited', 0.8);
    expect(updated.currentEmotion).toBe('excited');
    expect(updated.emotionalJourney).toHaveLength(1);
  });
});

describe('SymbolicResonance', () => {
  it('should initialize symbolic space', () => {
    const resonance = new SymbolicResonance();
    const space = resonance.initializeSymbolicSpace('user1');
    
    expect(space).toHaveProperty('userId', 'user1');
    expect(space).toHaveProperty('symbols');
  });

  it('should add symbol', () => {
    const resonance = new SymbolicResonance();
    resonance.initializeSymbolicSpace('user1');
    
    const symbol = resonance.addSymbol('user1', 'hope', 'A feeling of expectation and desire');
    expect(symbol.symbol).toBe('hope');
    expect(symbol.meaning).toBe('A feeling of expectation and desire');
  });
});
