import { StyleSheet, View, Text, Animated, Platform } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import socketService from '../service/socketService';
import { mS as ms, vS as vs } from '../lib/scale';
import Ionicons from 'react-native-vector-icons/Ionicons';

const MapConnectionStatus = () => {
  const insets = useSafeAreaInsets();
  const [isConnected, setIsConnected] = useState(socketService.isConnected);
  const slideAnim = useRef(new Animated.Value(-100)).current;

  // Track socket connection
  useEffect(() => {
    const handleStatusChange = (connected: boolean) => {
      setIsConnected(connected);
    };
    socketService.addConnectionListener(handleStatusChange);
    return () => socketService.removeConnectionListener(handleStatusChange);
  }, []);

  // Sync animation
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: isConnected ? -100 : 0,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
  }, [isConnected, slideAnim]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.content}>
        <Ionicons name="cloud-offline-outline" size={ms(18)} color="#FFF" />
        <Text style={styles.text}>
          No Connection - Location sharing paused
        </Text>
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
    backgroundColor: '#EF4444', // Red-500
    zIndex: 2000,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: vs(10),
    paddingHorizontal: ms(20),
  },
  text: {
    color: '#FFF',
    fontSize: ms(13),
    fontWeight: '700',
    marginLeft: ms(10),
    letterSpacing: 0.3,
  },
});

export default MapConnectionStatus;
