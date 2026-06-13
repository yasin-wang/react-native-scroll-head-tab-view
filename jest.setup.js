jest.mock('react-native-pager-view', () => {
  const React = require('react');
  const { View } = require('react-native');

  const PagerView = React.forwardRef(({ children, ...props }, ref) => {
    React.useImperativeHandle(ref, () => ({
      setPage: page =>
        props.onPageSelected?.({ nativeEvent: { position: page } }),
      setPageWithoutAnimation: page =>
        props.onPageSelected?.({ nativeEvent: { position: page } }),
    }));

    return React.createElement(
      View,
      { ...props, testID: props.testID ?? 'pager-view' },
      children,
    );
  });

  PagerView.displayName = 'PagerView';
  return PagerView;
});
