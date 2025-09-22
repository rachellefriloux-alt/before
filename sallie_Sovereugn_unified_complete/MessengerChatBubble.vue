<template>
  <div :class="['messenger-chat-bubble', isSallie ? 'sallie' : 'user', mode]">
    <div class="bubble-content">
      <span v-if="isSallie" class="avatar"><img :src="avatar.url" alt="Sallie Avatar" /></span>
      <span class="message-text" v-html="styledMessage"></span>
    </div>
  </div>
</template>
<script>
import AssetManager from '../../core/AssetManager.js';
export default {
  name: 'MessengerChatBubble',
  props: {
    message: { type: Object, required: true },
    mode: { type: String, default: 'loyal' },
    isSallie: { type: Boolean, default: false },
    personaState: { type: Object, default: () => ({}) }
  },
  computed: {
    avatar() {
      // Persona-driven avatar selection
      if (this.personaState && this.personaState.mode) {
        return AssetManager.getAssetsByMode(this.personaState.mode)[0] || AssetManager.getAsset('avatar_loyal');
      }
      return AssetManager.getAssetsByMode(this.mode)[0] || AssetManager.getAsset('avatar_loyal');
    },
    styledMessage() {
      // Expanded emotional cues and behavioral mapping
      let text = this.message.text;
      switch (this.message.cue) {
        case 'decisive':
          text = `<b>${text}</b>`;
          break;
        case 'empathetic':
          text = `<i>${text}</i>`;
          break;
        case 'sarcastic':
          text = `<span class='underline-flick'>${text}</span>`;
          break;
        case 'strategic':
          text = `<span style='color:#2979FF'>${text}</span>`;
          break;
        case 'playful':
          text = `<span style='color:#FF7043;font-style:italic;'>${text}</span>`;
          break;
        case 'resourceful':
          text = `<span style='color:#90A4AE;'>${text}</span>`;
          break;
        case 'critical':
          text = `<span style='color:#D32F2F;font-weight:bold;'>${text}</span>`;
          break;
        case 'calm':
          text = `<span style='color:#00BFA5;'>${text}</span>`;
          break;
        case 'alert':
          text = `<span style='color:#2979FF;font-weight:bold;'>${text}</span>`;
          break;
        case 'celebrate':
          text = `<span style='color:#FFD54F;font-weight:bold;'>${text}</span>`;
          break;
        default:
          break;
      }
      return text;
    }
  }
};
</script>
<style scoped>
.messenger-chat-bubble {
  display: flex;
  align-items: flex-end;
  margin-bottom: 8px;
  max-width: 80%;
}
.messenger-chat-bubble.sallie {
  flex-direction: row;
  justify-content: flex-start;
}
.messenger-chat-bubble.user {
  flex-direction: row-reverse;
  justify-content: flex-end;
}
.bubble-content {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(90deg, #00BFA5 0%, #FFD54F 100%);
  border-radius: 16px;
  padding: 12px 18px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  font-size: 16px;
  color: #0E1116;
  position: relative;
  animation: bubbleReveal 0.8s cubic-bezier(0.25,0.1,0.25,1);
}
.messenger-chat-bubble.user .bubble-content {
  background: #ECEFF1;
  color: #41505A;
}
.avatar img {
  width: 32px;
  height: 32px;
  border-radius: 20%;
  margin-right: 8px;
}
.underline-flick {
  text-decoration: underline;
  animation: flick 0.6s linear;
}
@keyframes flick {
  0% { text-decoration-color: #FF7043; }
  50% { text-decoration-color: #FFD54F; }
  100% { text-decoration-color: #00BFA5; }
}
@keyframes bubbleReveal {
  0% { opacity: 0; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1); }
}
</style>


<template>
  <div :class="['messenger-chat-bubble', isSallie ? 'sallie' : 'user', mode]">
    <div class="bubble-content">
      <span v-if="isSallie" class="avatar"><img :src="avatar.url" alt="Sallie Avatar" /></span>
      <span class="message-text" v-html="styledMessage"></span>
    </div>
  </div>
</template>
<script>
import AssetManager from '../../core/AssetManager.js';
export default {
  name: 'MessengerChatBubble',
  props: {
    message: { type: Object, required: true },
    mode: { type: String, default: 'loyal' },
    isSallie: { type: Boolean, default: false },
    personaState: { type: Object, default: () => ({}) }
  },
  computed: {
    avatar() {
      // Persona-driven avatar selection
      if (this.personaState && this.personaState.mode) {
        return AssetManager.getAssetsByMode(this.personaState.mode)[0] || AssetManager.getAsset('avatar_loyal');
      }
      return AssetManager.getAssetsByMode(this.mode)[0] || AssetManager.getAsset('avatar_loyal');
    },
    styledMessage() {
      // Expanded emotional cues and behavioral mapping
      let text = this.message.text;
      switch (this.message.cue) {
        case 'decisive':
          text = `<b>${text}</b>`;
          break;
        case 'empathetic':
          text = `<i>${text}</i>`;
          break;
        case 'sarcastic':
          text = `<span class='underline-flick'>${text}</span>`;
          break;
        case 'strategic':
          text = `<span style='color:#2979FF'>${text}</span>`;
          break;
        case 'playful':
          text = `<span style='color:#FF7043;font-style:italic;'>${text}</span>`;
          break;
        case 'resourceful':
          text = `<span style='color:#90A4AE;'>${text}</span>`;
          break;
        case 'critical':
          text = `<span style='color:#D32F2F;font-weight:bold;'>${text}</span>`;
          break;
        case 'calm':
          text = `<span style='color:#00BFA5;'>${text}</span>`;
          break;
        case 'alert':
          text = `<span style='color:#2979FF;font-weight:bold;'>${text}</span>`;
          break;
        case 'celebrate':
          text = `<span style='color:#FFD54F;font-weight:bold;'>${text}</span>`;
          break;
        default:
          break;
      }
      return text;
    }
  }
};
</script>
<style scoped>
.messenger-chat-bubble {
  display: flex;
  align-items: flex-end;
  margin-bottom: 8px;
  max-width: 80%;
}
.messenger-chat-bubble.sallie {
  flex-direction: row;
  justify-content: flex-start;
}
.messenger-chat-bubble.user {
  flex-direction: row-reverse;
  justify-content: flex-end;
}
.bubble-content {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(90deg, #00BFA5 0%, #FFD54F 100%);
  border-radius: 16px;
  padding: 12px 18px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  font-size: 16px;
  color: #0E1116;
  position: relative;
  animation: bubbleReveal 0.8s cubic-bezier(0.25,0.1,0.25,1);
}
.messenger-chat-bubble.user .bubble-content {
  background: #ECEFF1;
  color: #41505A;
}
.avatar img {
  width: 32px;
  height: 32px;
  border-radius: 20%;
  margin-right: 8px;
}
.underline-flick {
  text-decoration: underline;
  animation: flick 0.6s linear;
}
@keyframes flick {
  0% { text-decoration-color: #FF7043; }
  50% { text-decoration-color: #FFD54F; }
  100% { text-decoration-color: #00BFA5; }
}
@keyframes bubbleReveal {
  0% { opacity: 0; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1); }
}
</style>


/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\ui\components\MessengerChatBubble.vue) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\MessengerChatBubble.vue) */
/* --- dest (C:\Users\chell\Desktop\newsal\ui\components\MessengerChatBubble.vue) --- */
<!-- Merged master for logical file: ui\components\MessengerChatBubble
Sources:
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\MessengerChatBubble.vue (hash:411B8A0C670BD1C08971B020A45B6B8C74BF4600564BE0FAD085C7CBC60C9A11)
 - C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\MessengerChatBubble.vue (hash:ED843125D373DF8A09A937E0CD6A90FE7AC6AEEF8DBDBAA6F25E022FD41A21F2)
 -->

<!-- ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\MessengerChatBubble.vue | ext: .vue | sha: 411B8A0C670BD1C08971B020A45B6B8C74BF4600564BE0FAD085C7CBC60C9A11 ---- -->
[BINARY FILE - original copied to merged_sources: ui\components\MessengerChatBubble.vue]
<!-- ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\MessengerChatBubble.vue | ext: .vue | sha: ED843125D373DF8A09A937E0CD6A90FE7AC6AEEF8DBDBAA6F25E022FD41A21F2 ---- -->
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\MessengerChatBubble.vue --- */
<template>
  <div :class="['messenger-chat-bubble', isSallie ? 'sallie' : 'user', mode]">
    <div class="bubble-content">
      <span v-if="isSallie" class="avatar"><img :src="avatar.url" alt="Sallie Avatar" /></span>
      <span class="message-text" v-html="styledMessage"></span>
    </div>
  </div>
</template>
<script>
import AssetManager from '../../core/AssetManager.js';
export default {
  name: 'MessengerChatBubble',
  props: {
    message: { type: Object, required: true },
    mode: { type: String, default: 'loyal' },
    isSallie: { type: Boolean, default: false },
    personaState: { type: Object, default: () => ({}) }
  },
  computed: {
    avatar() {
      // Persona-driven avatar selection
      if (this.personaState && this.personaState.mode) {
        return AssetManager.getAssetsByMode(this.personaState.mode)[0] || AssetManager.getAsset('avatar_loyal');
      }
      return AssetManager.getAssetsByMode(this.mode)[0] || AssetManager.getAsset('avatar_loyal');
    },
    styledMessage() {
      // Expanded emotional cues and behavioral mapping
      let text = this.message.text;
      switch (this.message.cue) {
        case 'decisive':
          text = `<b>${text}</b>`;
          break;
        case 'empathetic':
          text = `<i>${text}</i>`;
        case 'sarcastic':
          text = `<span class='underline-flick'>${text}</span>`;
        case 'strategic':
          text = `<span style='color:#2979FF'>${text}</span>`;
        case 'playful':
          text = `<span style='color:#FF7043;font-style:italic;'>${text}</span>`;
        case 'resourceful':
          text = `<span style='color:#90A4AE;'>${text}</span>`;
        case 'critical':
          text = `<span style='color:#D32F2F;font-weight:bold;'>${text}</span>`;
        case 'calm':
          text = `<span style='color:#00BFA5;'>${text}</span>`;
        case 'alert':
          text = `<span style='color:#2979FF;font-weight:bold;'>${text}</span>`;
        case 'celebrate':
          text = `<span style='color:#FFD54F;font-weight:bold;'>${text}</span>`;
        default:
      return text;
    }
  }
};
</script>
<style scoped>
.messenger-chat-bubble {
  display: flex;
  align-items: flex-end;
  margin-bottom: 8px;
  max-width: 80%;
}
.messenger-chat-bubble.sallie {
  flex-direction: row;
  justify-content: flex-start;
.messenger-chat-bubble.user {
  flex-direction: row-reverse;
  justify-content: flex-end;
.bubble-content {
  align-items: center;
  gap: 8px;
  background: linear-gradient(90deg, #00BFA5 0%, #FFD54F 100%);
  border-radius: 16px;
  padding: 12px 18px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  font-size: 16px;
  color: #0E1116;
  position: relative;
  animation: bubbleReveal 0.8s cubic-bezier(0.25,0.1,0.25,1);
.messenger-chat-bubble.user .bubble-content {
  background: #ECEFF1;
  color: #41505A;
.avatar img {
  width: 32px;
  height: 32px;
  border-radius: 20%;
  margin-right: 8px;
.underline-flick {
  text-decoration: underline;
  animation: flick 0.6s linear;
@keyframes flick {
  0% { text-decoration-color: #FF7043; }
  50% { text-decoration-color: #FFD54F; }
  100% { text-decoration-color: #00BFA5; }
@keyframes bubbleReveal {
  0% { opacity: 0; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1); }
</style>
