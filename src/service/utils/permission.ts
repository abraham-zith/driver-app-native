import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from 'react-native-geolocation-service';

export const requestLocationPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'ios') {
        try {
            const auth = await Geolocation.requestAuthorization('whenInUse');
            return auth === 'granted';
        } catch (error) {
            console.warn(error);
            return false;
        }
    }

    if (Platform.OS === 'android') {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (err) {
            console.warn(err);
            return false;
        }
    }

    return false;
};
