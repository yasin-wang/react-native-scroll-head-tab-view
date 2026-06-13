import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import type { LayoutChangeEvent, NativeSyntheticEvent } from 'react-native';
import PagerView from 'react-native-pager-view';

import DefaultTabBar from './components/DefaultTabBar';
import { getSyncedSceneOffset } from './scrollSync';
import type {
  PageScrollEvent,
  SceneController,
  ScrollTabViewProps,
  ScrollTabViewRef,
  TabBarProps,
  TabLabelProps,
  TabSceneProps,
} from './types';

const DEFAULT_TAB_BAR_HEIGHT = 50;

function clampPage(page: number, pageCount: number) {
  if (pageCount <= 0 || !Number.isFinite(page)) {
    return 0;
  }

  return Math.min(Math.max(Math.trunc(page), 0), pageCount - 1);
}

function getSceneKey(
  child: React.ReactElement<TabLabelProps & TabSceneProps>,
  index: number,
) {
  return String(child.key ?? `${String(child.props.tabLabel)}_${index}`);
}

function flattenScenes(children: React.ReactNode) {
  const result: React.ReactElement<TabLabelProps & TabSceneProps>[] = [];

  React.Children.forEach(children, child => {
    if (!React.isValidElement(child)) {
      return;
    }

    if (child.type === React.Fragment) {
      flattenScenes(
        (child.props as { children?: React.ReactNode }).children,
      ).forEach(scene => result.push(scene));
      return;
    }

    result.push(child as React.ReactElement<TabLabelProps & TabSceneProps>);
  });

  return result;
}

const ScrollTabView = forwardRef<ScrollTabViewRef, ScrollTabViewProps>(
  function ScrollTabViewComponent(
    {
      children,
      contentProps,
      headerHeight,
      initialPage = 0,
      insetValue = 0,
      locked = false,
      onChangeTab,
      onContentScroll,
      onScroll,
      page,
      prerenderingSiblingsNumber = 0,
      renderScrollHeader,
      renderTabBar,
      scrollWithoutAnimation = false,
      style,
      tabBarActiveTextColor,
      tabBarBackgroundColor,
      tabBarInactiveTextColor,
      tabBarPaddingInset,
      tabBarPosition = 'top',
      tabBarStyle,
      tabBarTabUnderlineWidth,
      tabBarTabWidth,
      tabBarTextStyle,
      tabBarUnderlineStyle,
    },
    forwardedRef,
  ) {
    const scenes = useMemo(() => flattenScenes(children), [children]);
    const pageCount = scenes.length;
    const pagerRef = useRef<React.ElementRef<typeof PagerView>>(null);
    const sceneControllers = useRef(new Map<string, SceneController>());
    const sceneOffsets = useRef(new Map<string, number>());
    const currentPageRef = useRef(clampPage(initialPage, pageCount));
    const currentSceneKeyRef = useRef<string | null>(
      scenes[currentPageRef.current]
        ? getSceneKey(scenes[currentPageRef.current]!, currentPageRef.current)
        : null,
    );
    const sharedScrollY = useRef(new Animated.Value(0)).current;
    const pageScrollValue = useRef(
      new Animated.Value(currentPageRef.current),
    ).current;
    const [currentPage, setCurrentPage] = useState(currentPageRef.current);
    const [containerSize, setContainerSize] = useState({
      height: 0,
      width: 0,
    });
    const [measuredHeaderHeight, setMeasuredHeaderHeight] = useState(0);
    const [tabBarHeight, setTabBarHeight] = useState(DEFAULT_TAB_BAR_HEIGHT);
    const [loadedSceneKeys, setLoadedSceneKeys] = useState<Set<string>>(
      () => new Set(),
    );

    const resolvedHeaderHeight = renderScrollHeader
      ? Math.max(0, headerHeight ?? measuredHeaderHeight)
      : 0;
    const collapseDistance = Math.max(
      0,
      resolvedHeaderHeight - Math.max(0, insetValue),
    );
    const isTopTabBar =
      tabBarPosition === 'top' || tabBarPosition === 'overlayTop';
    const contentInsetTop =
      resolvedHeaderHeight + (tabBarPosition === 'top' ? tabBarHeight : 0);
    const contentInsetBottom =
      tabBarPosition === 'overlayBottom' ? tabBarHeight : 0;
    const minimumContentHeight = Math.max(
      0,
      containerSize.height -
        (tabBarPosition === 'bottom' ? tabBarHeight : 0) +
        collapseDistance,
    );

    const updateLoadedScenes = useCallback(
      (targetPage: number) => {
        setLoadedSceneKeys(previous => {
          const validKeys = new Set(
            scenes.map((child, index) => getSceneKey(child, index)),
          );
          const next = new Set([...previous].filter(key => validKeys.has(key)));
          const siblingCount = Math.max(
            0,
            Math.trunc(prerenderingSiblingsNumber),
          );

          for (
            let index = Math.max(0, targetPage - siblingCount);
            index <= Math.min(pageCount - 1, targetPage + siblingCount);
            index += 1
          ) {
            const child = scenes[index];
            if (child) {
              next.add(getSceneKey(child, index));
            }
          }

          return next;
        });
      },
      [pageCount, prerenderingSiblingsNumber, scenes],
    );

    useEffect(() => {
      updateLoadedScenes(currentPageRef.current);
    }, [updateLoadedScenes]);

    const syncScene = useCallback(
      (fromPage: number, toPage: number) => {
        const fromScene = scenes[fromPage];
        const toScene = scenes[toPage];
        if (!fromScene || !toScene) {
          return;
        }
        const fromKey =
          currentSceneKeyRef.current ?? getSceneKey(fromScene, fromPage);
        const toKey = getSceneKey(toScene, toPage);
        const fromOffset = sceneOffsets.current.get(fromKey) ?? 0;
        const toOffset = sceneOffsets.current.get(toKey) ?? 0;
        const nextOffset = getSyncedSceneOffset(
          fromOffset,
          toOffset,
          collapseDistance,
        );

        sceneOffsets.current.set(toKey, nextOffset);
        sceneControllers.current.get(toKey)?.scrollTo(nextOffset);
        sharedScrollY.setValue(nextOffset);
        onContentScroll?.(nextOffset);
      },
      [collapseDistance, onContentScroll, scenes, sharedScrollY],
    );

    const selectPage = useCallback(
      (nextPage: number) => {
        if (pageCount === 0) {
          return;
        }

        const boundedPage = clampPage(nextPage, pageCount);
        const previousPage = currentPageRef.current;

        if (boundedPage === previousPage) {
          updateLoadedScenes(boundedPage);
          return;
        }

        syncScene(previousPage, boundedPage);
        currentPageRef.current = boundedPage;
        currentSceneKeyRef.current = getSceneKey(
          scenes[boundedPage]!,
          boundedPage,
        );
        setCurrentPage(boundedPage);
        updateLoadedScenes(boundedPage);
        onChangeTab?.({
          from: previousPage,
          i: boundedPage,
          ref: scenes[boundedPage]!,
        });
      },
      [onChangeTab, pageCount, scenes, syncScene, updateLoadedScenes],
    );

    const goToPage = useCallback(
      (nextPage: number) => {
        if (pageCount === 0 || !Number.isFinite(nextPage)) {
          return;
        }

        const boundedPage = clampPage(nextPage, pageCount);
        updateLoadedScenes(boundedPage);

        if (scrollWithoutAnimation) {
          pagerRef.current?.setPageWithoutAnimation(boundedPage);
        } else {
          pagerRef.current?.setPage(boundedPage);
        }
      },
      [pageCount, scrollWithoutAnimation, updateLoadedScenes],
    );

    useImperativeHandle(forwardedRef, () => ({ goToPage }), [goToPage]);

    useEffect(() => {
      if (page === undefined || pageCount === 0) {
        return;
      }

      const boundedPage = clampPage(page, pageCount);
      if (boundedPage !== currentPageRef.current) {
        goToPage(boundedPage);
      }
    }, [goToPage, page, pageCount]);

    useEffect(() => {
      if (pageCount === 0) {
        currentPageRef.current = 0;
        currentSceneKeyRef.current = null;
        setCurrentPage(0);
        pageScrollValue.setValue(0);
        sceneControllers.current.clear();
        sceneOffsets.current.clear();
        return;
      }

      const previousSceneKey = currentSceneKeyRef.current;
      const matchingPage =
        previousSceneKey === null
          ? -1
          : scenes.findIndex(
              (scene, index) => getSceneKey(scene, index) === previousSceneKey,
            );
      const boundedPage =
        matchingPage >= 0
          ? matchingPage
          : clampPage(currentPageRef.current, pageCount);
      if (boundedPage !== currentPageRef.current) {
        const previousPage = currentPageRef.current;
        currentPageRef.current = boundedPage;
        currentSceneKeyRef.current = getSceneKey(
          scenes[boundedPage]!,
          boundedPage,
        );
        setCurrentPage(boundedPage);
        pageScrollValue.setValue(boundedPage);
        pagerRef.current?.setPageWithoutAnimation(boundedPage);
        onChangeTab?.({
          from: previousPage,
          i: boundedPage,
          ref: scenes[boundedPage]!,
        });
      } else {
        currentSceneKeyRef.current = getSceneKey(
          scenes[boundedPage]!,
          boundedPage,
        );
      }
    }, [onChangeTab, pageCount, pageScrollValue, scenes]);

    useEffect(() => {
      const activeOffset = currentSceneKeyRef.current
        ? (sceneOffsets.current.get(currentSceneKeyRef.current) ?? 0)
        : 0;
      sharedScrollY.setValue(activeOffset);
    }, [collapseDistance, resolvedHeaderHeight, scenes, sharedScrollY]);

    const onSceneMount = useCallback(
      (sceneKey: string, index: number, controller: SceneController | null) => {
        if (controller) {
          sceneControllers.current.set(sceneKey, controller);
          if (index === currentPageRef.current) {
            controller.scrollTo(sceneOffsets.current.get(sceneKey) ?? 0);
          }
        } else {
          sceneControllers.current.delete(sceneKey);
        }
      },
      [],
    );

    const onSceneScroll = useCallback(
      (sceneKey: string, index: number, offset: number) => {
        sceneOffsets.current.set(sceneKey, offset);
        if (index === currentPageRef.current) {
          onContentScroll?.(offset);
        }
      },
      [onContentScroll],
    );

    const handlePageScroll = useCallback(
      (event: PageScrollEvent) => {
        const { offset, position } = event.nativeEvent;
        const value = position + offset;
        pageScrollValue.setValue(value);
        onScroll?.(value);
      },
      [onScroll, pageScrollValue],
    );

    const handlePageSelected = useCallback(
      (
        event: NativeSyntheticEvent<{
          position: number;
        }>,
      ) => {
        const nextPage = clampPage(event.nativeEvent.position, pageCount);
        pageScrollValue.setValue(nextPage);
        selectPage(nextPage);
      },
      [pageCount, pageScrollValue, selectPage],
    );

    const handleLayout = useCallback((event: LayoutChangeEvent) => {
      const { height, width } = event.nativeEvent.layout;
      setContainerSize(previous => {
        if (
          Math.round(previous.height) === Math.round(height) &&
          Math.round(previous.width) === Math.round(width)
        ) {
          return previous;
        }
        return { height, width };
      });
    }, []);

    const headerTranslateY =
      collapseDistance > 0
        ? sharedScrollY.interpolate({
            inputRange: [0, collapseDistance],
            outputRange: [0, -collapseDistance],
            extrapolate: 'clamp',
          })
        : 0;

    const tabBarProps: TabBarProps = {
      activeTab: currentPage,
      containerWidth: containerSize.width,
      goToPage,
      scrollValue: pageScrollValue,
      tabs: scenes.map(child => child.props.tabLabel),
      ...(tabBarStyle ? { tabBarStyle } : {}),
      ...(tabBarActiveTextColor
        ? { activeTextColor: tabBarActiveTextColor }
        : {}),
      ...(tabBarInactiveTextColor
        ? { inactiveTextColor: tabBarInactiveTextColor }
        : {}),
      ...(tabBarTextStyle ? { textStyle: tabBarTextStyle } : {}),
      ...(tabBarUnderlineStyle ? { underlineStyle: tabBarUnderlineStyle } : {}),
      ...(tabBarPaddingInset !== undefined
        ? { paddingInset: tabBarPaddingInset }
        : {}),
      ...(tabBarTabWidth !== undefined ? { tabWidth: tabBarTabWidth } : {}),
      ...(tabBarTabUnderlineWidth !== undefined
        ? { tabUnderlineWidth: tabBarTabUnderlineWidth }
        : {}),
      ...(tabBarBackgroundColor
        ? { backgroundColor: tabBarBackgroundColor }
        : {}),
    };

    const tabBar = (
      <View
        onLayout={event => {
          const nextHeight = event.nativeEvent.layout.height;
          if (nextHeight > 0) {
            setTabBarHeight(nextHeight);
          }
        }}>
        {renderTabBar ? (
          renderTabBar(tabBarProps)
        ) : (
          <DefaultTabBar {...tabBarProps} />
        )}
      </View>
    );

    const renderPager = () => {
      if (pageCount === 0) {
        return <View style={styles.pager} />;
      }

      return (
        <PagerView
          {...contentProps}
          initialPage={clampPage(initialPage, pageCount)}
          onPageScroll={handlePageScroll}
          onPageSelected={handlePageSelected}
          ref={pagerRef}
          scrollEnabled={!locked}
          style={styles.pager}>
          {scenes.map((child, index) => {
            const key = getSceneKey(child, index);
            const shouldRender = loadedSceneKeys.has(key);

            return (
              <View collapsable={false} key={key} style={styles.scene}>
                {shouldRender
                  ? React.cloneElement(child, {
                      collapseDistance,
                      contentInsetBottom,
                      contentInsetTop,
                      index,
                      isActive: index === currentPage,
                      minimumContentHeight,
                      onSceneMount,
                      onSceneScroll,
                      sceneKey: key,
                      sharedScrollY,
                    })
                  : null}
              </View>
            );
          })}
        </PagerView>
      );
    };

    return (
      <View onLayout={handleLayout} style={[styles.container, style]}>
        {renderPager()}

        {renderScrollHeader ? (
          <Animated.View
            pointerEvents="box-none"
            style={[
              styles.header,
              {
                height:
                  headerHeight === undefined ? undefined : resolvedHeaderHeight,
                transform: [{ translateY: headerTranslateY }],
              },
            ]}>
            <View
              onLayout={event => {
                if (headerHeight === undefined) {
                  setMeasuredHeaderHeight(event.nativeEvent.layout.height);
                }
              }}>
              {renderScrollHeader()}
            </View>
          </Animated.View>
        ) : null}

        {isTopTabBar ? (
          <Animated.View
            style={[
              styles.topTabBar,
              {
                top: resolvedHeaderHeight,
                transform: [{ translateY: headerTranslateY }],
              },
            ]}>
            {tabBar}
          </Animated.View>
        ) : null}

        {tabBarPosition === 'bottom' ? tabBar : null}

        {tabBarPosition === 'overlayBottom' ? (
          <View style={styles.bottomTabBar}>{tabBar}</View>
        ) : null}
      </View>
    );
  },
);

export default ScrollTabView;

const styles = StyleSheet.create({
  bottomTabBar: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    zIndex: 20,
  },
  container: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  header: {
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 10,
  },
  pager: {
    flex: 1,
  },
  scene: {
    flex: 1,
  },
  topTabBar: {
    left: 0,
    position: 'absolute',
    right: 0,
    zIndex: 20,
  },
});
