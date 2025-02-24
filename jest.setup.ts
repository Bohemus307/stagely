// Mock Expo modules
jest.mock("expo-font");
jest.mock("expo-asset");
jest.mock("expo-constants", () => ({
  expoConfig: { extra: { apiUrl: "https://mock-api.example.com" } },
  manifest: { extra: { apiUrl: "https://mock-api.example.com" } },
}));

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
