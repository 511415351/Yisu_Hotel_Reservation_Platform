import { reactRouter } from "@react-router/dev/vite"; // 1. 引入 RR 插件
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        // target: 'https://m1.apifoxmock.com/m1/7810839-7557920-default',
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  plugins: [
    reactRouter(),   
    tsconfigPaths(),  
    tailwindcss(),    
  ],
});