import React, { useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ms, vs } from '../lib/scale';
import { useAppTheme } from '../context/ThemeContext';

// const { width } = Dimensions.get('window');

interface SuccessPopupProps {
    message: string;
    onDismiss: () => void;
    isVisible: boolean;
}

const SuccessPopup: React.FC<SuccessPopupProps> = ({ message, onDismiss, isVisible }) => {
    const { theme, isDark } = useAppTheme();
    const translateY = useSharedValue(-100);
    const opacity = useSharedValue(0);

    const dismissPopup = useCallback(() => {
        onDismiss();
    }, [onDismiss]);

    useEffect(() => {
        if (isVisible) {
            opacity.value = withTiming(1, { duration: 300 });
            translateY.value = withSpring(vs(50), {
                damping: 12,
                stiffness: 90,
            });

            // Auto dismiss after 2 seconds
            const timer = setTimeout(() => {
                opacity.value = withTiming(0, { duration: 300 });
                translateY.value = withTiming(-100, { duration: 300 }, () => {
                    runOnJS(dismissPopup)();
                });
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [isVisible, opacity, translateY, dismissPopup]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
            opacity: opacity.value,
        };
    });

    if (!isVisible && opacity.value === 0) return null;

    return (
        <Animated.View style={[styles.container, animatedStyle]}>
            <View style={[
                styles.popup,
                {
                    backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    borderColor: theme.colors.primary + '30',
                }
            ]}>
                <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
                    <Ionicons name="checkmark-circle" size={ms(24)} color={theme.colors.primary} />
                </View>
                <Text style={[styles.message, { color: theme.colors.text }]}>{message}</Text>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 9999,
        paddingHorizontal: ms(20),
    },
    popup: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: vs(12),
        paddingHorizontal: ms(20),
        borderRadius: ms(20),
        borderWidth: 1,
        width: '100%',
        maxWidth: ms(350),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    iconContainer: {
        width: ms(40),
        height: ms(40),
        borderRadius: ms(12),
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: ms(12),
    },
    message: {
        fontSize: ms(15),
        fontWeight: '700',
        flex: 1,
    },
});

export default SuccessPopup;
