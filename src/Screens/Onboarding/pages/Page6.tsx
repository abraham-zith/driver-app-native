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

const Page6 = () => {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      {/* HERO */}
      <Animated.View
        entering={FadeInDown.duration(600).delay(100)}
        style={styles.heroWrapper}
      >
        <Image
          source={require('../../../assets/images/guied1.png')}
          style={styles.heroImage}
          resizeMode="contain"
        />
      </Animated.View>

      {/* TITLE */}
      <Animated.Text
        entering={FadeInDown.duration(600).delay(200)}
        style={styles.title}
      >
        Important Guidelines
      </Animated.Text>
      <Animated.Text
        entering={FadeInDown.duration(600).delay(300)}
        style={styles.desc}
      >
        Essential information to help you succeed
      </Animated.Text>

      {/* GRID */}
      <Animated.View
        entering={FadeInDown.duration(600).delay(400)}
        style={styles.grid}
      >
        <View style={styles.card}>
          <Icon name="phone-call" size={mS(22)} color="#EF9A9A" />
          <Text style={styles.cardTitle}>Emergency Support</Text>
          <Text style={styles.cardSub}>24/7 help when you need it</Text>
        </View>

        <View style={styles.card}>
          <MCIcon name="wallet-outline" size={mS(22)} color="#81C784" />
          <Text style={styles.cardTitle}>Wallet Recharge</Text>
          <Text style={styles.cardSub}>Easy top-up options</Text>
        </View>

        <View style={styles.card}>
          <MCIcon name="headphones" size={mS(22)} color="#90CAF9" />
          <Text style={styles.cardTitle}>Support Center</Text>
          <Text style={styles.cardSub}>Get answers to your questions</Text>
        </View>

        <View style={styles.card}>
          <MCIcon name="shield-check" size={mS(22)} color="#A5D6A7" />
          <Text style={styles.cardTitle}>Safety Features</Text>
          <Text style={styles.cardSub}>SOS button, ride sharing</Text>
        </View>

        <View style={styles.card}>
          <MCIcon
            name="alert-circle-outline"
            size={mS(22)}
            color="#FFF59D"
          />
          <Text style={styles.cardTitle}>Issue Reporting</Text>
          <Text style={styles.cardSub}>Report problems easily</Text>
        </View>

        <View style={styles.card}>
          <MCIcon name="update" size={mS(22)} color="#81C784" />
          <Text style={styles.cardTitle}>App Updates</Text>
          <Text style={styles.cardSub}>Stay current with features</Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

export default Page6;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: hS(20),
    paddingBottom: vS(20),
  },

  /* HERO */
  heroWrapper: {
    width: '100%',
    alignItems: 'center',
    marginVertical: vS(18),
  },

  heroImage: {
    width: '100%',
    height: vS(180),
  },

  /* TITLE */
  title: {
    fontSize: mS(22),
    fontWeight: '700',
    color: '#111827',
    marginTop: vS(1),
  },

  desc: {
    fontSize: mS(14),
    color: '#4B5563',
    marginTop: vS(1),
    textAlign: 'center',
  },

  /* GRID */
  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: vS(6),
  },

  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: mS(14),
    paddingVertical: vS(2),
    paddingHorizontal: hS(6),
    alignItems: 'center',
    marginBottom: vS(2),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },

  cardTitle: {
    fontSize: mS(13),
    color: '#111827',
    fontWeight: '700',
    marginTop: vS(2),
    textAlign: 'center',
  },

  cardSub: {
    fontSize: mS(11),
    textAlign: 'center',
    color: '#6B7280',
    marginTop: vS(2),
  },
});
