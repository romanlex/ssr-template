module.exports = (api) => {
  api.cache(true);
  const debug = process.env.EFFECTOR_DEBUG === 'true';

  return {
    plugins: [
      '@loadable/babel-plugin',
      [
        'effector/babel-plugin',
        {
          addLoc: debug,
          addNames: debug,
          debugSids: debug,
          reactSsr: true,
          factories: ['shared/libs/effector/factories']
        },
      ],
      [
        'styled-components',
        {
          displayName: process.env.STYLED_DEBUG === 'true',
          ssr: true,
          namespace: 'ssr-app',
          meaninglessFileNames: ['index', 'styles', 'styled'],
        },
      ],
    ].filter(Boolean),
    presets: [
      [
        "@foxford/babel-preset-react-app",
        {
          "runtime": "automatic",
          "typescript": true,
          "absoluteRuntime": false,
          "mjs": false,
          "envUseBuiltIns": "usage"
        }
      ]
    ],
  };
};
