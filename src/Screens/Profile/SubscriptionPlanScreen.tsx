import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Animated,
  Platform,
  StatusBar,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useFocusEffect } from '@react-navigation/native';
import { useAlert } from '../../context/AlertContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';
import RazorpayCheckout from 'react-native-razorpay';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector } from 'react-redux';
import { useHaptic } from '../../hooks/useHaptic';
import { RootState } from '../../redux/store';
import {
  useCreateSubscriptionOrderMutation,
  useVerifySubscriptionPaymentMutation,
  useGetMySubscriptionQuery,
  useGetSubscriptionPlansQuery,
} from '../../service/userApi';
import { useAppTheme } from '../../context/ThemeContext';
import AppStatusBar from '../../Components/AppStatusBar';

/* ================= TYPES ================= */

interface PlanFeature {
  key: string;
  icon: string;
  params?: Record<string, any>;
  isBlocked?: boolean;
}

interface PlanTier {
  id: number;
  name: string;
  color: string;
  gradient: string;
  icon: string;
  features: PlanFeature[];
  pricing: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  isPopular?: boolean;
  savings?: number | null;
}

type Duration = 'daily' | 'weekly' | 'monthly';

/* ================= CONSTANTS ================= */
const RAZORPAY_KEY = 'rzp_test_SCjewpaZ96XBWa'; // Replace with real key in prod

const FALLBACK_COLORS = ['#2563EB', '#152D5E', '#D97706'];
const FALLBACK_GRADIENTS = ['#3B82F6', '#1E3A8A', '#F59E0B'];
const FALLBACK_ICONS = ['shield-outline', 'diamond-outline', 'trophy-outline'];

const PLAN_COLORS: Record<string, { color: string, gradient: string, icon: string }> = {
  basic: { color: '#2563EB', gradient: '#3B82F6', icon: 'shield-outline' },
  elite: { color: '#152D5E', gradient: '#1E3A8A', icon: 'diamond-outline' },
  premium: { color: '#D97706', gradient: '#F59E0B', icon: 'trophy-outline' },
};

const DURATIONS: { key: Duration; labelKey: string }[] = [
  { key: 'daily', labelKey: 'daily_tag' },
  { key: 'weekly', labelKey: 'weekly_tag' },
  { key: 'monthly', labelKey: 'monthly_tag' },
];

const SkeletonBox = ({ style, isDark, opacity }: { style?: any, isDark: boolean, opacity: any }) => {
  return (
    <Animated.View style={[{ backgroundColor: isDark ? '#374151' : '#E5E7EB', borderRadius: 8, opacity }, style]} />
  );
};

/* ================= SCREEN ================= */

const RechargeSkeleton = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(shimmerAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const { isDark } = useAppTheme();

  return (
    <View style={styles.scrollContent}>
      <SkeletonBox style={{ height: 50, borderRadius: 14, marginBottom: 20 }} isDark={isDark} opacity={opacity} />
      <SkeletonBox style={{ height: 100, borderRadius: 20, marginBottom: 20 }} isDark={isDark} opacity={opacity} />
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
        <SkeletonBox style={{ flex: 1, height: 120, borderRadius: 16 }} isDark={isDark} opacity={opacity} />
        <SkeletonBox style={{ flex: 1, height: 120, borderRadius: 16 }} isDark={isDark} opacity={opacity} />
        <SkeletonBox style={{ flex: 1, height: 120, borderRadius: 16 }} isDark={isDark} opacity={opacity} />
      </View>
      <SkeletonBox style={{ height: 45, borderRadius: 14, marginBottom: 20 }} isDark={isDark} opacity={opacity} />
      <SkeletonBox style={{ height: 180, borderRadius: 16, marginBottom: 16 }} isDark={isDark} opacity={opacity} />
    </View>
  );
};

const RechargePlanScreen: React.FC<any> = ({ navigation }) => {
  const { colors } = useTheme();
  const { showAlert } = useAlert();
  const { t } = useTranslation();
  const { theme, isDark } = useAppTheme();
  const user = useSelector((state: RootState) => state.userSlice?.user);

  const { data: plansData, isLoading: isPlansLoading } = useGetSubscriptionPlansQuery();
  const { data: subscriptionData, isLoading: isSubLoading, refetch: refetchSub } = useGetMySubscriptionQuery();
  const [createSubscriptionOrder] = useCreateSubscriptionOrderMutation();
  const [verifySubscriptionPayment] = useVerifySubscriptionPaymentMutation();

  const [selectedTierId, setSelectedTierId] = useState<number | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<Duration>('weekly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'verifying' | 'success' | 'failed'>('idle');
  const [refreshing, setRefreshing] = useState(false);

  const insets = useSafeAreaInsets();
  const { triggerHaptic } = useHaptic();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetchSub();
    setRefreshing(false);
  }, [refetchSub]);

  // Sync sub data on focus
  useFocusEffect(
    React.useCallback(() => {
      refetchSub();
    }, [refetchSub])
  );

  // Helper to map backend JSON features to translated display items
  const getDisplayFeatures = (plan: any, duration: Duration): PlanFeature[] => {
    const features: PlanFeature[] = [];
    const featObj = plan.features;

    // Support for array format (manual override / legacy)
    if (Array.isArray(featObj)) {
      return featObj.map(f => ({
        key: f.toLowerCase().replace(/ /g, '_'),
        icon: 'checkmark-circle'
      }));
    }

    const feats = featObj || {};

    // Core features
    features.push({ key: 'zero_commission', icon: 'shield-checkmark' });

    const allowedTypes = feats.allowed_ride_types || [];

    if (allowedTypes.includes('INSTANT') || feats.instant_requests) {
      features.push({ key: 'instant_rides', icon: 'car' });
    } else {
      features.push({ key: 'local_rides', icon: 'car' });
    }

    if (allowedTypes.includes('OUTSTATION') || feats.outstation_enabled) {
      features.push({ key: 'outstation_trips', icon: 'map' });
    }
    if (allowedTypes.includes('ONE-WAY') || feats.oneway_enabled) {
      features.push({ key: 'one_way_trips', icon: 'arrow-forward-circle' });
    }

    // Scheduled Rides Logic
    const sched = feats.scheduled_rides;
    let isScheduledAllowed = false;
    if (sched) {
      if (duration === 'daily') isScheduledAllowed = !!sched.daily_allowed;
      else if (duration === 'weekly') isScheduledAllowed = !!sched.weekly_allowed;
      else if (duration === 'monthly') isScheduledAllowed = !!sched.monthly_allowed;

      features.push({
        key: 'scheduled_rides',
        icon: 'calendar',
        isBlocked: !isScheduledAllowed
      });
    }

    // Support Level
    if (feats.support === '24/7 Priority Support' || feats.priority_support) {
      features.push({ key: 'priority_support', icon: 'headset' });
    }

    // Extra Benefits
    if (feats.premium_driver_rank || (plan.plan_name || plan.name || '').toLowerCase().includes('premium')) {
      features.push({ key: 'priority_matching', icon: 'star' });
    }

    return features;
  };

  // Dynamic Tiers Mapping
  const planTiers: PlanTier[] = (plansData?.data?.plans || plansData?.data || []).map((plan: any, index: number) => {
    const daily = Number(plan.daily_price || 0);
    const weekly = Number(plan.weekly_price || 0);
    const monthly = Number(plan.monthly_price || 0);

    // Calculate savings relative to daily price
    let savingsPercent = 0;
    if (selectedDuration === 'weekly' && daily > 0) {
      savingsPercent = Math.round((1 - (weekly / (daily * 7))) * 100);
    } else if (selectedDuration === 'monthly' && daily > 0) {
      savingsPercent = Math.round((1 - (monthly / (daily * 30))) * 100);
    }

    const name = plan.plan_name || plan.name || '';
    const lowerName = name.toLowerCase();

    let colorScheme = {
      color: FALLBACK_COLORS[index % 3],
      gradient: FALLBACK_GRADIENTS[index % 3],
      icon: FALLBACK_ICONS[index % 3]
    };

    if (lowerName.includes('basic')) colorScheme = PLAN_COLORS.basic;
    else if (lowerName.includes('elite')) colorScheme = PLAN_COLORS.elite;
    else if (lowerName.includes('premium')) colorScheme = PLAN_COLORS.premium;

    return {
      id: plan.id,
      name: name,
      ...colorScheme,
      features: getDisplayFeatures(plan, selectedDuration),
      pricing: { daily, weekly, monthly },
      savings: savingsPercent > 0 ? savingsPercent : null,
      isPopular: plan.is_popular || lowerName.includes('elite'),
    };
  });

  useEffect(() => {
    if (planTiers.length > 0 && selectedTierId === null) {
      setSelectedTierId(planTiers[0].id);
    }
  }, [planTiers, selectedTierId]);

  const currentTier = planTiers.find((p) => p.id === selectedTierId) || planTiers[0];
  const currentPrice = currentTier?.pricing[selectedDuration] || 0;

  const getDurationKey = (cycle: string): Duration => {
    if (cycle === 'day') return 'daily';
    if (cycle === 'week') return 'weekly';
    if (cycle === 'month') return 'monthly';
    return 'daily';
  };

  const getBillingCycle = (dur: Duration): 'day' | 'week' | 'month' => {
    if (dur === 'daily') return 'day';
    if (dur === 'weekly') return 'week';
    if (dur === 'monthly') return 'month';
    return 'day';
  };

  const activePlan = subscriptionData?.data?.subscription;
  const isActivePlan = activePlan?.plan_id === selectedTierId &&
    getDurationKey(activePlan?.billing_cycle) === selectedDuration &&
    activePlan?.status?.toUpperCase() === 'ACTIVE';

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleTierSelect = (id: number) => {
    triggerHaptic(HapticFeedbackTypes.impactLight);
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    setSelectedTierId(id);
  };

  const handleSubscribe = async () => {
    if (!selectedTierId || isActivePlan) return;

    triggerHaptic(HapticFeedbackTypes.impactMedium);
    setIsProcessing(true);
    setPaymentStatus('processing');

    try {
      const orderResponse = await createSubscriptionOrder({
        plan_id: selectedTierId,
        billing_cycle: getBillingCycle(selectedDuration),
      }).unwrap();

      const options = {
        description: `${currentTier.name} - ${selectedDuration.toUpperCase()} Recharge`,
        image: 'https://vdrive.com/logo.png',
        currency: 'INR',
        key: RAZORPAY_KEY,
        amount: orderResponse.data.amount,
        name: 'VDRIVE',
        order_id: orderResponse.data.order_id,
        prefill: {
          email: user?.email || '',
          contact: user?.phone_number || '',
          name: user?.full_name || '',
        },
        theme: { color: currentTier.color },
      };

      const data = await RazorpayCheckout.open(options);

      setPaymentStatus('verifying');
      const verifyResult = await verifySubscriptionPayment({
        razorpay_order_id: data.razorpay_order_id || '',
        razorpay_payment_id: data.razorpay_payment_id || '',
        razorpay_signature: data.razorpay_signature || '',
      }).unwrap();

      if (verifyResult.success) {
        setPaymentStatus('success');
        triggerHaptic(HapticFeedbackTypes.notificationSuccess);
        showAlert({
          title: 'Subscription',
          message: 'Your plan has been upgraded successfully.',
          singleButton: true,
          icon: 'star-outline',
        });
        refetchSub();
      } else {
        throw new Error('Verification failed');
      }
    } catch (error: any) {
      setPaymentStatus('failed');
      showAlert({
        title: t('payment_failed'),
        message: error.message || t('something_went_wrong'),
        singleButton: true,
        icon: 'close-circle-outline',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getFriendlyDuration = (dur: Duration) => {
    if (dur === 'daily') return 'day';
    if (dur === 'weekly') return 'week';
    if (dur === 'monthly') return 'month';
    return 'day';
  };

  if (isPlansLoading || isSubLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom', 'left', 'right']}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        <ScrollView
          contentContainerStyle={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors?.primary || '#152D5E']}
              tintColor={colors?.primary || '#152D5E'}
            />
          }
        >
          <LinearGradient
            colors={isDark ? ['#152D5E', '#0F172A'] : ['#152D5E', '#1E3A8A']}
            style={styles.premiumHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={[styles.titleSection, { marginTop: insets.top + 10, flexDirection: 'row', alignItems: 'center' }]}>
              <Pressable onPress={() => navigation.goBack()} style={{ marginRight: 15 }}>
                <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
              </Pressable>
              <Text style={styles.premiumTitle}>{t('subscription_plan')}</Text>
            </View>
          </LinearGradient>
          <RechargeSkeleton />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors?.primary || '#152D5E']}
            tintColor={colors?.primary || '#152D5E'}
          />
        }
      >
        <LinearGradient
          colors={isDark ? ['#152D5E', '#0F172A'] : ['#152D5E', '#1E3A8A']}
          style={styles.premiumHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
        

          {/* Promo Banner */}
          {/* <View style={styles.promoBanner}>
            <Ionicons name="pricetag" size={20} color="#D97706" style={styles.promoIcon} />
            <View>
              <Text style={styles.promoTitle}>{t('first_month_promo')}</Text>
              <Text style={styles.promoSubtitle}>{t('promo_ends')}</Text>
            </View>
          </View> */}

          {/* Title Section */}

          <View style={[styles.titleSection, { marginTop: insets.top + 10, flexDirection: 'row', alignItems: 'flex-start' }]}>
            <Pressable onPress={() => navigation.goBack()} style={{ marginTop: 6, marginRight: 12 }}>
              <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
            </Pressable>
            <View style={{ flex: 1 }}>
            <Text style={styles.pickYourText}>
              {t('pick_your')} <Text style={styles.planWordText}>{t('plan_word')}</Text>
            </Text>
            <Text style={styles.subTitleText}>{t('drive_earn_faster')}</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.contentContainer}>
          {/* Tier Selection Cards */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tierCardsScroll}
            style={styles.tierCardsWrapper}
          >
            {planTiers.map((tier) => (
              <Pressable
                key={tier.id}
                onPress={() => handleTierSelect(tier.id)}
                style={({ pressed }) => [
                  { transform: [{ scale: pressed ? 0.98 : 1 }] }
                ]}
              >
                <LinearGradient
                  colors={selectedTierId === tier.id 
                    ? [tier.gradient, tier.color] 
                    : (isDark ? ['#374151', '#1F2937'] : ['#FFFFFF', '#F9FAFB'])}
                  style={[
                    styles.tierCard,
                    selectedTierId === tier.id && { borderColor: tier.color },
                    tier.isPopular && { borderWidth: 2, borderColor: selectedTierId === tier.id ? '#FFF' : tier.color }
                  ]}
                >
                  {tier.isPopular && (
                    <View style={[styles.popularBadge, { backgroundColor: selectedTierId === tier.id ? '#FFF' : tier.color }]}>
                      <Text style={[styles.popularBadgeText, { color: selectedTierId === tier.id ? tier.color : '#FFF' }]}>
                        {t('popular_caps')}
                      </Text>
                    </View>
                  )}
                  <View style={[
                    styles.tierIconContainer, 
                    { backgroundColor: selectedTierId === tier.id ? 'rgba(255,255,255,0.2)' : (isDark ? '#4B5563' : '#F3F4F6') }
                  ]}>
                    <Ionicons 
                      name={tier.icon as any} 
                      size={26} 
                      color={selectedTierId === tier.id ? '#FFFFFF' : tier.color} 
                    />
                  </View>
                  <Text style={[
                    styles.tierNameText, 
                    { color: selectedTierId === tier.id ? '#FFFFFF' : (isDark ? '#E5E7EB' : '#1E3A8A') }
                  ]} numberOfLines={1}>
                    {tier.name}
                  </Text>
                  <View style={styles.tierPriceContainer}>
                    <Text style={[
                      styles.tierPriceText,
                      { color: selectedTierId === tier.id ? '#FFFFFF' : (isDark ? '#F3F4F6' : '#111827') }
                    ]}>₹{tier.pricing.daily}</Text>
                    <Text style={[
                      styles.tierDurationText,
                      { color: selectedTierId === tier.id ? 'rgba(255,255,255,0.8)' : '#6B7280' }
                    ]}>/{t('day_tag').toLowerCase()}</Text>
                  </View>
                </LinearGradient>
              </Pressable>
            ))}
          </ScrollView>

          {/* Duration Selection */}
          <View style={styles.durationTabs}>
            {DURATIONS.map((dur) => (
              <Pressable
                key={dur.key}
                onPress={() => setSelectedDuration(dur.key)}
                style={[
                  styles.durationTab,
                  selectedDuration === dur.key && { backgroundColor: currentTier.color }
                ]}
              >
                <Text style={[
                  styles.durationTabText,
                  selectedDuration === dur.key && styles.selectedDurationTabText
                ]}>
                  {t(dur.labelKey)}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Selected Plan Details */}
          <Animated.View style={[
            styles.mainPlanCard, 
            { 
              transform: [{ scale: scaleAnim }],
              backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
              borderColor: isDark ? '#374151' : '#E5E7EB'
            }
          ]}>
            <View style={styles.planCardHeader}>
              <View style={{ flex: 1 }}>
                <View style={[styles.planTitleContainer, { backgroundColor: currentTier.color + '15' }]}>
                  <Ionicons name={currentTier.icon} size={16} color={currentTier.color} style={{ marginRight: 6 }} />
                  <Text style={[styles.mainPlanName, { color: currentTier.color }]}>{currentTier.name.toUpperCase()}</Text>
                </View>
                <View style={styles.mainPriceRow}>
                  <Text style={[styles.mainPriceText, { color: isDark ? '#FFFFFF' : '#111827' }]}>₹{currentPrice}</Text>
                  <Text style={styles.mainDurationText}>/{getFriendlyDuration(selectedDuration)}</Text>
                </View>
                {isActivePlan && (
                  <LinearGradient
                    colors={['#ECFDF5', '#D1FAE5']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.activePlanBadge}
                  >
                    <Ionicons name="shield-checkmark" size={14} color="#10B981" />
                    <Text style={styles.activePlanExpiryText}>
                      {t('expires_on')}: {new Date(activePlan.expiry_date).toLocaleDateString()}
                    </Text>
                  </LinearGradient>
                )}
              </View>
              {currentTier.savings && (
                <LinearGradient
                  colors={isDark ? ['#1E3A8A', '#152D5E'] : ['#EBF2FF', '#DBEAFE']}
                  style={styles.saveBadge}
                >
                   <Text style={[styles.saveBadgeText, { color: isDark ? '#60A5FA' : '#2563EB' }]}>
                     {t('save_percent', { percent: currentTier.savings })}
                   </Text>
                </LinearGradient>
              )}
            </View>

            <View style={[styles.divider, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]} />

            <View style={styles.featuresSection}>
              <Text style={styles.featuresTitle}>{t('whats_included_caps')}</Text>
              {currentTier.features.map((feature: any, idx) => (
                <View key={idx} style={styles.featureLine}>
                  <View style={[
                    styles.checkCircle, 
                    { backgroundColor: feature.isBlocked ? (isDark ? '#374151' : '#F3F4F6') : currentTier.color }
                  ]}>
                    <Ionicons
                      name={feature.icon}
                      size={12}
                      color={feature.isBlocked ? "#9CA3AF" : "white"}
                    />
                  </View>
                  <Text style={[
                    styles.featureLineText,
                    { color: isDark ? '#D1D5DB' : '#374151' },
                    feature.isBlocked && { textDecorationLine: 'line-through', color: '#9CA3AF' }
                  ]}>
                    {t(feature.key, feature.params) as any}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Action Button */}
          <View style={styles.bottomSection}>
            <Pressable
              onPress={handleSubscribe}
              disabled={isProcessing || isActivePlan}
              style={[
                styles.mainSubscribeButton,
                { backgroundColor: isActivePlan ? '#10B981' : currentTier.color }
              ]}
            >
              <Ionicons name="lock-closed" size={20} color="white" style={styles.lockIcon} />
              <Text style={styles.subscribeText}>
                {isActivePlan ? t('current_active_plan') : `${t('subscribe_now_btn')} • ₹${currentPrice}`}
              </Text>
            </Pressable>

            <View style={styles.securityInfo}>
              <Ionicons name="shield-checkmark-outline" size={16} color="#9CA3AF" />
              <Text style={styles.securityText}>{t('secured_encryption')}</Text>
            </View>

            <Pressable style={styles.refundLink}>
              <Text style={styles.refundText}>{t('refund_policy')}</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flexGrow: 1 },
  premiumHeader: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  backButtonAbsolute: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  premiumTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
  },
  // promoBanner: {
  //   backgroundColor: '#FEF3C7',
  //   marginHorizontal: 20,
  //   borderRadius: 15,
  //   padding: 15,
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   marginTop: 10,
  // },
  // promoIcon: { marginRight: 12 },
  // promoTitle: { color: '#92400E', fontSize: 16, fontWeight: 'bold' },
  // promoSubtitle: { color: '#B45309', fontSize: 13 },
  titleSection: {
    paddingHorizontal: 25,
    marginTop: 4,
  },
  pickYourText: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
  },
  planWordText: { color: '#FBBF24' },
  subTitleText: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  contentContainer: {
    flex: 1,
    marginTop: -20,
  },
  tierCardsWrapper: {
    maxHeight: 210,
    marginBottom: 10,
  },
  tierCardsScroll: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    gap: 16,
  },
  tierCard: {
    width: 110,
    borderRadius: 24,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
   
  },
  selectedTierCard: {
    borderColor: '#FFFFFF',
  },
  eliteCardBorder: {
    borderColor: '#1E3A8A',
    borderWidth: 2,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    zIndex: 2,
  
   
  },
  popularBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tierIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  tierNameText: {
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  tierPriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  tierPriceText: { fontSize: 18, fontWeight: '900' },
  tierDurationText: { fontSize: 11, fontWeight: '600' },
  durationTabs: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 15,
    padding: 5,
    marginBottom: 20,
    marginHorizontal: 20,
  },
  durationTab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  selectedDurationTab: {
    backgroundColor: '#1E3A8A',
  },
  durationTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  selectedDurationTabText: {
    color: 'white',
  },
  mainPlanCard: {
    borderRadius: 30,
    padding: 24,
    marginHorizontal: 20,
    borderWidth: 1,
  },
  planCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  planTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 10,
  },
  mainPlanName: { fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  mainPriceRow: { flexDirection: 'row', alignItems: 'baseline' },
  mainPriceText: { fontSize: 42, fontWeight: '900' },
  mainDurationText: { fontSize: 18, color: '#6B7280', marginLeft: 4, fontWeight: '600' },
  activePlanBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  activePlanExpiryText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '700',
    marginLeft: 6,
  },
  saveBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  saveBadgeText: { fontSize: 13, fontWeight: '800' },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 20,
  },
  featuresSection: { marginTop: 10 },
  featuresTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 15,
  },
  featureLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureLineText: { fontSize: 15, color: '#1F2937', fontWeight: '500' },
  bottomSection: {
    marginTop: 30,
    paddingBottom: 40,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  mainSubscribeButton: {
    width: '100%',
    height: 60,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  lockIcon: { marginRight: 10 },
  subscribeText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  securityText: { color: '#9CA3AF', fontSize: 12, marginLeft: 8 },
  refundLink: { marginTop: 10 },
  refundText: { color: '#9CA3AF', fontSize: 12, textDecorationLine: 'underline' },
  scrollContent: { paddingBottom: 20 },
});

export default RechargePlanScreen;
