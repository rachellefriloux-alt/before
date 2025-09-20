/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\vitest.config.js) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\vitest.config.js) */
/* --- dest (C:\Users\chell\Desktop\newsal\vitest.config.js) --- */
/* Merged master for logical file: .\vitest.config
Sources:
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\vitest.config.js (hash:09465A26D6E12F285A6CEE367B457E19027A4229C6A7B75F8C96F1998BBC1F04)
 - C:\Users\chell\Desktop\Sallie\merged_sallie\vitest.config.js (hash:EFD991F0F8C23B0E8C473EC29D78E9AEF7BCFB10C694FFB4FBE651EAFB1414D7)
 */

/* ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\vitest.config.js | ext: .js | sha: 09465A26D6E12F285A6CEE367B457E19027A4229C6A7B75F8C96F1998BBC1F04 ---- */
[BINARY FILE - original copied to merged_sources: vitest.config.js]
/* ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\vitest.config.js | ext: .js | sha: EFD991F0F8C23B0E8C473EC29D78E9AEF7BCFB10C694FFB4FBE651EAFB1414D7 ---- */
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\vitest.config.js --- */
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    globals: true
  }
})
