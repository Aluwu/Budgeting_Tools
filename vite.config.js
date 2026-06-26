import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/Budgeting_Tools/',
  plugins: [react()],
});
