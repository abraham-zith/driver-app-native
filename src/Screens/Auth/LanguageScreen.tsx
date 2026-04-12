import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Platform,
  ToastAndroid,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withRepeat,
  interpolate,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';
import { useHaptic } from '../../hooks/useHaptic';

import { Text } from '../../Components';
import Button from '../../Components/Button';

import { languagesList } from '../../constant/language';
import { WelcomeScreen_Nav } from '../../Navigations/navigations';
import { setUser } from '../../redux/userSlice';
import { RootState } from '../../redux/store';
import i18n from '../../i18n/i18n';

import { hS, vS, mS } from '../../lib/scale';
import { Logo } from '../../assets/svg';
import { useUpdateDriverMutation } from '../../service/driverApi';
import LinearGradient from 'react-native-linear-gradient';
import AppStatusBar from '../../Components/AppStatusBar';

type Props = {
  navigation: any;
};

const AnimatedShape = ({ size = 150, color = '#000', startPos = { x: 0, y: 0 } }: any) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 15000 + Math.random() * 5000 }),
      -1,
      true
    );
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      progress.value,
      [0, 0.5, 1],
      [0, 50, -50]
    );
    const translateY = interpolate(
      progress.value,
      [0, 0.5, 1],
      [0, -80, 40]
    );
    const scale = interpolate(
      progress.value,
      [0, 0.5, 1],
      [1, 1.2, 0.9]
    );
    const rotate = interpolate(
      progress.value,
      [0, 1],
      [0, 360]
    );

    return {
      transform: [
        { translateX },
        { translateY },
        { scale },
        { rotate: `${rotate}deg` },
      ],
      opacity: interpolate(progress.value, [0, 0.5, 1], [0.3, 0.6, 0.3]),
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          left: startPos.x,
          top: startPos.y,
        },
        animatedStyle,
      ]}
    >
      <LinearGradient
        colors={[color, 'transparent']}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
        }}
        start={{ x: 0.5, y: 0.5 }}
        end={{ x: 1, y: 1 }}
      />
    </Animated.View>
  );
};

const DynamicBackground = ({ colors }: any) => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <AnimatedShape
        color={colors.primary}
        size={250}
        startPos={{ x: -50, y: -50 }}
      />
      <AnimatedShape
        color={colors.notification || '#FF6B6B'}
        size={200}
        startPos={{ x: 250, y: 200 }}
      />
      <AnimatedShape
        color={colors.primary}
        size={180}
        startPos={{ x: 50, y: 500 }}
      />
    </View>
  );
};

const LanguageItem = ({ item, isSelected, onPress, colors, dark, fonts }: any) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    // Dynamic tint for selection based on dark mode
    const selectionBg = isSelected
      ? (dark ? 'rgba(21, 45, 94, 0.4)' : '#E8EDF5')
      : colors.background;

    return {
      borderColor: withTiming(isSelected ? colors.primary : colors.border),
      backgroundColor: withTiming(selectionBg),
      borderWidth: withTiming(isSelected ? 2 : 1),
      transform: [{ scale: withSpring(scale.value, { damping: 15, stiffness: 200 }) }],
    };
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={() => (scale.value = 0.96)}
      onPressOut={() => (scale.value = 1)}
      activeOpacity={1} // Using our custom scale feedback
      accessibilityRole="radio"
      accessibilityLabel={`${item.nativeName}, ${item.label}`}
      accessibilityState={{ selected: isSelected }}
    >
      <Animated.View
        style={[
          styles.languageItem,
          animatedStyle,
        ]}
      >
        <View style={styles.languageInfo}>
          <View style={styles.flagContainer}>
            <Text style={{ fontSize: mS(32) }}>{item.icon}</Text>
          </View>
          <View>
            <Text style={[fonts.bold, { fontSize: mS(18), color: colors.text }]}>
              {item.nativeName}
            </Text>
            <Text
              style={{
                fontSize: mS(14),
                color: colors.paragraphText,
                marginTop: vS(2),
              }}
            >
              {item.label}
            </Text>
          </View>
        </View>

        <View style={styles.selectionIndicator}>
          {isSelected ? (
            <Ionicons
              name="checkmark-circle"
              size={mS(28)}
              color={colors.primary}
            />
          ) : (
            <View style={[styles.emptyCircle, { borderColor: colors.border }]} />
          )}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const LanguageScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, fonts, dark } = useTheme() as any;
  const dispatch = useDispatch();
  const { triggerHaptic } = useHaptic();

  /* ================= REDUX & API ================= */
  const user = useSelector((state: RootState) => state.userSlice.user);
  const savedLanguage = user?.language;
  const driverId = user?.driverId;

  const [updateDriver] = useUpdateDriverMutation();

  /* ================= STATE ================= */

  const [selectedLang, setSelectedLang] = useState<string>(
    savedLanguage || 'en'
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (savedLanguage) {
      setSelectedLang(savedLanguage);
    }
  }, [savedLanguage]);

  /* ================= HANDLERS ================= */

  const handleSelect = useCallback((value: string) => {
    setSelectedLang(value);
    triggerHaptic(HapticFeedbackTypes.impactLight);
  }, [triggerHaptic]);

  const handleContinue = useCallback(async () => {
    setIsLoading(true);
    triggerHaptic(HapticFeedbackTypes.impactMedium);

    try {
      // 1. Update server if driver is logged in
      if (driverId) {
        await updateDriver({
          id: driverId,
          data: { language: selectedLang },
        }).unwrap();
      }

      // 2. Update local state
      dispatch(setUser({ language: selectedLang }));
      i18n.changeLanguage(selectedLang);

      if (Platform.OS === 'android') {
        ToastAndroid.show('Language Updated Successfully', ToastAndroid.SHORT);
      }

      // 3. Navigate
      navigation.navigate(WelcomeScreen_Nav);
    } catch (error) {
      console.error('Failed to update language on server:', error);
      // Even if server update fails, we might want to let the user proceed locally
      // but for production, we alert them or just proceed depending on UX preference.
      dispatch(setUser({ language: selectedLang }));
      i18n.changeLanguage(selectedLang);
      navigation.navigate(WelcomeScreen_Nav);
    } finally {
      setIsLoading(false);
    }
  }, [selectedLang, dispatch, navigation, driverId, updateDriver, triggerHaptic]);

  /* ================= RENDER ================= */

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['top', 'bottom']}
    >
      <AppStatusBar />
      <DynamicBackground colors={colors} />

      {/* 🔹 LOGO SECTION */}
      <View
        style={styles.logoContainer}
      >
        <Logo width={mS(180)} height={hS(50)} />
      </View>

      {/* 🔹 HEADER SECTION */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.partnerText, { color: colors.paragraphText, ...fonts.medium }]}>
            vDrive Partner
          </Text>
          <View style={styles.titleRow}>
            <View style={[styles.titleIcon, { backgroundColor: dark ? 'rgba(238, 242, 255, 0.1)' : '#EEF2FF' }]}>
              <MaterialIcons name="translate" size={mS(22)} color={colors.primary} />
            </View>
            <Text style={[fonts.bold, styles.title, { color: colors.text }]}>
              Choose the Language
            </Text>
          </View>
          <Text style={[styles.subtitle, { color: colors.paragraphText, ...fonts.regular }]}>
            Choose the language you are most comfortable with
          </Text>
        </View>
      </View>

      {/* 🔹 CONTENT SECTION */}
      <View style={styles.content}>
        <View
          style={[styles.listContainer, { backgroundColor: colors.card }]}
        >
          <FlatList
            data={languagesList}
            keyExtractor={item => item.value}
            renderItem={({ item }) => (
              <LanguageItem
                item={item}
                isSelected={item.value === selectedLang}
                onPress={() => handleSelect(item.value)}
                colors={colors}
                dark={dark}
                fonts={fonts}
              />
            )}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </View>

        <View style={styles.footer}>
          <Text style={[styles.selectedLabelText, { color: colors.primary, ...fonts.bold }]}>
            {languagesList.find(l => l.value === selectedLang)?.label} selected
          </Text>
          <Text style={[styles.footerText, { color: colors.paragraphText, ...fonts.regular }]}>
            You can change this later in settings
          </Text>

          <Button
            style={[styles.continueButton, { backgroundColor: colors.primary }]}
            onPress={handleContinue}
            loading={isLoading}
          >
            Continue →
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    height: vS(90),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: vS(30),
    marginBottom: vS(10),
  },
  header: {
    paddingHorizontal: hS(24),
    marginBottom: vS(15),
    alignItems: 'center',
  },
  partnerText: {
    fontSize: mS(14),
    textAlign: 'center',
    marginBottom: vS(6),
    letterSpacing: 0.5,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vS(10),
  },
  titleIcon: {
    width: mS(42),
    height: mS(42),
    borderRadius: mS(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: hS(14),
  },
  title: {
    fontSize: mS(26),
  },
  subtitle: {
    fontSize: mS(15),
    textAlign: 'center',
    marginBottom: vS(10),
    lineHeight: mS(20),
  },
  content: {
    flex: 1,
    paddingHorizontal: hS(20),
  },
  listContainer: {
    borderRadius: mS(28),
    padding: hS(16),
    marginBottom: vS(8),
  },
  languageItem: {
    borderRadius: mS(20),
    padding: hS(16),
    marginBottom: vS(12),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagContainer: {
    marginRight: hS(18),
  },
  selectionIndicator: {
    marginLeft: hS(10),
  },
  emptyCircle: {
    width: mS(28),
    height: mS(28),
    borderRadius: mS(14),
    borderWidth: 1.5,
  },
  footer: {
    paddingBottom: vS(40),
  },
  selectedLabelText: {
    textAlign: 'center',
    fontSize: mS(16),
    marginBottom: vS(6),
  },
  footerText: {
    textAlign: 'center',
    fontSize: mS(14),
    marginBottom: vS(40),
  },
  continueButton: {
    height: vS(64),
    borderRadius: mS(20),
  },
});

export default LanguageScreen;
