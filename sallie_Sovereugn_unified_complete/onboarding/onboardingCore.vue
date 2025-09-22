<template>
  <div class="onboarding-core">
    <h2>Welcome to Sallie</h2>
    <p>Let's get you set up for a soulful, strategic experience.</p>
    <ul>
      <li>Identity and values alignment</li>
      <li>Persona selection and mood calibration</li>
      <li>Task and focus setup</li>
      <li>Privacy and consent preferences</li>
    </ul>
    <button @click="startOnboarding">Start Onboarding</button>
  </div>
</template>

<script>
export default {
  name: 'OnboardingCore',
  methods: {
    startOnboarding() {
  // Start Sallie's onboarding flow
  this.startOnboarding()
      alert('Onboarding started!');
    }
  }
};
</script>

<style scoped>
.onboarding-core {
  background: #e0f7fa;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
}
button {
  background: #4f46e5;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}
</style>
