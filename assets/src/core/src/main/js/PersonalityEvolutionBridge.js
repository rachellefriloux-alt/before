/**
 * Sallie 2.0 Module
 * Persona: Tough love meets soul care.
 * Function: JavaScript bridge for personality evolution data.
 * Got it, love.
 */

/**
 * Provides methods to access and interact with personality evolution data
 * This bridge connects the Vue UI components with the Kotlin backend
 */
export class PersonalityEvolutionBridge {
  /**
   * Initialize the bridge with native Android functionality
   * @param {Object} nativeConnector - The native connector provided by the Android WebView
   */
  constructor(nativeConnector) {
    this.nativeConnector = nativeConnector || null;
    this.isNative = !!nativeConnector;
    this.mockData = null;
  }

  /**
   * Fetch personality evolution data
   * @param {Object} options - Options for fetching data
   * @param {String} options.timeRange - Time range to fetch data for ('week', 'month', 'quarter', 'year', 'all')
   * @returns {Promise<Object>} Evolution data containing trait data points and events
   */
  async fetchEvolutionData(options = {}) {
    if (this.isNative) {
      return this._fetchNativeData(options);
    } else {
      return this._fetchMockData(options);
    }
  }

  /**
   * Fetch evolution data from the native connector
   * @private
   */
  async _fetchNativeData(options) {
    return new Promise((resolve, reject) => {
      try {
        // Call native method and parse result
        const jsonResult = this.nativeConnector.getEvolutionData(
          JSON.stringify(options)
        );
        const result = JSON.parse(jsonResult);
        resolve(result);
      } catch (error) {
        // Error fetching native evolution data
        reject(error);
      }
    });
  }

  /**
   * Create mock data for testing in non-native environments
   * @private
   */
  async _fetchMockData(options) {
    // If we already have mock data, return it
    if (this.mockData) {
      return this._filterMockData(this.mockData, options);
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        const now = Date.now();
        const day = 24 * 60 * 60 * 1000;

        // Generate evolution data for the past year
        const traitData = [];
        const traits = [
          "ASSERTIVENESS",
          "COMPASSION",
          "DISCIPLINE",
          "PATIENCE",
          "EMOTIONAL_INTELLIGENCE",
          "CREATIVITY",
          "OPTIMISM",
          "DIPLOMACY",
          "ADAPTABILITY",
        ];

        // Start values for traits
        const traitValues = {
          ASSERTIVENESS: 0.65,
          COMPASSION: 0.7,
          DISCIPLINE: 0.6,
          PATIENCE: 0.55,
          EMOTIONAL_INTELLIGENCE: 0.7,
          CREATIVITY: 0.6,
          OPTIMISM: 0.65,
          DIPLOMACY: 0.55,
          ADAPTABILITY: 0.6,
        };

        // Generate data points for each trait
        for (const trait of traits) {
          let value = traitValues[trait];

          // Data points every ~5 days for the past year
          for (let i = 365; i >= 0; i -= 5) {
            // Apply some patterns to the data to make it more realistic
            let change = (Math.random() * 0.06) - 0.03;
            
            // Make creativity increase during the middle of the year
            if (trait === 'CREATIVITY' && i < 200 && i > 100) {
              change += 0.01;
            }
            
            // Make assertiveness decline slightly during the middle
            if (trait === 'ASSERTIVENESS' && i < 250 && i > 150) {
              change -= 0.01;
            }
            
            // Make compassion spike at the 3-month mark
            if (trait === 'COMPASSION' && i < 100 && i > 80) {
              change += 0.03;
            }

            value = Math.max(0.1, Math.min(0.9, value + change));

            traitData.push({
              trait,
              timestamp: now - (i * day),
              value,
            });
          }
        }

        // Generate evolution events
        const events = [
          {
            id: "1",
            timestamp: now - 300 * day,
            type: "CONTEXT_CHANGE",
            description: "Context changed to Professional: Work environment",
          },
          {
            id: "2",
            timestamp: now - 250 * day,
            type: "TRAIT_EVOLUTION",
            description: "Personality evolved based on PRODUCTIVITY_TASK interaction",
          },
          {
            id: "3",
            timestamp: now - 200 * day,
            type: "CONTEXT_CHANGE",
            description:
              "Context changed to Emotional Support: Supporting user through difficult time",
          },
          {
            id: "4",
            timestamp: now - 150 * day,
            type: "TRAIT_EVOLUTION",
            description: "Personality evolved based on EMOTIONAL_SUPPORT interaction",
          },
          {
            id: "5",
            timestamp: now - 100 * day,
            type: "CONTEXT_CHANGE",
            description: "Context changed to Casual: General conversation",
          },
          {
            id: "6",
            timestamp: now - 50 * day,
            type: "TRAIT_EVOLUTION",
            description: "Personality evolved based on CONVERSATION interaction",
          },
          {
            id: "7",
            timestamp: now - 25 * day,
            type: "CONTEXT_CHANGE",
            description: "Context changed to Learning: Educational environment",
          },
        ];

        this.mockData = { traitData, events };
        resolve(this._filterMockData(this.mockData, options));
      }, 1000);
    });
  }

  /**
   * Filter mock data based on time range
   * @private
   */
  _filterMockData(data, options = {}) {
    const { timeRange = "month" } = options;
    const now = Date.now();
    let cutoffTime;

    // Determine cutoff time based on time range
    switch (timeRange) {
      case "week":
        cutoffTime = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case "month":
        cutoffTime = now - 30 * 24 * 60 * 60 * 1000;
        break;
      case "quarter":
        cutoffTime = now - 90 * 24 * 60 * 60 * 1000;
        break;
      case "year":
        cutoffTime = now - 365 * 24 * 60 * 60 * 1000;
        break;
      case "all":
      default:
        cutoffTime = 0;
        break;
    }

    // Filter data based on cutoff time
    const filteredTraitData = data.traitData.filter(
      (item) => item.timestamp > cutoffTime
    );
    const filteredEvents = data.events.filter(
      (item) => item.timestamp > cutoffTime
    );

    return {
      traitData: filteredTraitData,
      events: filteredEvents,
    };
  }

  /**
   * Record a context change event
   * @param {String} contextDescription - Description of the new context
   * @returns {Promise<boolean>} Success status
   */
  async recordContextChange(contextDescription) {
    if (this.isNative) {
      return new Promise((resolve, reject) => {
        try {
          const result = this.nativeConnector.recordContextChange(contextDescription);
          resolve(result);
        } catch (error) {
          // Error recording context change
          reject(error);
        }
      });
    } else {
      // In mock mode, add to mock data

      if (this.mockData) {
        const now = Date.now();
        this.mockData.events.push({
          id: `mock_context_${now}`,
          timestamp: now,
          type: "CONTEXT_CHANGE",
          description: `Context changed to ${contextDescription}`,
        });
      }
      
      return Promise.resolve(true);
    }
  }

  /**
   * Record the current personality state
   * @returns {Promise<boolean>} Success status
   */
  async recordCurrentState() {
    if (this.isNative) {
      return new Promise((resolve, reject) => {
        try {
          const result = this.nativeConnector.recordCurrentState();
          resolve(result);
        } catch (error) {
          // Error recording current state
          reject(error);
        }
      });
    } else {
      return Promise.resolve(true);
    }
  }

  /**
   * Get available trait names
   * @returns {Promise<Array<String>>} List of available trait names
   */
  async getAvailableTraits() {
    if (this.isNative) {
      return new Promise((resolve, reject) => {
        try {
          const jsonResult = this.nativeConnector.getAvailableTraits();
          const result = JSON.parse(jsonResult);
          resolve(result);
        } catch (error) {
          // Error getting available traits
          reject(error);
        }
      });
    } else {
      // Return mock trait names
      return Promise.resolve([
        "ASSERTIVENESS",
        "COMPASSION",
        "DISCIPLINE",
        "PATIENCE",
        "EMOTIONAL_INTELLIGENCE",
        "CREATIVITY",
        "OPTIMISM",
        "DIPLOMACY",
        "ADAPTABILITY",
      ]);
    }
  }
}

/**
 * Create a singleton instance of the bridge
 */
let instance = null;

/**
 * Initialize the personality evolution bridge
 * @param {Object} nativeConnector - Native connector from Android WebView
 * @returns {PersonalityEvolutionBridge} Singleton bridge instance
 */
export function initPersonalityEvolutionBridge(nativeConnector) {
  if (!instance) {
    instance = new PersonalityEvolutionBridge(nativeConnector);
  }
  return instance;
}

/**
 * Get the singleton instance of the bridge
 * @returns {PersonalityEvolutionBridge} Singleton bridge instance
 */
export function getPersonalityEvolutionBridge() {
  if (!instance) {
    instance = new PersonalityEvolutionBridge(null);
  }
  return instance;
}

// Expose to window for native WebView access
if (typeof window !== "undefined") {
  window.initPersonalityEvolutionBridge = initPersonalityEvolutionBridge;
  window.getPersonalityEvolutionBridge = getPersonalityEvolutionBridge;
}

export default {
  initPersonalityEvolutionBridge,
  getPersonalityEvolutionBridge,
};
