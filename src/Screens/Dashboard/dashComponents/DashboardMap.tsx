import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import MapView, {  PROVIDER_GOOGLE } from 'react-native-maps';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { Text } from '../../../Components';
import { hS as s, vS as vs, mS as ms } from '../../../lib/scale';
import { useAppTheme } from '../../../context/ThemeContext';
import UserLocationMarker from '../../../Components/Map/UserLocationMarker';




interface DashboardMapProps {
    userLocation: { latitude: number; longitude: number; heading: number | null } | null;
    isOnline: boolean;
    routeCoordinates?: { latitude: number; longitude: number }[];
}


const DashboardMap: React.FC<DashboardMapProps> = ({
    userLocation,
    isOnline,
    routeCoordinates = [],
}) => {
    const { isDark } = useAppTheme();
    const { t } = useTranslation();
    const mapRef = useRef<MapView | null>(null);

    const [isFollowing, setIsFollowing] = useState(true);
    const [hasCentered, setHasCentered] = useState(false);
    const [mapMargin, setMapMargin] = useState(1);

    // Reset centering when going offline
    useEffect(() => {
        if (!isOnline) {
            setHasCentered(false);
            setIsFollowing(false);
        } else {
            setIsFollowing(true);
        }
    }, [isOnline]);



// console.log("userLocation", userLocation);





    // Re-center when navigating back to the dashboard
    useFocusEffect(
        useCallback(() => {
            if (isOnline) {
                setIsFollowing(true);
                setHasCentered(false);
            }
        }, [isOnline])
    );

    // ── Auto-center/Follow map ──
    useEffect(() => {
        if (userLocation && isOnline) {
            if (!hasCentered) {
                mapRef.current?.animateToRegion({
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                });
                setHasCentered(true);
            } else if (isFollowing) {
                mapRef.current?.animateToRegion(
                    {
                        latitude: userLocation.latitude,
                        longitude: userLocation.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    },
                    1000
                );
            }
        }
    }, [userLocation, isOnline, hasCentered, isFollowing]);

    const recenterMap = useCallback(() => {
        if (userLocation) {
            setIsFollowing(true);
            mapRef.current?.animateToRegion(
                {
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                },
                1000
            );
        }
    }, [userLocation]);

    return (
        <View style={styles.mapContainer}>
            <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                // style={[StyleSheet.absoluteFillObject, { marginBottom: mapMargin }]}

                style={{
                    flex: 1,
                    }}
            
                onMapReady={() => setMapMargin(0)}
                showsUserLocation={false}
                showsMyLocationButton={false}
                showsCompass={false} // Usually we want to hide the compass if we have a custom recenter btn
                onPanDrag={() => setIsFollowing(false)}
                region={{
                    latitude: userLocation?.latitude || 0,
                    longitude: userLocation?.longitude || 0,
                    latitudeDelta: userLocation ? 0.05 : 100, // Zoom out if no location
                    longitudeDelta: userLocation ? 0.05 : 100,
                }}
            >
                {isOnline && userLocation && (
                    <UserLocationMarker 
                        coordinate={{ latitude: userLocation.latitude, longitude: userLocation.longitude }} 
                        heading={userLocation.heading} 
                    />
                )}
            </MapView>

            {/* ── OFFLINE DIM OVERLAY ── */}
            {!isOnline && (
                <View style={styles.offlineOverlay}>
                    <View style={styles.offlineIconCircle}>
                        <Ionicons name="eye-off" size={s(32)} color="#FFFFFF" />
                    </View>
                    <Text style={styles.offlineMapText}>{t('go_online_start')}</Text>
                </View>
            )}

            {/* ── RECENTER BUTTON ── */}
            {isOnline && (
                <Pressable style={[styles.recenterBtn, isDark && { backgroundColor: '#1E293B' }]} onPress={recenterMap}>
                    <Ionicons name="locate" size={s(22)} color={isDark ? '#FFFFFF' : '#1E293B'} />
                </Pressable>
            )}
        </View>
    );
};

export default DashboardMap;

const styles = StyleSheet.create({
    mapContainer: {
        height: vs(280),
        borderBottomLeftRadius: ms(24),
        borderBottomRightRadius: ms(24),
        overflow: 'hidden',
    },
    recenterBtn: {
        position: 'absolute',
        bottom: vs(20),
        right: s(20),
        backgroundColor: '#FFFFFF',
        width: s(44),
        height: s(44),
        borderRadius: ms(22),
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
    offlineOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    offlineIconCircle: {
        width: s(64),
        height: s(64),
        borderRadius: ms(32),
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: vs(16),
    },
    offlineMapText: {
        color: '#FFFFFF',
        fontSize: ms(14),
        fontWeight: '700',
        textAlign: 'center',
        paddingHorizontal: s(40),
        lineHeight: ms(24),
    },

});



