import React from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { vS as vs, mS as ms } from '../../../lib/scale';

const { width } = Dimensions.get('window');

const RideSkeleton = () => {
    const animatedValue = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.loop(
            Animated.timing(animatedValue, {
                toValue: 1,
                duration: 1500,
                useNativeDriver: true,
            })
        ).start();
    }, [animatedValue]);

    const translateX = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-width, width],
    });

    return (
        <View style={styles.card}>
            {/* Header placeholder */}
            <View style={styles.headerRow}>
                <View style={styles.lineSmall} />
                <View style={styles.pricePlaceholder} />
            </View>

            {/* Time badge placeholder */}
            <View style={styles.badgePlaceholder} />

            {/* Location placeholder */}
            <View style={styles.locationRow}>
                <View style={styles.indicator} />
                <View style={{ flex: 1, gap: vs(12) }}>
                    <View style={styles.lineLarge} />
                    <View style={styles.lineLarge} />
                </View>
            </View>

            {/* Stats placeholder */}
            <View style={styles.statsRow}>
                <View style={styles.statItem} />
                <View style={styles.statItem} />
                <View style={styles.statItem} />
            </View>

            {/* Shimmer overlay */}
            <Animated.View
                style={[
                    styles.shimmer,
                    { transform: [{ translateX }] },
                ]}
            >
                <LinearGradient
                    colors={['transparent', 'rgba(255,255,255,0.3)', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: ms(24),
        padding: ms(20),
        marginBottom: vs(16),
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: vs(16),
    },
    lineSmall: {
        height: vs(14),
        width: '40%',
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
    },
    lineLarge: {
        height: vs(16),
        width: '80%',
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
    },
    pricePlaceholder: {
        height: vs(24),
        width: ms(60),
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
    },
    badgePlaceholder: {
        height: vs(20),
        width: ms(100),
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
        marginBottom: vs(20),
    },
    locationRow: {
        flexDirection: 'row',
        marginBottom: vs(20),
    },
    indicator: {
        width: ms(8),
        marginRight: ms(12),
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: vs(12),
        borderTopWidth: 1,
        borderColor: '#E5E7EB',
    },
    statItem: {
        height: vs(12),
        width: '25%',
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
    },
    shimmer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
});

export default RideSkeleton;
