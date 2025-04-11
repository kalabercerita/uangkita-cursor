
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.3efe076a52434954862bb36bfde4c1aa',
  appName: 'UangKita',
  webDir: 'dist',
  server: {
    url: 'https://3efe076a-5243-4954-862b-b36bfde4c1aa.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
      keystorePassword: undefined,
      keystoreAliasPassword: undefined,
      releaseType: undefined,
    }
  }
};

export default config;
