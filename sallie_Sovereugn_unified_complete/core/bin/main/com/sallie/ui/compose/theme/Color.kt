/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * Color - Color definitions for Sallie UI
 */

package com.sallie.ui.compose.theme

import androidx.compose.material3.ColorScheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.ui.graphics.Color

/**
 * Sallie's primary brand colors
 */
object SallieColors {
    // Primary brand color - purple representing loyalty, wisdom, and creativity
    val PrimaryPurple = Color(0xFF7E57C2)
    val PrimaryPurpleLight = Color(0xFFB085F5)
    val PrimaryPurpleDark = Color(0xFF4D2C91)
    
    // Secondary color - warm gold representing value, tradition, and warmth
    val SecondaryGold = Color(0xFFFFB74D)
    val SecondaryGoldLight = Color(0xFFFFE97D)
    val SecondaryGoldDark = Color(0xFFC88719)
    
    // Accent color - teal representing trust, calm, and stability
    val AccentTeal = Color(0xFF26A69A)
    val AccentTealLight = Color(0xFF64D8CB)
    val AccentTealDark = Color(0xFF00766C)
    
    // Neutral colors
    val Neutral50 = Color(0xFFFAFAFA)
    val Neutral100 = Color(0xFFF5F5F5)
    val Neutral200 = Color(0xFFEEEEEE)
    val Neutral300 = Color(0xFFE0E0E0)
    val Neutral400 = Color(0xFFBDBDBD)
    val Neutral500 = Color(0xFF9E9E9E)
    val Neutral600 = Color(0xFF757575)
    val Neutral700 = Color(0xFF616161)
    val Neutral800 = Color(0xFF424242)
    val Neutral900 = Color(0xFF212121)
    
    // Error and success colors
    val Error = Color(0xFFD32F2F)
    val ErrorLight = Color(0xFFEF5350)
    val ErrorDark = Color(0xFFB71C1C)
    
    val Success = Color(0xFF388E3C)
    val SuccessLight = Color(0xFF66BB6A)
    val SuccessDark = Color(0xFF1B5E20)
    
    val Warning = Color(0xFFF57C00)
    val WarningLight = Color(0xFFFFB74D)
    val WarningDark = Color(0xFFE65100)
    
    val Info = Color(0xFF1976D2)
    val InfoLight = Color(0xFF64B5F6)
    val InfoDark = Color(0xFF0D47A1)
}

/**
 * Light theme color scheme
 */
object LightColorSchemes {
    val DEFAULT = lightColorScheme(
        primary = SallieColors.PrimaryPurple,
        onPrimary = Color.White,
        primaryContainer = SallieColors.PrimaryPurpleLight,
        onPrimaryContainer = Color(0xFF21005E),
        
        secondary = SallieColors.SecondaryGold,
        onSecondary = Color(0xFF4A2800),
        secondaryContainer = SallieColors.SecondaryGoldLight,
        onSecondaryContainer = Color(0xFF3E2000),
        
        tertiary = SallieColors.AccentTeal,
        onTertiary = Color.White,
        tertiaryContainer = SallieColors.AccentTealLight,
        onTertiaryContainer = Color(0xFF002019),
        
        error = SallieColors.Error,
        onError = Color.White,
        errorContainer = Color(0xFFFFDAD6),
        onErrorContainer = Color(0xFF410002),
        
        background = SallieColors.Neutral50,
        onBackground = SallieColors.Neutral900,
        
        surface = SallieColors.Neutral50,
        onSurface = SallieColors.Neutral900,
        
        surfaceVariant = SallieColors.Neutral100,
        onSurfaceVariant = SallieColors.Neutral700,
        
        outline = SallieColors.Neutral500
    )
    
    val WARM = lightColorScheme(
        primary = Color(0xFFB5621B),
        onPrimary = Color.White,
        primaryContainer = Color(0xFFFFDBC8),
        onPrimaryContainer = Color(0xFF3A1800),
        
        secondary = Color(0xFF775A00),
        onSecondary = Color.White,
        secondaryContainer = Color(0xFFFFDF8C),
        onSecondaryContainer = Color(0xFF261A00),
        
        tertiary = Color(0xFF7C5635),
        onTertiary = Color.White,
        tertiaryContainer = Color(0xFFFEDDC3),
        onTertiaryContainer = Color(0xFF2E1500),
        
        error = SallieColors.Error,
        onError = Color.White,
        errorContainer = Color(0xFFFFDAD6),
        onErrorContainer = Color(0xFF410002),
        
        background = Color(0xFFFFFBFF),
        onBackground = Color(0xFF201A17),
        
        surface = Color(0xFFFFFBFF),
        onSurface = Color(0xFF201A17),
        
        surfaceVariant = Color(0xFFF4DED3),
        onSurfaceVariant = Color(0xFF53443D),
        
        outline = Color(0xFF85736B)
    )
    
    val COOL = lightColorScheme(
        primary = Color(0xFF006493),
        onPrimary = Color.White,
        primaryContainer = Color(0xFFCDE5FF),
        onPrimaryContainer = Color(0xFF001E30),
        
        secondary = Color(0xFF4C626F),
        onSecondary = Color.White,
        secondaryContainer = Color(0xFFCFE6F6),
        onSecondaryContainer = Color(0xFF071E2A),
        
        tertiary = Color(0xFF5E5C7F),
        onTertiary = Color.White,
        tertiaryContainer = Color(0xFFE4DFFF),
        onTertiaryContainer = Color(0xFF1A1938),
        
        error = SallieColors.Error,
        onError = Color.White,
        errorContainer = Color(0xFFFFDAD6),
        onErrorContainer = Color(0xFF410002),
        
        background = Color(0xFFFCFCFF),
        onBackground = Color(0xFF191C1E),
        
        surface = Color(0xFFFCFCFF),
        onSurface = Color(0xFF191C1E),
        
        surfaceVariant = Color(0xFFDEE3EB),
        onSurfaceVariant = Color(0xFF42474E),
        
        outline = Color(0xFF72777F)
    )
    
    /**
     * Get the color scheme based on persona type
     */
    fun getScheme(personaType: PersonaType): ColorScheme {
        return when (personaType) {
            PersonaType.DEFAULT -> DEFAULT
            PersonaType.WARM -> WARM
            PersonaType.COOL -> COOL
        }
    }
}

/**
 * Dark theme color scheme
 */
object DarkColorSchemes {
    val DEFAULT = darkColorScheme(
        primary = SallieColors.PrimaryPurpleLight,
        onPrimary = Color(0xFF371E73),
        primaryContainer = SallieColors.PrimaryPurple,
        onPrimaryContainer = Color(0xFFE9DDFF),
        
        secondary = SallieColors.SecondaryGoldLight,
        onSecondary = Color(0xFF432B00),
        secondaryContainer = SallieColors.SecondaryGold,
        onSecondaryContainer = Color(0xFFFFDEAC),
        
        tertiary = SallieColors.AccentTealLight,
        onTertiary = Color(0xFF003731),
        tertiaryContainer = SallieColors.AccentTeal,
        onTertiaryContainer = Color(0xFFB3EBE3),
        
        error = SallieColors.ErrorLight,
        onError = Color(0xFF690005),
        errorContainer = SallieColors.Error,
        onErrorContainer = Color(0xFFFFDAD6),
        
        background = Color(0xFF1A1A1A),
        onBackground = Color.White,
        
        surface = Color(0xFF1A1A1A),
        onSurface = Color.White,
        
        surfaceVariant = Color(0xFF2E2E2E),
        onSurfaceVariant = SallieColors.Neutral300,
        
        outline = SallieColors.Neutral500
    )
    
    val WARM = darkColorScheme(
        primary = Color(0xFFFFB68C),
        onPrimary = Color(0xFF5D2900),
        primaryContainer = Color(0xFF823E00),
        onPrimaryContainer = Color(0xFFFFDBCA),
        
        secondary = Color(0xFFF0C13B),
        onSecondary = Color(0xFF3F2E00),
        secondaryContainer = Color(0xFF5A4300),
        onSecondaryContainer = Color(0xFFFFDF8C),
        
        tertiary = Color(0xFFE2BF95),
        onTertiary = Color(0xFF452A09),
        tertiaryContainer = Color(0xFF603F1F),
        onTertiaryContainer = Color(0xFFFEDDC3),
        
        error = SallieColors.ErrorLight,
        onError = Color(0xFF690005),
        errorContainer = SallieColors.Error,
        onErrorContainer = Color(0xFFFFDAD6),
        
        background = Color(0xFF201A17),
        onBackground = Color(0xFFECE0DA),
        
        surface = Color(0xFF201A17),
        onSurface = Color(0xFFECE0DA),
        
        surfaceVariant = Color(0xFF53443D),
        onSurfaceVariant = Color(0xFFD6C3BB),
        
        outline = Color(0xFF9F8D85)
    )
    
    val COOL = darkColorScheme(
        primary = Color(0xFF94CCFF),
        onPrimary = Color(0xFF003354),
        primaryContainer = Color(0xFF004A76),
        onPrimaryContainer = Color(0xFFCDE5FF),
        
        secondary = Color(0xFFB3CAD9),
        onSecondary = Color(0xFF1F333F),
        secondaryContainer = Color(0xFF364954),
        onSecondaryContainer = Color(0xFFCFE6F6),
        
        tertiary = Color(0xFFC8C2EA),
        onTertiary = Color(0xFF302F4E),
        tertiaryContainer = Color(0xFF464466),
        onTertiaryContainer = Color(0xFFE4DFFF),
        
        error = SallieColors.ErrorLight,
        onError = Color(0xFF690005),
        errorContainer = SallieColors.Error,
        onErrorContainer = Color(0xFFFFDAD6),
        
        background = Color(0xFF191C1E),
        onBackground = Color(0xFFE2E2E6),
        
        surface = Color(0xFF191C1E),
        onSurface = Color(0xFFE2E2E6),
        
        surfaceVariant = Color(0xFF42474E),
        onSurfaceVariant = Color(0xFFC2C7CF),
        
        outline = Color(0xFF8C9199)
    )
    
    /**
     * Get the color scheme based on persona type
     */
    fun getScheme(personaType: PersonaType): ColorScheme {
        return when (personaType) {
            PersonaType.DEFAULT -> DEFAULT
            PersonaType.WARM -> WARM
            PersonaType.COOL -> COOL
        }
    }
}
