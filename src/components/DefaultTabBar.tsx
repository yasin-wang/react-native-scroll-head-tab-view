import React from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import type { TabBarProps } from '../types';

export interface DefaultTabBarProps extends TabBarProps {
  activeTextStyle?: TabBarProps['textStyle'];
  hiddenUnderline?: boolean;
  inactiveTextStyle?: TabBarProps['textStyle'];
  tabStyle?: TabBarProps['tabBarStyle'];
}

export default function DefaultTabBar({
  activeTab,
  activeTextColor = '#202020',
  activeTextStyle,
  backgroundColor,
  containerWidth,
  goToPage,
  hiddenUnderline = false,
  inactiveTextColor = '#909090',
  inactiveTextStyle,
  paddingInset = 0,
  scrollValue,
  tabBarStyle,
  tabStyle,
  tabUnderlineWidth,
  tabWidth,
  tabs,
  textStyle,
  underlineStyle,
}: DefaultTabBarProps) {
  const numberOfTabs = tabs.length;
  const availableWidth = Math.max(0, containerWidth - paddingInset * 2);
  const resolvedTabWidth =
    tabWidth ?? (numberOfTabs > 0 ? availableWidth / numberOfTabs : 0);
  const resolvedUnderlineWidth = Math.min(
    tabUnderlineWidth ?? resolvedTabWidth * 0.6,
    resolvedTabWidth,
  );
  const maxPage = Math.max(0, numberOfTabs - 1);
  const translateX =
    maxPage > 0
      ? scrollValue.interpolate({
          inputRange: [0, maxPage],
          outputRange: [0, resolvedTabWidth * maxPage],
          extrapolate: 'clamp',
        })
      : 0;

  return (
    <View
      accessibilityRole="tablist"
      style={[
        styles.tabBar,
        backgroundColor ? { backgroundColor } : null,
        { paddingHorizontal: paddingInset },
        tabBarStyle,
      ]}>
      {!hiddenUnderline && numberOfTabs > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.underline,
            {
              left:
                paddingInset + (resolvedTabWidth - resolvedUnderlineWidth) / 2,
              transform: [{ translateX }],
              width: resolvedUnderlineWidth,
            },
            underlineStyle,
          ]}
        />
      ) : null}

      {tabs.map((label, page) => {
        const selected = activeTab === page;

        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            hitSlop={8}
            key={page}
            onPress={() => goToPage(page)}
            style={[
              styles.tab,
              tabWidth ? { width: tabWidth } : styles.flexTab,
              tabStyle,
            ]}>
            <Text
              style={[
                styles.text,
                textStyle,
                selected
                  ? [{ color: activeTextColor }, activeTextStyle]
                  : [{ color: inactiveTextColor }, inactiveTextStyle],
              ]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  flexTab: {
    flex: 1,
  },
  tab: {
    alignItems: 'center',
    height: 50,
    justifyContent: 'center',
  },
  tabBar: {
    alignItems: 'stretch',
    borderBottomColor: '#f0f0f0',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    height: 50,
  },
  text: {
    fontSize: 16,
  },
  underline: {
    backgroundColor: '#fe1966',
    borderRadius: 3,
    bottom: 1,
    height: 3,
    position: 'absolute',
  },
});
