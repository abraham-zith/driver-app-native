import { persistor } from '../../redux/store';
import { clearUser } from '../../redux/userSlice';
import { storage } from './storage';

export const logoutUser = async (dispatch: any) => {
  try {
    // 1. Clear secure tokens from Keychain
    await storage.clearAll();

    // 2. Clear Redux state
    dispatch(clearUser());

    // 3. Purge persisted data from AsyncStorage
    await persistor.purge();
  } catch (error) {
    console.log('Logout error:', error);
  }
};
