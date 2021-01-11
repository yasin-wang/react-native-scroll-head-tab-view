import React, { ReactElement } from 'react';

export default class StaticContainer extends React.Component {
    shouldComponentUpdate(nextProps: Object): boolean {
        return !!nextProps.shouldUpdate;
    }

    render(): ReactElement | null {
        var child = this.props.children;
        if (child === null || child === false) {
            return null;
        }
        return React.Children.only(child);
    }
}
