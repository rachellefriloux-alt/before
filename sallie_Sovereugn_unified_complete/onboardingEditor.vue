<template>
  <div class="onboarding-editor">
    <h2>Edit Onboarding Flow</h2>
    <form @submit.prevent="saveStep">
      <label>Step:
        <input v-model="step" type="text" />
      </label>
      <label>Description:
        <textarea v-model="description"></textarea>
      </label>
      <button type="submit">Save Step</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'OnboardingEditor',
  emits: ['save'],
  data() {
    return {
      step: '',
      description: ''
    };
  },
  methods: {
    saveStep() {
      const record = {
        step: this.step.trim(),
        description: this.description.trim(),
        savedAt: new Date().toISOString()
      };
      if (!record.step) {
        alert('Step name required');
        return;
      }
      window.onboardingSteps = window.onboardingSteps || [];
      window.onboardingSteps.push(record);
      this.$emit('save', record);
      alert('Onboarding step saved!');
      this.step = '';
      this.description = '';
    }
  }
};
</script>

<style scoped>
.onboarding-editor {
  background: #fffbe6;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
}
form label {
  display: block;
  margin-bottom: 12px;
}
form input, form textarea {
  width: 100%;
  padding: 6px;
  margin-top: 4px;
  border-radius: 6px;
  border: 1px solid #ccc;
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
