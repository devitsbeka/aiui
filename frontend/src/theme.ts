/**
 * A2UI Theme Configuration
 */

export interface Theme {
  colors: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    background: string;
    surface: string;
    surfaceVariant: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
  fonts: {
    primary: string;
    mono: string;
  };
}

export const lightTheme: Theme = {
  colors: {
    primary: '#5154b3',
    primaryLight: '#8487ea',
    primaryDark: '#383b99',
    background: '#f8faff',
    surface: '#ffffff',
    surfaceVariant: '#f2efff',
    text: '#1b1b1b',
    textSecondary: '#5e5e5e',
    border: '#e2e2e2',
    error: '#ba1a1a',
    success: '#2e7d32',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
  fonts: {
    primary: '"Outfit", "Helvetica Neue", Helvetica, Arial, sans-serif',
    mono: '"SF Mono", "Consolas", monospace',
  },
};

export const darkTheme: Theme = {
  colors: {
    primary: '#a0a3ff',
    primaryLight: '#c0c1ff',
    primaryDark: '#8487ea',
    background: '#0f0d1f',
    surface: '#1a1333',
    surfaceVariant: '#252040',
    text: '#f1f1f1',
    textSecondary: '#ababab',
    border: '#3b3b3b',
    error: '#ffb4ab',
    success: '#81c784',
  },
  spacing: lightTheme.spacing,
  borderRadius: lightTheme.borderRadius,
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.2)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
  },
  fonts: lightTheme.fonts,
};

