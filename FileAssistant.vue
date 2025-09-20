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
