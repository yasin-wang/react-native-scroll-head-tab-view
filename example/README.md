# Example

This is a React Native 0.86 New Architecture application for local development
of `react-native-scroll-head-tab-view`.

```sh
npm install
cd example/ios && bundle install && bundle exec pod install
cd ../..
npm run ios --workspace example
```

The screen demonstrates:

- automatic and dynamic header measurement;
- safe-area insets;
- long, short, and almost-empty scenes;
- controlled page changes;
- dynamic tab removal;
- a custom `ScrollableTabBar`.
