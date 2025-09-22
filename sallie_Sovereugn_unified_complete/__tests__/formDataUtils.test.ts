/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Tests for configurable FormData utilities.
 * Got it, love.
 */

import { ConfigurableFormData, createConfigurableForm, PRESET_CONFIGS } from '../utils/formDataUtils';

// Mock Response for testing
global.Response = class MockResponse {
  constructor(public body: any) {}

  async blob() {
    return new Blob([this.body]);
  }

  get headers() {
    return {
      get: (name: string) => {
        if (name === 'content-disposition') return 'attachment; filename="test.txt"';
        return null;
      }
    };
  }
} as any;

// Mock FormData for testing
class MockFormData {
  private entries: Array<[string, any]> = [];

  append(key: string, value: any, filename?: string): void {
    this.entries.push([key, value]);
  }

  getEntries(): Array<[string, any]> {
    return [...this.entries];
  }

  has(key: string): boolean {
    return this.entries.some(([k]) => k === key);
  }

  get(key: string): any {
    const entry = this.entries.find(([k]) => k === key);
    return entry ? entry[1] : null;
  }

  getAll(key: string): any[] {
    return this.entries.filter(([k]) => k === key).map(([, v]) => v);
  }
}

// Mock global FormData
(global as any).FormData = MockFormData;

describe('ConfigurableFormData', () => {
  let formData: ConfigurableFormData;

  beforeEach(() => {
    formData = new ConfigurableFormData();
  });

  describe('Basic functionality', () => {
    it('should handle primitive values', async () => {
      const form = await formData.createForm({
        string: 'test',
        number: 42,
        boolean: true
      });

      const entries = (form as any).getEntries();
      expect(entries).toEqual([
        ['string', 'test'],
        ['number', '42'],
        ['boolean', 'true']
      ]);
    });

    it('should handle null and undefined values', async () => {
      const form = await formData.createForm({
        defined: 'value',
        undefined: undefined
      });

      const entries = (form as any).getEntries();
      expect(entries).toEqual([
        ['defined', 'value']
      ]);

      await expect(formData.createForm({ null: null })).rejects.toThrow(
        'Received null for "null"; to pass null in FormData, you must use the string \'null\''
      );
    });
  });

  describe('Array formatting', () => {
    it('should use brackets format by default', async () => {
      const form = await formData.createForm({
        items: ['a', 'b', 'c']
      });

      const entries = (form as any).getEntries();
      expect(entries).toEqual([
        ['items[]', 'a'],
        ['items[]', 'b'],
        ['items[]', 'c']
      ]);
    });

    it('should use indexed format when configured', async () => {
      formData = new ConfigurableFormData({ arrayFormat: 'indexed' });
      const form = await formData.createForm({
        items: ['a', 'b', 'c']
      });

      const entries = (form as any).getEntries();
      expect(entries).toEqual([
        ['items[0]', 'a'],
        ['items[1]', 'b'],
        ['items[2]', 'c']
      ]);
    });

    it('should use repeat format when configured', async () => {
      formData = new ConfigurableFormData({ arrayFormat: 'repeat' });
      const form = await formData.createForm({
        items: ['a', 'b', 'c']
      });

      const entries = (form as any).getEntries();
      expect(entries).toEqual([
        ['items', 'a'],
        ['items', 'b'],
        ['items', 'c']
      ]);
    });

    it('should use custom array formatter when provided', async () => {
      formData = new ConfigurableFormData({
        customArrayFormatter: (key, index) => `${key}_${index}`
      });
      const form = await formData.createForm({
        items: ['a', 'b']
      });

      const entries = (form as any).getEntries();
      expect(entries).toEqual([
        ['items_0', 'a'],
        ['items_1', 'b']
      ]);
    });
  });

  describe('Object formatting', () => {
    it('should use brackets format by default', async () => {
      const form = await formData.createForm({
        user: {
          name: 'John',
          age: 30
        }
      });

      const entries = (form as any).getEntries();
      expect(entries).toContainEqual(['user[name]', 'John']);
      expect(entries).toContainEqual(['user[age]', '30']);
    });

    it('should use dot format when configured', async () => {
      formData = new ConfigurableFormData({ objectFormat: 'dot' });
      const form = await formData.createForm({
        user: {
          name: 'John',
          age: 30
        }
      });

      const entries = (form as any).getEntries();
      expect(entries).toContainEqual(['user.name', 'John']);
      expect(entries).toContainEqual(['user.age', '30']);
    });

    it('should use underscore format when configured', async () => {
      formData = new ConfigurableFormData({ objectFormat: 'underscore' });
      const form = await formData.createForm({
        user: {
          name: 'John',
          age: 30
        }
      });

      const entries = (form as any).getEntries();
      expect(entries).toContainEqual(['user_name', 'John']);
      expect(entries).toContainEqual(['user_age', '30']);
    });

    it('should use custom object formatter when provided', async () => {
      formData = new ConfigurableFormData({
        customObjectFormatter: (key, prop) => `${key}::${prop}`
      });
      const form = await formData.createForm({
        user: { name: 'John' }
      });

      const entries = (form as any).getEntries();
      expect(entries).toEqual([['user::name', 'John']]);
    });
  });

  describe('Nested structures', () => {
    it('should handle arrays of objects', async () => {
      const form = await formData.createForm({
        users: [
          { name: 'John', age: 30 },
          { name: 'Jane', age: 25 }
        ]
      });

      const entries = (form as any).getEntries();
      expect(entries).toContainEqual(['users[][name]', 'John']);
      expect(entries).toContainEqual(['users[][age]', '30']);
      expect(entries).toContainEqual(['users[][name]', 'Jane']);
      expect(entries).toContainEqual(['users[][age]', '25']);
    });

    it('should handle objects with arrays', async () => {
      const form = await formData.createForm({
        data: {
          tags: ['red', 'blue'],
          count: 5
        }
      });

      const entries = (form as any).getEntries();
      expect(entries).toContainEqual(['data[tags][]', 'red']);
      expect(entries).toContainEqual(['data[tags][]', 'blue']);
      expect(entries).toContainEqual(['data[count]', '5']);
    });
  });

  describe('File handling', () => {
    it('should handle File objects', async () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const form = await formData.createForm({
        upload: file
      });

      const entries = (form as any).getEntries();
      expect(entries[0][0]).toBe('upload');
      expect(entries[0][1]).toBe(file);
    });

    it('should handle Blob objects', async () => {
      const blob = new Blob(['content'], { type: 'text/plain' });
      const form = await formData.createForm({
        upload: blob
      });

      const entries = (form as any).getEntries();
      expect(entries[0][0]).toBe('upload');
      expect(entries[0][1]).toBe(blob);
    });
  });

  describe('Configuration management', () => {
    it('should update configuration', () => {
      formData.updateConfig({ arrayFormat: 'indexed' });
      const config = formData.getConfig();
      expect(config.arrayFormat).toBe('indexed');
    });

    it('should maintain other config values when updating', () => {
      formData.updateConfig({ arrayFormat: 'indexed' });
      const config = formData.getConfig();
      expect(config.objectFormat).toBe('brackets'); // Should remain default
    });
  });

  describe('Preset configurations', () => {
    it('should work with STANDARD preset', async () => {
      formData = new ConfigurableFormData(PRESET_CONFIGS.STANDARD);
      const form = await formData.createForm({
        items: ['a'],
        user: { name: 'John' }
      });

      const entries = (form as any).getEntries();
      expect(entries).toContainEqual(['items[]', 'a']);
      expect(entries).toContainEqual(['user[name]', 'John']);
    });

    it('should work with INDEXED_DOT preset', async () => {
      formData = new ConfigurableFormData(PRESET_CONFIGS.INDEXED_DOT);
      const form = await formData.createForm({
        items: ['a'],
        user: { name: 'John' }
      });

      const entries = (form as any).getEntries();
      expect(entries).toContainEqual(['items[0]', 'a']);
      expect(entries).toContainEqual(['user.name', 'John']);
    });

    it('should work with UNDERSCORE preset', async () => {
      formData = new ConfigurableFormData(PRESET_CONFIGS.UNDERSCORE);
      const form = await formData.createForm({
        items: ['a'],
        user: { name: 'John' }
      });

      const entries = (form as any).getEntries();
      expect(entries).toContainEqual(['items_0', 'a']);
      expect(entries).toContainEqual(['user_name', 'John']);
    });
  });

  describe('Utility function', () => {
    it('should work with createConfigurableForm', async () => {
      const form = await createConfigurableForm(
        { items: ['a', 'b'] },
        { arrayFormat: 'indexed' }
      );

      const entries = (form as any).getEntries();
      expect(entries).toEqual([
        ['items[0]', 'a'],
        ['items[1]', 'b']
      ]);
    });
  });

  describe('Error handling', () => {
    it('should throw for invalid value types', async () => {
      const invalidData = { func: () => {} };
      await expect(formData.createForm(invalidData)).rejects.toThrow(
        'Invalid value given to form'
      );
    });
  });
});