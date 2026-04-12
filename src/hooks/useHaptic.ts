import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import ReactNativeHapticFeedback, { HapticFeedbackTypes } from 'react-native-haptic-feedback';
import { RootState } from '../redux/store';

const hapticOptions = {
    enableVibrateFallback: true,
    ignoreAndroidSystemSettings: false,
};

export const useHaptic = () => {
    const isVibrationEnabled = useSelector((state: RootState) => state.userSlice.user?.isVibrationEnabled ?? true);

    const triggerHaptic = useCallback((type: HapticFeedbackTypes = HapticFeedbackTypes.impactLight) => {
        if (isVibrationEnabled) {
            ReactNativeHapticFeedback.trigger(type, hapticOptions);
        }
    }, [isVibrationEnabled]);

    return {
        triggerHaptic,
        isVibrationEnabled,
    };
};

export default useHaptic;
