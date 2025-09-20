module.exports = {
    preset: null,
    setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
    testMatch: [
        '<rootDir>/__tests__/**/*.test.js',
        '<rootDir>/components/**/*.test.js',
        '<rootDir>/app/**/*.test.js'
    ],
    collectCoverageFrom: [
        'components/**/*.{js}',
        'app/**/*.{js}',
        '!**/*.d.ts',
        '!**/node_modules/**'
    ],
    coverageReporters: [
        'text',
        'lcov',
        'html'
    ],
    testEnvironment: 'node',
    moduleFileExtensions: [
        'js',
        'jsx',
        'json'
    ],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1'
    }
};
