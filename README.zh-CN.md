# react-native-scroll-head-tab-view

为 React Native 应用提供可折叠头部和吸顶标签栏。

2.0 在 Android 和 iOS 上统一使用 `react-native-pager-view`，支持 React
Native 新架构，并保留 1.x 的 `ScrollTabView + tabLabel` 使用方式。

> 2.0 要求 React Native 0.82 或更高版本。仍使用旧架构的项目应继续使用
> 1.0.9。

## 安装

```sh
npm install react-native-scroll-head-tab-view react-native-pager-view
cd ios && pod install
```

要求 React 19.1+、React Native 0.82+ 和 `react-native-pager-view` 7+。

## 基本用法

标签场景需要将 `ScrollTabView` 注入的属性传给本库导出的 `FlatList` 或
`ScrollView`。

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

function ListScene({ tabLabel: _tabLabel, ...sceneProps }: SceneProps) {
  return (
    <FlatList
      {...sceneProps}
      data={Array.from({ length: 50 }, (_, index) => index)}
      keyExtractor={String}
      renderItem={({ item }) => (
        <View>
          <Text>第 {item} 项</Text>
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
          <Text>个人主页头部</Text>
        </View>
      )}>
      <ListScene tabLabel="动态" />
      <ListScene tabLabel="喜欢" />
    </ScrollTabView>
  );
}
```

头部高度默认自动测量。已知高度时可传入 `headerHeight`，避免首次布局测量。

## 安全区

头部内容应包含顶部安全区，并将相同的高度传给 `insetValue`：

```tsx
const insets = useSafeAreaInsets();

<ScrollTabView
  insetValue={insets.top}
  renderScrollHeader={() => (
    <View style={{ paddingTop: insets.top }}>
      <Text>头部</Text>
    </View>
  )}>
  {/* 标签场景 */}
</ScrollTabView>;
```

## 受控页面和 Ref

```tsx
const ref = React.useRef<ScrollTabViewRef>(null);
const [page, setPage] = React.useState(0);

<ScrollTabView ref={ref} page={page} onChangeTab={({ i }) => setPage(i)}>
  {/* 标签场景 */}
</ScrollTabView>;

ref.current?.goToPage(1);
```

非法页码会被限制在有效范围内。动态增加、删除或排序标签时，建议为场景提供
稳定的 React `key`，以保留各标签的滚动位置。

## 自定义标签栏

```tsx
<ScrollTabView
  renderTabBar={props => (
    <ScrollableTabBar
      {...props}
      activeTextColor="#0b6bcb"
      underlineStyle={{ backgroundColor: '#0b6bcb' }}
    />
  )}>
  {/* 标签场景 */}
</ScrollTabView>
```

`DefaultTabBar` 和 `ScrollableTabBar` 均提供标签可访问性角色、选中状态和扩大的
点击区域。

## 主要属性

| 属性                         | 类型                                           | 默认值          |
| ---------------------------- | ---------------------------------------------- | --------------- |
| `initialPage`                | `number`                                       | `0`             |
| `page`                       | `number`                                       | 非受控          |
| `headerHeight`               | `number`                                       | 自动测量        |
| `insetValue`                 | `number`                                       | `0`             |
| `renderScrollHeader`         | `() => ReactNode`                              | 无              |
| `renderTabBar`               | `(props: TabBarProps) => ReactElement`         | `DefaultTabBar` |
| `tabBarPosition`             | `top \| bottom \| overlayTop \| overlayBottom` | `top`           |
| `locked`                     | `boolean`                                      | `false`         |
| `scrollWithoutAnimation`     | `boolean`                                      | `false`         |
| `prerenderingSiblingsNumber` | `number`                                       | `0`             |
| `onChangeTab`                | `({ i, from, ref }) => void`                   | 无              |
| `onScroll`                   | `(pagePosition: number) => void`               | 无              |
| `onContentScroll`            | `(offsetY: number) => void`                    | 无              |
| `contentProps`               | 受约束的 `PagerViewProps`                      | 无              |

公开类型包括 `ScrollTabViewProps`、`ScrollTabViewRef`、`TabBarProps`、
`TabSceneProps` 和列表组件属性类型。

## 从 1.x 迁移

1. 将 `@react-native-community/viewpager` 替换为
   `react-native-pager-view`。
2. 将应用升级到 React Native 0.82+ 新架构。
3. `onContentScroll` 的参数现在是数字类型的纵向偏移量。
4. `contentProps` 使用 `PagerViewProps`，不能覆盖由组件管理的分页回调。
5. 为标签场景增加 `TabSceneProps` 可获得完整类型检查。

组件名称、`tabLabel` 子组件 API、标签栏样式属性以及导出的 `FlatList` 和
`ScrollView` 名称保持不变。

[示例应用](./example)覆盖动态头部、动态标签、安全区、受控页面以及短内容。

## 开发

```sh
npm install
npm run validate
npm run ios --workspace example
# 或
npm run android --workspace example
```

2.0 首版采用手动发布。发布前必须通过 CI，并检查 `npm run pack:check` 的输出。

## 许可证

ISC
