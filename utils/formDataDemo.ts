/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Demonstration of configurable nested formats for FormData.
 * Got it, love.
 */

import { ConfigurableFormData, PRESET_CONFIGS, NestedFormatConfig } from './formDataUtils';

// Example data that would be sent to an API
const sampleData = {
  user: {
    name: 'John Doe',
    age: 30,
    preferences: {
      theme: 'dark',
      notifications: true
    }
  },
  files: ['document1.pdf', 'image1.jpg'],
  metadata: {
    tags: ['important', 'urgent'],
    priority: 'high'
  }
};

export async function demonstrateFormats() {
  console.log('=== Configurable FormData Formats Demo ===\n');

  // Standard format (default)
  console.log('1. STANDARD Format (brackets):');
  const standardForm = new ConfigurableFormData(PRESET_CONFIGS.STANDARD);
  const standardFormData = await standardForm.createForm(sampleData);
  printFormEntries(standardFormData);

  // Indexed dot format
  console.log('\n2. INDEXED_DOT Format:');
  const indexedForm = new ConfigurableFormData(PRESET_CONFIGS.INDEXED_DOT);
  const indexedFormData = await indexedForm.createForm(sampleData);
  printFormEntries(indexedFormData);

  // Underscore format
  console.log('\n3. UNDERSCORE Format:');
  const underscoreForm = new ConfigurableFormData(PRESET_CONFIGS.UNDERSCORE);
  const underscoreFormData = await underscoreForm.createForm(sampleData);
  printFormEntries(underscoreFormData);

  // Custom format
  console.log('\n4. CUSTOM Format:');
  const customForm = new ConfigurableFormData({
    arrayFormat: 'indexed',
    objectFormat: 'dot',
    customArrayFormatter: (key, index) => `${key}__${index}`,
    customObjectFormatter: (key, prop) => `${key}::${prop}`
  });
  const customFormData = await customForm.createForm(sampleData);
  printFormEntries(customFormData);
}

function printFormEntries(formData: FormData) {
  const entries = (formData as any).getEntries?.() || [];
  entries.forEach(([key, value]: [string, any]) => {
    console.log(`  ${key} = ${value}`);
  });
}

export function showConfigurationOptions() {
  console.log('\n=== Available Configuration Options ===\n');
  
  console.log('Array Formats:');
  console.log('  - brackets: items[]');
  console.log('  - indexed: items[0], items[1]');
  console.log('  - repeat: items, items (same key repeated)');
  console.log('  - custom: define your own formatter function');
  
  console.log('\nObject Formats:');
  console.log('  - brackets: obj[prop]');
  console.log('  - dot: obj.prop');
  console.log('  - underscore: obj_prop');
  console.log('  - custom: define your own formatter function');
  
  console.log('\nPredefined Presets:');
  console.log('  - STANDARD: brackets for both arrays and objects');
  console.log('  - INDEXED_DOT: indexed arrays, dot notation for objects');
  console.log('  - UNDERSCORE: underscore notation throughout');
  console.log('  - OPENAI: optimized for OpenAI API compatibility');
}

// Example usage in API integration
export class APIClient {
  private formDataConfig: ConfigurableFormData;

  constructor(formatConfig: NestedFormatConfig = PRESET_CONFIGS.STANDARD) {
    this.formDataConfig = new ConfigurableFormData(formatConfig);
  }

  async uploadWithMetadata(data: Record<string, any>) {
    const formData = await this.formDataConfig.createForm(data);
    
    // This FormData can now be sent to any API that expects the configured format
    return fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
  }

  updateFormat(newConfig: any) {
    this.formDataConfig.updateConfig(newConfig);
  }
}

// Use case: Different APIs requiring different formats
export const apiClients = {
  // Standard REST API
  standard: new APIClient(PRESET_CONFIGS.STANDARD),
  
  // Legacy API requiring underscore notation
  legacy: new APIClient(PRESET_CONFIGS.UNDERSCORE),
  
  // Modern API with dot notation
  modern: new APIClient(PRESET_CONFIGS.INDEXED_DOT),
  
  // OpenAI API
  openai: new APIClient(PRESET_CONFIGS.OPENAI)
};

if (require.main === module) {
  // Run demonstration if this file is executed directly
  demonstrateFormats().catch(console.error);
  showConfigurationOptions();
}