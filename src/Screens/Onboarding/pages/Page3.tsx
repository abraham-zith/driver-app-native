import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { hS, vS, mS } from '../../../lib/scale';

const Page3 = () => {
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
          source={require('../../../assets/images/page3.png')}
          style={styles.heroImage}
          resizeMode="contain"
        />
      </Animated.View>

      {/* CONTENT */}
      <View style={styles.content}>
        <Animated.Text
          entering={FadeInDown.duration(600).delay(200)}
          style={styles.title}
        >
          Recharge & Subscription Plans
        </Animated.Text>

        <Animated.Text
          entering={FadeInDown.duration(600).delay(300)}
          style={styles.desc}
        >
          Choose flexible daily or weekly plans. No hidden charges. Full
          transparency for better earnings.
        </Animated.Text>

        <Animated.View
          entering={FadeInDown.duration(600).delay(400)}
          style={styles.grid}
        >
          <View style={styles.card}>
            <MCIcon name="calendar-today" size={mS(20)} color="#64B5F6" />
            <Text style={styles.cardTitle}>Daily Plans</Text>
            <Text style={styles.cardSub}>Flexible daily options</Text>
          </View>

          <View style={styles.card}>
            <MCIcon name="shield-check" size={mS(20)} color="#64B5F6" />
            <Text style={styles.cardTitle}>No Hidden Fees</Text>
            <Text style={styles.cardSub}>Full transparency</Text>
          </View>

          <View style={styles.card}>
            <MCIcon
              name="credit-card-outline"
              size={mS(20)}
              color="#64B5F6"
            />
            <Text style={styles.cardTitle}>Easy Payment</Text>
            <Text style={styles.cardSub}>Multiple methods</Text>
          </View>

          <View style={styles.card}>
            <MCIcon name="autorenew" size={mS(20)} color="#64B5F6" />
            <Text style={styles.cardTitle}>Auto-Renewal</Text>
            <Text style={styles.cardSub}>Never miss a day</Text>
          </View>
        </Animated.View>
      </View>
    </ScrollView>
  );
};

export default Page3;

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
    height: vS(200),
  },

  /* CONTENT */
  content: {
    flex: 1,
    alignItems: 'center',
  },

  title: {
    fontSize: mS(22),
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginTop: vS(2),
  },

  desc: {
    textAlign: 'center',
    fontSize: mS(14),
    color: '#4B5563',
    marginTop: vS(2),
    lineHeight: mS(20),
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: vS(20),
  },

  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: mS(14),
    alignItems: 'center',
    paddingVertical: vS(3),
    marginBottom: vS(8),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },

  cardTitle: {
    marginTop: vS(6),
    fontSize: mS(13),
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },

  cardSub: {
    fontSize: mS(11),
    color: '#6B7280',
    marginTop: vS(2),
    textAlign: 'center',
  },
});
