<template>
  <div class="upgrade-matrix">
    <h2>Upgrade Prioritization</h2>
    <ul>
      <li v-for="upgrade in upgrades">{{ upgrade.task }} — <em>{{ upgrade.toneImpact }}</em></li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      upgrades: [
        { task: 'Integrate value triggers', toneImpact: 'High Resonance' },
        { task: 'Verify fallback scaffolds', toneImpact: 'Clarity Boost' },
        { task: 'Tone-lock emotional protocols', toneImpact: 'Legacy Sync' }
      ]
    }
  }
}
</script>
