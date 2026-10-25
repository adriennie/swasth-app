import { StyleSheet, Text, type TextProps } from 'react-native';
import { Palette } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  return (
    <Text
      style={[
        { color: lightColor },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontFamily: Fonts.body.regular,
    fontSize: 16,
    lineHeight: 24,
    color: Palette.ink,
  },
  defaultSemiBold: {
    fontFamily: Fonts.body.semiBold,
    fontSize: 16,
    lineHeight: 24,
    color: Palette.ink,
  },
  title: {
    fontFamily: Fonts.heading.bold,
    fontSize: 32,
    lineHeight: 32,
    color: Palette.ink,
  },
  subtitle: {
    fontFamily: Fonts.heading.bold,
    fontSize: 20,
    color: Palette.ink,
  },
  link: {
    fontFamily: Fonts.body.regular,
    lineHeight: 30,
    fontSize: 16,
    color: Palette.tealText,
  },
});