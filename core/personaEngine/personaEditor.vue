<template>
  <div class="persona-editor">
    <h2>Edit Persona Profiles</h2>
  <form @submit.prevent="savePersona">
      <label>Persona Name:
  <input v-model="persona.name" type="text" />
      </label>
      <label>Tone:
  <input v-model="persona.tone" type="text" />
      </label>
      <label>Validation:
  <input v-model="persona.validation" type="text" />
      </label>
      <label>Fallback:
  <input v-model="persona.fallback" type="text" />
      </label>
      <label>Lexicon:
        <textarea v-model="lexiconText"></textarea>
      </label>
  <button type="submit">Save</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'PersonaEditor',
  emits: ['save'],
  data() {
    return {
      persona: {
        name: '',
        tone: '',
        validation: '',
        fallback: ''
      },
      lexiconText: ''
    };
  },
  methods: {
    savePersona() {
  // Placeholder: Save logic for persona profile
  this.$emit('save', this.persona)
      alert('Persona saved!');
    }
  }
};
</script>

<style scoped>
.persona-editor {
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
