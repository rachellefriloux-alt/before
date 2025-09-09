/*
 * Persona: Tough love meets soul care.
 * Module: firebaseConfigManager
 * Intent: Handle functionality for firebaseConfigManager
 * Provenance-ID: 4119fc9e-4113-432d-8a66-9b1129b090a0
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

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
}

export function getFirebaseApp() {
  return firebaseApp;
}
