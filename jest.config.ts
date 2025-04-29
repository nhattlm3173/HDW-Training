import type { Config } from "jest";

// jest.config.ts
const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: ".", // hoặc './src' nếu bạn thích
  testMatch: ["**/src/_test_/**/*.test.ts"],
  moduleFileExtensions: ["ts", "js", "json", "node"],
  moduleDirectories: ["node_modules", "src"],
  transform: {
    "^.+\\.ts?$": "ts-jest",
  },
  globals: {
    "ts-jest": {
      isolatedModules: true,
    },
  },
  verbose: true,
};

export default config;
