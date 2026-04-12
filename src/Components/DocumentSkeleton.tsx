import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const DocumentSkeleton = () => {
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
        outputRange: [-100, 400],
    });

    return (
        <View style={styles.card}>
            <View style={styles.iconPlaceholder} />
            <View style={{ flex: 1, gap: 8 }}>
                <View style={styles.lineMedium} />
                <View style={styles.lineSmall} />
            </View>
            <View style={styles.statusPlaceholder} />
            <Animated.View
                style={[
                    styles.shimmer,
                    { transform: [{ translateX }] },
                ]}
            >
                <LinearGradient
                    colors={['transparent', 'rgba(255,255,255,0.4)', 'transparent']}
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
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: 12,
        backgroundColor: '#fff',
        overflow: 'hidden',
    },
    iconPlaceholder: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F3F4F6',
        marginRight: 12,
    },
    lineMedium: {
        height: 14,
        width: '60%',
        backgroundColor: '#F3F4F6',
        borderRadius: 4,
    },
    lineSmall: {
        height: 10,
        width: '40%',
        backgroundColor: '#F3F4F6',
        borderRadius: 4,
    },
    statusPlaceholder: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
    },
    shimmer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: 100,
    },
});

export default DocumentSkeleton;
