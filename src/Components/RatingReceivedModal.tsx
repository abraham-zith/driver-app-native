import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Animated,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

interface RatingReceivedModalProps {
  visible: boolean;
  rating: number;
  feedback?: string;
  onClose: () => void;
}

const RatingReceivedModal: React.FC<RatingReceivedModalProps> = ({
  visible,
  rating,
  feedback,
  onClose,
}) => {
  const { t } = useTranslation();
  const { theme, isDark } = useAppTheme();
  
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.modalContainer, 
            { 
              backgroundColor: theme.colors.card,
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            }
          ]}
        >
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
            <Ionicons name="star" size={40} color="#FBBF24" />
          </View>
          
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {t('new_rating_received', 'New Rating Received!')}
          </Text>
          
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={star <= rating ? "star" : "star-outline"}
                size={28}
                color="#FBBF24"
              />
            ))}
          </View>

          {feedback ? (
            <View style={[styles.feedbackBox, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
              <Text style={[styles.feedbackText, { color: isDark ? '#E5E7EB' : '#374151' }]}>
                "{feedback}"
              </Text>
            </View>
          ) : (
            <Text style={[styles.subTitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              {t('rider_loved_your_service', 'The rider loved your service!')}
            </Text>
          )}

          <Pressable
            style={[styles.closeBtn, { backgroundColor: theme.colors.primary }]}
            onPress={onClose}
          >
            <Text style={styles.closeBtnText}>{t('awesome', 'Awesome!')}</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '90%',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
    textAlign: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 20,
  },
  subTitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  feedbackBox: {
    padding: 16,
    borderRadius: 16,
    width: '100%',
    marginBottom: 24,
  },
  feedbackText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
  },
  closeBtn: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default RatingReceivedModal;
