<template>
  <div class="file-assistant">
    <h3>File & Document Assistant</h3>
    <button @click="scanFiles">Scan Files</button>
    <ul>
      <li v-for="file in files" :key="file.id">{{ file.name }}</li>
    </ul>
    <div v-if="files.length === 0">No files found.</div>
  </div>
</template>
<script>
export default {
  data() {
    return { files: [] };
  },
  mounted() {
    this.scanFiles();
  },
  methods: {
    scanFiles() {
      // For demo, mock file scan from localStorage
      const raw = localStorage.getItem('sallie:files');
      if (raw) {
        try {
          this.files = JSON.parse(raw);
        } catch {}
      } else {
        // Mock files
        this.files = [
          { id: 1, name: 'Resume.pdf' },
          { id: 2, name: 'GroceryList.txt' },
          { id: 3, name: 'Bella_School_Report.docx' }
        ];
      }
    }
  }
}
</script>
<style>
.file-assistant { margin: 12px 0; }
</style>


<template>
  <div class="file-assistant">
    <h3>File & Document Assistant</h3>
    <button @click="scanFiles">Scan Files</button>
    <ul>
      <li v-for="file in files" :key="file.id">{{ file.name }}</li>
    </ul>
    <div v-if="files.length === 0">No files found.</div>
  </div>
</template>
<script>
export default {
  data() {
    return { files: [] };
  },
  mounted() {
    this.scanFiles();
  },
  methods: {
    scanFiles() {
      // For demo, mock file scan from localStorage
      const raw = localStorage.getItem('sallie:files');
      if (raw) {
        try {
          this.files = JSON.parse(raw);
        } catch {}
      } else {
        // Mock files
        this.files = [
          { id: 1, name: 'Resume.pdf' },
          { id: 2, name: 'GroceryList.txt' },
          { id: 3, name: 'Bella_School_Report.docx' }
        ];
      }
    }
  }
}
</script>
<style>
.file-assistant { margin: 12px 0; }
</style>


/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\ui\components\files\FileAssistant.vue) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\files\FileAssistant.vue) */
/* --- dest (C:\Users\chell\Desktop\newsal\ui\components\files\FileAssistant.vue) --- */
<!-- Merged master for logical file: ui\components\files\FileAssistant
Sources:
 - C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\files\FileAssistant.vue (hash:688F57FCEEABBF58B74A01722EE2E14562FD924CA1160A19CA02656C67C82156)
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\files\FileAssistant.vue (hash:B5C05F73F02C73C9DD7FBE18108AB504A3B7C5936FB94957E8FA8185F7478E3D)
 -->

<!-- ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\files\FileAssistant.vue | ext: .vue | sha: 688F57FCEEABBF58B74A01722EE2E14562FD924CA1160A19CA02656C67C82156 ---- -->
[BINARY FILE - original copied to merged_sources: ui\components\files\FileAssistant.vue]
<!-- ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\files\FileAssistant.vue | ext: .vue | sha: B5C05F73F02C73C9DD7FBE18108AB504A3B7C5936FB94957E8FA8185F7478E3D ---- -->
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\files\FileAssistant.vue --- */
<template>
  <div class="file-assistant">
    <h3>File & Document Assistant</h3>
    <button @click="scanFiles">Scan Files</button>
    <ul>
      <li v-for="file in files" :key="file.id">{{ file.name }}</li>
    </ul>
    <div v-if="files.length === 0">No files found.</div>
  </div>
</template>
<script>
export default {
  data() {
    return { files: [] };
  },
  mounted() {
    this.scanFiles();
  methods: {
    scanFiles() {
      // For demo, mock file scan from localStorage
      const raw = localStorage.getItem('sallie:files');
      if (raw) {
        try {
          this.files = JSON.parse(raw);
        } catch {}
      } else {
        // Mock files
        this.files = [
          { id: 1, name: 'Resume.pdf' },
          { id: 2, name: 'GroceryList.txt' },
          { id: 3, name: 'Bella_School_Report.docx' }
        ];
      }
    }
  }
}
</script>
<style>
.file-assistant { margin: 12px 0; }
</style>
