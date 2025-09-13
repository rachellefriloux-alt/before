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
  // Main App Icons - Perfect Blend of Mystical + Authentic
  icons: {
    // Using direct paths for React Native compatibility
    mainAppIcon: '✨', // Placeholder emoji until image loading is fixed
    chatBubbleAvatar: '✨', // Placeholder emoji until image loading is fixed
    brandLogo: 'Sallie Sovereign', // Text fallback
    // Alternative versions (commented out to prevent loading issues)
    // authenticIcon: require('@/attached_assets/generated_images/Authentic_mystical_app_icon_c9db53e1.png'),
    // sigilAvatar: require('@/attached_assets/generated_images/Sophisticated_chat_avatar_sigil_54e13f0d.png'),
  },
  
  // Avatar Expressions - Refined Mystical Character  
  avatars: {
    expressions: '✨', // Placeholder emoji until image loading is fixed
    // polishedExpressions: require('@/attached_assets/generated_images/Polished_mystical_expressions_873c6818.png'),
    // originalExpressions: require('@/attached_assets/generated_images/Sallie_avatar_expressions_5ff8440b.png'),
  },
  
  // UI Elements and Decorations
  ui: {
    moodIcons: '🎭', // Placeholder emoji until image loading is fixed
    decorations: '✨', // Placeholder emoji until image loading is fixed
    loadingGraphics: '⏳', // Placeholder emoji until image loading is fixed
    splashScreen: '🌟', // Placeholder emoji until image loading is fixed
  },
  
  // Backgrounds - Sophisticated Mystical Textures
  backgrounds: {
    mysticalPattern: 'transparent', // Fallback to transparent background
    // textilePattern: require('@/attached_assets/generated_images/Authentic_textile_background_00e945de.png'),
    // originalPattern: require('@/attached_assets/generated_images/Mystical_background_pattern_ea581f26.png'),
  },
  
  // Themes
  themes: {
    previewCards: '🎨', // Placeholder emoji until image loading is fixed
  },
  
  // Achievements - Authentic Medallions
  achievements: {
    badges: '🏆', // Placeholder emoji until image loading is fixed
    // originalBadges: require('@/attached_assets/generated_images/Achievement_badges_collection_758fc471.png'),
  },
  
  // Onboarding
  onboarding: {
    welcome: '👋', // Placeholder emoji until image loading is fixed
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