import { TextStyle } from 'react-native';

export const Typography = {
  // Editorial Display Serifs (Playfair Display)
  displayXl: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 40,
    lineHeight: 46,
    letterSpacing: -0.8,
    color: '#ffffff',
  } as TextStyle,
  
  headlineLg: {
    fontFamily: 'PlayfairDisplay_500Medium',
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.4,
    color: '#ffffff',
  } as TextStyle,
  
  headlineMd: {
    fontFamily: 'PlayfairDisplay_500Medium',
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.2,
    color: '#ffffff',
  } as TextStyle,

  // Technical & UI Sans-Serifs (Inter)
  bodyLg: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: '#d4e4fa',
  } as TextStyle,
  
  bodyMd: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#bbc9cd',
  } as TextStyle,
  
  bodySm: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 16,
    color: '#859397',
  } as TextStyle,

  labelMd: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    lineHeight: 16,
    letterSpacing: 0.6,
    color: '#d4e4fa',
  } as TextStyle,
  
  labelSm: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: '#bbc9cd',
  } as TextStyle,

  caps: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#859397',
  } as TextStyle,
  
  numericLg: {
    fontFamily: 'Inter_500Medium',
    fontSize: 26,
    lineHeight: 30,
    color: '#ffffff',
  } as TextStyle,
};
