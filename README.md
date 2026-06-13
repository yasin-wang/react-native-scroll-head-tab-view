# react-native-scroll-head-tab-view

Collapsible headers and sticky tab bars for React Native applications.

Version 2 uses `react-native-pager-view` on both platforms, supports the React
Native New Architecture, and keeps the familiar `ScrollTabView + tabLabel`
API from version 1.

> Version 2 requires React Native 0.82 or newer. Applications on the legacy
> architecture should remain on version 1.0.9.

[中文文档](./README.zh-CN.md)

## Installation

```sh
npm install react-native-scroll-head-tab-view react-native-pager-view
cd ios && pod install
```

The package expects:

- React 19.1 or newer
- React Native 0.82 or newer with the New Architecture
- `react-native-pager-view` 7 or newer

## Basic usage

Scenes must forward the props injected by `ScrollTabView` to the exported
`FlatList` or `ScrollView`.

```tsx
import React from 'react';
import { Text, View } from 'react-native';
import {
  FlatList,
  ScrollTabView,
  type TabSceneProps,
} from 'react-native-scroll-head-tab-view';

interface SceneProps extends TabSceneProps {
  tabLabel: string;
}

function FeedScene({ tabLabel: _tabLabel, ...sceneProps }: SceneProps) {
  return (
    <FlatList
      {...sceneProps}
      data={Array.from({ length: 50 }, (_, index) => index)}
      keyExtractor={String}
      renderItem={({ item }) => (
        <View>
          <Text>Item {item}</Text>
        </View>
      )}
    />
  );
}

export default function Screen() {
  return (
    <ScrollTabView
      renderScrollHeader={() => (
        <View>
          <Text>Profile header</Text>
        </View>
      )}>
      <FeedScene tabLabel="Posts" />
      <FeedScene tabLabel="Likes" />
    </ScrollTabView>
  );
}
```

The header is measured automatically. Pass `headerHeight` when the height is
already known and you want to avoid the initial measurement layout.

## Safe areas

Include the top safe-area padding in the header and pass the same inset to
`insetValue`. The header collapses until the tab bar reaches this inset.

```tsx
const insets = useSafeAreaInsets();

<ScrollTabView
  insetValue={insets.top}
  renderScrollHeader={() => (
    <View style={{ paddingTop: insets.top }}>
      <Text>Header</Text>
    </View>
  )}>
  {/* scenes */}
</ScrollTabView>;
```

## Controlled pages and refs

```tsx
const ref = React.useRef<ScrollTabViewRef>(null);
const [page, setPage] = React.useState(0);

<ScrollTabView ref={ref} page={page} onChangeTab={({ i }) => setPage(i)}>
  {/* scenes */}
</ScrollTabView>;

ref.current?.goToPage(1);
```

Invalid page values are clamped to the available scene range. If scenes are
added, removed, or reordered, explicit React keys preserve their scroll state.

## Custom tab bar

```tsx
<ScrollTabView
  renderTabBar={props => (
    <ScrollableTabBar
      {...props}
      activeTextColor="#0b6bcb"
      underlineStyle={{ backgroundColor: '#0b6bcb' }}
    />
  )}>
  {/* scenes */}
</ScrollTabView>
```

`DefaultTabBar` and `ScrollableTabBar` expose accessible tab roles, selected
state, and enlarged press targets.

## Main props

| Prop                         | Type                                           | Default         |
| ---------------------------- | ---------------------------------------------- | --------------- |
| `initialPage`                | `number`                                       | `0`             |
| `page`                       | `number`                                       | uncontrolled    |
| `headerHeight`               | `number`                                       | measured        |
| `insetValue`                 | `number`                                       | `0`             |
| `renderScrollHeader`         | `() => ReactNode`                              | none            |
| `renderTabBar`               | `(props: TabBarProps) => ReactElement`         | `DefaultTabBar` |
| `tabBarPosition`             | `top \| bottom \| overlayTop \| overlayBottom` | `top`           |
| `locked`                     | `boolean`                                      | `false`         |
| `scrollWithoutAnimation`     | `boolean`                                      | `false`         |
| `prerenderingSiblingsNumber` | `number`                                       | `0`             |
| `onChangeTab`                | `({ i, from, ref }) => void`                   | none            |
| `onScroll`                   | `(pagePosition: number) => void`               | none            |
| `onContentScroll`            | `(offsetY: number) => void`                    | none            |
| `contentProps`               | managed `PagerViewProps`                       | none            |

Public TypeScript types include `ScrollTabViewProps`, `ScrollTabViewRef`,
`TabBarProps`, `TabSceneProps`, and the exported list prop types.

## Migration from 1.x

1. Replace `@react-native-community/viewpager` with
   `react-native-pager-view`.
2. Upgrade the application to React Native 0.82+ and the New Architecture.
3. Treat the `onContentScroll` argument as a numeric vertical offset.
4. Treat `contentProps` as `PagerViewProps`; managed paging callbacks cannot be
   overridden.
5. Add `TabSceneProps` to scene component props for complete type safety.

The component names, `tabLabel` children API, tab bar customization props, and
exported `FlatList`/`ScrollView` names are retained.

See the runnable [example application](./example) for dynamic headers, dynamic
tabs, safe-area handling, controlled pages, and short content.

## Development

```sh
npm install
npm run validate
npm run ios --workspace example
# or
npm run android --workspace example
```

Releases are intentionally manual. CI must pass and `npm run pack:check` must
show only the intended package files before publishing.

## License

ISC
