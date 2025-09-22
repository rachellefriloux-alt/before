/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Vite configuration for modern web development.
 * Got it, love.
 */

...existing content migrated and adapted for Sallie app structure...


/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Vite configuration for modern web development.
 * Got it, love.
 */

...existing content migrated and adapted for Sallie app structure...


/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Vite configuration for modern web development.
 * Got it, love.
 */

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // Treat Sallie custom elements as custom elements
          isCustomElement: (tag) => tag.startsWith('sallie-')
        }
      }
    })
  ],
  
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
      '@/components': resolve(__dirname, 'components'),
      '@/core': resolve(__dirname, 'core'),
      '@/ai': resolve(__dirname, 'ai'),
      '@/ui': resolve(__dirname, 'ui'),
      '@/feature': resolve(__dirname, 'feature')
    }
  },
  
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    __SALLIE_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  },
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'esbuild',
    target: 'es2020',
    
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      
      output: {
        manualChunks: {
          // Split vendor code for better caching
          vendor: ['vue'],
          ui: ['./ui/visual/themeGenerator.ts', './ui/visual/svgGenerator.ts'],
          core: ['./core/AdaptivePersonaEngine.ts', './core/PluginRegistry.ts']
        },
        
        // Better asset naming
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          let extType = info[info.length - 1];
          
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            extType = 'images';
          } else if (/woff2?|eot|ttf|otf/i.test(extType)) {
            extType = 'fonts';
          }
          
          return `assets/${extType}/[name]-[hash][extname]`;
        },
        
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js'
      }
    },
    
    // Optimize for production
    cssCodeSplit: true,
    cssMinify: true,
    
    // Bundle size analysis
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000
  },
  
  server: {
    port: 5173,
    host: true, // Allow external connections
    open: true,
    cors: true,
    
    // Proxy API calls during development
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  
  preview: {
    port: 4173,
    host: true,
    open: true
  },
  
  optimizeDeps: {
    include: ['vue'],
    exclude: ['@vite/client', '@vite/env']
  },
  
  esbuild: {
    // Remove console and debugger in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
  },
  
  css: {
    devSourcemap: true,
    
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import "./ui/styles/variables.scss";
          @import "./ui/styles/mixins.scss";
        `
      }
    },
    
    postcss: {
      plugins: [
        // Add PostCSS plugins as needed
      ]
    }
  },
  
  json: {
    namedExports: true,
    stringify: false
  },
  
  // Environment variables
  envPrefix: 'SALLIE_',
  
  // Performance optimizations
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      if (hostType === 'js') {
        return { js: `"/assets/${filename}"` };
      } else {
        return { relative: true };
      }
    }
  }
});

/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Vite configuration for modern web development.
 * Got it, love.
 */

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // Treat Sallie custom elements as custom elements
          isCustomElement: (tag) => tag.startsWith('sallie-')
        }
      }
    })
  ],
  
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
      '@/components': resolve(__dirname, 'components'),
      '@/core': resolve(__dirname, 'core'),
      '@/ai': resolve(__dirname, 'ai'),
      '@/ui': resolve(__dirname, 'ui'),
      '@/feature': resolve(__dirname, 'feature')
    }
  },
  
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    __SALLIE_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  },
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'esbuild',
    target: 'es2020',
    
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      
      output: {
        manualChunks: {
          // Split vendor code for better caching
          vendor: ['vue'],
          ui: ['./ui/visual/themeGenerator.ts', './ui/visual/svgGenerator.ts'],
          core: ['./core/AdaptivePersonaEngine.ts', './core/PluginRegistry.ts']
        },
        
        // Better asset naming
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          let extType = info[info.length - 1];
          
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            extType = 'images';
          } else if (/woff2?|eot|ttf|otf/i.test(extType)) {
            extType = 'fonts';
          }
          
          return `assets/${extType}/[name]-[hash][extname]`;
        },
        
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js'
      }
    },
    
    // Optimize for production
    cssCodeSplit: true,
    cssMinify: true,
    
    // Bundle size analysis
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000
  },
  
  server: {
    port: 5173,
    host: true, // Allow external connections
    open: true,
    cors: true,
    
    // Proxy API calls during development
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  
  preview: {
    port: 4173,
    host: true,
    open: true
  },
  
  optimizeDeps: {
    include: ['vue'],
    exclude: ['@vite/client', '@vite/env']
  },
  
  esbuild: {
    // Remove console and debugger in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
  },
  
  css: {
    devSourcemap: true,
    
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import "./ui/styles/variables.scss";
          @import "./ui/styles/mixins.scss";
        `
      }
    },
    
    postcss: {
      plugins: [
        // Add PostCSS plugins as needed
      ]
    }
  },
  
  json: {
    namedExports: true,
    stringify: false
  },
  
  // Environment variables
  envPrefix: 'SALLIE_',
  
  // Performance optimizations
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      if (hostType === 'js') {
        return { js: `"/assets/${filename}"` };
      } else {
        return { relative: true };
      }
    }
  }
});

/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Vite configuration for modern web development.
 * Got it, love.
 */

...existing content migrated and adapted for Sallie app structure...


/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\vite.config.ts) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\vite.config.ts) */
/* --- dest (C:\Users\chell\Desktop\newsal\vite.config.ts) --- */
/* Merged master for logical file: .\vite.config
Sources:
 - C:\Users\chell\Desktop\Sallie\merged_sallie\vite.config.ts (hash:2B22BB2DE492FE9DD76C17CD11495EC45D00CC0F3F447AAC8A5F34F1D6E2D54D)
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\vite.config.js (hash:3B06C0EC869338FC318F4C4F5EDBFDBDC326CC7FAC5B3A2DCDA2A26CBB27096F)
 - C:\Users\chell\Desktop\Sallie\merged_sallie\vite.config.js (hash:A15FFD2591B5C366992CAFE97B452868540C9DAE1C5C666601E6308B1034F462)
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\vite.config.ts (hash:32868D6F08AF94635B27FF240E8C74F46EA71B8108B9D8EB6A503A9B20A5D970)
 */

/* ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\vite.config.ts | ext: .ts | sha: 2B22BB2DE492FE9DD76C17CD11495EC45D00CC0F3F447AAC8A5F34F1D6E2D54D ---- */
[BINARY FILE - original copied to merged_sources: vite.config.ts]
/* ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\vite.config.js | ext: .js | sha: 3B06C0EC869338FC318F4C4F5EDBFDBDC326CC7FAC5B3A2DCDA2A26CBB27096F ---- */
[BINARY FILE - original copied to merged_sources: vite.config.js]
/* ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\vite.config.js | ext: .js | sha: A15FFD2591B5C366992CAFE97B452868540C9DAE1C5C666601E6308B1034F462 ---- */
/* ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\vite.config.ts | ext: .ts | sha: 32868D6F08AF94635B27FF240E8C74F46EA71B8108B9D8EB6A503A9B20A5D970 ---- */
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\vite.config.ts --- */
/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Vite configuration for modern web development.
 * Got it, love.
...existing content migrated and adapted for Sallie app structure...
