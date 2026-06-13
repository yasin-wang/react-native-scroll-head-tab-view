/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

test('renders correctly', () => {
  ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
