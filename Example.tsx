import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { ScrollView, FlatList } from './components/TabView';
import ScrollTabView from './ScrollTabView';

function TabView1(props) {
    const data = new Array(200).fill({});
    const renderItem = ({ item, index }) => {
        return (
            <View style={{ marginVertical: 2, padding: 10, borderWidth: 1 }}>
                <Text>{'tab1 => ' + index}</Text>
            </View>
        );
    };
    return <FlatList {...props} data={data} renderItem={renderItem} {...props} />;
}

function TabView2(props) {
    const data = new Array(100).fill({});
    const renderItem = ({ item, index }) => {
        return (
            <View style={{ marginVertical: 2, padding: 10, borderWidth: 1 }}>
                <Text>{'tab2 => ' + index}</Text>
            </View>
        );
    };
    return <FlatList data={data} renderItem={renderItem} {...props} />;
}

function TabView3(props) {
    const data = new Array(20).fill({});
    return (
        <ScrollView {...props}>
            {data.map((o, i) => (
                <View style={{ marginVertical: 2, padding: 10, borderWidth: 1 }}>
                    <Text>{'tab3 => ' + i}</Text>
                </View>
            ))}
        </ScrollView>
    );
}

export default function Example() {
    const [headerHeight, setHeaderHeight] = useState(200);
    const headerOnLayout = useCallback((event: any) => {
        const { height } = event.nativeEvent.layout;
        setHeaderHeight(height);
    }, []);

    const _renderScrollHeader = useCallback(() => {
        const data = new Array(10).fill({});
        return (
            <View onLayout={headerOnLayout}>
                <View style={{ backgroundColor: 'pink' }}>
                    {data.map((o, i) => (
                        <View style={{ marginVertical: 2, padding: 10, borderWidth: 1 }}>
                            <Text>{'header => ' + i}</Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    }, []);

    return (
        <View style={styles.container}>
            <ScrollTabView headerHeight={headerHeight} renderScrollHeader={_renderScrollHeader}>
                <TabView1 tabLabel="tab1" />
                <TabView2 tabLabel="tab2" />
                <TabView3 abLabel="tab3" />
            </ScrollTabView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
