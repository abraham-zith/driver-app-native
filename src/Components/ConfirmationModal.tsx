import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
    FadeIn,
    FadeOut,
    ZoomIn,
    ZoomOut,
} from 'react-native-reanimated';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../context/ThemeContext';
import { useHaptic } from '../hooks/useHaptic';
import { ms, vs } from '../lib/scale';

const { width } = Dimensions.get('window');

interface ConfirmationModalProps {
    isVisible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    icon?: string;
    singleButton?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isVisible,
    onClose,
    onConfirm,
    title,
    message,
    confirmText,
    cancelText,
    isDestructive = false,
    icon = 'help-circle-outline',
    singleButton = false,
}) => {
    const { t } = useTranslation();
    const { theme, isDark } = useAppTheme();
    const { triggerHaptic } = useHaptic();

    const [layoutReady, setLayoutReady] = React.useState(false);

    useEffect(() => {
        if (!isVisible) {
            setLayoutReady(false);
        }
    }, [isVisible]);

    useEffect(() => {
        if (isVisible) {
            triggerHaptic(HapticFeedbackTypes.impactLight);
        }
    }, [isVisible, triggerHaptic]);

    const handleConfirm = () => {
        triggerHaptic(HapticFeedbackTypes.notificationSuccess);
        onConfirm();
    };

    const handleCancel = () => {
        triggerHaptic(HapticFeedbackTypes.selection);
        onClose();
    };

    return (
        <Modal
            visible={isVisible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View 
                style={styles.overlay}
                onLayout={() => setLayoutReady(true)}
            >
                <TouchableOpacity
                    style={StyleSheet.absoluteFill}
                    activeOpacity={1}
                    onPress={onClose}
                />
                
                {layoutReady && (
                    <Animated.View
                        entering={ZoomIn.springify().mass(1).stiffness(100).damping(12)}
                        exiting={ZoomOut.duration(200)}
                        style={[
                            styles.modalContainer,
                            {
                                backgroundColor: theme.colors.card,
                                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                            }
                        ]}
                    >
                        {/* Icon Header */}
                        <View style={[
                            styles.iconWrapper,
                            {
                                backgroundColor: isDestructive 
                                    ? 'rgba(239, 68, 68, 0.1)' 
                                    : isDark ? 'rgba(255, 255, 255, 0.05)' : theme.colors.primary + '10',
                            }
                        ]}>
                            <Ionicons
                                name={icon}
                                size={ms(32)}
                                color={isDestructive ? '#EF4444' : theme.colors.primary}
                            />
                        </View>

                        {/* Content */}
                        <Text style={[styles.title, { color: theme.colors.text }]}>
                            {title}
                        </Text>
                        <Text style={[styles.message, { color: isDark ? '#9CA3AF' : theme.colors.paragraphText }]}>
                            {message}
                        </Text>

                        {/* Buttons */}
                        <View style={styles.buttonContainer}>
                            {!singleButton && (
                                <TouchableOpacity
                                    onPress={handleCancel}
                                    style={[
                                        styles.button,
                                        styles.cancelButton,
                                        {
                                            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6',
                                        }
                                    ]}
                                >
                                    <Text style={[styles.cancelText, { color: isDark ? '#FFFFFF' : '#4B5563' }]}>
                                        {cancelText || t('cancel')}
                                    </Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                onPress={handleConfirm}
                                style={styles.confirmButtonWrapper}
                            >
                                <LinearGradient
                                    colors={isDestructive ? ['#EF4444', '#DC2626'] : ['#1e40af', '#1e3a8a']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.button}
                                >
                                    <Text style={styles.confirmText}>
                                        {confirmText || (singleButton ? t('common.ok') : t('confirm'))}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                )}
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    modalContainer: {
        width: width * 0.85,
        borderRadius: ms(28),
        padding: ms(24),
        alignItems: 'center',
        borderWidth: 1,
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    iconWrapper: {
        width: ms(64),
        height: ms(64),
        borderRadius: ms(32),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: vs(16),
    },
    title: {
        fontSize: ms(20),
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: vs(8),
        letterSpacing: -0.5,
    },
    message: {
        fontSize: ms(15),
        textAlign: 'center',
        lineHeight: ms(22),
        marginBottom: vs(24),
    },
    buttonContainer: {
        flexDirection: 'row',
        width: '100%',
        gap: ms(12),
    },
    button: {
        flex: 1,
        height: vs(48),
        borderRadius: ms(16),
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButton: {
        // Styles defined in render
    },
    confirmButtonWrapper: {
        flex: 1,
    },
    cancelText: {
        fontSize: ms(15),
        fontWeight: '700',
    },
    confirmText: {
        color: '#FFFFFF',
        fontSize: ms(15),
        fontWeight: '700',
    },
});

export default ConfirmationModal;
