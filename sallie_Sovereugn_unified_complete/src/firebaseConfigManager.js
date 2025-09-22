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
