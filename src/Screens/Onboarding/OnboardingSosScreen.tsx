import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../../api/axiosInstance';
import LinearGradient from 'react-native-linear-gradient';
// @ts-ignore
import { selectContactPhone } from 'react-native-select-contact';
import { 
  PremiumInfoBanner, 
  RelationshipPicker, 
  Input, 
  ConfirmationModal 
} from '../../Components';
import { ms, vs } from '../../lib/scale';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';

const OnboardingSosScreen = ({ navigation, route }: any) => {
  const { t } = useTranslation();
  const { theme, isDark } = useAppTheme();
  const colors = theme.colors;
  const insets = useSafeAreaInsets();
  
  const nextScreen = route?.params?.nextScreen || 'Dashboard_Nav';

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('Family');
  const [contactsAddedCount, setContactsAddedCount] = useState(0);

  // Modal State for ConfirmationModal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState({
    title: '',
    message: '',
    confirmText: '',
    cancelText: '',
    icon: 'shield-checkmark',
    isDestructive: false,
    onConfirm: () => {},
  });

  const showConfirm = (options: any) => {
    setModalData({
      title: options.title || '',
      message: options.message || '',
      confirmText: options.confirmText || t('ok'),
      cancelText: options.cancelText || t('cancel'),
      icon: options.icon || 'shield-checkmark',
      isDestructive: options.isDestructive || false,
      onConfirm: options.onConfirm || (() => setModalVisible(false)),
    });
    setModalVisible(true);
  };

  const handleChooseContact = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_CONTACTS
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          showConfirm({
            title: t('permission_denied') || 'Permission Denied',
            message: 'Contacts permission is required to use this feature.',
            icon: 'lock-closed',
            isDestructive: true
          });
          return;
        }
      }

      const selection = await selectContactPhone();
      if (!selection) return;

      const { contact, selectedPhone } = selection;
      setName(contact.name || '');
      setPhone((selectedPhone.number || '').replace(/[\s\-\(\)]/g, ''));
    } catch (error) {
      console.log('Error picking contact:', error);
    }
  };

  const handleAddContact = async () => {
    if (!name.trim() || !phone.trim()) {
      showConfirm({
        title: t('error') || 'Error',
        message: t('fill_all_fields') || 'Please fill name and phone number',
        icon: 'alert-circle',
        isDestructive: true
      });
      return;
    }

    const cleanInputPhone = phone.trim().replace(/[\s\-\(\)]/g, '');
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(cleanInputPhone)) {
      showConfirm({
        title: t('invalid_phone') || 'Invalid Phone Number',
        message: t('invalid_phone_desc') || 'Please enter a valid phone number.',
        icon: 'call',
        isDestructive: true
      });
      return;
    }

    try {
      setLoading(true);
      const payload = { 
        name: name.trim(), 
        phone: cleanInputPhone,
        relationship // Added relationship to payload
      };
      const response = await axiosInstance.post('/sos/contacts', payload);
      
      if (response.data.success) {
        setName('');
        setPhone('');
        setContactsAddedCount(prev => prev + 1);
        showConfirm({
          title: t('success') || 'Success',
          message: t('contact_added_success') || 'Emergency contact added securely!',
          icon: 'checkmark-circle',
          onConfirm: () => {
            setModalVisible(false);
            setTimeout(() => {
              proceedToNext();
            }, 300);
          }
        });
      }
    } catch (error: any) {
      showConfirm({
        title: t('error') || 'Error',
        message: error.response?.data?.message || t('failed_to_add_contact') || 'Failed to add contact.',
        icon: 'close-circle',
        isDestructive: true
      });
    } finally {
      setLoading(false);
    }
  };

  const proceedToNext = () => {
    navigation.replace(nextScreen);
  };

  const handleContinue = () => {
    if (contactsAddedCount === 0) {
      showConfirm({
        title: t('highly_recommended') || 'Highly Recommended',
        message: t('sos_skip_warning') || 'Adding an emergency contact is highly recommended for your safety. Skip anyway?',
        icon: 'warning',
        confirmText: t('skip_anyway') || 'Skip Anyway',
        cancelText: t('add_contact') || 'Add Contact',
        isDestructive: true,
        onConfirm: () => {
          setModalVisible(false);
          proceedToNext();
        }
      });
    } else {
      proceedToNext();
    }
  };

  const textPrimary = isDark ? '#FFFFFF' : '#111827';
  const textSecondary = isDark ? '#9CA3AF' : '#6B7280';
  const cardBg = isDark ? '#1F2937' : '#FFFFFF';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#111827' : '#F3F4F6' }]} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: vs(120) }]} showsVerticalScrollIndicator={false}>
        
        {/* HERO BANNER */}
        <Animated.View entering={FadeInUp.duration(600)}>
          <PremiumInfoBanner 
            title="Safety First"
            description="Your safety is our top priority. Add a trusted contact to share your live location during emergencies."
          />
        </Animated.View>

        {/* INPUT SECTION */}
        <Animated.View 
          entering={FadeInDown.delay(200).duration(600)}
          style={[styles.section, { backgroundColor: cardBg, shadowColor: isDark ? '#000' : '#CBD5E1' }]}
        >
          <Pressable 
            style={[styles.chooseContactBtn, { backgroundColor: isDark ? '#374151' : '#F3F4F6', borderColor: colors.primary }]}
            onPress={handleChooseContact}
          >
            <Ionicons name="people" size={ms(20)} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={[styles.chooseContactText, { color: colors.primary }]}>Choose from Contacts</Text>
          </Pressable>
          
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: isDark ? '#4B5563' : '#E5E7EB' }]} />
            <Text style={[styles.dividerText, { color: textSecondary }]}>or enter manually</Text>
            <View style={[styles.dividerLine, { backgroundColor: isDark ? '#4B5563' : '#E5E7EB' }]} />
          </View>

          <Input 
            label={t('contact_name') || 'Contact Name'}
            placeholder="e.g. John Doe"
            value={name}
            onChangeText={setName}
            LeadingAccessory={<Ionicons name="person-outline" size={ms(20)} color={textSecondary} style={{ marginRight: 10 }} />}
            containerStyle={{ marginBottom: vs(20) }}
          />

          <Input 
            label={t('phone_number') || 'Phone Number'}
            placeholder="e.g. 9876543210"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            LeadingAccessory={<Ionicons name="call-outline" size={ms(20)} color={textSecondary} style={{ marginRight: 10 }} />}
            containerStyle={{ marginBottom: vs(20) }}
          />

          <RelationshipPicker 
            selected={relationship}
            onSelect={setRelationship}
          />

          <View style={styles.addBtnContainer}>
            <Pressable 
              onPress={handleAddContact} 
              disabled={loading}
              style={({ pressed }) => [{ opacity: pressed || loading ? 0.9 : 1 }]}
            >
              <LinearGradient
                colors={loading ? ['#9CA3AF', '#6B7280'] : [colors.primary, '#1E3A8A']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.addBtn}
              >
                <Ionicons name={loading ? "sync" : "add-circle-outline"} size={ms(22)} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.addBtnText}>{loading ? t('saving') : t('save_contact') || 'Save Contact'}</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </Animated.View>
      </ScrollView>

      {/* STICKY FOOTER */}
      <View style={[styles.onboardingFooter, { backgroundColor: cardBg, paddingBottom: Platform.OS === 'ios' ? insets.bottom : vs(20) }]}>
        <Pressable
          style={[styles.continueSetupBtn, { backgroundColor: contactsAddedCount > 0 ? '#10B981' : colors.primary }]}
          onPress={handleContinue}
        >
          <Text style={styles.continueSetupBtnText}>
            {contactsAddedCount > 0 ? t('continue_setup') || 'Continue' : 'Skip for now'}
          </Text>
          <Ionicons name={contactsAddedCount > 0 ? "checkmark" : "arrow-forward"} size={ms(20)} color="#FFF" style={{ marginLeft: ms(8) }} />
        </Pressable>
      </View>

      {/* STANDARDIZED MODAL */}
      <ConfirmationModal 
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={modalData.onConfirm}
        title={modalData.title}
        message={modalData.message}
        confirmText={modalData.confirmText}
        cancelText={modalData.cancelText}
        isDestructive={modalData.isDestructive}
        icon={modalData.icon}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: ms(20),
    paddingTop: vs(20),
  },
  section: {
    padding: ms(24),
    borderRadius: ms(24),
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: vs(20),
  },
  chooseContactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: vs(54),
    borderWidth: 1.5,
    borderRadius: ms(16),
    borderStyle: 'dashed',
    marginBottom: vs(24),
  },
  chooseContactText: {
    fontSize: ms(15),
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(24),
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: ms(12),
    fontSize: ms(13),
    fontWeight: '500',
  },
  addBtnContainer: {
    marginTop: vs(8),
    borderRadius: ms(16),
    overflow: 'hidden',
  },
  addBtn: {
    height: vs(56),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    color: '#fff',
    fontSize: ms(16),
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  onboardingFooter: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingHorizontal: ms(20),
    paddingTop: vs(16),
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  continueSetupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: vs(18),
    borderRadius: ms(16),
  },
  continueSetupBtnText: {
    color: '#FFF',
    fontSize: ms(17),
    fontWeight: '800',
  },
});

export default OnboardingSosScreen;
