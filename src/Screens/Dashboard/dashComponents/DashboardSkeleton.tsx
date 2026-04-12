import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { hS as s, vS as vs, mS as ms } from '../../../lib/scale';
import { SafeAreaView } from 'react-native-safe-area-context';

const SCREEN_WIDTH = Dimensions.get('window').width;

const SkeletonBox = ({ style, opacity }: { style?: any, opacity: any }) => (
    <Animated.View style={[styles.skeleton, { opacity }, style]} />
);

const DashboardSkeleton = () => {
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const startShimmer = () => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(shimmerAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(shimmerAnim, {
                        toValue: 0,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        };
        startShimmer();
    }, [shimmerAnim]);

    const opacity = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header Skeleton */}
            <View style={styles.header}>
                <View style={styles.profileLeft}>
                    <SkeletonBox style={styles.avatar} opacity={opacity} />
                    <View style={{ marginLeft: 12 }}>
                        <SkeletonBox style={styles.greetingLine} opacity={opacity} />
                        <SkeletonBox style={styles.ratingLine} opacity={opacity} />
                    </View>
                </View>
                <SkeletonBox style={styles.settingsBtn} opacity={opacity} />
            </View>

            {/* Map Placeholder */}
            <SkeletonBox style={styles.mapContainer} opacity={opacity} />

            {/* Title Placeholder */}
            <SkeletonBox style={styles.sectionTitle} opacity={opacity} />

            {/* Grid Placeholder */}
            <View style={styles.grid}>
                <SkeletonBox style={styles.gridItem} opacity={opacity} />
                <SkeletonBox style={styles.gridItem} opacity={opacity} />
                <SkeletonBox style={styles.gridItem} opacity={opacity} />
            </View>

            {/* Analytics Placeholder */}
            <View style={styles.analyticsRow}>
                <SkeletonBox style={styles.analyticsCardLg} opacity={opacity} />
                <SkeletonBox style={styles.analyticsCardSm} opacity={opacity} />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F6FA',
    },
    skeleton: {
        backgroundColor: '#E5E7EB',
        borderRadius: ms(8),
    },
    header: {
        paddingHorizontal: s(16),
        paddingTop: vs(10),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    profileLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: s(56),
        height: s(56),
        borderRadius: ms(28),
    },
    greetingLine: {
        width: s(120),
        height: vs(16),
        marginBottom: vs(8),
    },
    ratingLine: {
        width: s(80),
        height: vs(12),
    },
    settingsBtn: {
        width: s(40),
        height: s(40),
        borderRadius: ms(20),
    },
    mapContainer: {
        width: '100%',
        height: vs(280),
        marginTop: vs(8),
        borderRadius: ms(22),
    },
    sectionTitle: {
        marginHorizontal: s(16),
        marginTop: vs(24),
        width: s(140),
        height: vs(18),
    },
    grid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: s(14),
        marginTop: vs(14),
    },
    gridItem: {
        width: (SCREEN_WIDTH - s(60)) / 3,
        height: vs(80),
        borderRadius: ms(14),
    },
    analyticsRow: {
        flexDirection: 'row',
        marginHorizontal: s(16),
        marginTop: vs(24),
        gap: s(12),
    },
    analyticsCardLg: {
        flex: 1.2,
        height: vs(100),
        borderRadius: ms(20),
    },
    analyticsCardSm: {
        flex: 1,
        height: vs(100),
        borderRadius: ms(20),
    },
});

export default DashboardSkeleton;
