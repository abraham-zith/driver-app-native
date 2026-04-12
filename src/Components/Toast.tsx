import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeInUp,
  FadeOutUp,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useToast } from '../context/ToastContext';
import { theme } from '../constant/theme';

const { width } = Dimensions.get('window');

const Toast: React.FC = () => {
  const { isVisible, toastConfig, hideToast } = useToast();
  const insets = useSafeAreaInsets();

  if (!isVisible || !toastConfig) return null;

  const { message, type = 'info' } = toastConfig;

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#E8F5E9',
          borderLeftColor: '#4CAF50',
          icon: 'check-circle',
          iconColor: '#4CAF50',
          textColor: '#2E7D32',
        };
      case 'error':
        return {
          backgroundColor: '#FFEBEE',
          borderLeftColor: '#F44336',
          icon: 'alert-circle',
          iconColor: '#F44336',
          textColor: '#C62828',
        };
      case 'info':
      default:
        return {
          backgroundColor: '#E3F2FD',
          borderLeftColor: '#2196F3',
          icon: 'information',
          iconColor: '#2196F3',
          textColor: '#1565C0',
        };
    }
  };

  const config = getToastStyles();

  return (
    <Animated.View
      entering={FadeInUp.springify().damping(15)}
      exiting={FadeOutUp.duration(300)}
      style={[
        styles.container,
        {
          top: insets.top + 10,
          backgroundColor: config.backgroundColor,
          borderLeftColor: config.borderLeftColor,
        },
      ]}
    >
      <Pressable onPress={hideToast} style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name={config.icon} size={24} color={config.iconColor} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.message, { color: config.textColor }]}>{message}</Text>
        </View>
        <Pressable onPress={hideToast} style={styles.closeButton}>
          <View style={{ opacity: 0.6 }}>
            <MaterialCommunityIcons name="close" size={18} color={config.textColor} />
          </View>
        </Pressable>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 9999,
    borderRadius: 12,
    borderLeftWidth: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  message: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  closeButton: {
    marginLeft: 8,
    padding: 4,
  },
});

export default Toast;
