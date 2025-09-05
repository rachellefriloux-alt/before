/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Test for Memory Manager functionality.
 * Got it, love.
 */

import MemoryManager, { MemoryType } from '../core/MemoryManager';
import { MemoryPriority } from '../types/MemoryTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve())
}));

// Mock encryption functions
jest.mock('../utils/securityUtils', () => ({
  encryptData: jest.fn((data) => Promise.resolve(`encrypted_${data}`)),
  decryptData: jest.fn((data) => {
    // Strip 'encrypted_' prefix for decryption
    if (data?.startsWith('encrypted_')) {
      return Promise.resolve(data.substring(10));
    }
    return Promise.resolve(data);
  })
}));

describe('MemoryManager', () => {
  let memoryManager: MemoryManager;
  
  beforeEach(async () => {
    jest.clearAllMocks();
    memoryManager = MemoryManager.getInstance();
    await memoryManager.initialize();
    await memoryManager.clearAll(); // Clear all memories between tests
  });
  
  it('should be a singleton', () => {
    const instance1 = MemoryManager.getInstance();
    const instance2 = MemoryManager.getInstance();
    expect(instance1).toBe(instance2);
  });
  
  it('should add a memory item', async () => {
    const newMemory = {
      content: 'Test memory content',
      type: MemoryType.QUICK_CAPTURE,
      createdAt: new Date().toISOString(),
      priority: MemoryPriority.MEDIUM,
      tags: ['test', 'memory']
    };
    
    const result = await memoryManager.addMemory(newMemory);
    
    expect(result).toMatchObject({
      content: newMemory.content,
      type: newMemory.type,
      priority: newMemory.priority,
      tags: newMemory.tags,
    });
    
    expect(result.id).toBeDefined();
    expect(result.timestamp).toBeDefined();
    
    // Verify AsyncStorage was called to save the memory
    // We need to wait a bit since save is debounced
    await new Promise(resolve => setTimeout(resolve, 2100));
    
    expect(AsyncStorage.setItem).toHaveBeenCalled();
  });
  
  it('should retrieve memories by type', async () => {
    // Add a test memory
    await memoryManager.addMemory({
      content: 'Test preference',
      type: MemoryType.PREFERENCE,
      createdAt: new Date().toISOString(),
      priority: MemoryPriority.MEDIUM,
      tags: ['pref']
    });
    
    // Allow debounced save to complete
    await new Promise(resolve => setTimeout(resolve, 2100));
    
    // Mock returning data for this specific type
    const mockPreferences = [
      {
        id: 'test_id',
        content: 'Test preference',
        type: MemoryType.PREFERENCE,
        importance: 3,
        tags: ['pref'],
        timestamp: Date.now()
      }
    ];
    
    // Mock the storage return for this specific key
    (AsyncStorage.getItem as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve(JSON.stringify(mockPreferences))
    );
    
    const preferences = await memoryManager.getAllMemoriesByType(MemoryType.PREFERENCE);
    expect(preferences.length).toBeGreaterThanOrEqual(1);
  });
  
  it('should search memories with various filters', async () => {
    // Add multiple test memories
    await memoryManager.addMemory({
      content: 'High priority task',
      type: MemoryType.TASK,
      createdAt: new Date().toISOString(),
      priority: MemoryPriority.HIGH,
      tags: ['high', 'priority']
    });
    
    await memoryManager.addMemory({
      content: 'Low priority task',
      type: MemoryType.TASK,
      createdAt: new Date().toISOString(),
      priority: MemoryPriority.LOW,
      tags: ['low', 'priority']
    });
    
    // Allow debounced save to complete
    await new Promise(resolve => setTimeout(resolve, 2100));
    
    // Mock storage retrieval with our test memories
    const mockTasks = [
      {
        id: 'high_task',
        content: 'High priority task',
        type: MemoryType.TASK,
        createdAt: new Date().toISOString(),
        priority: MemoryPriority.HIGH,
        tags: ['high', 'priority'],
        timestamp: Date.now()
      },
      {
        id: 'low_task',
        content: 'Low priority task',
        type: MemoryType.TASK,
        createdAt: new Date().toISOString(),
        priority: MemoryPriority.LOW,
        tags: ['low', 'priority'],
        timestamp: Date.now() - 1000
      }
    ];
    
    (AsyncStorage.getItem as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve(JSON.stringify(mockTasks))
    );
    
    // Search for high priority tasks
    const highPriorityResults = await memoryManager.searchMemories({
      type: MemoryType.TASK,
      priority: MemoryPriority.HIGH
    });
    
    expect(highPriorityResults.length).toBe(1);
    expect(highPriorityResults[0].content).toContain('High priority');
    
    // Mock storage retrieval again
    (AsyncStorage.getItem as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve(JSON.stringify(mockTasks))
    );
    
    // Search by tag
    const tagResults = await memoryManager.searchMemories({
      type: MemoryType.TASK,
      tags: ['low']
    });
    
    expect(tagResults.length).toBe(1);
    expect(tagResults[0].content).toContain('Low priority');
  });
  
  it('should update an existing memory', async () => {
    // Add a test memory
    const addedMemory = await memoryManager.addMemory({
      content: 'Original content',
      type: MemoryType.QUICK_CAPTURE,
      createdAt: new Date().toISOString(),
      priority: MemoryPriority.MEDIUM,
      tags: ['original']
    });
    
    // Allow debounced save to complete
    await new Promise(resolve => setTimeout(resolve, 2100));
    
    // Mock storage retrieval with our test memory
    const mockMemories = [addedMemory];
    
    (AsyncStorage.getItem as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve(JSON.stringify(mockMemories))
    );
    
    // Update the memory
    const updatedMemory = await memoryManager.updateMemory(addedMemory.id, {
      content: 'Updated content',
      tags: ['updated']
    });
    
    expect(updatedMemory).toBeDefined();
    if (updatedMemory) {
      expect(updatedMemory.content).toBe('Updated content');
      expect(updatedMemory.tags).toEqual(['updated']);
      expect(updatedMemory.id).toBe(addedMemory.id); // ID should remain the same
    }
  });
  
  it('should delete a memory', async () => {
    // Add a test memory
    const addedMemory = await memoryManager.addMemory({
      content: 'Memory to delete',
      type: MemoryType.QUICK_CAPTURE,
      createdAt: new Date().toISOString(),
      priority: MemoryPriority.MEDIUM,
      tags: ['delete']
    });
    
    // Allow debounced save to complete
    await new Promise(resolve => setTimeout(resolve, 2100));
    
    // Mock storage retrieval with our test memory
    const mockMemories = [addedMemory];
    
    (AsyncStorage.getItem as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve(JSON.stringify(mockMemories))
    );
    
    // Delete the memory
    const deleteResult = await memoryManager.deleteMemory(addedMemory.id);
    expect(deleteResult).toBe(true);
    
    // Verify AsyncStorage was called to save the updated (empty) memories
    await new Promise(resolve => setTimeout(resolve, 2100));
    expect(AsyncStorage.setItem).toHaveBeenCalled();
  });
  
  it('should handle quick captures', async () => {
    const quickCapture = await memoryManager.quickCapture('Remember to buy milk', ['shopping']);
    
    expect(quickCapture.type).toBe(MemoryType.QUICK_CAPTURE);
    expect(quickCapture.content).toBe('Remember to buy milk');
    expect(quickCapture.tags).toContain('shopping');
    
    // Mock storage retrieval for getQuickCaptures
    const mockCaptures = [quickCapture];
    
    (AsyncStorage.getItem as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve(JSON.stringify(mockCaptures))
    );
    
    const captures = await memoryManager.getQuickCaptures();
    expect(captures.length).toBe(1);
    expect(captures[0].content).toBe('Remember to buy milk');
  });
  
  it('should handle preferences', async () => {
    await memoryManager.addPreference('theme', 'dark', MemoryPriority.HIGH);
    
    // Allow debounced save to complete
    await new Promise(resolve => setTimeout(resolve, 2100));
    
    // Mock storage retrieval for getPreference
    const mockPreference = {
      id: 'pref_id',
      content: JSON.stringify({ key: 'theme', value: 'dark' }),
      type: MemoryType.PREFERENCE,
      importance: MemoryPriority.HIGH,
      tags: ['theme'],
      timestamp: Date.now()
    };
    
    (AsyncStorage.getItem as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve(JSON.stringify([mockPreference]))
    );
    
    const theme = await memoryManager.getPreference('theme');
    expect(theme).toBe('dark');
  });
});
