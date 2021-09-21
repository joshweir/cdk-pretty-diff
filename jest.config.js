module.exports = {
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  },
  testEnvironment: 'node',
  testRegex: '(/__tests__/.*|(src|test)/.*(\\.|-|/)(test|spec))\\.(jsx?|tsx?)$',
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
  setupFiles: [
    "./jest-setup.js"
  ],
  moduleFileExtensions: [
    'ts',
    'tsx',
    'json',
    'js',
    'jsx'
  ]
}
