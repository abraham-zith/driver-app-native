import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useSharedValue, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';
import { useHaptic } from './useHaptic';

interface UseVerificationTimerProps {
    initialSeconds: number;
    active: boolean;
    onExpire?: () => void;
}

export const useVerificationTimer = ({ initialSeconds, active, onExpire }: UseVerificationTimerProps) => {
    const [timer, setTimer] = useState(initialSeconds);
    const [isTimerActive, setIsTimerActive] = useState(active);
    const pulseAnim = useSharedValue(1);
    const appState = useRef(AppState.currentState);
    const lastBackgroundTime = useRef<number | null>(null);

    const { triggerHaptic } = useHaptic();

    const formatTime = useCallback((seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }, []);

    useEffect(() => {
        setIsTimerActive(active);
    }, [active]);

    useEffect(() => {
        let interval: any = null;

        if (isTimerActive && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => {
                    const next = prev - 1;
                    if (next <= 0) {
                        setIsTimerActive(false);
                        triggerHaptic(HapticFeedbackTypes.notificationError);
                        onExpire?.();
                        return 0;
                    }
                    return next;
                });
            }, 1000);

            if (timer <= 60) {
                pulseAnim.value = withRepeat(
                    withSequence(
                        withTiming(1.15, { duration: 500 }),
                        withTiming(1, { duration: 500 })
                    ),
                    -1,
                    true
                );
            } else {
                pulseAnim.value = withTiming(1);
            }
        }

        return () => {
            if (interval) { clearInterval(interval); }
        };
    }, [isTimerActive, timer, triggerHaptic, onExpire, pulseAnim]);

    // Handle AppState changes to fix timer when app is in background
    useEffect(() => {
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                if (lastBackgroundTime.current && isTimerActive) {
                    const timeSpentInBackground = Math.floor((Date.now() - lastBackgroundTime.current) / 1000);
                    setTimer((prev) => {
                        const next = Math.max(0, prev - timeSpentInBackground);
                        if (next === 0 && prev > 0) {
                            setIsTimerActive(false);
                            triggerHaptic(HapticFeedbackTypes.notificationError);
                            onExpire?.();
                        }
                        return next;
                    });
                }
            } else if (nextAppState.match(/inactive|background/)) {
                lastBackgroundTime.current = Date.now();
            }
            appState.current = nextAppState;
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription.remove();
    }, [isTimerActive, triggerHaptic, onExpire]);

    return {
        timer,
        formattedTime: formatTime(timer),
        pulseAnim,
        isWarning: timer <= 60,
        showWarningBanner: timer > 0 && timer < 120,
        stopTimer: () => setIsTimerActive(false),
        resetTimer: (seconds: number) => {
            setTimer(seconds);
            setIsTimerActive(true);
        },
    };
};
