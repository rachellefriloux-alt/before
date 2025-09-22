<template>
  <div class="response fallback">
    <h3>Fallback Response</h3>
    <p>{{ message }}</p>
  </div>
</template>

<script>
export default {
  name: 'FallbackResponse',
  props: {
    message: {
      type: String,
      default: 'Let’s pause this for now. We can revisit when you’re ready.'
    }
  }
};
</script>

<style scoped>
.response.fallback {
  background: #fffbe6;
  padding: 16px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  margin-bottom: 16px;
}
</style>
