import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppTheme } from '../context/ThemeContext';
import { ms, vs } from '../lib/scale';
import Animated, { FadeInRight, Layout } from 'react-native-reanimated';

interface PremiumSosContactCardProps {
  name: string;
  phone: string;
  relationship?: string;
  status?: 'verified' | 'pending';
  onDelete?: () => void;
  index: number;
}

const AVATAR_COLORS = [
  { bg: '#DBEAFE', text: '#1E40AF' },
  { bg: '#E0E7FF', text: '#3730A3' },
  { bg: '#FEF3C7', text: '#92400E' },
  { bg: '#DCFCE7', text: '#166534' },
  { bg: '#FCE7F3', text: '#9D174D' },
];

const PremiumSosContactCard: React.FC<PremiumSosContactCardProps> = ({
  name,
  phone,
  relationship,
  status = 'verified',
  onDelete,
  index
}) => {
  const { isDark, theme } = useAppTheme();
  const avatarStyle = AVATAR_COLORS[index % AVATAR_COLORS.length];

  return (
    <Animated.View 
      entering={FadeInRight.delay(index * 100)}
      layout={Layout.springify()}
      style={[
        styles.container,
        { 
          backgroundColor: theme.colors.card, 
          shadowColor: isDark ? '#000' : '#CBD5E1' 
        }
      ]}
    >
      <View style={[styles.avatar, { backgroundColor: avatarStyle.bg }]}>
        <Text style={[styles.avatarText, { color: avatarStyle.text }]}>
          {name.charAt(0).toUpperCase()}
        </Text>
      </View>
      
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: isDark ? '#FFFFFF' : '#111827' }]} numberOfLines={1}>
            {name}
          </Text>
          {relationship && (
            <View style={[styles.tag, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
              <Text style={[styles.tagText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                {relationship}
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.phone, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{phone}</Text>
        
        <View style={styles.statusRow}>
          <Ionicons 
            name={status === 'verified' ? "checkmark-circle" : "time"} 
            size={14} 
            color={status === 'verified' ? '#10B981' : '#F59E0B'} 
          />
          <Text style={[styles.statusText, { color: status === 'verified' ? '#10B981' : '#F59E0B' }]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Text>
        </View>
      </View>
      
      {onDelete && (
        <Pressable 
          onPress={onDelete} 
          style={({ pressed }) => [
            styles.deleteBtn,
            { backgroundColor: isDark ? '#374151' : '#FEE2E2' },
            pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] }
          ]}
        >
          <Ionicons name="trash" size={ms(20)} color="#EF4444" />
        </Pressable>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: ms(16),
    borderRadius: ms(24),
    marginBottom: vs(16),
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  avatar: {
    width: ms(56),
    height: ms(56),
    borderRadius: ms(28),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ms(16),
  },
  avatarText: {
    fontSize: ms(22),
    fontWeight: '800',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(4),
    flexWrap: 'wrap',
  },
  name: {
    fontSize: ms(17),
    fontWeight: '800',
    marginRight: ms(8),
  },
  tag: {
    paddingHorizontal: ms(8),
    paddingVertical: vs(2),
    borderRadius: ms(6),
  },
  tagText: {
    fontSize: ms(11),
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  phone: {
    fontSize: ms(14),
    fontWeight: '500',
    marginBottom: vs(4),
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: ms(12),
    fontWeight: '700',
    marginLeft: ms(4),
  },
  deleteBtn: {
    width: ms(44),
    height: ms(44),
    borderRadius: ms(22),
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: ms(12),
  },
});

export default PremiumSosContactCard;
