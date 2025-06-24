import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

const CustomAlert = ({
  visible,
  title,
  message,
  buttons = [{ text: 'OK', onPress: () => {} }],
  onDismiss,
  type = 'info' // info, success, warning, error
}) => {
  const getIconName = () => {
    switch(type) {
      case 'success': return 'checkmark-circle-outline';
      case 'warning': return 'alert-circle-outline';
      case 'error': return 'close-circle-outline';
      default: return 'information-circle-outline';
    }
  };

  const getIconColor = () => {
    switch(type) {
      case 'success': return colors.success;
      case 'warning': return colors.warning;
      case 'error': return colors.danger;
      default: return colors.primary;
    }
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={onDismiss}
    >
      <TouchableWithoutFeedback onPress={onDismiss}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.alertContainer}>
              <View style={[styles.iconContainer, { backgroundColor: `${getIconColor()}15` }]}>
                <Ionicons name={getIconName()} size={28} color={getIconColor()} />
              </View>
              
              <Text style={styles.title}>{title}</Text>
              
              {message ? <Text style={styles.message}>{message}</Text> : null}
              
              <View style={[
                styles.buttonContainer, 
                buttons.length > 1 && styles.multipleButtons
              ]}>
                {buttons.map((button, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.button,
                      button.style === 'cancel' && styles.cancelButton,
                      button.style === 'destructive' && styles.destructiveButton,
                      buttons.length > 1 && styles.buttonFlex,
                      index > 0 && buttons.length > 1 && styles.buttonMarginLeft
                    ]}
                    onPress={() => {
                      if (button.onPress) button.onPress();
                      onDismiss();
                    }}
                  >
                    <Text style={[
                      styles.buttonText,
                      button.style === 'cancel' && styles.cancelButtonText,
                      button.style === 'destructive' && styles.destructiveButtonText
                    ]}>
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 340,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.darkText,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: colors.darkGray,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 8,
  },
  multipleButtons: {
    flexDirection: 'row',
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonFlex: {
    flex: 1,
  },
  buttonMarginLeft: {
    marginLeft: 12,
  },
  cancelButton: {
    backgroundColor: colors.lightGray,
  },
  destructiveButton: {
    backgroundColor: colors.danger,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButtonText: {
    color: colors.darkText,
  },
  destructiveButtonText: {
    color: 'white',
  }
});

export default CustomAlert;