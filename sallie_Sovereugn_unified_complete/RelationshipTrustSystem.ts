/*
Salle Persona Module: RelationshipTrustSystem
Implements relationship building, trust modeling, and rapport development capabilities.
Follows Salle architecture, modularity, and privacy rules.
*/

interface RelationshipMetrics {
  trustScore: number; // 0-100
  familiarity: number; // 0-100
  rapport: number; // 0-100
  interactions: number;
  lastInteraction: number;
  preferences: Record<string, any>;
  communicationStyle: string;
  trustHistory: { timestamp: number, event: string, impact: number }[];
}

export class RelationshipTrustSystem {
  private relationships: Map<string, RelationshipMetrics> = new Map();
  
  /**
   * Get or create relationship metrics for a user
   */
  private getRelationship(userId: string): RelationshipMetrics {
    if (!this.relationships.has(userId)) {
      this.relationships.set(userId, {
        trustScore: 50, // Start with neutral trust
        familiarity: 0,
        rapport: 0,
        interactions: 0,
        lastInteraction: Date.now(),
        preferences: {},
        communicationStyle: 'neutral',
        trustHistory: []
      });
    }
    
    return this.relationships.get(userId)!;
  }
  
  /**
   * Record a positive interaction that builds trust
   */
  recordPositiveInteraction(userId: string, event: string, impact: number = 1): void {
    const relationship = this.getRelationship(userId);
    
    // Update metrics
    relationship.interactions++;
    relationship.lastInteraction = Date.now();
    relationship.familiarity = Math.min(100, relationship.familiarity + 0.5);
    
    // Increase trust (with diminishing returns as trust gets higher)
    const trustGain = impact * (1 - (relationship.trustScore / 150));
    relationship.trustScore = Math.min(100, relationship.trustScore + trustGain);
    
    // Increase rapport
    relationship.rapport = Math.min(100, relationship.rapport + (impact * 0.7));
    
    // Log the event
    relationship.trustHistory.push({
      timestamp: Date.now(),
      event,
      impact: trustGain
    });
  }
  
  /**
   * Record a negative interaction that reduces trust
   */
  recordNegativeInteraction(userId: string, event: string, impact: number = 1): void {
    const relationship = this.getRelationship(userId);
    
    // Update metrics
    relationship.interactions++;
    relationship.lastInteraction = Date.now();
    
    // Reduce trust (more impactful at high trust levels)
    const trustLoss = impact * (1 + (relationship.trustScore / 200));
    relationship.trustScore = Math.max(0, relationship.trustScore - trustLoss);
    
    // Reduce rapport
    relationship.rapport = Math.max(0, relationship.rapport - (impact * 1.2));
    
    // Log the event
    relationship.trustHistory.push({
      timestamp: Date.now(),
      event,
      impact: -trustLoss
    });
  }
  
  /**
   * Update a user preference
   */
  updatePreference(userId: string, key: string, value: any): void {
    const relationship = this.getRelationship(userId);
    relationship.preferences[key] = value;
    
    // Small familiarity boost
    relationship.familiarity = Math.min(100, relationship.familiarity + 0.2);
  }
  
  /**
   * Set preferred communication style
   */
  setPreferredCommunicationStyle(userId: string, style: string): void {
    const relationship = this.getRelationship(userId);
    relationship.communicationStyle = style;
  }
  
  /**
   * Get relationship status
   */
  getRelationshipStatus(userId: string): RelationshipMetrics {
    return this.getRelationship(userId);
  }
  
  /**
   * Get appropriate communication style based on relationship
   */
  getAppropriateStyle(userId: string): string {
    const relationship = this.getRelationship(userId);
    
    if (relationship.communicationStyle !== 'neutral') {
      return relationship.communicationStyle; // User has explicit preference
    }
    
    // Base style on relationship metrics
    if (relationship.familiarity > 80) return 'casual';
    if (relationship.familiarity > 50) return 'friendly';
    if (relationship.familiarity < 20) return 'formal';
    return 'neutral';
  }
  
  /**
   * Get trust-appropriate response modifications
   */
  getTrustModifiers(userId: string): Record<string, boolean> {
    const relationship = this.getRelationship(userId);
    
    return {
      canSharePersonalInsights: relationship.trustScore > 70,
      canUseHumor: relationship.rapport > 40,
      shouldBeFormal: relationship.familiarity < 30,
      canAskPersonalQuestions: relationship.trustScore > 80,
      shouldOfferHelp: relationship.rapport > 30
    };
  }
  
  /**
   * Calculate trust decay for inactive relationships
   */
  processTrustDecay(): void {
    const now = Date.now();
    
    this.relationships.forEach((metrics, userId) => {
      const daysSinceLastInteraction = (now - metrics.lastInteraction) / (1000 * 60 * 60 * 24);
      
      if (daysSinceLastInteraction > 7) {
        // Decay trust and rapport slowly over time
        const decay = Math.min(5, daysSinceLastInteraction * 0.1);
        
        metrics.trustScore = Math.max(25, metrics.trustScore - decay);
        metrics.rapport = Math.max(10, metrics.rapport - decay);
        
        // Log decay event if significant
        if (decay > 1) {
          metrics.trustHistory.push({
            timestamp: now,
            event: 'Inactivity decay',
            impact: -decay
          });
        }
      }
    });
  }
}
