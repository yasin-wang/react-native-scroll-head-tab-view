import React, { forwardRef } from 'react';
import { Text, View } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';

import {
  ScrollTabView,
  ScrollView,
  type CollapsibleScrollViewProps,
  type ScrollTabViewRef,
} from '../src';

const Scene = forwardRef<
  React.ElementRef<typeof ScrollView>,
  CollapsibleScrollViewProps & { name: string }
>(function TestScene({ name, ...props }, ref) {
  return (
    <ScrollView {...props} ref={ref}>
      <Text>{name}</Text>
    </ScrollView>
  );
});

describe('ScrollTabView', () => {
  it('renders safely without scenes', () => {
    const result = render(<ScrollTabView />);

    expect(result.UNSAFE_getAllByType(View)).not.toHaveLength(0);
  });

  it('lazy loads scenes and preserves the public children API', () => {
    const result = render(
      <ScrollTabView>
        <Scene name="first scene" tabLabel="First" />
        <Scene name="second scene" tabLabel="Second" />
      </ScrollTabView>,
    );

    expect(result.getByText('first scene')).toBeTruthy();
    expect(result.queryByText('second scene')).toBeNull();

    fireEvent.press(result.getByRole('tab', { name: 'Second' }));

    expect(result.getByText('second scene')).toBeTruthy();
  });

  it('reports page scroll and page changes', () => {
    const onChangeTab = jest.fn();
    const onScroll = jest.fn();
    const result = render(
      <ScrollTabView onChangeTab={onChangeTab} onScroll={onScroll}>
        <Scene name="first scene" tabLabel="First" />
        <Scene name="second scene" tabLabel="Second" />
      </ScrollTabView>,
    );
    const pager = result.getByTestId('pager-view');

    fireEvent(pager, 'pageScroll', {
      nativeEvent: { offset: 0.25, position: 0 },
    });
    fireEvent(pager, 'pageSelected', {
      nativeEvent: { position: 1 },
    });

    expect(onScroll).toHaveBeenCalledWith(0.25);
    expect(onChangeTab).toHaveBeenCalledWith(
      expect.objectContaining({ from: 0, i: 1 }),
    );
  });

  it('clamps imperative page changes', () => {
    const onChangeTab = jest.fn();
    const ref = React.createRef<ScrollTabViewRef>();
    const result = render(
      <ScrollTabView onChangeTab={onChangeTab} ref={ref}>
        <Scene name="first scene" tabLabel="First" />
        <Scene name="second scene" tabLabel="Second" />
      </ScrollTabView>,
    );

    act(() => {
      ref.current?.goToPage(99);
    });

    expect(result.getByText('second scene')).toBeTruthy();
    expect(onChangeTab).toHaveBeenLastCalledWith(
      expect.objectContaining({ i: 1 }),
    );
  });

  it('forwards active scene vertical scroll values', () => {
    const onContentScroll = jest.fn();
    const result = render(
      <ScrollTabView onContentScroll={onContentScroll}>
        <Scene name="first scene" tabLabel="First" testID="first-scroll" />
      </ScrollTabView>,
    );

    const scene = result.UNSAFE_getByType(Scene);
    act(() => {
      scene.props.onSceneScroll(scene.props.sceneKey, scene.props.index, 72);
    });

    expect(onContentScroll).toHaveBeenCalledWith(72);
  });

  it('supports automatic header measurement', () => {
    const result = render(
      <ScrollTabView
        renderScrollHeader={() => (
          <View testID="header-content">
            <Text>Header</Text>
          </View>
        )}>
        <Scene name="first scene" tabLabel="First" testID="first-scroll" />
      </ScrollTabView>,
    );

    fireEvent(result.getByTestId('header-content').parent!, 'layout', {
      nativeEvent: { layout: { height: 120, width: 320, x: 0, y: 0 } },
    });

    expect(
      result.getByTestId('first-scroll').props.contentContainerStyle,
    ).toEqual(
      expect.arrayContaining([expect.objectContaining({ paddingTop: 170 })]),
    );
  });
});
