import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dusrel.fotmio',
  appName: 'Fotmio',
  // UI (Svelte + Vite) ka production build hi mobile app ka content hai.
  // Root se pehle `pnpm build` chalega to ui/dist ban jata hai.
  webDir: '../ui/dist',
  server: {
    // Offline-first app: koi remote server nahi, sab kuch bundle ke andar.
    androidScheme: 'https',
  },
  plugins: {
    Camera: {
      // Photo sirf user ke choose karne par li jayegi; koi background access nahi.
      permissions: ['photos'],
    },
  },
};

export default config;
