<template>
  <div class="real-time-chat">
    <h2>Real-Time Chat</h2>
    <div class="chat-window">
      <div v-for="msg in messages" :key="msg.id" :class="['chat-msg', msg.sender]">
        <span class="sender">{{ msg.sender }}:</span> <span class="text">{{ msg.text }}</span>
      </div>
    </div>
    <input v-model="newMessage" @keyup.enter="send" placeholder="Type a message..." />
    <button @click="send">Send</button>
  </div>
</template>
<script>
import { getFirestore, collection, addDoc, onSnapshot } from 'firebase/firestore';
export default {
  name: 'RealTimeChat',
  props: {
    firebaseApp: { type: Object, required: true },
    theme: { type: String, default: 'light' }
  },
  data() {
    return {
      messages: [],
      newMessage: '',
      analytics: [],
      error: ''
    };
  },
  mounted() {
    const db = getFirestore(this.firebaseApp);
    const chatRef = collection(db, 'chat');
    onSnapshot(chatRef, (snapshot) => {
      this.messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      this.logAnalytics('chat_update', { count: this.messages.length });
    });
  },
  methods: {
    async send() {
      if (this.newMessage) {
        try {
          const db = getFirestore(this.firebaseApp);
          await addDoc(collection(db, 'chat'), { sender: 'user', text: this.newMessage, timestamp: Date.now() });
          this.logAnalytics('chat_send', { text: this.newMessage });
          this.newMessage = '';
        } catch (e) {
          this.error = 'Message send failed.';
          this.logAnalytics('error', { error: this.error });
        }
      }
    },
    logAnalytics(event, data) {
      this.analytics.push({ event, data, timestamp: Date.now() });
    }
  }
};
</script>
<style>
.real-time-chat { padding: 12px; background: #f0f9ff; border-radius: 8px; margin-bottom: 12px; }
.chat-window { max-height: 120px; overflow-y: auto; margin-bottom: 8px; }
.chat-msg { margin-bottom: 4px; }
.chat-msg.user { color: #6366f1; }
.chat-msg.sallie { color: #f59e42; }
.sender { font-weight: bold; }
.text { margin-left: 4px; }
</style>


<template>
  <div class="real-time-chat">
    <h2>Real-Time Chat</h2>
    <div class="chat-window">
      <div v-for="msg in messages" :key="msg.id" :class="['chat-msg', msg.sender]">
        <span class="sender">{{ msg.sender }}:</span> <span class="text">{{ msg.text }}</span>
      </div>
    </div>
    <input v-model="newMessage" @keyup.enter="send" placeholder="Type a message..." />
    <button @click="send">Send</button>
  </div>
</template>
<script>
import { getFirestore, collection, addDoc, onSnapshot } from 'firebase/firestore';
export default {
  name: 'RealTimeChat',
  props: {
    firebaseApp: { type: Object, required: true },
    theme: { type: String, default: 'light' }
  },
  data() {
    return {
      messages: [],
      newMessage: '',
      analytics: [],
      error: ''
    };
  },
  mounted() {
    const db = getFirestore(this.firebaseApp);
    const chatRef = collection(db, 'chat');
    onSnapshot(chatRef, (snapshot) => {
      this.messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      this.logAnalytics('chat_update', { count: this.messages.length });
    });
  },
  methods: {
    async send() {
      if (this.newMessage) {
        try {
          const db = getFirestore(this.firebaseApp);
          await addDoc(collection(db, 'chat'), { sender: 'user', text: this.newMessage, timestamp: Date.now() });
          this.logAnalytics('chat_send', { text: this.newMessage });
          this.newMessage = '';
        } catch (e) {
          this.error = 'Message send failed.';
          this.logAnalytics('error', { error: this.error });
        }
      }
    },
    logAnalytics(event, data) {
      this.analytics.push({ event, data, timestamp: Date.now() });
    }
  }
};
</script>
<style>
.real-time-chat { padding: 12px; background: #f0f9ff; border-radius: 8px; margin-bottom: 12px; }
.chat-window { max-height: 120px; overflow-y: auto; margin-bottom: 8px; }
.chat-msg { margin-bottom: 4px; }
.chat-msg.user { color: #6366f1; }
.chat-msg.sallie { color: #f59e42; }
.sender { font-weight: bold; }
.text { margin-left: 4px; }
</style>


/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\ui\components\RealTimeChat.vue) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\RealTimeChat.vue) */
/* --- dest (C:\Users\chell\Desktop\newsal\ui\components\RealTimeChat.vue) --- */
<!-- Merged master for logical file: ui\components\RealTimeChat
Sources:
 - C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\RealTimeChat.vue (hash:7E7AC9F692F430FC25B60823BC8E34E04ECD1320833FD06FA2DB013D027C91E5)
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\RealTimeChat.vue (hash:DCBF49151B15B1FDF044FE06F6675530F67CCC1249C6F8D260434F27825A9AF9)
 -->

<!-- ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\RealTimeChat.vue | ext: .vue | sha: 7E7AC9F692F430FC25B60823BC8E34E04ECD1320833FD06FA2DB013D027C91E5 ---- -->
[BINARY FILE - original copied to merged_sources: ui\components\RealTimeChat.vue]
<!-- ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\RealTimeChat.vue | ext: .vue | sha: DCBF49151B15B1FDF044FE06F6675530F67CCC1249C6F8D260434F27825A9AF9 ---- -->
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\RealTimeChat.vue --- */
<template>
  <div class="real-time-chat">
    <h2>Real-Time Chat</h2>
    <div class="chat-window">
      <div v-for="msg in messages" :key="msg.id" :class="['chat-msg', msg.sender]">
        <span class="sender">{{ msg.sender }}:</span> <span class="text">{{ msg.text }}</span>
      </div>
    </div>
    <input v-model="newMessage" @keyup.enter="send" placeholder="Type a message..." />
    <button @click="send">Send</button>
  </div>
</template>
<script>
import { getFirestore, collection, addDoc, onSnapshot } from 'firebase/firestore';
export default {
  name: 'RealTimeChat',
  props: {
    firebaseApp: { type: Object, required: true },
    theme: { type: String, default: 'light' }
  },
  data() {
    return {
      messages: [],
      newMessage: '',
      analytics: [],
      error: ''
    };
  mounted() {
    const db = getFirestore(this.firebaseApp);
    const chatRef = collection(db, 'chat');
    onSnapshot(chatRef, (snapshot) => {
      this.messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      this.logAnalytics('chat_update', { count: this.messages.length });
    });
  methods: {
    async send() {
      if (this.newMessage) {
        try {
          const db = getFirestore(this.firebaseApp);
          await addDoc(collection(db, 'chat'), { sender: 'user', text: this.newMessage, timestamp: Date.now() });
          this.logAnalytics('chat_send', { text: this.newMessage });
          this.newMessage = '';
        } catch (e) {
          this.error = 'Message send failed.';
          this.logAnalytics('error', { error: this.error });
        }
      }
    },
    logAnalytics(event, data) {
      this.analytics.push({ event, data, timestamp: Date.now() });
    }
  }
};
</script>
<style>
.real-time-chat { padding: 12px; background: #f0f9ff; border-radius: 8px; margin-bottom: 12px; }
.chat-window { max-height: 120px; overflow-y: auto; margin-bottom: 8px; }
.chat-msg { margin-bottom: 4px; }
.chat-msg.user { color: #6366f1; }
.chat-msg.sallie { color: #f59e42; }
.sender { font-weight: bold; }
.text { margin-left: 4px; }
</style>
