import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.costossecurity.medicontrol',
  appName: 'MediControl',
  webDir: 'dist',
  android: {
    allowMixedContent: false,
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_medicontrol',
      iconColor: '#10B981',
    },
  },
};

export default config;
