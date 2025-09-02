// updateMemory.js
// Updates Sallie's memory with onboarding and user profile data

// Simple in-memory store used during development to avoid undefined globals.
const memoryStore = {
  profiles: [],
  steps: {}
};

export default {
  updateProfile(profile) {
    if (!profile || !profile.name) return 'Invalid profile';
    memoryStore.profiles.push({ ...profile, updatedAt: new Date().toISOString() });
    return `Profile updated for ${profile.name}`;
  },
  updateStep(step, status) {
    if (!step) return 'Invalid step';
    memoryStore.steps[step] = { status, updatedAt: new Date().toISOString() };
    return `Step '${step}' marked as ${status}`;
  }
};
