import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import {
  Animated,
  FlatList as NativeFlatList,
  ScrollView as NativeScrollView,
} from 'react-native';
import type {
  FlatList as NativeFlatListType,
  FlatListProps,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView as NativeScrollViewType,
  ScrollViewProps,
} from 'react-native';

import type {
  CollapsibleFlatListProps,
  CollapsibleScrollViewProps,
  SceneController,
  TabSceneProps,
} from '../types';

function setForwardedRef<T>(ref: React.ForwardedRef<T>, value: T | null) {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}

function useSceneScrollHandler({
  index = 0,
  isActive = false,
  onScroll,
  onSceneScroll,
  sceneKey = String(index),
  sharedScrollY,
}: {
  index: number;
  isActive: boolean;
  onSceneScroll: TabSceneProps['onSceneScroll'] | undefined;
  onScroll:
    | ((event: NativeSyntheticEvent<NativeScrollEvent>) => void)
    | undefined;
  sceneKey: string;
  sharedScrollY: Animated.Value | undefined;
}) {
  const listener = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offset = Math.max(0, event.nativeEvent.contentOffset.y);
      onSceneScroll?.(sceneKey, index, offset);
      onScroll?.(event);
    },
    [index, onSceneScroll, onScroll, sceneKey],
  );

  return useMemo(() => {
    if (!isActive || !sharedScrollY) {
      return listener;
    }

    return Animated.event(
      [{ nativeEvent: { contentOffset: { y: sharedScrollY } } }],
      {
        listener,
        useNativeDriver: true,
      },
    );
  }, [isActive, listener, sharedScrollY]);
}

const CollapsibleScrollView = forwardRef<
  NativeScrollViewType,
  CollapsibleScrollViewProps
>(function CollapsibleScrollViewComponent(
  {
    contentContainerStyle,
    collapseDistance: _collapseDistance,
    contentInsetBottom = 0,
    contentInsetTop = 0,
    index = 0,
    isActive = false,
    minimumContentHeight,
    onSceneMount,
    onSceneScroll,
    onScroll,
    sceneKey = String(index),
    scrollEventThrottle = 16,
    sharedScrollY,
    tabLabel: _tabLabel,
    ...props
  },
  forwardedRef,
) {
  void _collapseDistance;
  void _tabLabel;

  const nativeRef = useRef<NativeScrollViewType>(null);
  const scrollHandler = useSceneScrollHandler({
    index,
    isActive,
    onScroll,
    onSceneScroll,
    sceneKey,
    sharedScrollY,
  });

  const scrollTo = useCallback((offset: number) => {
    nativeRef.current?.scrollTo({ animated: false, x: 0, y: offset });
  }, []);

  useEffect(() => {
    const controller: SceneController = { scrollTo };
    onSceneMount?.(sceneKey, index, controller);

    return () => {
      onSceneMount?.(sceneKey, index, null);
    };
  }, [index, onSceneMount, sceneKey, scrollTo]);

  return (
    <NativeScrollView
      {...props}
      contentContainerStyle={[
        contentContainerStyle,
        {
          minHeight: minimumContentHeight,
          paddingBottom: contentInsetBottom,
          paddingTop: contentInsetTop,
        },
      ]}
      onScroll={scrollHandler}
      ref={value => {
        nativeRef.current = value;
        setForwardedRef(forwardedRef, value);
      }}
      scrollEventThrottle={scrollEventThrottle}
    />
  );
});

function CollapsibleFlatListInner<ItemT>(
  {
    contentContainerStyle,
    collapseDistance: _collapseDistance,
    contentInsetBottom = 0,
    contentInsetTop = 0,
    index = 0,
    isActive = false,
    minimumContentHeight,
    onSceneMount,
    onSceneScroll,
    onScroll,
    sceneKey = String(index),
    scrollEventThrottle = 16,
    sharedScrollY,
    tabLabel: _tabLabel,
    ...props
  }: CollapsibleFlatListProps<ItemT>,
  forwardedRef: React.ForwardedRef<NativeFlatListType<ItemT>>,
) {
  void _collapseDistance;
  void _tabLabel;

  const nativeRef = useRef<NativeFlatListType<ItemT>>(null);
  const scrollHandler = useSceneScrollHandler({
    index,
    isActive,
    onScroll,
    onSceneScroll,
    sceneKey,
    sharedScrollY,
  });

  const scrollTo = useCallback((offset: number) => {
    nativeRef.current?.scrollToOffset({ animated: false, offset });
  }, []);

  useEffect(() => {
    const controller: SceneController = { scrollTo };
    onSceneMount?.(sceneKey, index, controller);

    return () => {
      onSceneMount?.(sceneKey, index, null);
    };
  }, [index, onSceneMount, sceneKey, scrollTo]);

  return (
    <NativeFlatList
      {...props}
      contentContainerStyle={[
        contentContainerStyle,
        {
          minHeight: minimumContentHeight,
          paddingBottom: contentInsetBottom,
          paddingTop: contentInsetTop,
        },
      ]}
      onScroll={scrollHandler}
      ref={value => {
        nativeRef.current = value;
        setForwardedRef(forwardedRef, value);
      }}
      scrollEventThrottle={scrollEventThrottle}
    />
  );
}

type FlatListComponent = <ItemT>(
  props: FlatListProps<ItemT> &
    TabSceneProps & {
      ref?: React.ForwardedRef<NativeFlatListType<ItemT>>;
      tabLabel?: React.ReactNode;
    },
) => React.ReactElement;

export const ScrollView = CollapsibleScrollView;
export const FlatList = forwardRef(
  CollapsibleFlatListInner,
) as FlatListComponent;

export type { ScrollViewProps, FlatListProps };
