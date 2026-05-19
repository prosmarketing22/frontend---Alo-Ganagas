/**
 * Babel Configuration - Para Jest en Frontend
 *
 * Permite transformar JSX y ES modules para tests
 */

module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }]
  ]
};
