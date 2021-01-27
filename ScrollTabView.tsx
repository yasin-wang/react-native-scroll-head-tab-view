import React, { Component, RefObject } from 'react';
import { View, Animated, ScrollView, Dimensions, Platform, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import ViewPager from '@react-native-community/viewpager';
import SceneComponent from './components/SceneComponent';
import DefaultTabBar from './components/DefaultTabBar';

const AnimatedViewPagerAndroid = Platform.OS === 'android' ? Animated.createAnimatedComponent(ViewPager) : undefined;

interface Props {
    tabBarPosition?: 'top' | 'bottom' | 'overlayTop' | 'overlayBottom';
    initialPage?: number;
    page?: number;
    onChangeTab?: ({ i: number, ref: RefObject, from: number }) => void;
    onScroll?: (o: number) => void;
    onContentScroll?: (o: Animated.value) => void; //tab容器滑动改变offsetY值，触发该事件
    renderTabBar?: (p: any) => React.ReactElement;
    renderScrollHeader?: (p: any) => React.ReactElement;
    insetValue?: number; // 状态栏的高度，也就是TabBar距离顶部状态栏的距离
    headerHeight?: number;
    tabBarStyle?: ViewStyle;
    tabBarPaddingInset?: number;
    tabBarTabWidth?: number;
    tabBarTabUnderlineWidth?: number;
    tabBarUnderlineStyle?: ViewStyle;
    tabBarBackgroundColor?: string;
    tabBarActiveTextColor?: string;
    tabBarInactiveTextColor?: string;
    tabBarTextStyle?: TextStyle;
    style?: ViewStyle;
    contentProps?: object;
    scrollWithoutAnimation?: boolean;
    locked?: boolean;
    prerenderingSiblingsNumber?: number;
}

const DEFAULT_PROPS = {
    tabBarPosition: 'top',
    initialPage: 0,
    insetValue: 0,
    page: -1,
    onChangeTab: () => {},
    onScroll: () => {},
    contentProps: {},
    scrollWithoutAnimation: false,
    locked: false,
    prerenderingSiblingsNumber: 0,
};

const IS_IOS = Platform.OS === 'ios';
const dw = Dimensions.get('window').width;
const dh = Dimensions.get('window').height;

export default class ScrollableTabView extends Component<Props> {
    static defaultProps = DEFAULT_PROPS;

    constructor(props: Props) {
        super(props);
        const containerWidth = dw;
        const containerHeight = dh;
        const containerOffsetY = new Animated.Value(0);
        let scrollValue;
        let scrollXIOS;
        let positionAndroid;
        let offsetAndroid;

        if (IS_IOS) {
            scrollXIOS = new Animated.Value(props.initialPage * containerWidth);
            const containerWidthAnimatedValue = new Animated.Value(containerWidth);
            // Need to call __makeNative manually to avoid a native animated bug. See
            // https://github.com/facebook/react-native/pull/14435
            containerWidthAnimatedValue.__makeNative();
            scrollValue = Animated.divide(scrollXIOS, containerWidthAnimatedValue);

            const callListeners = this._polyfillAnimatedValue(scrollValue);
            scrollXIOS.addListener(({ value }) => callListeners(value / containerWidth));
        } else {
            positionAndroid = new Animated.Value(props.initialPage);
            offsetAndroid = new Animated.Value(0);
            scrollValue = Animated.add(positionAndroid, offsetAndroid);

            const callListeners = this._polyfillAnimatedValue(scrollValue);
            let positionAndroidValue = props.initialPage;
            let offsetAndroidValue = 0;
            positionAndroid.addListener(({ value }) => {
                positionAndroidValue = value;
                callListeners(positionAndroidValue + offsetAndroidValue);
            });
            offsetAndroid.addListener(({ value }) => {
                offsetAndroidValue = value;
                callListeners(positionAndroidValue + offsetAndroidValue);
            });
        }
        if (props.onContentScroll) {
            containerOffsetY.addListener(props.onContentScroll);
        }
        this.state = {
            currentPage: props.initialPage,
            scrollValue,
            scrollXIOS,
            positionAndroid,
            offsetAndroid,
            containerOffsetY,
            tabBarHeight: 0,
            containerWidth,
            containerHeight,
            sceneKeys: this.newSceneKeys({ currentPage: props.initialPage }),
        };
    }

    componentDidUpdate(prevProps) {
        if (this.props.children !== prevProps.children) {
            this.updateSceneKeys({ page: this.state.currentPage, children: this.props.children });
        }

        if (this.props.page >= 0 && this.props.page !== this.state.currentPage) {
            this.goToPage(this.props.page);
        }
    }

    componentWillUnmount() {
        if (IS_IOS) {
            this.state.scrollXIOS.removeAllListeners();
        } else {
            this.state.positionAndroid.removeAllListeners();
            this.state.offsetAndroid.removeAllListeners();
        }
        if (this.props.onContentScroll) {
            this.state.containerOffsetY.removeListener(this.props.onContentScroll);
        }
    }

    goToPage = (pageNumber) => {
        if (IS_IOS) {
            const offset = pageNumber * this.state.containerWidth;
            if (this.scrollView) {
                this.scrollView.getNode().scrollTo({ x: offset, y: 0, animated: !this.props.scrollWithoutAnimation });
            }
        } else {
            if (this.scrollView) {
                if (this.props.scrollWithoutAnimation) {
                    this.scrollView.getNode().setPageWithoutAnimation(pageNumber);
                } else {
                    this.scrollView.getNode().setPage(pageNumber);
                }
            }
        }

        const currentPage = this.state.currentPage;
        this.updateSceneKeys({
            page: pageNumber,
            callback: this._onChangeTab.bind(this, currentPage, pageNumber),
        });
    };

    _tabBarOnLayout = (event) => {
        this.setState({ tabBarHeight: event.nativeEvent.layout.height });
    };

    renderTabBar = ({ style, ...tabBarProps }) => {
        const { containerOffsetY } = this.state;
        const { insetValue, headerHeight } = this.props;
        const tabBarStyle = { zIndex: 100 };
        if (this.props.renderScrollHeader) {
            tabBarStyle.transform = [
                {
                    translateY: containerOffsetY.interpolate({
                        inputRange: [0, headerHeight - insetValue],
                        outputRange: [headerHeight, insetValue],
                        extrapolateRight: 'clamp',
                    }),
                },
            ];
        }
        const tabBarContent = this.props.renderTabBar ? (
            this.props.renderTabBar(tabBarProps)
        ) : (
            <DefaultTabBar {...tabBarProps} />
        );
        return (
            <Animated.View onLayout={this._tabBarOnLayout} style={[style, tabBarStyle]}>
                {tabBarContent}
            </Animated.View>
        );
    };

    // 渲染可滑动头部
    renderHeader = () => {
        const { renderScrollHeader, headerHeight } = this.props;
        const { containerOffsetY, containerWidth } = this.state;
        if (!renderScrollHeader) return null;

        return (
            <Animated.View
                style={{
                    position: 'absolute',
                    zIndex: 10,
                    top: 0,
                    width: containerWidth,
                    transform: [
                        {
                            translateY: containerOffsetY.interpolate({
                                inputRange: [0, headerHeight],
                                outputRange: [0, -headerHeight],
                            }),
                        },
                    ],
                }}>
                {renderScrollHeader()}
            </Animated.View>
        );
    };

    updateSceneKeys = ({ page, children = this.props.children, callback = () => {} }) => {
        let newKeys = this.newSceneKeys({ previousKeys: this.state.sceneKeys, currentPage: page, children });
        this.setState({ currentPage: page, sceneKeys: newKeys }, callback);
    };

    newSceneKeys = ({ previousKeys = [], currentPage = 0, children = this.props.children }) => {
        let newKeys = [];
        this._children(children).forEach((child, idx) => {
            let key = this._makeSceneKey(child, idx);
            if (this._keyExists(previousKeys, key) || this._shouldRenderSceneKey(idx, currentPage)) {
                newKeys.push(key);
            }
        });
        return newKeys;
    };

    // Animated.add and Animated.divide do not currently support listeners so
    // we have to polyfill it here since a lot of code depends on being able
    // to add a listener to `scrollValue`. See https://github.com/facebook/react-native/pull/12620.
    _polyfillAnimatedValue = (animatedValue) => {
        const listeners = new Set();
        const addListener = (listener) => {
            listeners.add(listener);
        };

        const removeListener = (listener) => {
            listeners.delete(listener);
        };

        const removeAllListeners = () => {
            listeners.clear();
        };

        animatedValue.addListener = addListener;
        animatedValue.removeListener = removeListener;
        animatedValue.removeAllListeners = removeAllListeners;

        return (value) => listeners.forEach((listener) => listener({ value }));
    };

    _shouldRenderSceneKey = (idx, currentPageKey) => {
        let numOfSibling = this.props.prerenderingSiblingsNumber;
        return idx < currentPageKey + numOfSibling + 1 && idx > currentPageKey - numOfSibling - 1;
    };

    _keyExists = (sceneKeys, key) => {
        return sceneKeys.find((sceneKey) => key === sceneKey);
    };

    _makeSceneKey = (child, idx) => {
        return child.props.tabLabel + '_' + idx;
    };

    renderScrollableContent = () => {
        if (IS_IOS) {
            const scenes = this._composeScenes();
            return (
                <Animated.ScrollView
                    horizontal
                    pagingEnabled
                    automaticallyAdjustContentInsets={false}
                    contentOffset={{ x: this.props.initialPage * this.state.containerWidth }}
                    ref={(scrollView) => {
                        this.scrollView = scrollView;
                    }}
                    onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: this.state.scrollXIOS } } }], {
                        useNativeDriver: true,
                        listener: this._onScroll,
                    })}
                    onMomentumScrollBegin={this._onMomentumScrollBeginAndEnd}
                    onMomentumScrollEnd={this._onMomentumScrollBeginAndEnd}
                    scrollEventThrottle={16}
                    scrollsToTop={false}
                    showsHorizontalScrollIndicator={false}
                    scrollEnabled={!this.props.locked}
                    directionalLockEnabled
                    alwaysBounceVertical={false}
                    keyboardDismissMode="on-drag"
                    {...this.props.contentProps}>
                    {scenes}
                </Animated.ScrollView>
            );
        } else {
            const scenes = this._composeScenes();
            return (
                <AnimatedViewPagerAndroid
                    key={this._children().length}
                    style={styles.container}
                    initialPage={this.props.initialPage}
                    onPageSelected={this._updateSelectedPage}
                    keyboardDismissMode="on-drag"
                    scrollEnabled={!this.props.locked}
                    onPageScroll={Animated.event(
                        [
                            {
                                nativeEvent: {
                                    position: this.state.positionAndroid,
                                    offset: this.state.offsetAndroid,
                                },
                            },
                        ],
                        {
                            useNativeDriver: true,
                            listener: this._onScroll,
                        },
                    )}
                    ref={(scrollView) => {
                        this.scrollView = scrollView;
                    }}
                    {...this.props.contentProps}>
                    {scenes}
                </AnimatedViewPagerAndroid>
            );
        }
    };

    _creatSceneParams = (index) => {
        const { renderScrollHeader, headerHeight, insetValue } = this.props;
        const { currentPage, containerOffsetY, containerHeight, tabBarHeight } = this.state;
        if (!renderScrollHeader) {
            return { isActive: currentPage == index };
        }
        const params = { index, isActive: currentPage == index, containerOffsetY, headerHeight };
        params.sceneHeight = headerHeight + containerHeight - tabBarHeight - insetValue;
        return params;
    };

    _composeScenes = () => {
        return this._children().map((child, idx) => {
            let key = this._makeSceneKey(child, idx);
            // 如果有scrollHeader，标签页必须保持update状态
            const showUpdate = this.props.renderScrollHeader
                ? true
                : this._shouldRenderSceneKey(idx, this.state.currentPage);
            return (
                <SceneComponent key={child.key} shouldUpdated={showUpdate} style={{ width: this.state.containerWidth }}>
                    {this._keyExists(this.state.sceneKeys, key) ? (
                        React.cloneElement(child, this._creatSceneParams(idx))
                    ) : (
                        <View tabLabel={child.props.tabLabel} />
                    )}
                </SceneComponent>
            );
        });
    };

    _onMomentumScrollBeginAndEnd = (e) => {
        const offsetX = e.nativeEvent.contentOffset.x;
        const page = Math.round(offsetX / this.state.containerWidth);
        if (this.state.currentPage !== page) {
            this._updateSelectedPage(page);
        }
    };

    _updateSelectedPage = (nextPage) => {
        let localNextPage = nextPage;
        if (typeof localNextPage === 'object') {
            localNextPage = nextPage.nativeEvent.position;
        }

        const currentPage = this.state.currentPage;
        this.updateSceneKeys({
            page: localNextPage,
            callback: this._onChangeTab.bind(this, currentPage, localNextPage),
        });
    };

    _onChangeTab = (prevPage, currentPage) => {
        this.props.onChangeTab({
            i: currentPage,
            ref: this._children()[currentPage],
            from: prevPage,
        });
    };

    _onScroll = (e) => {
        if (IS_IOS) {
            const offsetX = e.nativeEvent.contentOffset.x;
            if (offsetX === 0 && !this.scrollOnMountCalled) {
                this.scrollOnMountCalled = true;
            } else {
                this.props.onScroll(offsetX / this.state.containerWidth);
            }
        } else {
            const { position, offset } = e.nativeEvent;
            this.props.onScroll(position + offset);
        }
    };

    _handleLayout = (e) => {
        const { width, height } = e.nativeEvent.layout;

        if (width && width > 0 && Math.round(width) !== Math.round(this.state.containerWidth)) {
            if (IS_IOS) {
                const containerWidthAnimatedValue = new Animated.Value(width);
                // Need to call __makeNative manually to avoid a native animated bug. See
                // https://github.com/facebook/react-native/pull/14435
                containerWidthAnimatedValue.__makeNative();
                scrollValue = Animated.divide(this.state.scrollXIOS, containerWidthAnimatedValue);
                this.setState({ containerWidth: width, scrollValue });
            } else {
                this.setState({ containerWidth: width });
            }
            InteractionManager.runAfterInteractions(() => {
                this.goToPage(this.state.currentPage);
            });
        }
        if (height && height > 0 && Math.round(height) !== Math.round(this.state.containerHeight)) {
            this.setState({ containerHeight: height });
        }
    };

    _children = (children = this.props.children) => {
        return React.Children.map(children, (child) => child);
    };

    render() {
        let overlayTabs = this.props.tabBarPosition === 'overlayTop' || this.props.tabBarPosition === 'overlayBottom';
        let tabBarProps = {
            goToPage: this.goToPage,
            tabs: this._children().map((child) => child.props.tabLabel),
            activeTab: this.state.currentPage,
            scrollValue: this.state.scrollValue,
            containerWidth: this.state.containerWidth,
            tabBarStyle: this.props.tabBarStyle,
        };
        if (this.props.tabBarActiveTextColor) {
            tabBarProps.activeTextColor = this.props.tabBarActiveTextColor;
        }
        if (this.props.tabBarInactiveTextColor) {
            tabBarProps.inactiveTextColor = this.props.tabBarInactiveTextColor;
        }
        if (this.props.tabBarTextStyle) {
            tabBarProps.textStyle = this.props.tabBarTextStyle;
        }
        if (this.props.tabBarUnderlineStyle) {
            tabBarProps.underlineStyle = this.props.tabBarUnderlineStyle;
        }
        if (this.props.tabBarPaddingInset) {
            tabBarProps.paddingInset = this.props.tabBarPaddingInset;
        }
        if (this.props.tabBarTabWidth) {
            tabBarProps.tabWidth = this.props.tabBarTabWidth;
        }
        if (this.props.tabBarTabUnderlineWidth) {
            tabBarProps.tabUnderlineWidth = this.props.tabBarTabUnderlineWidth;
        }
        if (overlayTabs) {
            tabBarProps.style = {
                position: 'absolute',
                left: 0,
                right: 0,
                [this.props.tabBarPosition === 'overlayTop' ? 'top' : 'bottom']: 0,
            };
        }

        return (
            <View style={[styles.container, this.props.style]} onLayout={this._handleLayout}>
                {this.renderHeader()}
                {this.props.tabBarPosition === 'top' && this.renderTabBar(tabBarProps)}
                {this.renderScrollableContent()}
                {(this.props.tabBarPosition === 'bottom' || overlayTabs) && this.renderTabBar(tabBarProps)}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        flex: 1,
    },
});
