/**
 * VARUNA Universal Safe Haptics Utility
 * Provides cross-platform haptic feedback with automatic web guards and error shielding.
 * Completely eliminates white screen crashes caused by unhandled haptic rejections on Web.
 */

import { Platform } from 'react-native';
import * as ExpoHaptics from 'expo-haptics';

export const ImpactFeedbackStyle = ExpoHaptics.ImpactFeedbackStyle;
export const NotificationFeedbackType = ExpoHaptics.NotificationFeedbackType;

export const impactAsync = async (style: ExpoHaptics.ImpactFeedbackStyle = ExpoHaptics.ImpactFeedbackStyle.Light): Promise<void> => {
  if (Platform.OS === 'web') return;
  try {
    await ExpoHaptics.impactAsync(style);
  } catch (err) {
    // Graceful silent fail on unsupported devices
  }
};

export const notificationAsync = async (type: ExpoHaptics.NotificationFeedbackType = ExpoHaptics.NotificationFeedbackType.Success): Promise<void> => {
  if (Platform.OS === 'web') return;
  try {
    await ExpoHaptics.notificationAsync(type);
  } catch (err) {
    // Graceful silent fail on unsupported devices
  }
};

export const selectionAsync = async (): Promise<void> => {
  if (Platform.OS === 'web') return;
  try {
    await ExpoHaptics.selectionAsync();
  } catch (err) {
    // Graceful silent fail on unsupported devices
  }
};

export default {
  ImpactFeedbackStyle,
  NotificationFeedbackType,
  impactAsync,
  notificationAsync,
  selectionAsync,
};
