/**
 * ╭──────────────────────────────────────────────────────────────────────────────╮
 * │                                                                              │
 * │   Sallie's Beautiful Image Collection                                        │
 * │   "Every image tells a story of magic and connection, love"                  │
 * │                                                                              │
 * ╰──────────────────────────────────────────────────────────────────────────────╯
 */

// For React Native/Expo apps, we'll use the images from the attached_assets directory
// These can be imported directly in components when needed

export const SallieImages = {
  // Main App Icons
  icons: {
    mainAppIcon: require('@/attached_assets/generated_images/Refined_mystical_app_icon_88515a58.png'),
    chatBubbleAvatar: require('@/attached_assets/generated_images/Enhanced_mystical_chat_avatar_d6cf72c0.png'),
    brandLogo: require('@/attached_assets/generated_images/Sallie_brand_text_logo_fdc184fd.png'),
  },
  
  // Avatar Expressions
  avatars: {
    expressions: require('@/attached_assets/generated_images/Polished_mystical_expressions_873c6818.png'),
    originalExpressions: require('@/attached_assets/generated_images/Sallie_avatar_expressions_5ff8440b.png'),
  },
  
  // UI Elements and Decorations
  ui: {
    moodIcons: require('@/attached_assets/generated_images/Sallie_UI_mood_icons_918bcfc8.png'),
    decorations: require('@/attached_assets/generated_images/UI_decoration_elements_cb210ac6.png'),
    loadingGraphics: require('@/attached_assets/generated_images/Loading_screen_graphics_4dff68f8.png'),
    splashScreen: require('@/attached_assets/generated_images/App_splash_screen_2cbbf02b.png'),
  },
  
  // Backgrounds
  backgrounds: {
    mysticalPattern: require('@/attached_assets/generated_images/Mystical_background_pattern_ea581f26.png'),
  },
  
  // Themes
  themes: {
    previewCards: require('@/attached_assets/generated_images/Theme_preview_cards_e842a197.png'),
  },
  
  // Achievements
  achievements: {
    badges: require('@/attached_assets/generated_images/Achievement_badges_collection_758fc471.png'),
  },
  
  // Onboarding
  onboarding: {
    welcome: require('@/attached_assets/generated_images/Onboarding_welcome_graphics_8b1d248e.png'),
  },
  
} as const;

// Helper function to get images by category
export const getSallieImage = (category: keyof typeof SallieImages, key: string) => {
  const categoryImages = SallieImages[category] as any;
  return categoryImages[key] || null;
};

// Mood-based avatar mapping
export const getSallieAvatarForMood = (mood: string) => {
  // For now, we'll use the main expressions image
  // In a full implementation, you could extract individual expressions
  return SallieImages.avatars.expressions;
};

// Theme preview mapping
export const getThemePreview = (themeName: string) => {
  return SallieImages.themes.previewCards;
};