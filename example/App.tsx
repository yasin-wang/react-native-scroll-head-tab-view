import React, { useCallback, useState } from 'react';
import { Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import {
  FlatList,
  ScrollTabView,
  ScrollView,
  ScrollableTabBar,
  type TabBarProps,
  type TabSceneProps,
} from 'react-native-scroll-head-tab-view';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

interface SceneProps extends TabSceneProps {
  tabLabel: string;
}

const LONG_ITEMS = Array.from({ length: 80 }, (_, index) => index + 1);
const SHORT_ITEMS = Array.from({ length: 4 }, (_, index) => index + 1);

function ListScene({
  tabLabel: _tabLabel,
  short = false,
  ...sceneProps
}: SceneProps & { short?: boolean }) {
  const data = short ? SHORT_ITEMS : LONG_ITEMS;

  return (
    <FlatList
      {...sceneProps}
      data={data}
      keyExtractor={item => String(item)}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Item {item}</Text>
          <Text style={styles.cardCopy}>
            Scroll vertically, then switch tabs to verify header
            synchronization.
          </Text>
        </View>
      )}
    />
  );
}

function EmptyScene({ tabLabel: _tabLabel, ...sceneProps }: SceneProps) {
  return (
    <ScrollView {...sceneProps}>
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>Short content</Text>
        <Text style={styles.cardCopy}>
          The scene still has enough scroll range to collapse the header.
        </Text>
      </View>
    </ScrollView>
  );
}

function Example() {
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState(0);
  const [compactHeader, setCompactHeader] = useState(false);
  const [showEmptyTab, setShowEmptyTab] = useState(true);

  const renderHeader = useCallback(
    () => (
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.eyebrow}>REACT NATIVE 0.86</Text>
        <Text style={styles.title}>Collapsible header</Text>
        {!compactHeader ? (
          <Text style={styles.subtitle}>
            PagerView-powered tabs with synchronized vertical scroll positions.
          </Text>
        ) : null}
        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              setPage(current => (current + 1) % (showEmptyTab ? 3 : 2))
            }
            style={styles.action}
          >
            <Text style={styles.actionText}>Next tab</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => setCompactHeader(value => !value)}
            style={styles.action}
          >
            <Text style={styles.actionText}>Resize header</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => setShowEmptyTab(value => !value)}
            style={styles.action}
          >
            <Text style={styles.actionText}>Toggle tab</Text>
          </Pressable>
        </View>
      </View>
    ),
    [compactHeader, insets.top, showEmptyTab],
  );

  const renderTabBar = useCallback(
    (props: TabBarProps) => (
      <ScrollableTabBar
        {...props}
        activeTextColor="#0b6bcb"
        inactiveTextColor="#667085"
        style={styles.tabBar}
        underlineStyle={styles.tabUnderline}
      />
    ),
    [],
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollTabView
        insetValue={insets.top}
        onChangeTab={({ i }) => setPage(i)}
        page={page}
        prerenderingSiblingsNumber={1}
        renderScrollHeader={renderHeader}
        renderTabBar={renderTabBar}
      >
        <ListScene key="long" tabLabel="Long list" />
        <ListScene key="short" short tabLabel="Short list" />
        {showEmptyTab ? (
          <EmptyScene key="empty" tabLabel="Empty state" />
        ) : null}
      </ScrollTabView>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Example />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  action: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderColor: 'rgba(255,255,255,0.24)',
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 18,
  },
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#e4e7ec',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
  },
  cardCopy: {
    color: '#667085',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  cardTitle: {
    color: '#101828',
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    backgroundColor: '#f2f4f7',
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    margin: 24,
    padding: 32,
  },
  emptyTitle: {
    color: '#101828',
    fontSize: 20,
    fontWeight: '700',
  },
  eyebrow: {
    color: '#b9d8f8',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  header: {
    backgroundColor: '#073763',
    paddingBottom: 22,
    paddingHorizontal: 20,
  },
  subtitle: {
    color: '#d1e9ff',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    maxWidth: 440,
  },
  tabBar: {
    backgroundColor: '#ffffff',
    borderBottomColor: '#e4e7ec',
  },
  tabUnderline: {
    backgroundColor: '#0b6bcb',
  },
  title: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.8,
    marginTop: 6,
  },
});
