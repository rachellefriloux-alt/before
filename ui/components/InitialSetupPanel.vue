<template>
  <div class="initial-setup-panel" :class="theme" aria-label="Initial App Setup" tabindex="0">
    <h2>Initial App Setup</h2>
    <form @submit.prevent="submitSetup">
      <label>Email: <input v-model="email" type="email" required aria-label="Email" /></label>
      <label>Password: <input v-model="password" type="password" required aria-label="Password" /></label>
      <label>Name: <input v-model="name" required aria-label="Name" /></label>
      <label>Persona: <input v-model="persona" required aria-label="Persona" /></label>
      <label>Preferred Theme: <input v-model="theme" required aria-label="Preferred Theme" /></label>
      <label>Consent: <input type="checkbox" v-model="consent" aria-label="Consent" /> I agree to terms</label>
      <button type="submit" aria-label="Complete Setup">Complete Setup</button>
      <p v-if="error" class="error" aria-live="assertive">{{ error }}</p>
    </form>
  </div>
</template>
<script>
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, setDoc, doc } from 'firebase/firestore';
export default {
  name: 'InitialSetupPanel',
  props: {
    firebaseApp: { type: Object, required: true },
    theme: { type: String, default: 'light' }
  },
  data() {
    return {
      email: '',
      password: '',
      name: '',
      persona: '',
      theme: '',
      consent: false,
      error: '',
      analytics: []
    };
  },
  methods: {
    async submitSetup() {
      this.error = '';
      if (!this.consent) {
        this.error = 'Consent required.';
        this.logAnalytics('error', { error: this.error });
        return;
      }
      try {
        const auth = getAuth(this.firebaseApp);
        const userCred = await createUserWithEmailAndPassword(auth, this.email, this.password);
        const db = getFirestore(this.firebaseApp);
        await setDoc(doc(db, 'users', userCred.user.uid), {
          name: this.name,
          persona: this.persona,
          theme: this.theme,
          consent: this.consent,
          email: this.email,
          onboardingComplete: true,
          onboardingTimestamp: Date.now()
        });
        this.logAnalytics('setup_complete', { user: userCred.user.uid });
        this.$emit('setupComplete', userCred.user);
      } catch (e) {
        this.error = e.message;
        this.logAnalytics('error', { error: this.error });
      }
    },
    logAnalytics(event, data) {
      this.analytics.push({ event, data, timestamp: Date.now() });
    }
  }
};
</script>
<style>
.initial-setup-panel { padding: 16px; background: #f3f3f3; border-radius: 8px; margin-bottom: 16px; }
.initial-setup-panel label { display: block; margin-bottom: 8px; }
</style>
