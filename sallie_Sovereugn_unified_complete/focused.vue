<template>
  <div class="response focused">
    <h3>Focused Response</h3>
    <p>{{ message }}</p>
  </div>
</template>

<script>
export default {
  name: 'FocusedResponse',
  props: {
    message: {
      type: String,
      default: 'Let’s map it. Proceed as planned.'
    }
  }
};
</script>

<style scoped>
.response.focused {
  background: #e0e7ff;
  padding: 16px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  margin-bottom: 16px;
}
</style>
