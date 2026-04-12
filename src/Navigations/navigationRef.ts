import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef<any>();

export function navigate(name: any, params?: any) {
    if (navigationRef.isReady()) {
        navigationRef.navigate(name, params);
    }
}

export function reset(name: any) {
    if (navigationRef.isReady()) {
        navigationRef.reset({
            index: 0,
            routes: [{ name }],
        });
    }
}
