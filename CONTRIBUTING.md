# Contributing

## Requirements

- Node.js 22.12 or newer
- npm 10 or newer
- Android Studio and JDK 17 for Android development
- Xcode and CocoaPods for iOS development

## Setup

```sh
npm install
cd example/ios && bundle install && bundle exec pod install
```

Run the example from the repository root:

```sh
npm run start --workspace example
npm run ios --workspace example
# or
npm run android --workspace example
```

## Validation

```sh
npm run validate
```

Changes to scroll synchronization should include focused tests for long
content, short content, switching tabs at partial/full collapse, and dynamic
scene changes. Avoid private React Native or Animated APIs.

## Releases

Releases are manual:

1. Update `CHANGELOG.md` and remove the `Unreleased` marker.
2. Run `npm run validate`.
3. Inspect `npm pack --dry-run`.
4. Commit and tag the release.
5. Publish with npm after CI succeeds. The `prepack` hook builds all package
   artifacts immediately before publishing.
