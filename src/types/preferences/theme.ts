export const THEME_MODE_OPTIONS = [
  {
    label: "Light",
    value: "light",
  },
  {
    label: "Dark",
    value: "dark",
  },
] as const;

export const THEME_MODE_VALUES = THEME_MODE_OPTIONS.map((m) => m.value);

export type ThemeMode = (typeof THEME_MODE_VALUES)[number];

// Theme Preset Options
export const THEME_PRESET_OPTIONS = [
  {
    label: "Default",
    value: "default",
    primary: {
      light: "oklch(0.205 0 0)",
      dark: "oklch(0.922 0 0)",
    },
  },
  {
    label: "Red",
    value: "red",
    primary: {
      light: "oklch(0.6489 0.2370 26.9728)",
      dark: "oklch(0.7044 0.1872 23.1858)",
    },
  },
  {
    label: "Rose",
    value: "rose",
    primary: {
      light: "oklch(0.6789 0.1840 12.2891)",
      dark: "oklch(0.7244 0.1483 12.2891)",
    },
  },
  {
    label: "Orange",
    value: "orange",
    primary: {
      light: "oklch(0.6589 0.2070 45.3728)",
      dark: "oklch(0.7144 0.1672 45.3728)",
    },
  },
  {
    label: "Green",
    value: "green",
    primary: {
      light: "oklch(0.6189 0.1870 156.5728)",
      dark: "oklch(0.6844 0.1472 156.5728)",
    },
  },
  {
    label: "Blue",
    value: "blue",
    primary: {
      light: "oklch(0.5889 0.2170 245.8728)",
      dark: "oklch(0.6644 0.1772 245.8728)",
    },
  },
  {
    label: "Violet",
    value: "violet",
    primary: {
      light: "oklch(0.5989 0.2070 285.4728)",
      dark: "oklch(0.6744 0.1672 285.4728)",
    },
  },
  {
    label: "Teal",
    value: "teal",
    primary: {
      light: "oklch(0.6089 0.1970 186.2728)",
      dark: "oklch(0.6644 0.1572 186.2728)",
    },
  },
  {
    label: "Bronze",
    value: "bronze",
    primary: {
      light: "oklch(0.5789 0.1870 56.7728)",
      dark: "oklch(0.6444 0.1472 56.7728)",
    },
  },
] as const;

export const THEME_PRESET_VALUES = THEME_PRESET_OPTIONS.map((p) => p.value);

export type ThemePreset = (typeof THEME_PRESET_OPTIONS)[number]["value"];
