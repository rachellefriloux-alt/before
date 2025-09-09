/*
Sallie Persona Module: AdvancedMemorySystem
Implements a sophisticated hierarchical memory system with short-term, long-term, and episodic memory.
Follows Sallie architecture, modularity, and privacy rules.
*/

type MemoryType = 'short-term' | 'long-term' | 'episodic' | 'semantic';

interface Memory {
  id: string;
  userId: string;
  content: any;
  timestamp: number;
  type: MemoryType;
  associations: string[];
  importance: number; // 0-10 scale
  lastAccessed?: number;
  accessCount: number;
}

export class AdvancedMemorySystem {
  private memories: Memory[] = [];
  private memoryIndex: Map<string, string[]> = new Map(); // Maps concepts to memory IDs
  
  /**
   * Store a new memory
   */
  storeMemory(userId: string, content: any, type: MemoryType, associations: string[] = [], importance: number = 5): string {
    const id = `mem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const memory: Memory = {
      id,
      userId,
      content,
      timestamp: Date.now(),
      type,
      associations,
      importance,
      accessCount: 0
    };
    
    this.memories.push(memory);
    
    // Update indexes
    associations.forEach(assoc => {
      if (!this.memoryIndex.has(assoc)) {
        this.memoryIndex.set(assoc, []);
      }
      this.memoryIndex.get(assoc)?.push(id);
    });
    
    // Perform memory consolidation for older memories
    if (this.memories.length % 10 === 0) {
      this.consolidateMemories();
    }
    
    return id;
  }
  
  /**
   * Retrieve memories by association
   */
  retrieveByAssociation(userId: string, association: string, limit: number = 5): Memory[] {
    const memoryIds = this.memoryIndex.get(association) || [];
    const relevantMemories = memoryIds
      .map(id => this.memories.find(m => m.id === id && m.userId === userId))
      .filter(Boolean) as Memory[];
    
    // Update access metadata
    relevantMemories.forEach(memory => {
      memory.lastAccessed = Date.now();
      memory.accessCount++;
    });
    
    // Sort by relevance (importance + recency)
    return relevantMemories
      .sort((a, b) => (b.importance + (b.timestamp / 1000000)) - (a.importance + (a.timestamp / 1000000)))
      .slice(0, limit);
  }
  
  /**
   * Retrieve memories by context (semantic search)
   */
  retrieveByContext(userId: string, context: string, limit: number = 5): Memory[] {
    // Extract key terms from context
    const terms = context.toLowerCase().split(/\W+/).filter(term => term.length > 3);
    
    // Find memories with matching associations
    const candidateMemories: Map<string, number> = new Map();
    
    terms.forEach(term => {
      const memoryIds = this.memoryIndex.get(term) || [];
      memoryIds.forEach(id => {
        const score = candidateMemories.get(id) || 0;
        candidateMemories.set(id, score + 1);
      });
    });
    
    // Get memories and sort by match score and importance
    const results = Array.from(candidateMemories.entries())
      .map(([id, matchScore]) => {
        const memory = this.memories.find(m => m.id === id && m.userId === userId);
        return { memory, matchScore };
      })
      .filter(item => item.memory !== undefined)
      .sort((a, b) => {
        // Sort by match score, then importance, then recency
        if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
        if (b.memory!.importance !== a.memory!.importance) return b.memory!.importance - a.memory!.importance;
        return b.memory!.timestamp - a.memory!.timestamp;
      })
      .slice(0, limit)
      .map(item => {
        const memory = item.memory as Memory;
        memory.lastAccessed = Date.now();
        memory.accessCount++;
        return memory;
      });
      
    return results;
  }
  
  /**
   * Get episodic memories in chronological order
   */
  getEpisodicTimeline(userId: string, limit: number = 10): Memory[] {
    return this.memories
      .filter(memory => memory.userId === userId && memory.type === 'episodic')
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }
  
  /**
   * Consolidate memories (merge similar short-term memories into long-term)
   */
  private consolidateMemories(): void {
    const now = Date.now();
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
    
    // Find old short-term memories with similar associations
    const shortTermMemories = this.memories.filter(
      m => m.type === 'short-term' && m.timestamp < oneWeekAgo
    );
    
    // Group by associations (simple implementation)
    const groupedMemories: Record<string, Memory[]> = {};
    
    shortTermMemories.forEach(memory => {
      const key = memory.associations.sort().join(',');
      if (!groupedMemories[key]) {
        groupedMemories[key] = [];
      }
      groupedMemories[key].push(memory);
    });
    
    // Consolidate groups with multiple memories
    Object.values(groupedMemories)
      .filter(group => group.length > 1)
      .forEach(group => {
        // Create consolidated memory
        const userId = group[0].userId;
        const associations = group[0].associations;
        const importance = Math.max(...group.map(m => m.importance));
        
        // Combine content (simplified)
        const content = {
          summary: `Consolidated from ${group.length} memories`,
          sources: group.map(m => m.content)
        };
        
        // Store as long-term memory
        this.storeMemory(userId, content, 'long-term', associations, importance);
        
        // Remove original memories
        const idsToRemove = new Set(group.map(m => m.id));
        this.memories = this.memories.filter(m => !idsToRemove.has(m.id));
        
        // Update indexes
        associations.forEach(assoc => {
          const memoryIds = this.memoryIndex.get(assoc) || [];
          this.memoryIndex.set(assoc, memoryIds.filter(id => !idsToRemove.has(id)));
        });
      });
  }
  
  /**
   * Forget a specific memory
   */
  forgetMemory(memoryId: string): boolean {
    const index = this.memories.findIndex(m => m.id === memoryId);
    if (index === -1) return false;
    
    const memory = this.memories[index];
    
    // Remove from indexes
    memory.associations.forEach(assoc => {
      const memoryIds = this.memoryIndex.get(assoc) || [];
      this.memoryIndex.set(assoc, memoryIds.filter(id => id !== memoryId));
    });
    
    // Remove from memories
    this.memories.splice(index, 1);
    
    return true;
  }
}
