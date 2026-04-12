import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  Modal,
  Text,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Styles } from '../lib/styles';
import { useTheme } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from './Input';
import { DownArrowIcon } from '../assets/svg';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

/* ================= TYPES ================= */

type DropDownDataType = {
  label: string;
  value: string;
};

interface DropDownProps {
  data: DropDownDataType[];
  value?: string;
  label?: string;


  /** ✅ Correct prop */
  placeholder?: string;

  /** ⚠️ Backward compatibility (old typo) */
  placeHolde?: string;

  containerStyle?: ViewStyle | ViewStyle[];
  error?: string;
  onSelect?: (value: string) => void;
  searchBar?: boolean;
  border?: boolean;
  disabled?: boolean;
}

/* ================= COMPONENT ================= */

const DropDown: React.FC<DropDownProps> = ({
  data,
  label,
  placeholder,
  placeHolde,
  containerStyle,
  value,
  onSelect = () => { },
  error,
  searchBar = true,
  border = true,
  disabled = false,
}) => {
  const { colors, fonts }: any = useTheme();

  const [modal, setModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filteredData, setFilteredData] =
    useState<DropDownDataType[]>(data);

  /* ================= SEARCH ================= */

  const searchAction = useCallback(
    (text: string) => {
      setSearch(text);
      const filtered = data.filter(item =>
        item.label.toLowerCase().includes(text.toLowerCase()),
      );
      setFilteredData(filtered);
    },
    [data],
  );

  useEffect(() => {
    if (modal) {
      setFilteredData(data);
    }
  }, [modal, data]);

  /* ================= RENDER ITEM ================= */

  const renderItem = useCallback(
    ({ item }: { item: DropDownDataType }) => (
      <TouchableOpacity
        onPress={() => {
          onSelect(item.value);
          setModal(false);
          setSearch('');
        }}
        style={styles.item}
      >
        <Text
          style={[
            value === item.value ? fonts.bold : fonts.regular,
            { color: value === item.value ? colors.primary : colors.text },
          ]}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    ),
    [value, colors, fonts, onSelect],
  );

  /* ================= UI ================= */

  return (
    <View style={containerStyle}>
      <TouchableOpacity
        disabled={disabled}
        onPress={() => setModal(true)}
        style={[
          Styles.flexRow,
          border && Styles.bw1,
          Styles.br2,
          Styles.px2,
          Styles.alignItemsCenter,
          { borderColor: colors.searchBorder, height: 55 },
        ]}
      >
        <Text
          numberOfLines={1}
          style={[
            Styles.flex,
            Styles.pl2,
            { color: value ? colors.text : colors.card },
          ]}
        >
          {value
            ? data.find(x => x.value === value)?.label
            : placeholder ?? placeHolde ?? ''}
        </Text>

        {!disabled && <DownArrowIcon />}
      </TouchableOpacity>

      {error && (
        <Text style={[fonts.regular, Styles.mt2, { color: colors.error }]}>
          {error}
        </Text>
      )}

      {/* ================= MODAL ================= */}

      <Modal
        visible={modal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setModal(false);
          setSearch('');
        }}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            setModal(false);
            setSearch('');
          }}
        >
          <View style={styles.backdrop}>
            <SafeAreaView
              edges={['bottom']}
              style={{ backgroundColor: colors.background }}
            >
              <View style={styles.sheet}>
                <View style={styles.handle} />

                {searchBar && (
                  <Input
                    value={search}
                    onChangeText={searchAction}
                    placeholder={
                      label ? `Search ${label.toLowerCase()}` : 'Search'
                    }
                    LeadingAccessory={
                      <MaterialIcons
                        name="search"
                        size={20}
                        color={colors.border}
                      />
                    }
                    containerStyle={[Styles.mb4, { borderRadius: 12 }]}
                  />
                )}

                <FlatList
                  data={filteredData}
                  renderItem={renderItem}
                  keyExtractor={(item, index) =>
                    `${item.value}-${index}`
                  }
                  keyboardShouldPersistTaps="handled"
                />
              </View>
            </SafeAreaView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '75%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CCC',
    alignSelf: 'center',
    marginBottom: 12,
  },
  item: {
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
});

export default React.memo(DropDown);
