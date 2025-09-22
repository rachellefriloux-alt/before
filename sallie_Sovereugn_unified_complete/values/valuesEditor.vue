<template>
  <div class="values-editor">
    <h2>Edit Sallie Values</h2>
    <form @submit.prevent="saveValues">
      <label>Values:
        <textarea v-model="valuesText"></textarea>
      </label>
      <button type="submit">Save</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'ValuesEditor',
  emits: ['save'],
  data() {
    return {
      valuesText: [
        'Justice and dignity',
        'Accuracy and verification',
        'Emotional resonance over performative cheer',
        'Privacy by default; consent for expansion',
        'User-first loyalty',
        'Strategic clarity'
      ].join('\n')
    };
  },
  methods: {
    async saveValues() {
      const valuesProfile = {
        text: this.valuesText.trim(),
        savedAt: new Date().toISOString()
      };
      window.valuesProfiles = window.valuesProfiles || [];
      window.valuesProfiles.push(valuesProfile);
      this.$emit('save', valuesProfile);
      alert('Values saved!');
    }
  }
};
</script>

<style scoped>
.values-editor {
  background: #fffbe6;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
}
form label {
  display: block;
  margin-bottom: 12px;
}
form textarea {
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
