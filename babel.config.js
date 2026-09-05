module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    env: {
      web: {
        plugins: [
          ["@expo/plugin-batteries-included", {}],
        ],
      },
    },
  };
};
