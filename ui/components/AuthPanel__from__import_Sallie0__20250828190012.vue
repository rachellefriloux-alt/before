/*
 * Persona: Tough love meets soul care.
 * Module: AuthPanel
 * Intent: Handle functionality for AuthPanel
 * Provenance-ID: 958c0cbe-f5e8-4e43-a931-3db52e46745f
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

<template>
  <div class="auth-panel">
    <h2>User Authentication</h2>
    <div v-if="!user">
      <input v-model="email" placeholder="Email" />
      <input v-model="password" type="password" placeholder="Password" />
      <button @click="login">Login</button>
      <button @click="register">Register</button>
      <p v-if="error">{{ error }}</p>
    </div>
    <div v-else>
      <p>Welcome, {{ user.email }}</p>
      <button @click="logout">Logout</button>
    </div>
  </div>
</template>
<script>
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
export default {
  name: 'AuthPanel',
  props: {
    firebaseApp: { type: Object, required: true },
    theme: { type: String, default: 'light' }
  },
  data() {
    return {
      email: '',
      password: '',
      user: null,
      error: '',
      analytics: []
    };
  },
  mounted() {
    const auth = getAuth(this.firebaseApp);
    onAuthStateChanged(auth, (user) => {
      this.user = user;
      this.logAnalytics('auth_state', { user });
    });
  },
  methods: {
    async login() {
      this.error = '';
      const auth = getAuth(this.firebaseApp);
      try {
        this.user = await signInWithEmailAndPassword(auth, this.email, this.password);
        this.logAnalytics('login', { email: this.email });
      } catch (e) {
        this.error = e.message;
        this.logAnalytics('error', { error: this.error });
      }
    },
    async register() {
      this.error = '';
      const auth = getAuth(this.firebaseApp);
      try {
        this.user = await createUserWithEmailAndPassword(auth, this.email, this.password);
        this.logAnalytics('register', { email: this.email });
      } catch (e) {
        this.error = e.message;
        this.logAnalytics('error', { error: this.error });
      }
    },
    async logout() {
      const auth = getAuth(this.firebaseApp);
      await signOut(auth);
      this.user = null;
      this.logAnalytics('logout', {});
    },
    logAnalytics(event, data) {
      this.analytics.push({ event, data, timestamp: Date.now() });
    }
  }
};
</script>
<style>
.auth-panel { padding: 12px; background: #e0e7ff; border-radius: 8px; margin-bottom: 12px; }
</style>
