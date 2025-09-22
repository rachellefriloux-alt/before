// AssetManager.js
// Fully coded, expanded, and upgraded asset manager for Sallie
// Supports dynamic, interchangeable, open/free source assets with all optional enhancements

const assetManifest = require('../assets/assetManifest.json');

class AssetManager {
  constructor() {
    this.cache = {};
    this.manifest = assetManifest;
  }

  getAsset(name) {
    const asset = this.manifest.find(a => a.name === name);
    if (!asset) return null;
    if (this.cache[name]) return this.cache[name];
    this.cache[name] = asset;
    return asset;
  }

  getAssetsByTag(tag) {
    return this.manifest.filter(a => a.tags.includes(tag));
  }

  getAssetsByType(type) {
    return this.manifest.filter(a => a.type === type);
  }

  getAssetsByMode(mode) {
    return this.manifest.filter(a => a.tags.includes(mode));
  }

  getAssetsByEmotion(emotion) {
    return this.manifest.filter(a => a.tags.includes(emotion));
  }

  getPersonaDrivenAsset(personaState, type = 'avatar') {
    // Select asset by persona mode, emotion, or fallback
    if (personaState && personaState.mode) {
      const modeAssets = this.getAssetsByMode(personaState.mode).filter(a => a.type === type);
      if (modeAssets.length) return modeAssets[0];
    }
    if (personaState && personaState.emotion) {
      const emotionAssets = this.getAssetsByEmotion(personaState.emotion).filter(a => a.type === type);
      if (emotionAssets.length) return emotionAssets[0];
    }
    // Fallback
    return this.getAssetsByType(type)[0] || null;
  }

  swapAsset(component, assetName) {
    const asset = this.getAsset(assetName);
    if (!asset) return;
    if (component && typeof component.setAsset === 'function') {
      component.setAsset(asset);
    }
  }

  addAsset(asset) {
    if (!asset || !asset.url || !asset.source) return false;
    this.manifest.push(asset);
    return true;
  }

  removeAsset(name) {
    const idx = this.manifest.findIndex(a => a.name === name);
    if (idx !== -1) {
      this.manifest.splice(idx, 1);
      delete this.cache[name];
      return true;
    }
    return false;
  }

  listAssets() {
    return this.manifest;
  }
}

module.exports = new AssetManager();


/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\core\AssetManager.js) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\core\AssetManager.js) */
/* --- dest (C:\Users\chell\Desktop\newsal\core\AssetManager.js) --- */
/* Merged master for logical file: core\AssetManager
Sources:
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\core\AssetManager.js (hash:7D1D26D61C03372E728FE61D4A2A8DC17EEB4DE867C2652385E9959E1E0F5587)
 - C:\Users\chell\Desktop\Sallie\merged_sallie\core\AssetManager.js (hash:D241C9241E72516301E8AD1E580A94EFD106D3341AED37445A408B48C96DBD55)
 */

/* ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\core\AssetManager.js | ext: .js | sha: 7D1D26D61C03372E728FE61D4A2A8DC17EEB4DE867C2652385E9959E1E0F5587 ---- */
[BINARY FILE - original copied to merged_sources: core\AssetManager.js]
/* ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\core\AssetManager.js | ext: .js | sha: D241C9241E72516301E8AD1E580A94EFD106D3341AED37445A408B48C96DBD55 ---- */
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\core\AssetManager.js --- */
// AssetManager.js
// Fully coded, expanded, and upgraded asset manager for Sallie
// Supports dynamic, interchangeable, open/free source assets with all optional enhancements
const assetManifest = require('../assets/assetManifest.json');
class AssetManager {
  constructor() {
    this.cache = {};
    this.manifest = assetManifest;
  }
  getAsset(name) {
    const asset = this.manifest.find(a => a.name === name);
    if (!asset) return null;
    if (this.cache[name]) return this.cache[name];
    this.cache[name] = asset;
    return asset;
  getAssetsByTag(tag) {
    return this.manifest.filter(a => a.tags.includes(tag));
  getAssetsByType(type) {
    return this.manifest.filter(a => a.type === type);
  getAssetsByMode(mode) {
    return this.manifest.filter(a => a.tags.includes(mode));
  getAssetsByEmotion(emotion) {
    return this.manifest.filter(a => a.tags.includes(emotion));
  getPersonaDrivenAsset(personaState, type = 'avatar') {
    // Select asset by persona mode, emotion, or fallback
    if (personaState && personaState.mode) {
      const modeAssets = this.getAssetsByMode(personaState.mode).filter(a => a.type === type);
      if (modeAssets.length) return modeAssets[0];
    }
    if (personaState && personaState.emotion) {
      const emotionAssets = this.getAssetsByEmotion(personaState.emotion).filter(a => a.type === type);
      if (emotionAssets.length) return emotionAssets[0];
    // Fallback
    return this.getAssetsByType(type)[0] || null;
  swapAsset(component, assetName) {
    const asset = this.getAsset(assetName);
    if (!asset) return;
    if (component && typeof component.setAsset === 'function') {
      component.setAsset(asset);
  addAsset(asset) {
    if (!asset || !asset.url || !asset.source) return false;
    this.manifest.push(asset);
    return true;
  removeAsset(name) {
    const idx = this.manifest.findIndex(a => a.name === name);
    if (idx !== -1) {
      this.manifest.splice(idx, 1);
      delete this.cache[name];
      return true;
    return false;
  listAssets() {
    return this.manifest;
}
module.exports = new AssetManager();
