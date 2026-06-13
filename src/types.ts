import type React from 'react';
import type {
  Animated,
  FlatListProps,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollViewProps,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import type { PagerViewProps } from 'react-native-pager-view';

export type TabBarPosition = 'top' | 'bottom' | 'overlayTop' | 'overlayBottom';

export interface TabLabelProps {
  tabLabel: React.ReactNode;
}

export interface TabChangeEvent {
  i: number;
  from: number;
  ref: React.ReactElement<TabLabelProps>;
}

export interface TabBarProps {
  activeTab: number;
  containerWidth: number;
  goToPage: (page: number) => void;
  scrollValue: Animated.Value;
  tabs: React.ReactNode[];
  style?: StyleProp<ViewStyle>;
  tabBarStyle?: StyleProp<ViewStyle>;
  activeTextColor?: string;
  inactiveTextColor?: string;
  textStyle?: StyleProp<TextStyle>;
  underlineStyle?: StyleProp<ViewStyle>;
  paddingInset?: number;
  tabWidth?: number;
  tabUnderlineWidth?: number;
  backgroundColor?: string;
}

export interface ScrollTabViewRef {
  goToPage: (page: number) => void;
}

export interface SceneController {
  scrollTo: (offset: number) => void;
}

export interface TabSceneProps {
  index?: number;
  isActive?: boolean;
  sceneKey?: string;
  collapseDistance?: number;
  contentInsetBottom?: number;
  contentInsetTop?: number;
  minimumContentHeight?: number;
  sharedScrollY?: Animated.Value;
  onSceneMount?: (
    sceneKey: string,
    index: number,
    controller: SceneController | null,
  ) => void;
  onSceneScroll?: (sceneKey: string, index: number, offset: number) => void;
}

export type CollapsibleScrollViewProps = ScrollViewProps &
  TabSceneProps & {
    tabLabel?: React.ReactNode;
  };

export type CollapsibleFlatListProps<ItemT> = FlatListProps<ItemT> &
  TabSceneProps & {
    tabLabel?: React.ReactNode;
  };

type ManagedPagerProps =
  | 'children'
  | 'initialPage'
  | 'onPageScroll'
  | 'onPageSelected'
  | 'ref'
  | 'scrollEnabled'
  | 'style';

export interface ScrollTabViewProps {
  children?: React.ReactNode;
  contentProps?: Omit<PagerViewProps, ManagedPagerProps>;
  headerHeight?: number;
  initialPage?: number;
  insetValue?: number;
  locked?: boolean;
  onChangeTab?: (event: TabChangeEvent) => void;
  onContentScroll?: (offset: number) => void;
  onScroll?: (position: number) => void;
  page?: number;
  prerenderingSiblingsNumber?: number;
  renderScrollHeader?: () => React.ReactNode;
  renderTabBar?: (props: TabBarProps) => React.ReactElement | null;
  scrollWithoutAnimation?: boolean;
  style?: StyleProp<ViewStyle>;
  tabBarActiveTextColor?: string;
  tabBarBackgroundColor?: string;
  tabBarInactiveTextColor?: string;
  tabBarPaddingInset?: number;
  tabBarPosition?: TabBarPosition;
  tabBarStyle?: StyleProp<ViewStyle>;
  tabBarTabUnderlineWidth?: number;
  tabBarTabWidth?: number;
  tabBarTextStyle?: StyleProp<TextStyle>;
  tabBarUnderlineStyle?: StyleProp<ViewStyle>;
}

export type PageScrollEvent = NativeSyntheticEvent<{
  offset: number;
  position: number;
}>;

export type SceneScrollEvent = NativeSyntheticEvent<NativeScrollEvent>;
