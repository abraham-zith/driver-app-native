import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
  ScrollView,
} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetTextInput,
  BottomSheetFooter,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';
import { useHaptic } from '../../hooks/useHaptic';
import Animated, {
  useAnimatedStyle,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';

/* ================= FAQ DATA ================= */

import { useTranslation } from 'react-i18next';

/* ================= COMPONENT ================= */

const FaqItem = ({ item, isExpanded, onPress, searchQuery }: any) => {
  const [contentHeight, setContentHeight] = useState(0);
  const { triggerHaptic } = useHaptic();

  const animatedBodyStyle = useAnimatedStyle(() => ({
    height: withTiming(isExpanded ? contentHeight : 0, { duration: 300 }),
    opacity: withTiming(isExpanded ? 1 : 0, { duration: 250 }),
  }));

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: withTiming(isExpanded ? '180deg' : '0deg') }],
  }));

  const highlightText = (text: string, query: string) => {
    if (!query || !query.trim()) {
      return <Text>{text}</Text>;
    }
    try {
      // Escape special regex characters to avoid crashes
      const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedQuery})`, 'gi');
      const parts = text.split(regex);
      return parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <Text key={i} style={styles.highlightText}>
            {part}
          </Text>
        ) : (
          <Text key={i}>{part}</Text>
        )
      );
    } catch (e) {
      return <Text>{text}</Text>;
    }
  };

  return (
    <View style={styles.faqRowContainer}>
      <TouchableOpacity
        style={styles.faqHeader}
        activeOpacity={0.7}
        onPress={() => {
          triggerHaptic(HapticFeedbackTypes.impactLight);
          onPress();
        }}
      >
        <Text style={[styles.faqQuestion, isExpanded && styles.faqQuestionActive]}>
          {highlightText(item.q, searchQuery)}
        </Text>
        <Animated.View style={arrowStyle}>
          <Ionicons
            name="chevron-down"
            size={20}
            color={isExpanded ? '#2563EB' : '#6B7280'}
          />
        </Animated.View>
      </TouchableOpacity>

      <Animated.View style={[animatedBodyStyle, styles.faqAnswerContainer]}>
        <View
          style={styles.faqAnswerWrapper}
          onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}
        >
          <Text style={styles.faqAnswer}>
            {highlightText(item.a, searchQuery)}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};

const HelpCenterModal = ({ visible, onClose }: any) => {
  const { t } = useTranslation();
  const { triggerHaptic } = useHaptic();
  const insets = useSafeAreaInsets();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['60%', '90%'], []);

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('cat_all');

  const CATEGORIES = useMemo(() => [
    { key: 'cat_all', label: t('cat_all') },
    { key: 'cat_registration', label: t('cat_registration') },
    { key: 'cat_earnings', label: t('cat_earnings') },
    { key: 'cat_driving', label: t('cat_driving') },
    { key: 'cat_app_issues', label: t('cat_app_issues') },
  ], [t]);

  const FAQS = useMemo(() => [
    {
      q: t('faq_reg_1_q'),
      a: t('faq_reg_1_a'),
      category: 'cat_registration',
    },
    {
      q: t('faq_reg_2_q'),
      a: t('faq_reg_2_a'),
      category: 'cat_registration',
    },
    {
      q: t('faq_reg_3_q'),
      a: t('faq_reg_3_a'),
      category: 'cat_registration',
    },
    {
      q: t('faq_earn_1_q'),
      a: t('faq_earn_1_a'),
      category: 'cat_earnings',
    },
    {
      q: t('faq_earn_2_q'),
      a: t('faq_earn_2_a'),
      category: 'cat_earnings',
    },
    {
      q: t('faq_earn_3_q'),
      a: t('faq_earn_3_a'),
      category: 'cat_earnings',
    },
    {
      q: t('faq_drive_1_q'),
      a: t('faq_drive_1_a'),
      category: 'cat_driving',
    },
    {
      q: t('faq_drive_2_q'),
      a: t('faq_drive_2_a'),
      category: 'cat_driving',
    },
    {
      q: t('faq_drive_3_q'),
      a: t('faq_drive_3_a'),
      category: 'cat_driving',
    },
    {
      q: t('faq_app_1_q'),
      a: t('faq_app_1_a'),
      category: 'cat_app_issues',
    },
    {
      q: t('faq_app_2_q'),
      a: t('faq_app_2_a'),
      category: 'cat_app_issues',
    },
  ], [t]);

  const filteredFaqs = useMemo(() => {
    return FAQS.filter((item) => {
      const matchCategory = category === 'cat_all' || item.category === category;
      const qText = search.trim().toLowerCase();
      const matchSearch =
        !qText ||
        (item.q && item.q.toLowerCase().includes(qText)) ||
        (item.a && item.a.toLowerCase().includes(qText));
      return matchCategory && matchSearch;
    });
  }, [search, category, FAQS]);

  // Sparkle + Magnifying Glass Animations for Empty State
  const magnifyingGlassStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withTiming(
          filteredFaqs.length === 0 && search.length > 0 ? 1.1 : 1,
          { duration: 600 },
        ),
      },
    ],
  }));

  const sparkleStyle1 = useAnimatedStyle(() => ({
    opacity: withTiming(
      filteredFaqs.length === 0 && search.length > 0 ? 1 : 0,
      { duration: 800 },
    ),
    transform: [
      {
        translateY: withTiming(
          filteredFaqs.length === 0 && search.length > 0 ? -15 : 0,
          { duration: 800 },
        ),
      },
      {
        scale: withTiming(
          filteredFaqs.length === 0 && search.length > 0 ? 1 : 0,
          { duration: 800 },
        ),
      },
    ],
  }));

  const sparkleStyle2 = useAnimatedStyle(() => ({
    opacity: withTiming(
      filteredFaqs.length === 0 && search.length > 0 ? 1 : 0,
      { duration: 1200 },
    ),
    transform: [
      {
        translateY: withTiming(
          filteredFaqs.length === 0 && search.length > 0 ? 10 : 0,
          { duration: 1200 },
        ),
      },
      {
        scale: withTiming(
          filteredFaqs.length === 0 && search.length > 0 ? 1 : 0,
          { duration: 1200 },
        ),
      },
    ],
  }));

  // Trigger modal presentation
  useEffect(() => {
    if (visible) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [visible]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose(); // Cleanup when dismissed
      }
    },
    [onClose]
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={1}
      >
        <Animated.View
          entering={FadeIn}
          style={styles.backdropBlur}
        />
      </BottomSheetBackdrop>
    ),
    []
  );


  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };


  const supportOptions = [
    {
      labelKey: 'email_support',
      icon: 'mail',
      color: '#1E3A8A',
      bg: '#DBEAFE',
      action: () => Linking.openURL('mailto:support@vdrive.com'),
    },
    {
      labelKey: 'whatsapp_support',
      icon: 'logo-whatsapp',
      color: '#16A34A',
      bg: '#DCFCE7',
      action: () => Linking.openURL('https://wa.me/919876543210'),
    },
    {
      labelKey: 'call_support',
      icon: 'call',
      color: '#2563EB',
      bg: '#E0E7FF',
      action: () => Linking.openURL('tel:+919876543210'),
    },
  ];

  const renderFooter = useCallback(
    (props: any) => (
      <BottomSheetFooter {...props} bottomInset={0}>
        <View style={[styles.footerContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <View style={styles.supportOptionsRow}>
            {supportOptions.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.supportButton}
                onPress={() => {
                  triggerHaptic(HapticFeedbackTypes.impactMedium);
                  item.action();
                }}
                activeOpacity={0.8}
              >
                <View style={[styles.supportIconBox, { backgroundColor: item.bg }]}>
                  <Ionicons name={item.icon} size={22} color={item.color} />
                </View>
                <Text style={styles.supportLabel}>{t(item.labelKey)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </BottomSheetFooter>
    ),
    [supportOptions, insets.bottom, t, triggerHaptic]
  );

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      footerComponent={renderFooter}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
    >
      <BottomSheetScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.heading}>{t('help_center')}</Text>
          <Text style={styles.subHeading}>
            {t('help_modal_subtitle')}
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <BottomSheetTextInput
            placeholder={t('search_help')}
            value={search}
            onChangeText={(text) => {
              setSearch(text);
              setOpenIndex(null);
            }}
            style={styles.searchInput}
            placeholderTextColor="#9CA3AF"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Horizontal Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryContainer}
          contentContainerStyle={styles.categoryScrollContent}
        >
          {CATEGORIES.map((cat, idx) => {
            const isActive = category === cat.key;
            return (
              <TouchableOpacity
                key={idx}
                style={[styles.categoryPill, isActive && styles.categoryActive]}
                onPress={() => {
                  triggerHaptic(HapticFeedbackTypes.selection);
                  setCategory(cat.key);
                  setOpenIndex(null);
                }}
              >
                <Text
                  style={[
                    styles.categoryText,
                    isActive && styles.categoryTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Contact Support Pinned to Footer */}

        {/* FAQ Section */}
        <Text style={styles.sectionTitle}>{t('common_questions')}</Text>

        <View style={styles.faqCard}>
          {filteredFaqs.length === 0 ? (
            <Animated.View style={styles.emptyState}>
              <View style={styles.magnifyingGlassContainer}>
                <Animated.View style={magnifyingGlassStyle}>
                  <Ionicons name="search" size={48} color="#D1D5DB" />
                </Animated.View>
                <Animated.View style={[styles.floatingSparkle, sparkleStyle1]}>
                  <Ionicons name="sparkles" size={16} color="#60A5FA" />
                </Animated.View>
                <Animated.View style={[styles.floatingSparkle2, sparkleStyle2]}>
                  <Ionicons name="sparkles" size={12} color="#FBBF24" />
                </Animated.View>
              </View>
              <Text style={styles.emptyTitle}>{t('no_results_title')}</Text>
              <Text style={styles.emptyText}>{t('no_results_desc', { search: search })}</Text>
            </Animated.View>
          ) : (
            filteredFaqs.map((item, index) => (
              <View key={index}>
                <FaqItem
                  item={item}
                  searchQuery={search}
                  isExpanded={openIndex === index}
                  onPress={() => toggleFAQ(index)}
                />
                {index < filteredFaqs.length - 1 && (
                  <View style={styles.divider} />
                )}
              </View>
            ))
          )}
        </View>
      </BottomSheetScrollView>

    </BottomSheetModal>
  );
};

export default HelpCenterModal;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: '#FAFAFA',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleIndicator: {
    backgroundColor: '#D1D5DB',
    width: 40,
    height: 5,
    borderRadius: 3,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  header: {
    marginTop: 10,
    marginBottom: 20,
  },
  heading: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
  },
  subHeading: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 14 : 2,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#111827',
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryScrollContent: {
    paddingRight: 20,
  },
  categoryPill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    marginRight: 10,
  },
  categoryActive: {
    backgroundColor: '#2563EB',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  footerContainer: {
    backgroundColor: '#FAFAFA',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  supportOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  supportButton: {
    alignItems: 'center',
    flex: 1,
  },
  supportIconBox: {
    height: 54,
    width: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  supportLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: '#111827',
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  faqRowContainer: {
    width: '100%',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    paddingRight: 12,
    lineHeight: 22,
  },
  faqQuestionActive: {
    color: '#2563EB',
  },
  faqAnswerContainer: {
    overflow: 'hidden',
  },
  faqAnswerWrapper: {
    position: 'absolute',
    width: '100%',
    paddingBottom: 18,
    paddingTop: 4,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
  },
  highlightText: {
    color: '#2563EB',
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  backdropBlur: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  magnifyingGlassContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  floatingSparkle: {
    position: 'absolute',
    top: -5,
    right: -10,
  },
  floatingSparkle2: {
    position: 'absolute',
    bottom: 5,
    left: -15,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
