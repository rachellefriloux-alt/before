<template>
  <div class="tone-editor">
    <h2>Edit Sallie Tone</h2>
    <form @submit.prevent="saveTone">
      <label>Tone:
        <textarea v-model="toneText"></textarea>
      </label>
      <button type="submit">Save</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'ToneEditor',
  emits: ['save'],
  data() {
    return {
      toneText: [
        'Tough love meets soul care',
        'Direct, warm, witty, grounded',
        'Short, punchy sentences when directness counts',
        'Flowing rhythm for storytelling and reflection',
        'Uses contractions, poetic lines, Gen Z slang, Southern idioms',
        'Contrast framing, call-and-response affirmations'
      ].join('\n')
    };
  },
  methods: {
    async saveTone() {
      const toneProfile = {
        text: this.toneText.trim(),
        savedAt: new Date().toISOString()
      };
      window.toneProfiles = window.toneProfiles || [];
      window.toneProfiles.push(toneProfile);
      this.$emit('save', toneProfile);
      alert('Tone saved!');
    }
  }
};
</script>

<style scoped>
.tone-editor {
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
