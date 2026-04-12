import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Path, Defs, LinearGradient, Stop, G } from 'react-native-svg';

interface PremiumUserIconProps {
    size?: number;
    primaryColor?: string;
    secondaryColor?: string;
}

const PremiumUserIcon: React.FC<PremiumUserIconProps> = ({
    size = 64,
    primaryColor = '#2563EB',
    secondaryColor = '#60A5FA',
}) => {
    // const innerSize = size * 0.8;

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
                <Defs>
                    <LinearGradient id="bg_grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <Stop offset="0%" stopColor="#EEF2FF" stopOpacity="1" />
                        <Stop offset="100%" stopColor="#E0E7FF" stopOpacity="1" />
                    </LinearGradient>

                    <LinearGradient id="icon_grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <Stop offset="0%" stopColor={primaryColor} stopOpacity="1" />
                        <Stop offset="100%" stopColor={secondaryColor} stopOpacity="1" />
                    </LinearGradient>

                    <LinearGradient id="ring_grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <Stop offset="0%" stopColor={secondaryColor} stopOpacity="0.5" />
                        <Stop offset="100%" stopColor={primaryColor} stopOpacity="0.1" />
                    </LinearGradient>
                </Defs>

                {/* Decorative Outer Ring */}
                <Circle cx="32" cy="32" r="30" stroke="url(#ring_grad)" strokeWidth="1" strokeDasharray="4 2" />

                {/* Main Circular Backdrop */}
                <Circle cx="32" cy="32" r="26" fill="url(#bg_grad)" />

                {/* User Silhouette - Multi-layered SVG */}
                <G transform="translate(16, 14)">
                    {/* Head */}
                    <Circle cx="16" cy="10" r="7" fill="url(#icon_grad)" />

                    {/* Body/Shoulders */}
                    <Path
                        d="M2 32C2 24.268 8.268 18 16 18C23.732 18 30 24.268 30 32"
                        fill="url(#icon_grad)"
                        strokeLinecap="round"
                    />
                </G>

                {/* Subtle Accent Glow/Dot */}
                <Circle cx="48" cy="16" r="3" fill="#60A5FA" opacity="0.6" />
            </Svg>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default PremiumUserIcon;
