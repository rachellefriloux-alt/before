import { MemoryV2Store } from '../core/memory/MemoryV2Store';
import { MerkleTree } from '../core/crypto/MerkleTree';

describe('MemoryV2Store Merkle Audit', () => {
  let store: MemoryV2Store;
  beforeEach(async () => {
    store = new MemoryV2Store();
    await store.initialize();
  });

  it('adds audit entries on create', async () => {
    const initialHistory = store.getAuditHistory();
    expect(initialHistory).toHaveLength(0);
    const mem = { id: '1', type: 'test', content: 'hello', provenance: { createdAt: new Date(), source: 'test', confidence: 1 }, emotionalTags: [], linkage: { narrativeThread: '', relatedMemories: [], contextWindow: { before: [], after: [] }, semanticLinks: [] }, accessControl: { ownerId: '', permissions: [], encryptionLevel: 'standard', retentionPolicy: { duration: '1d', autoDelete: false } }, metadata: {}, version: 1, lastModified: new Date() };
    await store.create(mem as any);
    const history = store.getAuditHistory();
    expect(history).toHaveLength(1);
    expect(history[0].root).toBe(store.getCurrentAuditRoot());
  });

  it('records update and delete entries', async () => {
    const mem = { id: '2', type: 'test', content: 'world', provenance: { createdAt: new Date(), source: 'test', confidence: 1 }, emotionalTags: [], linkage: { narrativeThread: '', relatedMemories: [], contextWindow: { before: [], after: [] }, semanticLinks: [] }, accessControl: { ownerId: '', permissions: [], encryptionLevel: 'standard', retentionPolicy: { duration: '1d', autoDelete: false } }, metadata: {}, version: 1, lastModified: new Date() };
    await store.create(mem as any);
    await store.update('2', { content: 'world2' } as any);
    await store.delete('2');
    const history = store.getAuditHistory();
    expect(history).toHaveLength(3);
    expect(history.map(e => e.root).every(r => typeof r === 'string')).toBe(true);
  });
});