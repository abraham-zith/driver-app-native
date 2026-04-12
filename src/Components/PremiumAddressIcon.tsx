import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Path, Defs, LinearGradient, Stop, G, Rect } from 'react-native-svg';

interface PremiumAddressIconProps {
    size?: number;
    primaryColor?: string;
    secondaryColor?: string;
}

const PremiumAddressIcon: React.FC<PremiumAddressIconProps> = ({
    size = 80,
    primaryColor = '#2563EB',
    secondaryColor = '#60A5FA',
}) => {
    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
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
                <Circle cx="40" cy="40" r="38" stroke="url(#ring_grad)" strokeWidth="1" strokeDasharray="4 2" />

                {/* Main Circular Backdrop */}
                <Circle cx="40" cy="40" r="34" fill="url(#bg_grad)" />

                {/* Home/Address Icon */}
                <G transform="translate(22, 22)">
                    {/* Roof */}
                    <Path
                        d="M18 2.5L2 15V32C2 33.1046 2.89543 34 4 34H12V24C12 22.8954 12.8954 22 14 22H22C23.1046 22 24 22.8954 24 24V34H32C33.1046 34 34 33.1046 34 32V15L18 2.5Z"
                        fill="url(#icon_grad)"
                    />
                    {/* Window/Detail */}
                    <Rect x="15" y="10" width="6" height="6" rx="1.5" fill="#FFFFFF" opacity="0.6" />
                </G>

                {/* Pin/Marker Accent */}
                <Circle cx="58" cy="22" r="5" fill="#EF4444" opacity="0.8" />
                <Circle cx="58" cy="22" r="2" fill="#FFFFFF" />
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

export default PremiumAddressIcon;
