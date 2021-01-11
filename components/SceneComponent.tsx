import React, { Component } from 'react';
import { View } from 'react-native';
import StaticContainer from './StaticContainer';

export default function SceneComponent(Props) {
    const { children, shouldUpdated, ...props } = Props;
    return (
        <View {...props}>
            <StaticContainer shouldUpdate={shouldUpdated}>{children}</StaticContainer>
        </View>
    );
}
