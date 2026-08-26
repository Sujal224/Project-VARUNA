import { ViewStyle } from 'react-native';
import { Colors } from './colors';

export const GlassStyles = {
  panel: {
    backgroundColor: Colors.glassBackground,
    borderColor: Colors.borderHairline,
    borderWidth: 1,
    borderRadius: 18,
    overflow: 'hidden',
  } as ViewStyle,

  panelSubtle: {
    backgroundColor: 'rgba(18, 33, 49, 0.45)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderRadius: 14,
    overflow: 'hidden',
  } as ViewStyle,

  panelGlow: {
    backgroundColor: Colors.glassBackground,
    borderColor: Colors.borderGlowCyan,
    borderWidth: 1,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: Colors.primaryContainer,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 4,
  } as ViewStyle,

  pill: {
    backgroundColor: 'rgba(28, 43, 60, 0.6)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderRadius: 9999,
  } as ViewStyle,

  pillActive: {
    backgroundColor: 'rgba(34, 211, 238, 0.12)',
    borderColor: 'rgba(34, 211, 238, 0.35)',
    borderWidth: 1,
    borderRadius: 9999,
  } as ViewStyle,
};
