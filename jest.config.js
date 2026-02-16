export default {
  testEnvironment: "node",
  coveragePathIgnorePatterns: ["/node_modules/"],
  testMatch: ["**/__tests__/**/*.test.js"],
  collectCoverageFrom: ["managers/**/*.js", "loaders/**/*.js", "mws/**/*.js"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  transform: {
    "^.+\\.js$": "babel-jest",
  },
  setupFilesAfterFramework: ["./__tests__/setup.js"],
  testTimeout: 30000,
};
