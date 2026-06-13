import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type {
  LayoutChangeEvent,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';

import type { TabBarProps } from '../types';

interface TabMeasurement {
  left: number;
  right: number;
  width: number;
}

export interface ScrollableTabBarProps extends TabBarProps {
  renderTab?: (
    label: React.ReactNode,
    page: number,
    selected: boolean,
    onPress: () => void,
    onLayout: (event: LayoutChangeEvent) => void,
  ) => React.ReactNode;
  scrollOffset?: number;
  tabStyle?: StyleProp<ViewStyle>;
  tabsContainerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export default function ScrollableTabBar({
  activeTab,
  activeTextColor = 'navy',
  backgroundColor,
  containerWidth,
  goToPage,
  inactiveTextColor = '#202020',
  renderTab,
  scrollValue,
  style,
  tabStyle,
  tabUnderlineWidth,
  tabs,
  tabsContainerStyle,
  textStyle,
  underlineStyle,
}: ScrollableTabBarProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const measurementsRef = useRef<Array<TabMeasurement | undefined>>([]);
  const tabContainerWidthRef = useRef(0);
  const latestPositionRef = useRef(activeTab);
  const underlineLeft = useRef(new Animated.Value(0)).current;
  const underlineWidth = useRef(new Animated.Value(0)).current;
  const [measuredContainerWidth, setMeasuredContainerWidth] =
    useState(containerWidth);

  const update = useCallback(
    (positionValue: number) => {
      if (tabs.length === 0 || positionValue < 0) {
        return;
      }

      const boundedPosition = Math.min(positionValue, tabs.length - 1);
      const position = Math.floor(boundedPosition);
      const pageOffset = boundedPosition - position;
      const current = measurementsRef.current[position];
      const next = measurementsRef.current[position + 1];

      if (!current) {
        return;
      }

      const nextMeasurement = next ?? current;
      const lineLeft =
        current.left + (nextMeasurement.left - current.left) * pageOffset;
      const lineRight =
        current.right + (nextMeasurement.right - current.right) * pageOffset;
      const tabLineWidth = lineRight - lineLeft;
      const nextUnderlineWidth = Math.min(
        tabUnderlineWidth ?? tabLineWidth * 0.6,
        tabLineWidth,
      );
      const nextUnderlineLeft =
        lineLeft + (tabLineWidth - nextUnderlineWidth) / 2;

      underlineLeft.setValue(nextUnderlineLeft);
      underlineWidth.setValue(nextUnderlineWidth);

      const viewportWidth = measuredContainerWidth || containerWidth;
      const tabCenter = lineLeft + tabLineWidth / 2;
      const maxScroll = Math.max(
        0,
        tabContainerWidthRef.current - viewportWidth,
      );
      const nextScrollX = Math.max(
        0,
        Math.min(maxScroll, tabCenter - viewportWidth / 2),
      );

      scrollViewRef.current?.scrollTo({
        animated: false,
        x: nextScrollX,
        y: 0,
      });
    },
    [
      containerWidth,
      measuredContainerWidth,
      tabUnderlineWidth,
      tabs.length,
      underlineLeft,
      underlineWidth,
    ],
  );

  useEffect(() => {
    const listenerId = scrollValue.addListener(({ value }) => {
      latestPositionRef.current = value;
      update(value);
    });

    return () => {
      scrollValue.removeListener(listenerId);
    };
  }, [scrollValue, update]);

  useEffect(() => {
    latestPositionRef.current = activeTab;
    update(activeTab);
  }, [activeTab, tabs, update]);

  const defaultRenderTab = useCallback(
    (
      label: React.ReactNode,
      page: number,
      selected: boolean,
      onPress: () => void,
      onLayout: (event: LayoutChangeEvent) => void,
    ) => (
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected }}
        hitSlop={8}
        key={page}
        onLayout={onLayout}
        onPress={onPress}
        style={[styles.tab, tabStyle]}>
        <Text
          style={[
            styles.text,
            textStyle,
            { color: selected ? activeTextColor : inactiveTextColor },
            selected ? styles.selectedText : null,
          ]}>
          {label}
        </Text>
      </Pressable>
    ),
    [activeTextColor, inactiveTextColor, tabStyle, textStyle],
  );

  const renderedTabs = useMemo(
    () =>
      tabs.map((label, page) => {
        const selected = activeTab === page;
        const onLayout = (event: LayoutChangeEvent) => {
          const { width, x } = event.nativeEvent.layout;
          measurementsRef.current[page] = {
            left: x,
            right: x + width,
            width,
          };
          update(latestPositionRef.current);
        };

        return (renderTab ?? defaultRenderTab)(
          label,
          page,
          selected,
          () => goToPage(page),
          onLayout,
        );
      }),
    [activeTab, defaultRenderTab, goToPage, renderTab, tabs, update],
  );

  return (
    <View
      accessibilityRole="tablist"
      onLayout={event => {
        setMeasuredContainerWidth(event.nativeEvent.layout.width);
      }}
      style={[
        styles.container,
        backgroundColor ? { backgroundColor } : null,
        style,
      ]}>
      <ScrollView
        bounces={false}
        directionalLockEnabled
        horizontal
        ref={scrollViewRef}
        scrollsToTop={false}
        showsHorizontalScrollIndicator={false}>
        <View
          onLayout={event => {
            tabContainerWidthRef.current = Math.max(
              event.nativeEvent.layout.width,
              measuredContainerWidth,
            );
            update(latestPositionRef.current);
          }}
          style={[
            styles.tabs,
            { minWidth: measuredContainerWidth },
            tabsContainerStyle,
          ]}>
          {renderedTabs}
          {tabs.length > 0 ? (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.underline,
                {
                  left: underlineLeft,
                  width: underlineWidth,
                },
                underlineStyle,
              ]}
            />
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomColor: '#cccccc',
    borderBottomWidth: StyleSheet.hairlineWidth,
    height: 50,
  },
  selectedText: {
    fontWeight: '600',
  },
  tab: {
    alignItems: 'center',
    height: 49,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  text: {
    fontSize: 16,
  },
  underline: {
    backgroundColor: 'navy',
    bottom: 0,
    height: 4,
    position: 'absolute',
  },
});
