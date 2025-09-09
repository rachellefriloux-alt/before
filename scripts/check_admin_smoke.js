// Minimal Node smoke-test to verify Admin SDK initialization and Firestore access
// Usage: node scripts/check_admin_smoke.js

const admin = require('firebase-admin');
(async () => {
  try {
    admin.initializeApp({});
    const db = admin.firestore();
    await db.listCollections();
    process.exit(0);
  } catch (e) {
    // Admin SDK smoke test failed
    process.exit(2);
  }
})();
