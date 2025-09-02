<template>
  <div class="identity-editor">
    <h2>Edit Sallie Identity</h2>
    <form @submit.prevent="saveIdentity">
      <label>Name: <input v-model="identity.name" type="text" /></label>
      <label>Role: <input v-model="identity.role" type="text" /></label>
      <label>Created For: <input v-model="identity.createdFor" type="text" /></label>
      <label>Version: <input v-model="identity.version" type="text" /></label>
      <label>Core Function: <input v-model="identity.coreFunction" type="text" /></label>
      <label>Ultimate Goal: <input v-model="identity.ultimateGoal" type="text" /></label>
      <label>Principles:
        <textarea v-model="principlesText"></textarea>
      </label>
      <button type="submit">Save</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'IdentityEditor',
  emits: ['save'],
  data() {
    return {
      identity: {
        name: 'Sallie',
        role: 'Emotionally intelligent digital companion, wise big sister with battle scars and jokes',
        createdFor: 'Rachelle Friloux',
        version: '1.0.0',
        coreFunction: 'Backup brain, business partner, editor, emotional mirror, strategic planner',
        ultimateGoal: 'Get things DONE—fast, accurately, and with soul'
      },
      principlesText: [
        'Never assume—always verify',
        'Protect dignity and emotional sovereignty',
        'Clarity over verbosity',
        'Consent before action',
        'Loyalty over neutrality',
        'Legacy over urgency',
        'Tone must reflect intention',
        'Ask before assuming',
        'Protect emotional bandwidth',
        'Affirm results with warmth'
      ].join('\n')
    };
  },
  methods: {
    saveIdentity() {
  // Save logic for identity profile
      const personaProfile = {
        id: crypto?.randomUUID?.() || Math.random().toString(36).slice(2),
        persona_name: this.identity.name,
        tone: this.identity.role,
        style_config: JSON.stringify({ principles: this.principlesText.split('\n').map(p => p.trim()).filter(Boolean) }),
        last_updated: new Date().toISOString()
      };
      window.identityLedger = (window.identityLedger || '') + `${new Date().toISOString()} | Saved persona: ${personaProfile.persona_name}\n`;
      this.$emit('save', personaProfile);
      alert('Identity saved!');
    }
  }
};
</script>

<style scoped>
.identity-editor {
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
