// Minimal Node smoke-test to verify Admin SDK initialization and Firestore access
// Usage: node scripts/check_admin_smoke.js

const admin = require('firebase-admin');
(async () => {
  try {
    admin.initializeApp({});
    const db = admin.firestore();
    const cols = await db.listCollections();
    console.log('Firestore collections (count):', cols.length);
    process.exit(0);
  } catch (e) {
    console.error('Admin SDK smoke test failed:', e.message || e);
    process.exit(2);
  }
})();
