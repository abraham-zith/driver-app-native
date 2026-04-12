import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { RootState } from '../redux/store';

export const useSubscription = () => {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const user = useSelector((state: RootState) => state.userSlice.user);

    const isSubscriptionActive = !!user?.subscription_active;

    const checkSubscription = (onActive?: () => void) => {
        if (!isSubscriptionActive) {
            Alert.alert(
                t('subscription_required'),
                t('please_subscribe_to_access_feature'),
                [
                    { text: t('cancel'), style: 'cancel' },
                    {
                        text: t('view_plans'),
                        onPress: () => navigation.navigate('SubscriptionPlanScreen')
                    },
                ]
            );
            return false;
        }
        if (onActive) onActive();
        return true;
    };

    return {
        isSubscriptionActive,
        checkSubscription,
        subscriptionStatus: user?.onboarding_status === 'SUBSCRIPTION_ACTIVE' ? 'active' : 'inactive',
    };
};
