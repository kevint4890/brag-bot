// Theme constants for consistent styling across the app
export const colors = {
  primary: {
    main: '#3b82f6',
    dark: '#1d4ed8',
    darker: '#1e40af',
    light: '#93c5fd',
    lighter: '#dbeafe',
  },
  secondary: {
    main: '#fbbf24',
    dark: '#d97706',
    light: '#fde68a',
  },
  success: {
    main: '#10b981',
    dark: '#059669',
    darker: '#047857',
  },
  error: {
    main: '#ef4444',
    dark: '#dc2626',
  },
  warning: {
    main: '#f59e0b',
    dark: '#d97706',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  white: '#ffffff',
  black: '#000000',
};

export const gradients = {
  primary: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  primaryReverse: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
  background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #60a5fa 100%)',
  success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  successReverse: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
  warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  chatBubble: 'linear-gradient(to bottom, #eff6ff, #ffffff)',
  glass: 'rgba(255, 255, 255, 0.95)',
  glassHover: 'rgba(255, 255, 255, 0.98)',
};

export const shadows = {
  sm: '0 2px 8px rgba(59, 130, 246, 0.3)',
  md: '0 4px 12px rgba(59, 130, 246, 0.3)',
  lg: '0 8px 24px rgba(59, 130, 246, 0.25)',
  xl: '0 12px 40px rgba(59, 130, 246, 0.15)',
  glass: `
    0 8px 32px rgba(0, 0, 0, 0.15),
    0 1px 0 rgba(255, 255, 255, 0.9) inset,
    0 -1px 0 rgba(255, 255, 255, 0.3) inset,
    0 0 0 1px rgba(255, 255, 255, 0.1) inset
  `,
};

export const borderRadius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  xxl: '24px',
  full: '50%',
};

export const animations = {
  float: {
    name: 'float',
    keyframes: {
      '0%, 100%': { transform: 'translateY(0px)' },
      '50%': { transform: 'translateY(-10px)' },
    },
    duration: '6s ease-in-out infinite',
  },
  fadeInUp: {
    name: 'fadeInUp',
    keyframes: {
      '0%': { transform: 'translateY(30px)', opacity: 0 },
      '100%': { transform: 'translateY(0)', opacity: 1 },
    },
    duration: '0.8s ease-out',
  },
  messageSlide: {
    name: 'messageSlide',
    keyframes: {
      '0%': { transform: 'translateY(20px)', opacity: 0 },
      '100%': { transform: 'translateY(0)', opacity: 1 },
    },
    duration: '0.5s ease-out',
  },
};

export const transitions = {
  default: 'all 0.3s ease',
  smooth: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};
