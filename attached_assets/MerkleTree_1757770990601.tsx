/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: MerkleTree for tamper-evident audit logging.
 * Got it, love.
 */

import CryptoJS from 'crypto-js';

export interface MerkleNode {
  hash: string;
}

export interface AuditEntry {
  timestamp: Date;
  root: string;
}

/**
 * MerkleTree implements a simple Merkle tree for audit logging.
 */
export class MerkleTree {
  private leaves: string[] = [];
  private history: AuditEntry[] = [];

  /**
   * Add a new leaf value to the tree and record new root hash.
   * @param value raw string data to leaf
   */
  public addLeaf(value: string): void {
    const hash = CryptoJS.SHA256(value).toString(CryptoJS.enc.Hex);
    this.leaves.push(hash);
    const root = this.computeRoot(this.leaves);
    this.history.push({ timestamp: new Date(), root });
  }

  /**
   * Compute Merkle root from array of hashes.
   */
  private computeRoot(nodes: string[]): string {
    if (nodes.length === 0) {
      return '';
    }
    let level = [...nodes];
    while (level.length > 1) {
      const next: string[] = [];
      for (let i = 0; i < level.length; i += 2) {
        const left = level[i];
        const right = i + 1 < level.length ? level[i + 1] : level[i];
        const combined = left + right;
        const hash = CryptoJS.SHA256(combined).toString(CryptoJS.enc.Hex);
        next.push(hash);
      }
      level = next;
    }
    return level[0];
  }

  /**
   * Get the latest Merkle root.
   */
  public getCurrentRoot(): string {
    return this.history.length > 0 ? this.history[this.history.length - 1].root : '';
  }

  /**
   * Get full audit history of roots.
   */
  public getHistory(): AuditEntry[] {
    return [...this.history];
  }
}
