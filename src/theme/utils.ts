// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223
// Adapted from apps/common/frontend/src/theme/utils.ts @ canton-network/splice 80488155

export const generateHslPalette = (
  hue: number,
  saturation: number,
  levels: number[],
): Record<string, string> =>
  levels
    .map((lightness) => ({
      lightness,
      color: `hsl(${String(hue)}, ${String(saturation)}%, ${String(lightness)}%)`,
    }))
    .reduce(
      (prev, { lightness, color }) => ({
        ...prev,
        [lightness]: color,
      }),
      {} as Record<string, string>,
    );

export const generateRemValue = (stepSize: number, multiplier: number): string =>
  `${String(multiplier ** stepSize)}rem`;

interface PillButtonConfig {
  readonly props?: Record<string, string>;
  readonly bgColor?: string;
  readonly bgHoverColor?: string;
  readonly bgFocusColor?: string;
  readonly bgDisableColor: string;
  readonly textColor: string;
  readonly textHoverColor?: string;
  readonly textFocusColor?: string;
  readonly border?: string;
  readonly borderFocus?: string;
  readonly borderDisableColor?: string;
}

export const stylePillButton = (
  config: PillButtonConfig,
  additionalStyles?: Record<string, string | number>,
): Record<string, unknown> => {
  const {
    props,
    bgColor = 'none',
    bgHoverColor = bgColor,
    bgFocusColor = bgHoverColor,
    bgDisableColor,
    textColor,
    textHoverColor = textColor,
    textFocusColor = textColor,
    border = 'none',
    borderFocus = border,
    borderDisableColor = bgDisableColor,
  } = config;

  return {
    props: { variant: 'pill', ...props },
    style: {
      borderRadius: 9999,
      backgroundColor: bgColor,
      border,
      color: textColor,
      ...additionalStyles,
      '&:hover': {
        backgroundColor: bgHoverColor,
        color: textHoverColor,
      },
      '&:focus-visible': {
        color: textFocusColor,
        backgroundColor: bgFocusColor,
        border: borderFocus,
      },
      '&:disabled': {
        backgroundColor: bgDisableColor,
        border: `2px solid ${borderDisableColor}`,
      },
    },
  };
};
