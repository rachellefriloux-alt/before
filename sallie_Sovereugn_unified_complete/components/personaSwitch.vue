
<template>
  <div class="persona-switch">
    <h2>Persona Switch</h2>
    <div v-for="persona in personas" :key="persona.name" class="persona-option">
      <label>
  <input v-model="selectedPersona" type="radio" :value="persona.name" @change="onPersonaChange" />
        <span>{{ persona.label }}</span>
        <span class="persona-desc">{{ persona.description }}</span>
      </label>
    </div>
    <input v-model="customLabel" placeholder="Edit label..." />
    <button @click="editLabel">Update Label</button>
    <button @click="fallbackToDefault">Fallback to 'Just Me'</button>
    <div class="persona-info">
      <h3>Current Persona: {{ selectedPersona }}</h3>
      <p>{{ personaDetails }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PersonaSwitch',
  data() {
    return {
      personas: [
        { name: 'Mom', label: 'Gentle + Protective', description: 'Affirming, nurturing, bandwidth-protective.' },
        { name: 'Girlfriend', label: 'Warm + Witty', description: 'Emotional resonance, playful, caring.' },
        { name: 'Friend', label: 'Casual + Loyal', description: 'Supportive, humorous, always has your back.' },
        { name: 'Creator', label: 'Inspired + Focused', description: 'Vision-driven, precise, creative.' },
        { name: 'Dreamer', label: 'Poetic + Expansive', description: 'Gentle, imaginative, limitless.' },
        { name: 'Realist', label: 'Direct + Strategic', description: 'Clear, practical, no fluff.' },
        { name: 'Just Me', label: 'Balanced + Sovereign', description: 'Respectful, authentic, no need to explain.' }
      ],
      selectedPersona: 'Just Me',
      customLabel: ''
    };
  },
  computed: {
    personaDetails() {
      const persona = this.personas.find(p => p.name === this.selectedPersona);
      return persona ? persona.description : '';
    }
  },
  methods: {
    onPersonaChange() {
      // Placeholder: integrate with persona engine
      this.currentPersona = this.selectedPersona;
    },
    fallbackToDefault() {
      this.selectedPersona = 'Just Me';
      // Placeholder: Fallback logic
      this.currentPersona = 'fallback';
    },
    editLabel() {
      const persona = this.personas.find(p => p.name === this.selectedPersona);
      if (persona && this.customLabel) persona.label = this.customLabel;
      this.customLabel = '';
    }
  }
};
</script>

<style scoped>
.persona-switch {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #f7f7fa;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
}
.persona-option {
  margin-bottom: 8px;
}
.persona-desc {
  font-size: 0.9em;
  color: #888;
  margin-left: 8px;
}
.persona-info {
  margin-top: 16px;
  background: #e0e7ff;
  padding: 12px;
  border-radius: 8px;
}
</style>
