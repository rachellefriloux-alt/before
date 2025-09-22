<template>
  <div class="skill-manager">
    <h3>Custom Skills & Plugins</h3>
    <input v-model="newSkill" placeholder="Skill name" />
    <button @click="addSkill">Add Skill</button>
    <ul>
      <li v-for="skill in skills" :key="skill.id">{{ skill.name }}</li>
    </ul>
    <div v-if="skills.length === 0">No skills added.</div>
  </div>
</template>
<script>
export default {
  data() {
    return { skills: [], newSkill: '' };
  },
  mounted() {
    const raw = localStorage.getItem('sallie:skills');
    if (raw) {
      try {
        this.skills = JSON.parse(raw);
      } catch {}
    }
  },
  methods: {
    addSkill() {
      if (!this.newSkill.trim()) return;
      const skill = { id: Date.now(), name: this.newSkill.trim() };
      this.skills.push(skill);
      localStorage.setItem('sallie:skills', JSON.stringify(this.skills));
      this.newSkill = '';
    }
  }
}
</script>
<style>
.skill-manager { margin: 12px 0; }
</style>
