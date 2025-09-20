/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: 'text' | 'textSecondary' | 'background' | 'surface' | 'surfaceElevated' | 'tint' | 'accent' | 'success' | 'warning' | 'error' | 'icon' | 'iconSecondary' | 'border' | 'borderFocus' | 'tabIconDefault' | 'tabIconSelected' | 'overlay' | 'primary' | 'card' | 'mystical' | 'shadow'
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}
