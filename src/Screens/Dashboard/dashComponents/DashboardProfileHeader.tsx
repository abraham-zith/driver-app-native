import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, Animated } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { Text } from '../../../Components';
import { hS as s, vS as vs, ms } from '../../../lib/scale';
import { useAppTheme } from '../../../context/ThemeContext';
import { getLanguageScaledSize } from '../../../utils/languageSizings';

interface Props {
    isOnline: boolean;
    driverName: string;
    currentAddress: string;
    rating?: number;
    onSettingsPress: () => void;
    subscription?: any;
}

const DashboardProfileHeader: React.FC<Props> = ({
    isOnline,
    driverName,
    currentAddress,
    rating = 0,
    onSettingsPress,
    subscription,
}) => {
    const { theme, isDark } = useAppTheme();
    const { t } = useTranslation();
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // ── Plan Tag Logic ──
    const planName = subscription?.plan?.name || subscription?.plan?.plan_name || '';
    const lowerName = planName.toLowerCase();
    const tierId = lowerName.includes('elite') ? 'elite' :
                  lowerName.includes('premium') ? 'premium' :
                  lowerName.includes('gold') ? 'premium' : 'basic';

    const PLAN_TAGS: any = {
        basic: {
            label: t('basic'),
            color: isDark ? '#60A5FA' : '#2563EB',
            bg: isDark ? '#1e293b' : '#eff6ff',
            icon: 'shield-checkmark',
        },
        elite: {
            label: t('elite'),
            color: isDark ? '#818CF8' : '#152D5E',
            bg: isDark ? '#1e1b4b' : '#e0e7ff',
            icon: 'diamond',
        },
        premium: {
            label: t('premium'),
            color: '#F59E0B',
            bg: isDark ? '#451a03' : '#FEF3C7',
            icon: 'trophy',
        },
    };

    const currentTier = PLAN_TAGS[tierId] || PLAN_TAGS.basic;

    // ── Greeting based on time ──
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) {
            return t('good_morning');
        }
        if (hour < 17) {
            return t('good_afternoon');
        }
        return t('good_evening');
    };

    // ── Online pulse animation ──
    useEffect(() => {
        if (isOnline) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.6, duration: 900, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
                ])
            ).start();
        } else {
            pulseAnim.stopAnimation();
            pulseAnim.setValue(1);
        }
    }, [isOnline, pulseAnim]);

    return (
        <View style={[styles.header, { backgroundColor: theme.colors.background, borderBottomColor: isDark ? '#374151' : '#E2E8F0' }]}>
            <View style={styles.profileLeft}>
                <View style={styles.avatarWrapper}>
                    {isOnline && (
                        <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseAnim }] }]} />
                    )}
                    <View style={[styles.avatarPlaceholder, isDark && { backgroundColor: '#1E293B' }]}>
                        <Ionicons name="person-outline" size={s(28)} color={isDark ? '#6B7280' : '#9CA3AF'} />
                    </View>
                    <View style={[styles.statusDot, { backgroundColor: isOnline ? '#22C55E' : '#9CA3AF' }]} />
                </View>

                <View style={{ marginLeft: s(14), flex: 1 }}>
                    <Text style={[styles.greeting, { color: isDark ? '#FFFFFF' : '#0F172A' }]} numberOfLines={1}>
                        {getGreeting()}, <Text style={[styles.userName, isDark && { color: '#9CA3AF' }]}>{driverName}</Text>
                    </Text>
                    <View style={styles.metaRow}>
                        <Ionicons name="star" size={ms(16)} color="#F59E0B" />
                        <Text style={[styles.rating, { color: isDark ? '#FFFFFF' : '#1E293B' }]}>{rating ? rating.toFixed(1) : '0.0'}</Text>
                        
                        <View style={[styles.badge, { marginLeft: s(10), backgroundColor: currentTier.bg }]}>
                            <Ionicons name={currentTier.icon} size={ms(12)} color={currentTier.color} style={{ marginRight: s(4) }} />
                            <Text style={[styles.badgeText, { color: currentTier.color }]}>{currentTier.label}</Text>
                        </View>
                    </View>
                    <View style={styles.statusRow}>
                        <Text style={styles.statusLabel} numberOfLines={1}>
                            {isOnline && currentAddress ? (
                                <>
                                    <Ionicons name="location-sharp" size={ms(12)} color={isDark ? '#60A5FA' : '#2563EB'} />
                                    <Text style={[styles.addressText, isDark && { color: '#60A5FA' }]}> {currentAddress}</Text>
                                </>
                            ) : (
                                t(isOnline ? 'waiting_location' : 'you_are_offline')
                            )}
                        </Text>
                    </View>
                </View>
            </View>

            <Pressable style={[styles.settingsBtn, { backgroundColor: isDark ? '#1E293B' : '#EEF2F7' }]} onPress={onSettingsPress}>
                <Ionicons name="options-outline" size={s(24)} color={isDark ? '#FFFFFF' : '#1E293B'} />
            </Pressable>
        </View>
    );
};

export default DashboardProfileHeader;

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: s(16),
        paddingVertical: vs(10),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F5F6FA',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E2E8F0',
    },
    profileLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: s(12),
    },
    avatarWrapper: {
        width: s(58),
        height: s(58),
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarPlaceholder: {
        width: s(54),
        height: s(54),
        borderRadius: ms(27),
        backgroundColor: '#EEF2F7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pulseRing: {
        position: 'absolute',
        width: s(58),
        height: s(58),
        borderRadius: ms(29),
        backgroundColor: 'rgba(34,197,94,0.15)',
    },
    statusDot: {
        position: 'absolute',
        bottom: vs(1),
        right: s(1),
        width: s(12),
        height: s(12),
        borderRadius: ms(6),
        borderWidth: 2,
        borderColor: '#fff',
    },
    greeting: {
        fontSize: getLanguageScaledSize(17),
        fontWeight: '800',
        color: '#0F172A',
    },
    userName: {
        fontSize: getLanguageScaledSize(15),
        fontWeight: '400',
        color: '#64748B',
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: vs(2),
    },
    addressText: {
        fontSize: getLanguageScaledSize(12),
        color: '#3B82F6',
        marginLeft: s(4),
        fontWeight: '500',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: vs(2),
    },
    rating: {
        marginLeft: s(6),
        fontSize: getLanguageScaledSize(15),
        fontWeight: '700',
        color: '#1E293B',
    },
    dot: {
        marginHorizontal: s(6),
        color: '#94A3B8',
    },
    badge: {
        backgroundColor: '#FEF3C7',
        paddingHorizontal: s(10),
        paddingVertical: vs(3),
        borderRadius: ms(12),
        flexDirection: 'row',
        alignItems: 'center',
    },
    badgeText: {
        fontSize: getLanguageScaledSize(12),
        fontWeight: '600',
        color: '#D97706',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: vs(4),
    },
    miniDot: {
        width: s(8),
        height: s(8),
        borderRadius: ms(4),
        marginRight: s(6),
    },
    statusLabel: {
        fontSize: getLanguageScaledSize(12),
        color: '#64748B',
        fontWeight: '500',
    },
    settingsBtn: {
        padding: ms(10),
        backgroundColor: '#EEF2F7',
        borderRadius: ms(25),
    },
});
