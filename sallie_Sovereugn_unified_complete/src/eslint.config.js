import pluginVue from 'eslint-plugin-vue';

export default [
  {
    files: ['**/*.{js,mjs,jsx,vue,ts,tsx}'],
    ...pluginVue.configs['flat/recommended'],
  },
];
