import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import DashBoardScreen from '../Screens/Dashboard';
import ScheduledRidesScreen from '../Screens/Requests/ScheduledRidesScreen';
import ProfileScreen from '../Screens/Profile';
import { useAppTheme } from '../context/ThemeContext';
import { vS as vs, mS as ms } from '../lib/scale';

import { useSelector } from 'react-redux';
import { useGetIncomingTripsQuery } from '../service/driverApi';
import { RootState } from '../redux/store';

const Tab = createBottomTabNavigator();

const TabBarIcon = ({ focused, color, routeName, theme }: any) => {
  let iconName: string = 'home-outline';

  if (routeName === 'Home') {
    iconName = focused ? 'home' : 'home-outline';
  }
  if (routeName === 'Requests') {
    iconName = focused ? 'car-sport' : 'car-sport-outline';
  }
  if (routeName === 'Profile') {
    iconName = focused ? 'person' : 'person-outline';
  }

  return (
    <View style={{ alignItems: 'center', width: '100%' }}>
      {focused && (
        <View
          style={{
            position: 'absolute',
            top: -vs(10),
            width: ms(20),
            height: vs(3),
            backgroundColor: theme.colors.primary,
            borderRadius: ms(2),
          }}
        />
      )}
      <Ionicons
        name={iconName}
        size={focused ? 28 : 24}
        color={color}
      />
    </View>
  );
};

const getScreenOptions = (theme: any, isDark: boolean, insets: any) => ({ route }: any) => ({
  headerShown: false,

  // COLORS
  tabBarActiveTintColor: theme.colors.primary,
  tabBarInactiveTintColor: theme.colors.paragraphText || '#94A3B8',

  // ✅ hide tabs when keyboard opens
  tabBarHideOnKeyboard: false, // Changed from true to prevent jumping

  // ✅ SAFE AREA + RESPONSIVE HEIGHT
  tabBarStyle: {
    backgroundColor: theme.colors.card,
    borderTopWidth: 0,
    height: vs(65) + Math.max(insets.bottom, vs(10)),
    paddingBottom: Math.max(insets.bottom, vs(5)),
    paddingTop: vs(10),
  },

  tabBarLabelStyle: {
    fontSize: ms(11),
    fontWeight: '600' as any,
    marginBottom: vs(4),
  },

  // ✅ ICONS (focused / unfocused)
  tabBarIcon: ({ focused, color }: any) => (
    <TabBarIcon
      focused={focused}
      color={color}
      routeName={route.name}
      theme={theme}
    />
  ),
});

const DriverTabs = () => {
  const insets = useSafeAreaInsets(); // ✅ SAFE AREA
  const { theme, isDark } = useAppTheme();
  const user = useSelector((state: RootState) => state.userSlice.user);

  const { data: incomingTrips } = useGetIncomingTripsQuery('SCHEDULED', {
    skip: !user?.driverId,
    pollingInterval: 30000,
  });

  const requestCount = incomingTrips?.data?.length || 0;

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={getScreenOptions(theme, isDark, insets)}
    >
      {/* 🏠 HOME */}
      <Tab.Screen
        name="Home"
        component={DashBoardScreen}
      />

      {/* 🚗 REQUESTS */}
      <Tab.Screen
        name="Requests"
        component={ScheduledRidesScreen}
        options={{ 
          title: 'Requests', 
          tabBarBadge: requestCount > 0 ? '' : undefined,
          tabBarBadgeStyle: {
            backgroundColor: theme.colors.primary,
            minWidth: ms(10),
            minHeight: ms(10),
            maxWidth: ms(10),
            maxHeight: ms(10),
            borderRadius: ms(5),
            marginTop: vs(2),
          }
        }}
      />

      {/* 👤 PROFILE */}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
      />
    </Tab.Navigator>
  );
};

export default DriverTabs;
