import { useEffect, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export const useNetInfo = () => {
    const [netInfo, setNetInfo] = useState<NetInfoState | null>(null);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setNetInfo(state);
        });

        return () => unsubscribe();
    }, []);

    const getConnectionType = () => {
        if (!netInfo) return 'Checking...';
        if (!netInfo.isConnected) return 'No Connection';

        switch (netInfo.type) {
            case 'wifi':
                return 'WiFi Connection';
            case 'cellular':
                return 'Mobile Data';
            case 'ethernet':
                return 'Ethernet';
            default:
                return 'Connected';
        }
    };

    return {
        netInfo,
        connectionType: getConnectionType(),
        isConnected: !!netInfo?.isConnected,
    };
};
