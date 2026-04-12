import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ProfileIcon from '../assets/svg/Logo.svg';

interface Props {
  name: string;
  showBack?: boolean; // NEW (for other pages)
}

const DashboardHeader = ({ name, showBack = false }: Props) => {
  const navigation: any = useNavigation();

  return (
    <View style={styles.headerContainer}>

      {/* BACK BUTTON ONLY IF showBack = true */}
      {showBack ? (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color="#1A2F6B" />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 26 }} /> /* Placeholder space */
      )}

      <Text style={styles.title}>{name}</Text>

      {/* PROFILE */}
      <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
        <ProfileIcon width={34} height={34} />
      </TouchableOpacity>

    </View>
  );
};

export default DashboardHeader;

const styles = StyleSheet.create({
  headerContainer: {
    height: 60,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A2F6B',
  },
});
