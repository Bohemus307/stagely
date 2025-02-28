// Mock Expo modules
jest.mock("expo-font");
jest.mock("expo-asset");
jest.mock("expo-constants", () => ({
  expoConfig: { extra: { apiUrl: "https://mock-api.example.com" } },
  manifest: { extra: { apiUrl: "https://mock-api.example.com" } },
}));

// Mock expo-symbols
jest.mock('expo-symbols', () => {
  const React = require('react');
  
  // Export a mock version of SymbolView
  const SymbolView = ({ name, size, color }: { name: string; size: number; color: string }) => {
    return React.createElement("view", {
      testID: `symbol-${name}`,
      style: { width: size, height: size, backgroundColor: color },
    });
  };
  
  // Define the types/enums that are exported from expo-symbols
  const SymbolWeight = {
    REGULAR: 'regular',
    BOLD: 'bold',
    THIN: 'thin',
    HEAVY: 'heavy',
  };
  
  return {
    SymbolView,
    SymbolWeight,
    // Add other exports as needed
  };
});

// Mock expo-modules-core to fix TypeScript errors
jest.mock('expo-modules-core', () => ({
  // Mock the EventEmitter class that's causing TypeScript issues
  EventEmitter: class {
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor() {}
    addListener() { return { remove: () => {} }; }
    removeAllListeners() {}
    emit() {}
  },
  // Add any other exports from expo-modules-core that your code might use
  NativeModulesProxy: {},
  Platform: { OS: 'jest' },
}), { virtual: true });

// Mock React Navigation
jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
  };
});

// Mock Gluestack UI components
jest.mock("@gluestack-ui/avatar", () => ({
  createAvatar: () => ({
    Group: () => null,
    Image: () => null,
    Fallback: () => null,
    Badge: () => null,
  }),
}));

jest.mock("@gluestack-ui/nativewind-utils", () => ({
  VariantProps: jest.fn(),
}));

// Mock Expo Router
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: () => true,
  }),
  useSegments: () => [""],
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

// Setup global fetch mock
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    ok: true,
    status: 200,
  })
) as jest.Mock;

// Cleanup mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});
