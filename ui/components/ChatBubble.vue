<!-- Migrated and adapted from sallie_1.00/ui/components/ChatBubble.vue -->
<template>
  <div class="chat-bubble" :class="{ 'user': isUser, 'sallie': !isUser }">
    <span>{{ message }}</span>
  </div>
</template>
<script>
export default {
  props: {
    message: String,
    isUser: Boolean
  }
}
</script>
<style scoped>
.chat-bubble {
  padding: 1em;
  border-radius: 16px;
  margin: 0.5em 0;
  background: var(--background-tertiary, #334155);
  color: var(--text-primary, #f8fafc);
  box-shadow: var(--shadow-sm, 0 1px 2px 0 rgb(0 0 0 / 0.05));
  max-width: 70%;
}
.chat-bubble.user {
  background: var(--sallie-accent, #06b6d4);
  color: #fff;
  align-self: flex-end;
}
.chat-bubble.sallie {
  background: var(--sallie-primary, #6366f1);
  color: #fff;
  align-self: flex-start;
}
</style>
