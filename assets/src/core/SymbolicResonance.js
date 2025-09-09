/*
 * Persona: Tough love meets soul care.
 * Module: Symbolic Resonance
 * Intent: Manage symbolic meanings and resonance in interactions.
 * Provenance-ID: 550e8400-e29b-41d4-a716-446655440005
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

export class SymbolicResonance {
    constructor() {
        this.symbolicMappings = new Map();
        this.resonancePatterns = new Map();
        this.symbolHistory = [];
    }

    initializeSymbolicSpace(userId) {
        const symbolicSpace = {
            userId,
            symbols: new Map(),
            resonances: [],
            patterns: [],
            lastUpdated: Date.now()
        };
        this.symbolicMappings.set(userId, symbolicSpace);
        return symbolicSpace;
    }

    addSymbol(userId, symbol, meaning, context = {}) {
        const space = this.symbolicMappings.get(userId);
        if (!space) return null;

        const symbolEntry = {
            symbol,
            meaning,
            context,
            createdAt: Date.now(),
            resonanceCount: 0,
            provenance: 'symbol_creation'
        };

        space.symbols.set(symbol, symbolEntry);
        space.lastUpdated = Date.now();

        this.symbolHistory.push({
            userId,
            action: 'add_symbol',
            symbol,
            timestamp: Date.now()
        });

        return symbolEntry;
    }

    detectResonance(userId, input, symbols) {
        const space = this.symbolicMappings.get(userId);
        if (!space) return null;

        const resonances = [];
        const symbolsToCheck = symbols || Array.from(space.symbols.keys());
        
        for (const symbol of symbolsToCheck) {
            const entry = space.symbols.get(symbol);
            if (entry && (input.includes(symbol) || this.hasSymbolicConnection(input, symbol))) {
                const resonance = {
                    symbol,
                    strength: this.calculateResonanceStrength(input, symbol, entry),
                    context: entry.context,
                    timestamp: Date.now()
                };
                resonances.push(resonance);
                entry.resonanceCount++;
            }
        }

        if (resonances.length > 0) {
            space.resonances.push({
                input,
                resonances,
                timestamp: Date.now()
            });
        }

        return resonances;
    }

    calculateResonanceStrength(input, symbol, entry) {
        // Simple resonance calculation - can be enhanced with NLP
        const inputWords = input.toLowerCase().split(/\s+/);
        const symbolWords = symbol.toLowerCase().split(/\s+/);
        const overlap = inputWords.filter(word => symbolWords.includes(word)).length;
        const baseStrength = overlap / Math.max(inputWords.length, symbolWords.length);
        const contextBonus = entry.context.relevance || 0;
        return Math.min(baseStrength + contextBonus, 1.0);
    }

    hasSymbolicConnection(input, symbol) {
        // Simple implementation - check for partial matches or synonyms
        const inputLower = input.toLowerCase();
        const symbolLower = symbol.toLowerCase();
        return inputLower.includes(symbolLower) || symbolLower.includes(inputLower);
    }

    getSymbolicSpace(userId) {
        return this.symbolicMappings.get(userId) || null;
    }

    analyzeResonancePatterns(userId) {
        const space = this.getSymbolicSpace(userId);
        if (!space || space.resonances.length < 2) return null;

        const patterns = {
            frequentSymbols: this.getFrequentSymbols(space),
            resonanceTrends: this.getResonanceTrends(space),
            symbolicThemes: this.extractSymbolicThemes(space)
        };

        return patterns;
    }

    getFrequentSymbols(space) {
        const symbolCounts = {};
        space.resonances.forEach(resonance => {
            resonance.resonances.forEach(r => {
                symbolCounts[r.symbol] = (symbolCounts[r.symbol] || 0) + 1;
            });
        });
        return Object.entries(symbolCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([symbol, count]) => ({ symbol, count }));
    }

    getResonanceTrends(space) {
        const trends = space.resonances.map(r => ({
            timestamp: r.timestamp,
            strength: r.resonances.reduce((sum, res) => sum + res.strength, 0) / r.resonances.length
        }));
        return trends;
    }

    extractSymbolicThemes(space) {
        // Extract themes based on symbol meanings
        const themes = new Set();
        for (const entry of space.symbols.values()) {
            if (entry.meaning) {
                const words = entry.meaning.toLowerCase().split(/\s+/);
                words.forEach(word => {
                    if (word.length > 3) themes.add(word);
                });
            }
        }
        return Array.from(themes).slice(0, 5);
    }
}
