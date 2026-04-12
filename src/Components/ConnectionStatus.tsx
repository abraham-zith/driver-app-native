import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated, Easing, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import socketService from '../service/socketService';
import { theme } from '../constant/theme';
import { hS as s, vS as vs, mS as ms } from '../lib/scale';

const ConnectionStatus: React.FC = () => {
  const [isConnected, setIsConnected] = useState(socketService.isConnected);
  const isOnline = useSelector((state: RootState) => state.userSlice.user?.isOnline);
  const driverId = useSelector((state: RootState) => state.userSlice.user?.driverId);
  
  const insets = useSafeAreaInsets();
  
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Sync animation with connection and online status
  useEffect(() => {
    // Show banner only if: Driver is logged in + Marked as Online + Socket is disconnected
    const shouldShow = !!(driverId && isOnline && !isConnected);
    
    Animated.timing(slideAnim, {
      toValue: shouldShow ? 0 : -100,
      duration: 400,
      easing: Easing.out(Easing.back(1.5)),
      useNativeDriver: true,
    }).start();
  }, [isConnected, isOnline, driverId, slideAnim]);

  useEffect(() => {
    const handleStatusChange = (connected: boolean) => {
      setIsConnected(connected);
    };

    socketService.addConnectionListener(handleStatusChange);
    
    return () => socketService.removeConnectionListener(handleStatusChange);
  }, []);

  // Pulsing animation for the dot
  useEffect(() => {
    if (!isConnected && isOnline) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.4,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
    }
  }, [isConnected, isOnline, pulseAnim]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: insets.top > 0 ? insets.top + vs(8) : vs(20),
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.pill}>
        <Animated.View style={[styles.dot, { opacity: pulseAnim }]} />
        <Text style={styles.text}>Reconnecting...</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.95)', // Red-500 with high opacity
    paddingHorizontal: s(16),
    paddingVertical: vs(8),
    borderRadius: ms(20),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  dot: {
    width: s(8),
    height: s(8),
    borderRadius: ms(4),
    backgroundColor: '#FFF',
    marginRight: s(8),
  },
  text: {
    color: '#FFF',
    fontSize: ms(13),
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
});

export default ConnectionStatus;
