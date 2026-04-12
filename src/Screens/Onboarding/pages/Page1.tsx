import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Feather';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { hS, vS, mS } from '../../../lib/scale';

const Page1 = () => {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      {/* IMAGE */}
      <Animated.View
        entering={FadeInDown.duration(600).delay(100)}
        style={styles.imageWrapper}
      >
        <Image
          source={require('../../../assets/images/page1.png')}
          style={styles.heroImage}
          resizeMode="contain"
        />
      </Animated.View>

      {/* TITLE */}
      <Animated.Text
        entering={FadeInDown.duration(600).delay(200)}
        style={styles.title}
      >
        About VDrive
      </Animated.Text>

      {/* DESCRIPTION */}
      <Animated.Text
        entering={FadeInDown.duration(600).delay(300)}
        style={styles.desc}
      >
        VDrive is a technology-driven ride platform helping drivers earn safely
        and efficiently with transparent operations.
      </Animated.Text>

      {/* ICON ROW */}
      <Animated.View
        entering={FadeInDown.duration(600).delay(400)}
        style={styles.row}
      >
        <View style={styles.iconBox}>
          <Icon name="cpu" size={mS(22)} color="#64B5F6" />
          <Text style={styles.iconLabel}>Tech-Driven</Text>
        </View>

        <View style={styles.iconBox}>
          <MCIcon name="shield-check" size={mS(22)} color="#64B5F6" />
          <Text style={styles.iconLabel}>Safe & Secure</Text>
        </View>

        <View style={styles.iconBox}>
          <MCIcon name="map-marker-radius" size={mS(22)} color="#64B5F6" />
          <Text style={styles.iconLabel}>Wide Coverage</Text>
        </View>
      </Animated.View>

      {/* PAGE 2 STYLE CARDS */}
      <Animated.View
        entering={FadeInDown.duration(600).delay(500)}
        style={styles.grid}
      >
        <View style={styles.card}>
          <Text style={styles.cardValue}>10,000+</Text>
          <Text style={styles.cardText}>Active Drivers</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardValue}>24/7</Text>
          <Text style={styles.cardText}>Driver Support</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardValue}>Daily</Text>
          <Text style={styles.cardText}>Payouts</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardValue}>100%</Text>
          <Text style={styles.cardText}>Transparency</Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

export default Page1;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: hS(20),
    paddingBottom: vS(20),
  },

  /* IMAGE */
  imageWrapper: {
    width: '100%',
    alignItems: 'center',
    marginTop: vS(2),
  },

  heroImage: {
    width: '100%',
    height: vS(180),
  },

  /* TEXT */
  title: {
    fontSize: mS(22),
    fontWeight: '700',
    color: '#111827',
    marginTop: vS(6),
  },

  desc: {
    marginTop: vS(6),
    fontSize: mS(14),
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: mS(20),
  },

  /* ICON ROW */
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: vS(8),
  },

  iconBox: {
    alignItems: 'center',
    flex: 1,
  },

  iconLabel: {
    fontSize: mS(12),
    marginTop: vS(2),
    color: '#6B7280',
  },

  /* GRID */
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: vS(10),
  },

  card: {
    width: '48%',
    height: vS(44),
    backgroundColor: '#FFFFFF',
    borderRadius: mS(12),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vS(8),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },

  cardValue: {
    fontSize: mS(16),
    fontWeight: '700',
    color: '#111827',
  },

  cardText: {
    marginTop: vS(4),
    fontSize: mS(11),
    color: '#6B7280',
    fontWeight: '600',
  },
});
