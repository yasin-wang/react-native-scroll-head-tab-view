import React from 'react';
import { Animated } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';

import { DefaultTabBar, ScrollableTabBar } from '../src';

const goToPage = jest.fn();

function createProps() {
  return {
    activeTab: 0,
    containerWidth: 320,
    goToPage,
    scrollValue: new Animated.Value(0),
    tabs: ['First', 'Second'],
  };
}

describe('tab bars', () => {
  beforeEach(() => {
    goToPage.mockClear();
  });

  it('exposes accessible tabs and handles presses', () => {
    const result = render(<DefaultTabBar {...createProps()} />);
    const first = result.getByRole('tab', { name: 'First' });
    const second = result.getByRole('tab', { name: 'Second' });

    expect(first.props.accessibilityState).toEqual({ selected: true });
    fireEvent.press(second);
    expect(goToPage).toHaveBeenCalledWith(1);
  });

  it('removes the scroll listener when a scrollable tab bar unmounts', () => {
    const props = createProps();
    const removeListener = jest.spyOn(props.scrollValue, 'removeListener');
    const result = render(<ScrollableTabBar {...props} />);

    result.unmount();

    expect(removeListener).toHaveBeenCalledTimes(1);
  });
});
