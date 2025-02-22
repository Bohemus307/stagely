# Welcome to STagely app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Conventional Commits Examples

This guide demonstrates common conventional commit patterns used throughout the development lifecycle.

## Feature Development

```bsh
feat: add user authentication system
feat(auth): implement JWT token validation
feat(ui): create login form component
feat(api): add user registration endpoints
```

## Bug Fixes

```bsh
fix: resolve memory leak in background service
fix(auth): correct token expiration calculation
fix(ui): address form validation error messages
fix(api): handle null response in user lookup
```

## Documentation Updates

```bsh
docs: update API authentication guide
docs(readme): add project setup instructions
docs(api): document new user endpoints
docs(contributing): clarify PR review process
```

## Code Refactoring

```bsh
refactor: simplify authentication middleware
refactor(auth): extract token validation logic
refactor(ui): consolidate form components
refactor(api): reorganize route handlers
```

## Performance Improvements

```bsh
perf: optimize database queries
perf(auth): cache token validation results
perf(ui): implement component lazy loading
perf(api): add response caching layer
```

## Testing

```bsh
test: add user authentication test suite
test(auth): cover token edge cases
test(ui): add form validation tests
test(api): increase endpoint coverage
```

## Build System Changes

```bsh
build: upgrade to webpack 5
build(deps): update authentication packages
build(ci): optimize test pipeline
build(docker): reduce image size
```

## Dependencies

```bsh
chore(deps): bump node from 14 to 16
chore(deps-dev): update testing libraries
chore(deps): update security vulnerabilities
```

## Breaking Changes

```bsh
feat!: migrate authentication to v2 API
fix!: remove deprecated token formats
refactor!: change authentication interface
perf!: require node 16 for performance
```

## Multiple Scopes

```bsh
feat(api,auth): add OAuth provider support
fix(ui,api): synchronize error handling
refactor(auth,db): improve token storage
```

## Multiple Changes in One Commit

```bsh
feat(auth): add password reset flow

- Implement reset token generation
- Add email notification service
- Create reset password form
- Update user documentation
```

## Common Mistakes to Avoid

❌ Don't do this:

```bsh
feat: lots of changes
fix: update stuff
chore: fixes
```

✅ Do this instead:

```bsh
feat(auth): implement password reset flow
fix(ui): correct input validation logic
chore(deps): update security packages
```

## Tips for Good Commits

1. Be specific about what changed
2. Use consistent scopes
3. Reference issue numbers when applicable
4. Separate breaking changes
5. Keep commits focused and atomic
