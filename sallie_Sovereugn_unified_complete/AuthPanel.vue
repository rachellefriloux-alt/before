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


/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\ui\components\AuthPanel.vue) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\AuthPanel.vue) */
/* --- dest (C:\Users\chell\Desktop\newsal\ui\components\AuthPanel.vue) --- */
<!-- Merged master for logical file: ui\components\AuthPanel
Sources:
 - C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\AuthPanel.vue (hash:65F44CA9ECEAACF586E5917B17DEF5F21BC1A0338786EC2CF3DCFB43C48E083B)
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\AuthPanel.vue (hash:BAF6BA6EE84A36717506F7DD338FC2AF64F1006ABA561BD80AECC70F045CC2FD)
 -->

<!-- ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\AuthPanel.vue | ext: .vue | sha: 65F44CA9ECEAACF586E5917B17DEF5F21BC1A0338786EC2CF3DCFB43C48E083B ---- -->
[BINARY FILE - original copied to merged_sources: ui\components\AuthPanel.vue]
<!-- ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\AuthPanel.vue | ext: .vue | sha: BAF6BA6EE84A36717506F7DD338FC2AF64F1006ABA561BD80AECC70F045CC2FD ---- -->
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\AuthPanel.vue --- */
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
  mounted() {
    const auth = getAuth(this.firebaseApp);
    onAuthStateChanged(auth, (user) => {
      this.user = user;
      this.logAnalytics('auth_state', { user });
    });
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
        this.user = await createUserWithEmailAndPassword(auth, this.email, this.password);
        this.logAnalytics('register', { email: this.email });
    async logout() {
      await signOut(auth);
      this.user = null;
      this.logAnalytics('logout', {});
    logAnalytics(event, data) {
      this.analytics.push({ event, data, timestamp: Date.now() });
    }
  }
};
</script>
<style>
.auth-panel { padding: 12px; background: #e0e7ff; border-radius: 8px; margin-bottom: 12px; }
</style>
