import React from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    Switch,
    Pressable,
    TouchableOpacity,
    Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { vS as vs, mS as ms } from '../../../lib/scale';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootState } from '../../../redux/store';
import { setTripPreferences } from '../../../redux/userSlice';
import { useGetMySubscriptionQuery } from '../../../service/userApi';
import { useAppTheme } from '../../../context/ThemeContext';

interface SettingsModalProps {
    visible: boolean;
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ visible, onClose }) => {
    const { theme, isDark } = useAppTheme();
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigation = useNavigation<NavigationProp<any>>();
    const { user } = useSelector((state: RootState) => state.userSlice);
    const { data: subData } = useGetMySubscriptionQuery(undefined, { skip: !visible });

    const tripPreferences = user?.tripPreferences || {
        local: true,
        outstation: true,
        roundTrip: true,
        oneWay: true,
        autoAccept: false,
    };

    const activeSubscription = subData?.data?.subscription;
    const planFeatures = activeSubscription?.plan?.features || activeSubscription?.features;
    const allowedRideTypes = planFeatures?.allowed_ride_types || [];
    const planName = (activeSubscription?.plan?.name || activeSubscription?.plan?.plan_name || '').toLowerCase();

    const isSubscribed = (type: string) => {
        const typeMatch = allowedRideTypes.includes(type) || planFeatures?.[`${type.toLowerCase().replace('-', '')}_enabled`];
        
        // Secondary check based on plan tier names for safety
        if (planName.includes('elite')) {
            if (type === 'OUTSTATION' || type === 'ONE-WAY') return true;
        }
        if (planName.includes('premium')) {
            return true;
        }
        
        return typeMatch;
    };

    const isOutstationEnabled = isSubscribed('OUTSTATION');
    const isRoundTripEnabled = isSubscribed('ROUND-TRIP');
    const isOneWayEnabled = isSubscribed('ONE-WAY');

    // Ensure Local is always true if it somehow became false
    React.useEffect(() => {
        if (!tripPreferences.local) {
            dispatch(setTripPreferences({ local: true }));
        }
    }, [tripPreferences.local, dispatch]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{t('trip_settings')}</Text>
                        <Pressable onPress={onClose}>
                            <Ionicons name="close" size={24} color={isDark ? '#9CA3AF' : '#374151'} />
                        </Pressable>
                    </View>
                    <Text style={[styles.modalSubtitle, isDark && { color: '#94A3B8' }]}>{t('select_trip_types')}</Text>

                    <View style={[styles.settingRow, isDark && { borderBottomColor: '#1E293B' }, { opacity: 0.7 }]}>
                        <Text style={[styles.settingLabel, { color: theme.colors.text }]}>{t('local_trip_city')}</Text>
                        <Switch
                            value={true}
                            disabled={true}
                            trackColor={{ false: '#D1D5DB', true: '#22C55E' }}
                            thumbColor={'#FFFFFF'}
                        />
                    </View>

                    {isOutstationEnabled && (
                        <View style={[styles.settingRow, isDark && { borderBottomColor: '#1E293B' }]}>
                            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>{t('outstation_trip')}</Text>
                            <Switch
                                value={tripPreferences.outstation}
                                onValueChange={(val) => {
                                    dispatch(setTripPreferences({ outstation: val }));
                                }}
                                trackColor={{ false: '#D1D5DB', true: '#22C55E' }}
                                thumbColor={tripPreferences.outstation ? '#FFFFFF' : '#f4f3f4'}
                            />
                        </View>
                    )}

                    {isRoundTripEnabled && (
                        <View style={[styles.settingRow, isDark && { borderBottomColor: '#1E293B' }]}>
                            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>{t('round_trip')}</Text>
                            <Switch
                                value={tripPreferences.roundTrip}
                                onValueChange={(val) => {
                                    dispatch(setTripPreferences({ roundTrip: val }));
                                }}
                                trackColor={{ false: '#D1D5DB', true: '#22C55E' }}
                                thumbColor={tripPreferences.roundTrip ? '#FFFFFF' : '#f4f3f4'}
                            />
                        </View>
                    )}

                    {isOneWayEnabled && (
                        <View style={[styles.settingRow, isDark && { borderBottomColor: '#1E293B' }]}>
                            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>{t('one_way_trip')}</Text>
                            <Switch
                                value={tripPreferences.oneWay}
                                onValueChange={(val) => {
                                    dispatch(setTripPreferences({ oneWay: val }));
                                }}
                                trackColor={{ false: '#D1D5DB', true: '#22C55E' }}
                                thumbColor={tripPreferences.oneWay ? '#FFFFFF' : '#f4f3f4'}
                            />
                        </View>
                    )}

                    <TouchableOpacity
                        style={styles.saveBtn}
                        onPress={onClose}
                    >
                        <Text style={styles.saveBtnText}>{t('save_settings')}</Text>
                    </TouchableOpacity>

                </View>
            </View>
        </Modal>
    );
};

export default SettingsModal;

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: ms(20),
        borderTopRightRadius: ms(20),
        padding: ms(20),
        minHeight: vs(300),
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: vs(8),
    },
    modalTitle: {
        fontSize: ms(18),
        fontWeight: '700',
        color: '#111827',
    },
    modalSubtitle: {
        fontSize: ms(13),
        color: '#6B7280',
        marginBottom: vs(20),
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: vs(12),
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    settingLabel: {
        fontSize: ms(15),
        fontWeight: '500',
        color: '#374151',
    },
    premiumBadge: {
        marginLeft: 6,
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    premiumText: {
        fontSize: 9,
        fontWeight: '700',
        color: '#92400E',
    },
    saveBtn: {
        backgroundColor: '#2563EB',
        paddingVertical: vs(14),
        borderRadius: ms(12),
        alignItems: 'center',
        marginTop: vs(24),
    },
    saveBtnText: {
        color: '#fff',
        fontSize: ms(16),
        fontWeight: '700',
    },
    deleteBtn: {
        backgroundColor: '#fee2e2',
        paddingVertical: vs(14),
        borderRadius: ms(12),
        alignItems: 'center',
        marginTop: vs(12),
        borderWidth: 1,
        borderColor: '#fca5a5',
    },
    deleteBtnText: {
        color: '#dc2626',
        fontSize: ms(16),
        fontWeight: '700',
    },
});
