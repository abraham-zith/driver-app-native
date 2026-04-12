import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import { ms, vs } from '../lib/scale';
import { useTranslation } from 'react-i18next';

interface RelationshipPickerProps {
  selected: string;
  onSelect: (relationship: string) => void;
}

const RELATIONSHIPS = [
  'Family',
  'Friend',
  'Spouse',
  'Work',
  'Other'
];

const RelationshipPicker: React.FC<RelationshipPickerProps> = ({ selected, onSelect }) => {
  const { theme, isDark } = useAppTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: isDark ? '#FFFFFF' : '#111827' }]}>
        {t('relationship') || 'Relationship'}
      </Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {RELATIONSHIPS.map((item) => {
          const isSelected = selected === item;
          return (
            <Pressable
              key={item}
              onPress={() => onSelect(item)}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected 
                    ? theme.colors.primary 
                    : isDark ? '#374151' : '#F3F4F6',
                  borderColor: isSelected ? theme.colors.primary : 'transparent'
                }
              ]}
            >
              <Text style={[
                styles.chipText,
                { color: isSelected ? '#FFFFFF' : isDark ? '#9CA3AF' : '#6B7280' }
              ]}>
                {t(item.toLowerCase()) || item}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: vs(20),
  },
  label: {
    fontSize: ms(13),
    fontWeight: '700',
    marginBottom: vs(12),
    letterSpacing: 0.3,
  },
  scrollContent: {
    paddingRight: ms(20),
  },
  chip: {
    paddingHorizontal: ms(16),
    paddingVertical: vs(10),
    borderRadius: ms(12),
    borderWidth: 1.5,
    marginRight: ms(10),
  },
  chipText: {
    fontSize: ms(14),
    fontWeight: '700',
  },
});

export default RelationshipPicker;
