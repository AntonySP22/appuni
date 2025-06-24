import React, { createContext, useState, useContext } from 'react';
import { Alert } from 'react-native';
import CustomAlert from '../components/CustomAlert';

const AlertContext = createContext(null);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    return {
      showAlert: ({ title, message, buttons }) => {
        Alert.alert(title, message, buttons.map(btn => ({
          text: btn.text,
          onPress: btn.onPress,
          style: btn.style
        })));
      }
    };
  }
  return context;
};

export const AlertProvider = ({ children }) => {
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    buttons: [],
    type: 'info'
  });

  const showAlert = (config) => {
    setAlertConfig({
      ...config,
      visible: true
    });
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({
      ...prev,
      visible: false
    }));
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <CustomAlert
        {...alertConfig}
        onDismiss={hideAlert}
      />
    </AlertContext.Provider>
  );
};