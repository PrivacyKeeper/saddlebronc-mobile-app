// Expo app config. Values that differ per build environment come from
// EXPO_PUBLIC_* env vars so a fresh clone runs without editing this file.
module.exports = {
  expo: {
    name: "Saddle Bronc",
    slug: "saddlebronc",
    scheme: "saddlebronc",
    version: '0.1.0',
    orientation: 'portrait',
    userInterfaceStyle: 'dark',
    newArchEnabled: true,
    splash: {
      resizeMode: 'contain',
      backgroundColor: "#0a0e1a",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "pro.saddlebronc.app",
      infoPlist: {
        NSCameraUsageDescription: 'Record your runs so SaddleBronc can analyse them.',
        NSMicrophoneUsageDescription: 'Capture audio alongside your run video.',
        NSPhotoLibraryUsageDescription: 'Pick a run video to analyse.',
      },
    },
    android: {
      package: "pro.saddlebronc.app",
      adaptiveIcon: {
        backgroundColor: "#0a0e1a",
      },
      edgeToEdgeEnabled: true,
    },
    web: { bundler: 'metro', output: 'static' },
    plugins: ['expo-router', 'expo-video'],
    experiments: { typedRoutes: true },
    extra: {
      domain: "saddlebronc.pro",
      eventType: "saddlebronc",
    },
  },
};
