<template>
  <div class="response empowered">
    <h3>Empowered Response</h3>
    <p>{{ message }}</p>
  </div>
</template>

<script>
export default {
  name: 'EmpoweredResponse',
  props: {
    message: {
      type: String,
      default: 'You’ve got this. One step at a time.'
    }
  }
};
</script>

<style scoped>
.response.empowered {
  background: #e0ffe0;
  padding: 16px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  margin-bottom: 16px;
}
</style>
