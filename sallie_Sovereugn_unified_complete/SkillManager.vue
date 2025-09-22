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


/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\ui\components\skills\SkillManager.vue) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\skills\SkillManager.vue) */
/* --- dest (C:\Users\chell\Desktop\newsal\ui\components\skills\SkillManager.vue) --- */
<!-- Merged master for logical file: ui\components\skills\SkillManager
Sources:
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\skills\SkillManager.vue (hash:0DD0475B326BE999D248032BE40085BF992C6EB51060F2BDBBCCBCE56F5B6F56)
 - C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\skills\SkillManager.vue (hash:BE611EC9E5AFACA4A2566F8AE2280A11FDBA436DDB5BB62DAB78EEA9C29C0C6A)
 -->

<!-- ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\skills\SkillManager.vue | ext: .vue | sha: 0DD0475B326BE999D248032BE40085BF992C6EB51060F2BDBBCCBCE56F5B6F56 ---- -->
[BINARY FILE - original copied to merged_sources: ui\components\skills\SkillManager.vue]
<!-- ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\skills\SkillManager.vue | ext: .vue | sha: BE611EC9E5AFACA4A2566F8AE2280A11FDBA436DDB5BB62DAB78EEA9C29C0C6A ---- -->
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\skills\SkillManager.vue --- */
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
  methods: {
    addSkill() {
      if (!this.newSkill.trim()) return;
      const skill = { id: Date.now(), name: this.newSkill.trim() };
      this.skills.push(skill);
      localStorage.setItem('sallie:skills', JSON.stringify(this.skills));
      this.newSkill = '';
  }
}
</script>
<style>
.skill-manager { margin: 12px 0; }
</style>
