<template>
  <div class="trait-forge">
    <h3>Create Trait</h3>
    <input v-model="traitName" placeholder="Trait name" />
    <select v-model="traitTone">
      <option>Empowered</option>
      <option>Focused</option>
      <option>Resonant</option>
    </select>
    <button @click="forge">Forge Trait</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      traitName: '',
      traitTone: 'Empowered'
    }
  },
  methods: {
    forge() {
      console.log(`Trait forged: ${this.traitName} (${this.traitTone})`)
      // Add to emotionalIndex.json or memoryHooks.ts
    }
  }
}
</script>
