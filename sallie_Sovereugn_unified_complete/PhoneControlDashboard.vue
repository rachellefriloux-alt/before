/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Phone Control Dashboard UI - integrates all phone control subsystems into a unified dashboard for user interaction.
 * Got it, love.
 */

<template>
  <div class="phone-control-dashboard">
    <CallPanel :manager="phoneControlManager.callManager" />
    <MessagePanel :manager="phoneControlManager.messageManager" />
    <AppPanel :manager="phoneControlManager.appManager" />
    <SystemPanel :manager="phoneControlManager.systemSettingsManager" />
    <MediaPanel :manager="phoneControlManager.mediaManager" />
    <CalendarPanel :manager="phoneControlManager.calendarManager" />
    <LocationPanel :manager="phoneControlManager.locationManager" />
    <ScreenPanel :manager="phoneControlManager.screenAnalyzer" />
  </div>
</template>

<script setup>
import CallPanel from './CallPanel.vue'
import MessagePanel from './MessagePanel.vue'
import AppPanel from './AppPanel.vue'
import SystemPanel from './SystemPanel.vue'
import MediaPanel from './MediaPanel.vue'
import CalendarPanel from './CalendarPanel.vue'
import LocationPanel from './LocationPanel.vue'
import ScreenPanel from './ScreenPanel.vue'

import { inject } from 'vue'
const phoneControlManager = inject('phoneControlManager')
</script>

<style scoped>
.phone-control-dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  padding: 2rem;
}
</style>
