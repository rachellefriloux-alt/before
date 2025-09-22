<!-- Migrated and adapted from sallie_1.00/ui/components/InsightCard.vue -->
<template>
  <div class="insight-card">
    <h4>{{ title }}</h4>
    <p>{{ insight }}</p>
  </div>
</template>
<script>
export default {
  name: 'InsightCard',
  props: {
    title: {
      type: String,
      required: true
    },
    insight: {
      type: String,
      required: true
    },
    details: {
      type: String,
      default: ''
    },
    theme: {
      type: String,
      default: 'light'
    }
  },
  data() {
    return {
      analytics: [],
      error: ''
    };
  },
  methods: {
    logAnalytics(event, data) {
      this.analytics.push({ event, data, timestamp: Date.now() });
    }
  }
}
</script>
<style scoped>
.insight-card {
  background: var(--background-tertiary, #334155);
  border-radius: var(--border-radius, 8px);
  box-shadow: var(--shadow-sm, 0 1px 2px 0 rgb(0 0 0 / 0.05));
  padding: 1em;
  margin: 0.5em 0;
  color: var(--text-primary, #f8fafc);
}
</style>


<!-- Migrated and adapted from sallie_1.00/ui/components/InsightCard.vue -->
<template>
  <div class="insight-card">
    <h4>{{ title }}</h4>
    <p>{{ insight }}</p>
  </div>
</template>
<script>
export default {
  name: 'InsightCard',
  props: {
    title: {
      type: String,
      required: true
    },
    insight: {
      type: String,
      required: true
    },
    details: {
      type: String,
      default: ''
    },
    theme: {
      type: String,
      default: 'light'
    }
  },
  data() {
    return {
      analytics: [],
      error: ''
    };
  },
  methods: {
    logAnalytics(event, data) {
      this.analytics.push({ event, data, timestamp: Date.now() });
    }
  }
}
</script>
<style scoped>
.insight-card {
  background: var(--background-tertiary, #334155);
  border-radius: var(--border-radius, 8px);
  box-shadow: var(--shadow-sm, 0 1px 2px 0 rgb(0 0 0 / 0.05));
  padding: 1em;
  margin: 0.5em 0;
  color: var(--text-primary, #f8fafc);
}
</style>


<template>
  <div class="insight-card">
    <h3>Insight</h3>
    <p>{{ insight }}</p>
  </div>
</template>

<script>
export default {
  name: 'InsightCard',
  props: {
    insight: {
      type: String,
      default: 'No insight available.'
    }
  }
};
</script>

<style scoped>
.insight-card {
  background: #e0f7fa;
  padding: 16px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  margin-bottom: 16px;
}
</style>


<template>
  <div class="insight-card">
    <h3>Insight</h3>
    <p>{{ insight }}</p>
  </div>
</template>

<script>
export default {
  name: 'InsightCard',
  props: {
    insight: {
      type: String,
      default: 'No insight available.'
    }
  }
};
</script>

<style scoped>
.insight-card {
  background: #e0f7fa;
  padding: 16px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  margin-bottom: 16px;
}
</style>


/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\ui\components\InsightCard.vue) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\InsightCard.vue) */
/* --- dest (C:\Users\chell\Desktop\newsal\ui\components\InsightCard.vue) --- */
<!-- Merged master for logical file: ui\components\InsightCard
Sources:
 - C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\InsightCard.vue (hash:8363A96BF11762255951841022EC34FDE56B8E5185BFB564E855D37865FD151D)
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\InsightCard.vue (hash:5B87324CE2BB5B31D6615C487269E1F005111AD28A1E668B53523734D2104CDC)
 -->

<!-- ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\InsightCard.vue | ext: .vue | sha: 8363A96BF11762255951841022EC34FDE56B8E5185BFB564E855D37865FD151D ---- -->
[BINARY FILE - original copied to merged_sources: ui\components\InsightCard.vue]
<!-- ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\InsightCard.vue | ext: .vue | sha: 5B87324CE2BB5B31D6615C487269E1F005111AD28A1E668B53523734D2104CDC ---- -->
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\InsightCard.vue --- */
<!-- Migrated and adapted from sallie_1.00/ui/components/InsightCard.vue -->
<template>
  <div class="insight-card">
    <h4>{{ title }}</h4>
    <p>{{ insight }}</p>
  </div>
</template>
<script>
export default {
  name: 'InsightCard',
  props: {
    title: {
      type: String,
      required: true
    },
    insight: {
    details: {
      default: ''
    theme: {
      default: 'light'
    }
  },
  data() {
    return {
      analytics: [],
      error: ''
    };
  methods: {
    logAnalytics(event, data) {
      this.analytics.push({ event, data, timestamp: Date.now() });
  }
}
</script>
<style scoped>
.insight-card {
  background: var(--background-tertiary, #334155);
  border-radius: var(--border-radius, 8px);
  box-shadow: var(--shadow-sm, 0 1px 2px 0 rgb(0 0 0 / 0.05));
  padding: 1em;
  margin: 0.5em 0;
  color: var(--text-primary, #f8fafc);
</style>
