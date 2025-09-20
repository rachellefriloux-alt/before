/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\src\firebaseConfigManager.js) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\src\firebaseConfigManager.js) */
/* --- dest (C:\Users\chell\Desktop\newsal\src\firebaseConfigManager.js) --- */
/* Merged master for logical file: src\firebaseConfigManager
Sources:
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\src\firebaseConfigManager.js (hash:2212D57AFAADE424B067A754377C8D4A99F008C543EE808F4ABFD712E04AE6AC)
 - C:\Users\chell\Desktop\Sallie\merged_sallie\src\firebaseConfigManager.js (hash:1511D3435222012089509305FCFB4AFFA76FA39B6858FBA5695C0E7060179A84)
 */

/* ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\src\firebaseConfigManager.js | ext: .js | sha: 2212D57AFAADE424B067A754377C8D4A99F008C543EE808F4ABFD712E04AE6AC ---- */
[BINARY FILE - original copied to merged_sources: src\firebaseConfigManager.js]
/* ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\src\firebaseConfigManager.js | ext: .js | sha: 1511D3435222012089509305FCFB4AFFA76FA39B6858FBA5695C0E7060179A84 ---- */
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\src\firebaseConfigManager.js --- */
import localConfig from '../config/firebase-config.local.json';
import prodConfig from '../config/firebase-config.prod.json';
import { initializeApp } from 'firebase/app';
let currentFlavor = 'prod';
let firebaseApp = initializeApp(prodConfig);
export function getCurrentFlavor() {
  return currentFlavor;
}
export function switchFlavor(flavor) {
  currentFlavor = flavor;
  firebaseApp = initializeApp(flavor === 'local' ? localConfig : prodConfig);
export function getFirebaseApp() {
  return firebaseApp;
