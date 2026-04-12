import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { mS as ms, vS as vs } from '../../../lib/scale';
import { Text } from '../../../Components';
import { useAppTheme } from '../../../context/ThemeContext';

const { width } = Dimensions.get('window');

interface SubscriptionRequiredModalProps {
  visible: boolean;
  onClose: () => void;
  onSubscribe: () => void;
}

const SubscriptionRequiredModal: React.FC<SubscriptionRequiredModalProps> = ({
  visible,
  onClose,
  onSubscribe,
}) => {
  const { theme, isDark } = useAppTheme();
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
          <View style={[styles.iconContainer, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
            <Ionicons name="lock-closed" size={ms(40)} color={theme.colors.primary} />
          </View>

          <Text style={[styles.title, { color: theme.colors.text }]}>
            {t('subscription_required', 'Subscription Required')}
          </Text>

          <Text style={[styles.description, { color: isDark ? '#94A3B8' : '#64748B' }]}>
            {t('active_plan_start_earning', 'Active the plan then start earning')}
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.subscribeButton, { backgroundColor: theme.colors.primary }]}
              onPress={onSubscribe}
            >
              <Text style={styles.subscribeButtonText}>
                {t('subscribe_now_btn', 'Subscribe Now')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={[styles.cancelButtonText, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                {t('not_now', 'Not Now')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default SubscriptionRequiredModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: ms(20),
  },
  container: {
    width: '100%',
    maxWidth: ms(340),
    borderRadius: ms(24),
    padding: ms(24),
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  iconContainer: {
    width: ms(80),
    height: ms(80),
    borderRadius: ms(40),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: vs(20),
  },
  title: {
    fontSize: ms(22),
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: vs(12),
  },
  description: {
    fontSize: ms(16),
    textAlign: 'center',
    lineHeight: ms(24),
    marginBottom: vs(30),
  },
  buttonContainer: {
    width: '100%',
    gap: vs(12),
  },
  subscribeButton: {
    width: '100%',
    paddingVertical: vs(16),
    borderRadius: ms(14),
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscribeButtonText: {
    color: '#FFFFFF',
    fontSize: ms(16),
    fontWeight: '700',
  },
  cancelButton: {
    width: '100%',
    paddingVertical: vs(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: ms(14),
    fontWeight: '600',
  },
});
