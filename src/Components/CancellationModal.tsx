import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Pressable,
    Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Animated, { 
    FadeIn, 
    FadeOut, 
    SlideInDown, 
    SlideOutDown 
} from 'react-native-reanimated';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../context/ThemeContext';
import { useHaptic } from '../hooks/useHaptic';
import { ms, vs } from '../lib/scale';

const { height } = Dimensions.get('window');

export interface CancellationReason {
    id: string;
    label: string;
    icon: string;
}

interface CancellationModalProps {
    isVisible: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    isSubmitting?: boolean;
    hiddenReasonIds?: string[];
}

const REASONS: CancellationReason[] = [
    { id: 'PERSONAL_EMERGENCY', label: 'reason_personal_emergency', icon: 'person-outline' },
    { id: 'VEHICLE_PROBLEM', label: 'reason_vehicle_problem', icon: 'car-outline' },
    { id: 'PICKUP_TOO_FAR', label: 'reason_pickup_too_far', icon: 'map-outline' },
    { id: 'RIDER_NOT_RESPONDING', label: 'reason_rider_not_responding', icon: 'call-outline' },
    { id: 'RIDER_ASKED_TO_CANCEL', label: 'reason_rider_asked_to_cancel', icon: 'chatbubble-outline' },
    { id: 'TECHNICAL_ISSUE', label: 'reason_technical_issue', icon: 'construct-outline' },
    { id: 'OTHER', label: 'reason_other', icon: 'ellipsis-horizontal-outline' },
];

const CancellationModal: React.FC<CancellationModalProps> = ({
    isVisible,
    onClose,
    onConfirm,
    isSubmitting = false,
    hiddenReasonIds = [],
}) => {
    const { t } = useTranslation();
    const { theme, isDark } = useAppTheme();
    const { triggerHaptic } = useHaptic();
    const [selectedReason, setSelectedReason] = useState<string | null>(null);

    // Filter reasons based on hiddenReasonIds
    const filteredReasons = REASONS.filter(reason => !hiddenReasonIds.includes(reason.id));

    useEffect(() => {
        if (isVisible) {
            triggerHaptic(HapticFeedbackTypes.impactLight);
        } else {
            setSelectedReason(null);
        }
    }, [isVisible, triggerHaptic]);

    const handleConfirm = () => {
        if (selectedReason) {
            triggerHaptic(HapticFeedbackTypes.notificationSuccess);
            onConfirm(selectedReason);
        }
    };

    return (
        <Modal
            visible={isVisible}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <Animated.View 
                entering={FadeIn.duration(300)}
                exiting={FadeOut.duration(300)}
                style={styles.overlay}
            >
                <Pressable style={styles.background} onPress={onClose} />
                
                <Animated.View 
                    entering={SlideInDown.springify().damping(25).stiffness(200)}
                    exiting={SlideOutDown.duration(250)}
                    style={[styles.content, { backgroundColor: theme.colors.card }]}
                >
                        <View style={styles.handleContainer}>
                            <View style={[styles.handle, { backgroundColor: theme.colors.border }]} />
                        </View>

                        <View style={styles.header}>
                            <View>
                                <Text style={[styles.title, { color: theme.colors.text }]}>
                                    {t('cancel_trip_title')}
                                </Text>
                                <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
                                    {t('select_reason')}
                                </Text>
                            </View>
                            <TouchableOpacity 
                                onPress={onClose} 
                                disabled={isSubmitting}
                                style={[styles.closeButton, { backgroundColor: theme.colors.border + '40' }]}
                            >
                                <Ionicons name="close" size={ms(20)} color={theme.colors.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={[
                            styles.warningContainer,
                            { 
                                backgroundColor: isDark ? 'rgba(153, 27, 27, 0.1)' : '#FEF2F2',
                                borderColor: isDark ? 'rgba(153, 27, 27, 0.2)' : '#FEE2E2',
                            }
                        ]}>
                            <View style={[styles.warningIconContainer, { backgroundColor: '#B91C1C' }]}>
                                <Ionicons 
                                    name="alert-outline" 
                                    size={ms(16)} 
                                    color="#FFFFFF" 
                                />
                            </View>
                            <Text style={[
                                styles.warningText,
                                { color: isDark ? '#FCA5A5' : '#991B1B' }
                            ]}>
                                {t('cancellation_warning_text')}
                            </Text>
                        </View>

                        <FlatList
                            data={filteredReasons}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    style={[
                                        styles.reasonItem,
                                        {
                                            borderColor: selectedReason === item.id ? theme.colors.primary : theme.colors.border + '40',
                                            backgroundColor: selectedReason === item.id ? theme.colors.primary + '08' : theme.colors.card,
                                        },
                                    ]}
                                    onPress={() => {
                                        triggerHaptic(HapticFeedbackTypes.selection);
                                        setSelectedReason(item.id);
                                    }}
                                    disabled={isSubmitting}
                                >
                                    <View style={styles.reasonLeftContent}>
                                        <View style={[
                                            styles.reasonIconBox,
                                            { 
                                                backgroundColor: selectedReason === item.id ? theme.colors.primary + '15' : theme.colors.border + '30'
                                            }
                                        ]}>
                                            <Ionicons 
                                                name={item.icon} 
                                                size={ms(18)} 
                                                color={selectedReason === item.id ? theme.colors.primary : theme.colors.textMuted} 
                                            />
                                        </View>
                                        <Text style={[
                                            styles.reasonLabel,
                                            { 
                                                color: theme.colors.text,
                                                fontWeight: selectedReason === item.id ? '600' : '500'
                                            }
                                        ]}>
                                            {t(item.label)}
                                        </Text>
                                    </View>
                                    <View style={[
                                        styles.radioButton,
                                        { borderColor: selectedReason === item.id ? theme.colors.primary : theme.colors.border }
                                    ]}>
                                        {selectedReason === item.id && (
                                            <View style={[styles.radioInner, { backgroundColor: theme.colors.primary }]} />
                                        )}
                                    </View>
                                </TouchableOpacity>
                            )}
                            style={styles.list}
                            showsVerticalScrollIndicator={false}
                        />

                        <View style={styles.footer}>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={handleConfirm}
                                disabled={!selectedReason || isSubmitting}
                                style={[
                                    styles.confirmButton,
                                    {
                                        backgroundColor: !selectedReason || isSubmitting ? theme.colors.border : '#B91C1C',
                                        shadowColor: '#B91C1C',
                                        shadowOpacity: (selectedReason && !isSubmitting) ? 0.3 : 0,
                                    }
                                ]}
                            >
                                <Text style={styles.confirmButtonText}>
                                    {isSubmitting ? t('processing') : t('confirm_cancellation')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </Animated.View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    background: {
        ...StyleSheet.absoluteFillObject,
    },
    handleContainer: {
        alignItems: 'center',
        paddingVertical: vs(12),
    },
    handle: {
        width: ms(40),
        height: vs(4),
        borderRadius: ms(2),
    },
    content: {
        borderTopLeftRadius: ms(32),
        borderTopRightRadius: ms(32),
        paddingHorizontal: ms(20),
        paddingBottom: vs(40),
        maxHeight: height * 0.85,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: vs(20),
    },
    closeButton: {
        padding: ms(8),
        borderRadius: ms(20),
    },
    title: {
        fontSize: ms(22),
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: ms(14),
        marginTop: vs(2),
    },
    list: {
        marginBottom: vs(15),
    },
    reasonItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: vs(14),
        paddingHorizontal: ms(14),
        borderRadius: ms(16),
        borderWidth: 1.5,
        marginBottom: vs(10),
    },
    reasonLeftContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    reasonIconBox: {
        width: ms(36),
        height: ms(36),
        borderRadius: ms(10),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: ms(12),
    },
    reasonLabel: {
        fontSize: ms(15),
    },
    radioButton: {
        width: ms(20),
        height: ms(20),
        borderRadius: ms(10),
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: ms(12),
    },
    radioInner: {
        width: ms(10),
        height: ms(10),
        borderRadius: ms(5),
    },
    footer: {
        marginTop: vs(5),
    },
    confirmButton: {
        width: '100%',
        height: vs(52),
        borderRadius: ms(16),
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
        elevation: 4,
    },
    confirmButtonText: {
        color: '#FFFFFF',
        fontSize: ms(16),
        fontWeight: '700',
    },
    warningContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: ms(14),
        borderRadius: ms(16),
        marginBottom: vs(20),
        borderWidth: 1,
    },
    warningIconContainer: {
        width: ms(28),
        height: ms(28),
        borderRadius: ms(14),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: ms(12),
    },
    warningText: {
        fontSize: ms(13),
        fontWeight: '600',
        flex: 1,
        lineHeight: ms(18),
    },
});

export default CancellationModal;
