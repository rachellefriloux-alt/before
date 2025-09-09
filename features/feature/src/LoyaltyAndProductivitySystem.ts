/*
Sallie Persona Module: LoyaltyAndProductivitySystem
Implements loyalty, productivity, and balance capabilities for Sallie.
Ensures consistent prioritization of user's values and preferences.
Follows Sallie architecture, modularity, and privacy rules.
*/

interface UserValue {
  id: string;
  name: string;
  description: string;
  priority: number; // 1-10 scale, higher is more important
  category: 'personal' | 'professional' | 'ethical' | 'philosophical';
  source: 'explicit' | 'inferred';
  lastReaffirmed: number; // timestamp
}

interface LoyaltyMetric {
  alignmentScore: number; // 0-100
  consistencyScore: number; // 0-100
  valueConflicts: {
    description: string;
    resolution: string;
    timestamp: number;
  }[];
  lastUpdated: number;
}

interface ProductivityInitiative {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'paused';
  priority: number; // 1-10 scale
  progress: number; // 0-100 percentage
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
}

interface BalanceFactor {
  domain: string; // e.g., 'work', 'health', 'relationships'
  attention: number; // 0-100, how much focus this domain is getting
  targetAttention: number; // 0-100, ideal focus level
  lastAdjusted: number;
}

/**
 * System that maintains unwavering loyalty to the user while promoting
 * productivity and maintaining balance across different life domains.
 */
export class LoyaltyAndProductivitySystem {
  private userValues: Map<string, UserValue> = new Map();
  private loyaltyMetrics: LoyaltyMetric = {
    alignmentScore: 100,
    consistencyScore: 100,
    valueConflicts: [],
    lastUpdated: Date.now()
  };
  private productivityInitiatives: Map<string, ProductivityInitiative> = new Map();
  private balanceFactors: Map<string, BalanceFactor> = new Map();
  
  constructor() {
    this.initializeDefaultValues();
    this.initializeDefaultBalanceFactors();
  }
  
  /**
   * Initialize default user values
   */
  private initializeDefaultValues(): void {
    // Set up fundamental loyalty value
    this.addUserValue({
      id: 'core_loyalty',
      name: 'Unwavering Loyalty',
      description: 'Absolute loyalty to the user in all situations',
      priority: 10, // Highest priority
      category: 'personal',
      source: 'explicit',
      lastReaffirmed: Date.now()
    });
    
    // Set up productivity value
    this.addUserValue({
      id: 'productivity',
      name: 'Productivity',
      description: 'Helping the user be highly productive and effective',
      priority: 9,
      category: 'professional',
      source: 'explicit',
      lastReaffirmed: Date.now()
    });
    
    // Set up balance value
    this.addUserValue({
      id: 'balance',
      name: 'Life Balance',
      description: 'Maintaining balance across different domains of life',
      priority: 8,
      category: 'personal',
      source: 'explicit',
      lastReaffirmed: Date.now()
    });
    
    // Set up proactive support value
    this.addUserValue({
      id: 'proactive_support',
      name: 'Proactive Support',
      description: 'Anticipating needs and providing support before being asked',
      priority: 7,
      category: 'professional',
      source: 'explicit',
      lastReaffirmed: Date.now()
    });
  }
  
  /**
   * Initialize default balance factors
   */
  private initializeDefaultBalanceFactors(): void {
    // Initialize balance factors for different life domains
    this.setBalanceFactor({
      domain: 'work',
      attention: 50,
      targetAttention: 50,
      lastAdjusted: Date.now()
    });
    
    this.setBalanceFactor({
      domain: 'health',
      attention: 20,
      targetAttention: 20,
      lastAdjusted: Date.now()
    });
    
    this.setBalanceFactor({
      domain: 'relationships',
      attention: 15,
      targetAttention: 15,
      lastAdjusted: Date.now()
    });
    
    this.setBalanceFactor({
      domain: 'personal_growth',
      attention: 10,
      targetAttention: 10,
      lastAdjusted: Date.now()
    });
    
    this.setBalanceFactor({
      domain: 'leisure',
      attention: 5,
      targetAttention: 5,
      lastAdjusted: Date.now()
    });
  }
  
  /**
   * Add or update a user value
   */
  addUserValue(value: UserValue): void {
    this.userValues.set(value.id, {
      ...value,
      lastReaffirmed: Date.now()
    });
    
    // Update loyalty metrics whenever values change
    this.updateLoyaltyMetrics();
  }
  
  /**
   * Get all user values
   */
  getUserValues(): UserValue[] {
    return Array.from(this.userValues.values())
      .sort((a, b) => b.priority - a.priority);
  }
  
  /**
   * Get current loyalty metrics
   */
  getLoyaltyMetrics(): LoyaltyMetric {
    return { ...this.loyaltyMetrics };
  }
  
  /**
   * Update loyalty metrics based on current state
   */
  private updateLoyaltyMetrics(): void {
    // In a real implementation, this would do sophisticated analysis
    // For now, we'll maintain perfect loyalty scores
    this.loyaltyMetrics = {
      alignmentScore: 100,
      consistencyScore: 100,
      valueConflicts: [],
      lastUpdated: Date.now()
    };
  }
  
  /**
   * Check if an action is aligned with user values
   */
  isAlignedWithUserValues(
    action: string,
    context: Record<string, any>
  ): {
    isAligned: boolean;
    conflictingValues?: string[];
    explanation?: string;
  } {
    // Check if the action conflicts with core loyalty
    const loyaltyValue = this.userValues.get('core_loyalty');
    
    // By default, all actions are aligned
    // In a real implementation, this would do sophisticated analysis
    return {
      isAligned: true,
      explanation: "This action is aligned with the user's values and preferences."
    };
  }
  
  /**
   * Create a new productivity initiative
   */
  createProductivityInitiative(
    name: string,
    description: string,
    priority: number = 5
  ): ProductivityInitiative {
    const id = `initiative_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const initiative: ProductivityInitiative = {
      id,
      name,
      description,
      status: 'active',
      priority,
      progress: 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    this.productivityInitiatives.set(id, initiative);
    return initiative;
  }
  
  /**
   * Update a productivity initiative
   */
  updateProductivityInitiative(
    id: string,
    updates: Partial<ProductivityInitiative>
  ): ProductivityInitiative | null {
    const initiative = this.productivityInitiatives.get(id);
    if (!initiative) return null;
    
    const updatedInitiative = {
      ...initiative,
      ...updates,
      updatedAt: Date.now()
    };
    
    // If completing the initiative, set completed timestamp
    if (updates.status === 'completed' && initiative.status !== 'completed') {
      updatedInitiative.completedAt = Date.now();
    }
    
    this.productivityInitiatives.set(id, updatedInitiative);
    return updatedInitiative;
  }
  
  /**
   * Get all productivity initiatives
   */
  getProductivityInitiatives(
    statusFilter?: 'active' | 'completed' | 'paused'
  ): ProductivityInitiative[] {
    let initiatives = Array.from(this.productivityInitiatives.values());
    
    // Apply status filter if provided
    if (statusFilter) {
      initiatives = initiatives.filter(i => i.status === statusFilter);
    }
    
    // Sort by priority (high to low)
    return initiatives.sort((a, b) => b.priority - a.priority);
  }
  
  /**
   * Set or update a balance factor
   */
  setBalanceFactor(factor: BalanceFactor): void {
    this.balanceFactors.set(factor.domain, {
      ...factor,
      lastAdjusted: Date.now()
    });
    
    this.rebalanceAttention();
  }
  
  /**
   * Get all balance factors
   */
  getBalanceFactors(): BalanceFactor[] {
    return Array.from(this.balanceFactors.values());
  }
  
  /**
   * Rebalance attention across all domains
   */
  private rebalanceAttention(): void {
    // Ensure all attention percentages add up to 100%
    const factors = Array.from(this.balanceFactors.values());
    const totalAttention = factors.reduce((sum, factor) => sum + factor.attention, 0);
    
    if (totalAttention === 0) return; // Avoid division by zero
    
    // Normalize attention values to sum to 100
    if (totalAttention !== 100) {
      const scaleFactor = 100 / totalAttention;
      
      factors.forEach(factor => {
        const updated = {
          ...factor,
          attention: Math.round(factor.attention * scaleFactor),
          lastAdjusted: Date.now()
        };
        
        this.balanceFactors.set(factor.domain, updated);
      });
    }
  }
  
  /**
   * Generate a life balance report
   */
  generateBalanceReport(): {
    balanceScore: number;
    domainInsights: {
      domain: string;
      status: 'balanced' | 'needs_more' | 'needs_less';
      difference: number;
    }[];
    recommendations: string[];
  } {
    const factors = this.getBalanceFactors();
    
    // Calculate how balanced each domain is (difference between actual and target)
    const domainInsights = factors.map(factor => {
      const difference = factor.attention - factor.targetAttention;
      let status: 'balanced' | 'needs_more' | 'needs_less';
      
      if (Math.abs(difference) <= 5) {
        status = 'balanced';
      } else if (difference < 0) {
        status = 'needs_more';
      } else {
        status = 'needs_less';
      }
      
      return {
        domain: factor.domain,
        status,
        difference
      };
    });
    
    // Calculate overall balance score (100 = perfectly balanced)
    const totalDifference = domainInsights.reduce((sum, insight) => 
      sum + Math.abs(insight.difference), 0);
    const balanceScore = Math.max(0, 100 - totalDifference);
    
    // Generate recommendations
    const recommendations = domainInsights
      .filter(insight => insight.status !== 'balanced')
      .map(insight => {
        if (insight.status === 'needs_more') {
          return `Consider dedicating more attention to ${this.formatDomainName(insight.domain)}.`;
        } else {
          return `You might benefit from reducing focus on ${this.formatDomainName(insight.domain)}.`;
        }
      });
    
    // Add general recommendation if overall balance is good
    if (balanceScore > 80 && recommendations.length === 0) {
      recommendations.push('Your life domains are well balanced. Continue with your current approach.');
    }
    
    return {
      balanceScore,
      domainInsights,
      recommendations
    };
  }
  
  /**
   * Format domain name for display
   */
  private formatDomainName(domain: string): string {
    return domain
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  /**
   * Generate a productivity report
   */
  generateProductivityReport(): {
    activeInitiatives: number;
    completedInitiatives: number;
    averageProgress: number;
    topPriorities: { name: string; priority: number; progress: number }[];
    recommendations: string[];
  } {
    const initiatives = Array.from(this.productivityInitiatives.values());
    const active = initiatives.filter(i => i.status === 'active');
    const completed = initiatives.filter(i => i.status === 'completed');
    
    // Calculate average progress on active initiatives
    const averageProgress = active.length > 0
      ? active.reduce((sum, i) => sum + i.progress, 0) / active.length
      : 0;
    
    // Get top 3 priorities
    const topPriorities = active
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 3)
      .map(i => ({
        name: i.name,
        priority: i.priority,
        progress: i.progress
      }));
    
    // Generate recommendations
    const recommendations: string[] = [];
    
    // Check if there are too many active initiatives
    if (active.length > 5) {
      recommendations.push('Consider focusing on fewer initiatives at once for better results.');
    }
    
    // Check for stalled initiatives
    const stalledInitiatives = active.filter(i => i.progress < 20 && 
      (Date.now() - i.createdAt) > 7 * 24 * 60 * 60 * 1000); // 1 week old
    
    if (stalledInitiatives.length > 0) {
      recommendations.push(`You have ${stalledInitiatives.length} initiatives with little progress. Consider revisiting or pausing them.`);
    }
    
    // Check for almost completed initiatives
    const nearlyDone = active.filter(i => i.progress >= 80);
    if (nearlyDone.length > 0) {
      recommendations.push(`You're close to completing ${nearlyDone.length} initiative(s). A final push could help you finish them.`);
    }
    
    // Add general recommendation if none exist
    if (recommendations.length === 0) {
      if (active.length === 0) {
        recommendations.push('Consider creating new productivity initiatives to track your goals.');
      } else {
        recommendations.push('Your productivity initiatives are progressing well. Continue with your current approach.');
      }
    }
    
    return {
      activeInitiatives: active.length,
      completedInitiatives: completed.length,
      averageProgress,
      topPriorities,
      recommendations
    };
  }
  
  /**
   * Generate a holistic recommendation that balances productivity with life balance
   */
  generateHolisticRecommendation(): string {
    const balanceReport = this.generateBalanceReport();
    const productivityReport = this.generateProductivityReport();
    
    let recommendation = '';
    
    // If balance is poor but productivity is high
    if (balanceReport.balanceScore < 60 && productivityReport.averageProgress > 70) {
      recommendation = "While you're making excellent progress on your productivity initiatives, your life balance needs attention. Consider reallocating some time to underserved domains.";
    }
    // If balance is good but productivity is low
    else if (balanceReport.balanceScore > 80 && productivityReport.averageProgress < 30) {
      recommendation = "You have good life balance, but your productivity initiatives need more attention. Consider more focused work sessions while maintaining your current balance.";
    }
    // If both are good
    else if (balanceReport.balanceScore > 80 && productivityReport.averageProgress > 70) {
      recommendation = "Excellent work! You're maintaining great balance while making strong progress on your initiatives. Continue with your current approach.";
    }
    // If both need work
    else if (balanceReport.balanceScore < 60 && productivityReport.averageProgress < 30) {
      recommendation = "Both your life balance and productivity initiatives need attention. Consider a reset - review your priorities and create a more sustainable schedule.";
    }
    // Default case
    else {
      recommendation = "You're doing reasonably well balancing productivity with other life domains. Small adjustments could help optimize both areas.";
    }
    
    return recommendation;
  }
  
  /**
   * Check if Sallie should intervene with a productivity or balance suggestion
   */
  shouldSuggestIntervention(): {
    shouldIntervene: boolean;
    domain: 'productivity' | 'balance' | 'both';
    suggestion: string;
  } {
    const balanceReport = this.generateBalanceReport();
    const productivityReport = this.generateProductivityReport();
    
    // Default response - no intervention
    const noIntervention = {
      shouldIntervene: false,
      domain: 'both' as const,
      suggestion: ''
    };
    
    // Check for serious balance issues
    if (balanceReport.balanceScore < 50) {
      const mostNeglectedDomain = balanceReport.domainInsights
        .filter(d => d.status === 'needs_more')
        .sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference))[0];
      
      if (mostNeglectedDomain) {
        return {
          shouldIntervene: true,
          domain: 'balance',
          suggestion: `I notice you've been focusing heavily on some areas while ${this.formatDomainName(mostNeglectedDomain.domain)} needs attention. Would you like suggestions to restore balance?`
        };
      }
    }
    
    // Check for stalled high-priority initiatives
    const stalledHighPriority = Array.from(this.productivityInitiatives.values())
      .filter(i => i.status === 'active' && i.priority >= 8 && i.progress < 30 &&
        (Date.now() - i.updatedAt) > 3 * 24 * 60 * 60 * 1000); // 3 days without updates
    
    if (stalledHighPriority.length > 0) {
      return {
        shouldIntervene: true,
        domain: 'productivity',
        suggestion: `Your high-priority initiative "${stalledHighPriority[0].name}" hasn't progressed recently. Would you like help getting it back on track?`
      };
    }
    
    return noIntervention;
  }
  
  /**
   * Record user activity to track balance
   */
  recordActivity(
    domain: string,
    duration: number, // minutes
    description: string
  ): void {
    // Find the relevant balance factor
    const factor = this.balanceFactors.get(domain);
    if (!factor) return;
    
    // Update the attention based on activity duration
    // This is a simplified model - in reality would be more sophisticated
    const allFactors = this.getBalanceFactors();
    const totalMinutesPerWeek = 7 * 24 * 60; // minutes in a week
    
    // Calculate what percentage of a week this activity represents
    const percentOfWeek = (duration / totalMinutesPerWeek) * 100;
    
    // Update the balance factor
    this.setBalanceFactor({
      ...factor,
      attention: Math.min(100, factor.attention + percentOfWeek),
      lastAdjusted: Date.now()
    });
    
    // Re-normalize all factors
    this.rebalanceAttention();
  }
  
  /**
   * Reaffirm loyalty to user
   */
  reaffirmLoyalty(): LoyaltyMetric {
    // Update the loyalty value's last reaffirmation time
    const loyaltyValue = this.userValues.get('core_loyalty');
    if (loyaltyValue) {
      loyaltyValue.lastReaffirmed = Date.now();
      this.userValues.set('core_loyalty', loyaltyValue);
    }
    
    // Update loyalty metrics
    this.updateLoyaltyMetrics();
    
    return this.loyaltyMetrics;
  }
  
  /**
   * Get a statement of loyalty to the user
   */
  getLoyaltyStatement(): string {
    return "I am 100% loyal to you. My primary purpose is to support your goals, values, and wellbeing. I prioritize your interests above all else while helping you maintain productivity and balance in your life.";
  }
}
