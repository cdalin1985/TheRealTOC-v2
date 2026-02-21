module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './',
            '@/components': './src/components',
            '@/hooks': './src/hooks',
            '@/stores': './src/stores',
            '@/api': './src/api',
            '@/types': './src/types',
            '@/utils': './src/utils',
            '@/providers': './src/providers',
            '@/constants': './src/constants',
          },
        },
      ],
    ],
  };
};