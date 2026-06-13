# Changelog

All notable changes to this project are documented here.

## 2.0.0 - Unreleased

### Added

- React Native 0.82+ New Architecture support.
- Automatic header measurement and typed imperative `goToPage`.
- Typed public props for tab views, tab bars, and collapsible scenes.
- Dynamic scene handling with stable-key scroll state.
- Accessibility metadata for default and scrollable tab bars.
- React Native 0.86 example application, tests, and CI.

### Changed

- Replaced `@react-native-community/viewpager` with
  `react-native-pager-view`.
- Unified iOS and Android paging behavior.
- Rebuilt the package with TypeScript and React Native Builder Bob.
- `onContentScroll` now receives a numeric vertical offset.
- `contentProps` is now a typed subset of `PagerViewProps`.

### Removed

- React Native legacy architecture support.
- `memoize-one`.
- All use of private Animated fields and methods.

## 1.0.9 - 2021-05-10

- Last release supporting the original architecture and legacy ViewPager.
