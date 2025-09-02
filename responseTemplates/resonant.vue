<template>
  <div class="response resonant">
    <h3>Resonant Response</h3>
    <p>{{ message }}</p>
  </div>
</template>

<script>
export default {
  name: 'ResonantResponse',
  props: {
    message: {
      type: String,
      default: 'What value matters most here? I see you.'
    }
  }
};
</script>

<style scoped>
.response.resonant {
  background: #f0f4ff;
  padding: 16px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  margin-bottom: 16px;
}
</style>
