import type { Config } from "@jest/types";
import { defaults as tsjPreset } from "ts-jest/presets";

const config: Config.InitialOptions = {
  ...tsjPreset,
  preset: "jest-expo",
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@gluestack-ui/.*)/(?!(@legendapp/motion|@legendapp/motion/.*))",
  ],
  setupFilesAfterEnv: [
    "<rootDir>/jest.setup.ts",
    "@testing-library/jest-native/extend-expect",
  ],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  testEnvironment: "node",
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.[jt]sx?$",
  moduleNameMapper: {
    // Handle module aliases
    "^@/(.*)$": "<rootDir>/$1",
    // Handle image imports
    "\\.(jpg|jpeg|png|gif|webp|svg)$": "<rootDir>/__mocks__/fileMock.js",
    // Handle CSS imports (if using CSS in your project)
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.jest.json",
      },
    ],
  },
  collectCoverage: true,
  collectCoverageFrom: [
    "**/*.{ts,tsx}",
    "!**/node_modules/**",
    "!**/coverage/**",
    "!**/babel.config.js",
    "!**/jest.setup.ts",
    "!**/metro.config.js",
    "!**/components/ui/**",
    "!**/__mocks__/**",
    "!**/types/**",
    "!jest.config.ts",
    "!jest.setup.ts",
    "!app.config.ts",
    "!nativewind-env.d.ts",
    "!react-native-streetview.d.ts",
    "!stagely/lib/@types",
  ],
  verbose: true,
};

export default config;
