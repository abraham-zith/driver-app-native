import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import i18n from './i18n/i18n';
import { RootState } from './redux/store';
import moment from 'moment';
import 'moment/locale/hi';
import 'moment/locale/ta';

const ReduxLanguageSync = () => {
  const language = useSelector(
    (state: RootState) => state.userSlice.user?.language
  );

  useEffect(() => {
    if (language) {
      i18n.changeLanguage(language);
      moment.locale(language);
    }
  }, [language]);

  return null;
};

export default ReduxLanguageSync;
