import { Platform } from 'react-native';

export const isWeb = Platform.OS === 'web';

/** On web, Animated always runs on the JS thread; on native we use the native driver. */
export const USE_NATIVE_DRIVER = !isWeb;

/** Layouts switch from one column to the desktop arrangement at this width. */
export const WIDE_BREAKPOINT = 900;
