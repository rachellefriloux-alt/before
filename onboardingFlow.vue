<template>
  <section class="onboarding-flow">
    <h2>Welcome, Rachelle</h2>
    <TraitBuilder :traits="traits" />
    <ToneSelector :defaultTone="defaultTone" />
    <LegacyMapper :hooks="legacyHooks" />
  </section>
</template>

<script>
import TraitBuilder from './traitForge.vue'
import ToneSelector from './voiceSettings.vue'
import LegacyMapper from './identityCore.json'

export default {
  name: 'OnboardingFlow',
  data() {
    return {
      traits: ['loyalty', 'clarity', 'modularIntegrity'],
      defaultTone: 'Empowered',
      legacyHooks: ['Justice-driven', 'Dignity-first', 'No assumptions']
    }
  }
}
</script>
