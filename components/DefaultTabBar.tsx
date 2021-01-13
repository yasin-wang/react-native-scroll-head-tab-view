import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Animated,
    TouchableNativeFeedback,
    TouchableOpacity,
    ViewProps,
    ViewStyle,
    TextStyle,
    Dimensions,
} from 'react-native';

interface Props extends ViewProps {
    scrollValue: number; //切换tab的动画对应系数
    containerWidth: number; //tabBar外部容器宽度
    tabs: Array;
    paddingInset?: number; //tabBar外两边padding
    tabBarStyle?: ViewStyle;
    tabStyle?: ViewStyle;
    tabWidth?: number;
    underlineStyle?: ViewStyle;
    tabUnderlineWidth?: number;
    hiddenUnderLine?: boolean;
    textStyle?: TextStyle;
    activeTextStyle?: TextStyle;
    inactiveTextColor?: TextStyle;
}

const SCALE_NUMBER = 2;

export default class DefaultTabBar extends Component<Props> {
    static defaultProps = {
        paddingInset: 0,
        activeTextStyle: { color: '#202020' },
        inactiveTextColor: { color: '#909090' },
        hiddenUnderLine: false,
    };

    _renderTab(name: string, page: number, isTabActive: boolean, onPressHandler: Function) {
        const { tabWidth, tabStyle, textStyle, activeTextStyle, inactiveTextColor } = this.props;
        const tabTextStyle = isTabActive ? activeTextStyle : inactiveTextColor;
        const tabWidthStyle = tabWidth ? { width: tabWidth } : { flex: 1 };
        const tabItem = {
            alignItems: 'center',
            justifyContent: 'center',
            ...tabWidthStyle,
            ...tabStyle,
        };
        const tabText = {
            fontSize: 16,
            ...textStyle,
            ...tabTextStyle,
        };
        return (
            <TouchableOpacity style={tabItem} key={name} onPress={() => onPressHandler(page)}>
                <Text style={tabText}>{name}</Text>
            </TouchableOpacity>
        );
    }

    _renderUnderline() {
        const {
            scrollValue,
            containerWidth,
            paddingInset,
            tabs,
            tabWidth,
            tabUnderlineWidth,
            underlineStyle,
        } = this.props;
        const numberOfTabs = tabs.length;
        const calcTabWidth = tabWidth || (containerWidth - paddingInset) / numberOfTabs;
        const calcUnderlineWidth = Math.min(tabUnderlineWidth || calcTabWidth * 0.6, calcTabWidth);
        const underlineLeft = (calcTabWidth - calcUnderlineWidth) / 2 + paddingInset / 2;
        const tabUnderlineStyle = {
            position: 'absolute',
            width: calcUnderlineWidth,
            height: 3,
            borderRadius: 3,
            backgroundColor: '#FE1966',  
            bottom: 1,
            left: underlineLeft,
            ...underlineStyle,
        };

        // 计算underline动画系数
        const scaleValue = () => {
            const number = 4;
            const arr = new Array(number * 2);
            return arr.fill(0).reduce(
                function (pre, cur, idx) {
                    idx == 0 ? pre.inputRange.push(cur) : pre.inputRange.push(pre.inputRange[idx - 1] + 0.5);
                    idx % 2 ? pre.outputRange.push(SCALE_NUMBER) : pre.outputRange.push(1);
                    return pre;
                },
                { inputRange: [], outputRange: [] },
            );
        };
        const scaleX = scrollValue.interpolate(scaleValue());
        const translateX = scrollValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, calcTabWidth],
        });

        return (
            <Animated.View
                style={[
                    tabUnderlineStyle,
                    {
                        transform: [{ translateX }, { scaleX }],
                    },
                ]}
            />
        );
    }

    componentDidMount() {
        this.props.onMounted && this.props.onMounted();
    }

    render() {
        const { tabBarStyle, paddingInset, hiddenUnderLine, tabs } = this.props;
        return (
            <Animated.View style={[styles.tabBar, { paddingHorizontal: paddingInset }, tabBarStyle]}>
                {!hiddenUnderLine && this._renderUnderline()}
                {tabs.map((name, page) => {
                    const isTabActive = this.props.activeTab === page;
                    return this._renderTab(name, page, isTabActive, this.props.goToPage);
                })}
            </Animated.View>
        );
    }
}

const shadowSetting = {
    width: Dimensions.get('window').width,
    height: 50,
    color: '#E8E8E8',
    border: 5,
    radius: 15,
    opacity: 0.5,
    x: 0,
    y: 0,
};
const styles = StyleSheet.create({
    tabBar: {
        height: 50,
        flexDirection: 'row',
        alignItems: 'stretch',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: '#f0f0f0',
    },
});
