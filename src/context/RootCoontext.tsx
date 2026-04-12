import React, {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useState,
  useCallback,
} from 'react';
import { Loader } from '../Components';
import SuccessPopup from '../Components/SuccessPopup';

interface RootContextType {
  setLoading: Dispatch<SetStateAction<boolean>>;
  showSuccessPopup: (message: string) => void;
}

const initialValue: RootContextType = {
  setLoading: () => { },
  showSuccessPopup: () => { },
};

const RootContext = createContext<RootContextType>(initialValue);

const RootProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

  const showSuccessPopup = useCallback((message: string) => {
    setPopupMessage(message);
    setPopupVisible(true);
  }, []);

  const hidePopup = useCallback(() => {
    setPopupVisible(false);
  }, []);

  return (
    <RootContext.Provider value={{ setLoading, showSuccessPopup }}>
      {children}
      <Loader loading={loading} />
      <SuccessPopup
        isVisible={popupVisible}
        message={popupMessage}
        onDismiss={hidePopup}
      />
    </RootContext.Provider>
  );
};

export { RootContext, RootProvider };
