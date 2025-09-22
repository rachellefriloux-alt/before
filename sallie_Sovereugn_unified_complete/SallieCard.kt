/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * SallieCard - Card components for Sallie UI
 */

package com.sallie.ui.compose.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedCard
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.unit.dp
import com.sallie.ui.compose.theme.AnimationSpeed
import com.sallie.ui.compose.theme.EmotionalState
import com.sallie.ui.compose.theme.LocalAnimationSpeed
import com.sallie.ui.compose.theme.LocalEmotionalPalette
import com.sallie.ui.compose.theme.SallieDimensions

/**
 * Standard card component styled according to Sallie's design system
 * Subtly responds to emotional state with color accents
 * 
 * @param modifier Modifier for the card
 * @param emotionalState Optional emotional state override
 * @param content Card content
 */
@Composable
fun SallieCard(
    modifier: Modifier = Modifier,
    emotionalState: EmotionalState? = null,
    content: @Composable () -> Unit
) {
    val emotionalPalette = LocalEmotionalPalette.current
    val animationSpeed = LocalAnimationSpeed.current
    val currentEmotionalState = emotionalState ?: EmotionalState.Neutral
    
    // Calculate animation duration based on speed setting
    val animationDuration = remember(animationSpeed) {
        when (animationSpeed) {
            AnimationSpeed.NORMAL -> 300
            AnimationSpeed.SLOW -> 500
            AnimationSpeed.FAST -> 150
            AnimationSpeed.NONE -> 0
        }
    }
    
    // Color animation for emotional state
    val containerColor by animateColorAsState(
        targetValue = MaterialTheme.colorScheme.surface,
        animationSpec = tween(durationMillis = animationDuration),
        label = "CardColor"
    )
    
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(
            containerColor = containerColor
        ),
        shape = MaterialTheme.shapes.medium
    ) {
        // Subtle accent bar on top reflecting emotional state
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    brush = Brush.horizontalGradient(
                        colors = listOf(
                            emotionalPalette.primary,
                            emotionalPalette.accent
                        )
                    )
                )
                .padding(2.dp)
        ) {}
        
        // Card content
        Box(modifier = Modifier.padding(SallieDimensions.spacing_16)) {
            content()
        }
    }
}

/**
 * Elevated card component with shadow
 * 
 * @param modifier Modifier for the card
 * @param emotionalState Optional emotional state override
 * @param content Card content
 */
@Composable
fun SallieElevatedCard(
    modifier: Modifier = Modifier,
    emotionalState: EmotionalState? = null,
    content: @Composable () -> Unit
) {
    val emotionalPalette = LocalEmotionalPalette.current
    val animationSpeed = LocalAnimationSpeed.current
    val currentEmotionalState = emotionalState ?: EmotionalState.Neutral
    
    // Calculate animation duration based on speed setting
    val animationDuration = remember(animationSpeed) {
        when (animationSpeed) {
            AnimationSpeed.NORMAL -> 300
            AnimationSpeed.SLOW -> 500
            AnimationSpeed.FAST -> 150
            AnimationSpeed.NONE -> 0
        }
    }
    
    // Elevation animation based on emotional state
    val elevation by animateFloatAsState(
        targetValue = when(currentEmotionalState) {
            EmotionalState.Excited -> 8f
            EmotionalState.Happy -> 6f 
            EmotionalState.Neutral -> 4f
            EmotionalState.Calm -> 2f
            EmotionalState.Concerned -> 3f
            EmotionalState.Focused -> 5f
        },
        animationSpec = tween(durationMillis = animationDuration),
        label = "CardElevation"
    )
    
    ElevatedCard(
        modifier = modifier,
        colors = CardDefaults.elevatedCardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.elevatedCardElevation(
            defaultElevation = elevation.dp
        ),
        shape = MaterialTheme.shapes.medium
    ) {
        // Subtle accent bar on top reflecting emotional state
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    brush = Brush.horizontalGradient(
                        colors = listOf(
                            emotionalPalette.primary,
                            emotionalPalette.accent
                        )
                    )
                )
                .padding(2.dp)
        ) {}
        
        // Card content
        Box(modifier = Modifier.padding(SallieDimensions.spacing_16)) {
            content()
        }
    }
}

/**
 * Outlined card component with border
 * 
 * @param modifier Modifier for the card
 * @param emotionalState Optional emotional state override
 * @param content Card content
 */
@Composable
fun SallieOutlinedCard(
    modifier: Modifier = Modifier,
    emotionalState: EmotionalState? = null,
    content: @Composable () -> Unit
) {
    val emotionalPalette = LocalEmotionalPalette.current
    val animationSpeed = LocalAnimationSpeed.current
    val currentEmotionalState = emotionalState ?: EmotionalState.Neutral
    
    // Calculate animation duration based on speed setting
    val animationDuration = remember(animationSpeed) {
        when (animationSpeed) {
            AnimationSpeed.NORMAL -> 300
            AnimationSpeed.SLOW -> 500
            AnimationSpeed.FAST -> 150
            AnimationSpeed.NONE -> 0
        }
    }
    
    // Border color based on emotional state
    val borderColor by animateColorAsState(
        targetValue = emotionalPalette.primary.copy(alpha = 0.6f),
        animationSpec = tween(durationMillis = animationDuration),
        label = "BorderColor"
    )
    
    OutlinedCard(
        modifier = modifier,
        colors = CardDefaults.outlinedCardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        border = BorderStroke(1.dp, borderColor),
        shape = MaterialTheme.shapes.medium
    ) {
        // Card content
        Box(modifier = Modifier.padding(SallieDimensions.spacing_16)) {
            content()
        }
    }
}

/**
 * Interactive card component that can be clicked
 * 
 * @param onClick Click handler
 * @param modifier Modifier for the card
 * @param emotionalState Optional emotional state override
 * @param content Card content
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SallieClickableCard(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    emotionalState: EmotionalState? = null,
    content: @Composable () -> Unit
) {
    val emotionalPalette = LocalEmotionalPalette.current
    val animationSpeed = LocalAnimationSpeed.current
    val currentEmotionalState = emotionalState ?: EmotionalState.Neutral
    
    // Calculate animation duration based on speed setting
    val animationDuration = remember(animationSpeed) {
        when (animationSpeed) {
            AnimationSpeed.NORMAL -> 300
            AnimationSpeed.SLOW -> 500
            AnimationSpeed.FAST -> 150
            AnimationSpeed.NONE -> 0
        }
    }
    
    // Color animation for emotional state
    val containerColor by animateColorAsState(
        targetValue = MaterialTheme.colorScheme.surface,
        animationSpec = tween(durationMillis = animationDuration),
        label = "CardColor"
    )
    
    // Elevation animation based on emotional state
    val elevation by animateFloatAsState(
        targetValue = when(currentEmotionalState) {
            EmotionalState.Excited -> 8f
            EmotionalState.Happy -> 6f 
            EmotionalState.Neutral -> 4f
            EmotionalState.Calm -> 2f
            EmotionalState.Concerned -> 3f
            EmotionalState.Focused -> 5f
        },
        animationSpec = tween(durationMillis = animationDuration),
        label = "CardElevation"
    )
    
    Card(
        onClick = onClick,
        modifier = modifier,
        colors = CardDefaults.cardColors(
            containerColor = containerColor
        ),
        elevation = CardDefaults.cardElevation(
            defaultElevation = elevation.dp,
            pressedElevation = (elevation + 2).dp,
            hoveredElevation = (elevation + 4).dp
        ),
        shape = MaterialTheme.shapes.medium
    ) {
        // Subtle accent bar on top reflecting emotional state
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    brush = Brush.horizontalGradient(
                        colors = listOf(
                            emotionalPalette.primary,
                            emotionalPalette.accent
                        )
                    )
                )
                .padding(2.dp)
        ) {}
        
        // Card content
        Box(modifier = Modifier.padding(SallieDimensions.spacing_16)) {
            content()
        }
    }
}

/**
 * Accent card with background color based on emotional state
 * 
 * @param modifier Modifier for the card
 * @param emotionalState Optional emotional state override
 * @param content Card content
 */
@Composable
fun SallieAccentCard(
    modifier: Modifier = Modifier,
    emotionalState: EmotionalState? = null,
    content: @Composable () -> Unit
) {
    val emotionalPalette = LocalEmotionalPalette.current
    val animationSpeed = LocalAnimationSpeed.current
    val currentEmotionalState = emotionalState ?: EmotionalState.Neutral
    
    // Calculate animation duration based on speed setting
    val animationDuration = remember(animationSpeed) {
        when (animationSpeed) {
            AnimationSpeed.NORMAL -> 300
            AnimationSpeed.SLOW -> 500
            AnimationSpeed.FAST -> 150
            AnimationSpeed.NONE -> 0
        }
    }
    
    // Color animation for emotional state
    val containerColor by animateColorAsState(
        targetValue = emotionalPalette.primary.copy(alpha = 0.1f),
        animationSpec = tween(durationMillis = animationDuration),
        label = "CardColor"
    )
    
    val borderColor by animateColorAsState(
        targetValue = emotionalPalette.primary.copy(alpha = 0.3f),
        animationSpec = tween(durationMillis = animationDuration),
        label = "BorderColor"
    )
    
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(
            containerColor = containerColor
        ),
        border = BorderStroke(1.dp, borderColor),
        shape = MaterialTheme.shapes.medium
    ) {
        // Card content
        Box(modifier = Modifier.padding(SallieDimensions.spacing_16)) {
            content()
        }
    }
}


/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * SallieCard - Card components for Sallie UI
 */

package com.sallie.ui.compose.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedCard
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.unit.dp
import com.sallie.ui.compose.theme.AnimationSpeed
import com.sallie.ui.compose.theme.EmotionalState
import com.sallie.ui.compose.theme.LocalAnimationSpeed
import com.sallie.ui.compose.theme.LocalEmotionalPalette
import com.sallie.ui.compose.theme.SallieDimensions

/**
 * Standard card component styled according to Sallie's design system
 * Subtly responds to emotional state with color accents
 * 
 * @param modifier Modifier for the card
 * @param emotionalState Optional emotional state override
 * @param content Card content
 */
@Composable
fun SallieCard(
    modifier: Modifier = Modifier,
    emotionalState: EmotionalState? = null,
    content: @Composable () -> Unit
) {
    val emotionalPalette = LocalEmotionalPalette.current
    val animationSpeed = LocalAnimationSpeed.current
    val currentEmotionalState = emotionalState ?: EmotionalState.Neutral
    
    // Calculate animation duration based on speed setting
    val animationDuration = remember(animationSpeed) {
        when (animationSpeed) {
            AnimationSpeed.NORMAL -> 300
            AnimationSpeed.SLOW -> 500
            AnimationSpeed.FAST -> 150
            AnimationSpeed.NONE -> 0
        }
    }
    
    // Color animation for emotional state
    val containerColor by animateColorAsState(
        targetValue = MaterialTheme.colorScheme.surface,
        animationSpec = tween(durationMillis = animationDuration),
        label = "CardColor"
    )
    
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(
            containerColor = containerColor
        ),
        shape = MaterialTheme.shapes.medium
    ) {
        // Subtle accent bar on top reflecting emotional state
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    brush = Brush.horizontalGradient(
                        colors = listOf(
                            emotionalPalette.primary,
                            emotionalPalette.accent
                        )
                    )
                )
                .padding(2.dp)
        ) {}
        
        // Card content
        Box(modifier = Modifier.padding(SallieDimensions.spacing_16)) {
            content()
        }
    }
}

/**
 * Elevated card component with shadow
 * 
 * @param modifier Modifier for the card
 * @param emotionalState Optional emotional state override
 * @param content Card content
 */
@Composable
fun SallieElevatedCard(
    modifier: Modifier = Modifier,
    emotionalState: EmotionalState? = null,
    content: @Composable () -> Unit
) {
    val emotionalPalette = LocalEmotionalPalette.current
    val animationSpeed = LocalAnimationSpeed.current
    val currentEmotionalState = emotionalState ?: EmotionalState.Neutral
    
    // Calculate animation duration based on speed setting
    val animationDuration = remember(animationSpeed) {
        when (animationSpeed) {
            AnimationSpeed.NORMAL -> 300
            AnimationSpeed.SLOW -> 500
            AnimationSpeed.FAST -> 150
            AnimationSpeed.NONE -> 0
        }
    }
    
    // Elevation animation based on emotional state
    val elevation by animateFloatAsState(
        targetValue = when(currentEmotionalState) {
            EmotionalState.Excited -> 8f
            EmotionalState.Happy -> 6f 
            EmotionalState.Neutral -> 4f
            EmotionalState.Calm -> 2f
            EmotionalState.Concerned -> 3f
            EmotionalState.Focused -> 5f
        },
        animationSpec = tween(durationMillis = animationDuration),
        label = "CardElevation"
    )
    
    ElevatedCard(
        modifier = modifier,
        colors = CardDefaults.elevatedCardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.elevatedCardElevation(
            defaultElevation = elevation.dp
        ),
        shape = MaterialTheme.shapes.medium
    ) {
        // Subtle accent bar on top reflecting emotional state
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    brush = Brush.horizontalGradient(
                        colors = listOf(
                            emotionalPalette.primary,
                            emotionalPalette.accent
                        )
                    )
                )
                .padding(2.dp)
        ) {}
        
        // Card content
        Box(modifier = Modifier.padding(SallieDimensions.spacing_16)) {
            content()
        }
    }
}

/**
 * Outlined card component with border
 * 
 * @param modifier Modifier for the card
 * @param emotionalState Optional emotional state override
 * @param content Card content
 */
@Composable
fun SallieOutlinedCard(
    modifier: Modifier = Modifier,
    emotionalState: EmotionalState? = null,
    content: @Composable () -> Unit
) {
    val emotionalPalette = LocalEmotionalPalette.current
    val animationSpeed = LocalAnimationSpeed.current
    val currentEmotionalState = emotionalState ?: EmotionalState.Neutral
    
    // Calculate animation duration based on speed setting
    val animationDuration = remember(animationSpeed) {
        when (animationSpeed) {
            AnimationSpeed.NORMAL -> 300
            AnimationSpeed.SLOW -> 500
            AnimationSpeed.FAST -> 150
            AnimationSpeed.NONE -> 0
        }
    }
    
    // Border color based on emotional state
    val borderColor by animateColorAsState(
        targetValue = emotionalPalette.primary.copy(alpha = 0.6f),
        animationSpec = tween(durationMillis = animationDuration),
        label = "BorderColor"
    )
    
    OutlinedCard(
        modifier = modifier,
        colors = CardDefaults.outlinedCardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        border = BorderStroke(1.dp, borderColor),
        shape = MaterialTheme.shapes.medium
    ) {
        // Card content
        Box(modifier = Modifier.padding(SallieDimensions.spacing_16)) {
            content()
        }
    }
}

/**
 * Interactive card component that can be clicked
 * 
 * @param onClick Click handler
 * @param modifier Modifier for the card
 * @param emotionalState Optional emotional state override
 * @param content Card content
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SallieClickableCard(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    emotionalState: EmotionalState? = null,
    content: @Composable () -> Unit
) {
    val emotionalPalette = LocalEmotionalPalette.current
    val animationSpeed = LocalAnimationSpeed.current
    val currentEmotionalState = emotionalState ?: EmotionalState.Neutral
    
    // Calculate animation duration based on speed setting
    val animationDuration = remember(animationSpeed) {
        when (animationSpeed) {
            AnimationSpeed.NORMAL -> 300
            AnimationSpeed.SLOW -> 500
            AnimationSpeed.FAST -> 150
            AnimationSpeed.NONE -> 0
        }
    }
    
    // Color animation for emotional state
    val containerColor by animateColorAsState(
        targetValue = MaterialTheme.colorScheme.surface,
        animationSpec = tween(durationMillis = animationDuration),
        label = "CardColor"
    )
    
    // Elevation animation based on emotional state
    val elevation by animateFloatAsState(
        targetValue = when(currentEmotionalState) {
            EmotionalState.Excited -> 8f
            EmotionalState.Happy -> 6f 
            EmotionalState.Neutral -> 4f
            EmotionalState.Calm -> 2f
            EmotionalState.Concerned -> 3f
            EmotionalState.Focused -> 5f
        },
        animationSpec = tween(durationMillis = animationDuration),
        label = "CardElevation"
    )
    
    Card(
        onClick = onClick,
        modifier = modifier,
        colors = CardDefaults.cardColors(
            containerColor = containerColor
        ),
        elevation = CardDefaults.cardElevation(
            defaultElevation = elevation.dp,
            pressedElevation = (elevation + 2).dp,
            hoveredElevation = (elevation + 4).dp
        ),
        shape = MaterialTheme.shapes.medium
    ) {
        // Subtle accent bar on top reflecting emotional state
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    brush = Brush.horizontalGradient(
                        colors = listOf(
                            emotionalPalette.primary,
                            emotionalPalette.accent
                        )
                    )
                )
                .padding(2.dp)
        ) {}
        
        // Card content
        Box(modifier = Modifier.padding(SallieDimensions.spacing_16)) {
            content()
        }
    }
}

/**
 * Accent card with background color based on emotional state
 * 
 * @param modifier Modifier for the card
 * @param emotionalState Optional emotional state override
 * @param content Card content
 */
@Composable
fun SallieAccentCard(
    modifier: Modifier = Modifier,
    emotionalState: EmotionalState? = null,
    content: @Composable () -> Unit
) {
    val emotionalPalette = LocalEmotionalPalette.current
    val animationSpeed = LocalAnimationSpeed.current
    val currentEmotionalState = emotionalState ?: EmotionalState.Neutral
    
    // Calculate animation duration based on speed setting
    val animationDuration = remember(animationSpeed) {
        when (animationSpeed) {
            AnimationSpeed.NORMAL -> 300
            AnimationSpeed.SLOW -> 500
            AnimationSpeed.FAST -> 150
            AnimationSpeed.NONE -> 0
        }
    }
    
    // Color animation for emotional state
    val containerColor by animateColorAsState(
        targetValue = emotionalPalette.primary.copy(alpha = 0.1f),
        animationSpec = tween(durationMillis = animationDuration),
        label = "CardColor"
    )
    
    val borderColor by animateColorAsState(
        targetValue = emotionalPalette.primary.copy(alpha = 0.3f),
        animationSpec = tween(durationMillis = animationDuration),
        label = "BorderColor"
    )
    
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(
            containerColor = containerColor
        ),
        border = BorderStroke(1.dp, borderColor),
        shape = MaterialTheme.shapes.medium
    ) {
        // Card content
        Box(modifier = Modifier.padding(SallieDimensions.spacing_16)) {
            content()
        }
    }
}


package com.sallie.ui.components

import android.content.Context
import android.graphics.drawable.GradientDrawable
import android.util.AttributeSet
import android.view.View
import android.view.accessibility.AccessibilityNodeInfo
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.view.AccessibilityDelegateCompat
import androidx.core.view.ViewCompat
import androidx.core.view.accessibility.AccessibilityNodeInfoCompat
import com.sallie.ui.adaptation.UIAdaptationState

/**
 * Sallie's Adaptive Card
 * 
 * A container component that displays content in a card format with adaptive
 * styling based on theme, accessibility, device, and user context.
 */
class SallieCard @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : AdaptiveLayout(context, attrs, defStyleAttr) {

    // UI elements
    private var cardTitle: TextView? = null
    private var cardContent: LinearLayout? = null
    
    // Card properties
    private var cardElevation = 4f
    private var hasHeader = false
    
    init {
        // Inflate the card layout
        View.inflate(context, R.layout.sallie_card, this)
        
        // Get references to views
        cardTitle = findViewById(R.id.card_title)
        cardContent = findViewById(R.id.card_content)
        
        // Set default card properties
        clipToOutline = true
        
        // Parse attributes
        val typedArray = context.obtainStyledAttributes(
            attrs, R.styleable.SallieCard, defStyleAttr, 0
        )
        
        try {
            // Get card title
            val title = typedArray.getString(R.styleable.SallieCard_cardTitle)
            if (title != null) {
                setCardTitle(title)
            } else {
                cardTitle?.visibility = View.GONE
                hasHeader = false
            }
            
            // Get card elevation
            cardElevation = typedArray.getDimension(
                R.styleable.SallieCard_cardElevation,
                resources.getDimension(R.dimen.card_default_elevation)
            )
            elevation = cardElevation
        } finally {
            typedArray.recycle()
        }
        
        // Setup enhanced accessibility
        setupAccessibility()
    }
    
    /**
     * Set card title
     */
    fun setCardTitle(title: String) {
        cardTitle?.text = title
        cardTitle?.visibility = View.VISIBLE
        hasHeader = true
    }
    
    /**
     * Add content to the card
     */
    fun addContent(view: View) {
        cardContent?.addView(view)
    }
    
    /**
     * Remove all content from the card
     */
    fun clearContent() {
        cardContent?.removeAllViews()
    }
    
    /**
     * Apply theme adaptations
     */
    override fun applyTheme(state: UIAdaptationState) {
        super.applyTheme(state)
        
        val theme = state.themeConfig
        
        // Apply card styling
        val background = GradientDrawable().apply {
            shape = GradientDrawable.RECTANGLE
            cornerRadius = theme.cornerRadius.toFloat()
            setColor(if (theme.isDarkMode) darkenColor(theme.backgroundColor) else theme.backgroundColor)
        }
        this.background = background
        
        // Apply elevation based on theme
        elevation = theme.elevationLevel * resources.displayMetrics.density
        
        // Apply header styling if present
        if (hasHeader) {
            cardTitle?.setTextColor(theme.textColor)
        }
    }
    
    /**
     * Apply accessibility adaptations
     */
    override fun applyAccessibility(state: UIAdaptationState) {
        super.applyAccessibility(state)
        
        val accessibility = state.accessibilityConfig
        
        // Adjust text size for accessibility
        if (hasHeader) {
            cardTitle?.textSize = 18 * accessibility.fontScale
        }
        
        // Increase contrast if needed
        if (accessibility.contrastEnhanced) {
            if (hasHeader) {
                cardTitle?.setTextColor(enhanceContrast(state.themeConfig.textColor))
            }
        }
    }
    
    /**
     * Apply tablet-specific layout adaptations
     */
    override fun applyTabletLayout() {
        val horizontalPadding = (24 * resources.displayMetrics.density).toInt()
        val verticalPadding = (16 * resources.displayMetrics.density).toInt()
        
        cardContent?.setPadding(horizontalPadding, verticalPadding, horizontalPadding, verticalPadding)
        
        if (hasHeader) {
            val headerPadding = (24 * resources.displayMetrics.density).toInt()
            cardTitle?.setPadding(headerPadding, headerPadding, headerPadding, headerPadding / 2)
            cardTitle?.textSize = 20f
        }
    }
    
    /**
     * Apply phone-specific layout adaptations
     */
    override fun applyPhoneLayout() {
        val horizontalPadding = (16 * resources.displayMetrics.density).toInt()
        val verticalPadding = (12 * resources.displayMetrics.density).toInt()
        
        cardContent?.setPadding(horizontalPadding, verticalPadding, horizontalPadding, verticalPadding)
        
        if (hasHeader) {
            val headerPadding = (16 * resources.displayMetrics.density).toInt()
            cardTitle?.setPadding(headerPadding, headerPadding, headerPadding, headerPadding / 2)
            cardTitle?.textSize = 18f
        }
    }
    
    /**
     * Apply simplified layout for first-time users
     */
    override fun applySimplifiedLayout() {
        // Reduce visual complexity by simplifying the card
        val simpleBackground = GradientDrawable().apply {
            shape = GradientDrawable.RECTANGLE
            cornerRadius = 8f
            setColor(currentState.themeConfig.backgroundColor)
        }
        background = simpleBackground
        
        // Reduce elevation for simpler look
        elevation = 2 * resources.displayMetrics.density
        
        // Increase padding for better readability
        val padding = (16 * resources.displayMetrics.density).toInt()
        cardContent?.setPadding(padding, padding, padding, padding)
    }
    
    /**
     * Get default content description
     */
    override fun getDefaultContentDescription(): String {
        return if (hasHeader) {
            cardTitle?.text.toString() + " card"
        } else {
            "Information card"
        }
    }
    
    /**
     * Add custom accessibility actions
     */
    override fun addCustomAccessibilityActions(info: AccessibilityNodeInfo) {
        // Could add expand/collapse action if the card supports it
    }
    
    /**
     * Set up enhanced accessibility
     */
    private fun setupAccessibility() {
        // Set up accessibility delegate
        ViewCompat.setAccessibilityDelegate(this, object : AccessibilityDelegateCompat() {
            override fun onInitializeAccessibilityNodeInfo(
                host: View,
                info: AccessibilityNodeInfoCompat
            ) {
                super.onInitializeAccessibilityNodeInfo(host, info)
                
                // Mark this as a card
                info.roleDescription = "card"
                
                // Set the heading property for the title if present
                if (hasHeader) {
                    ViewCompat.setAccessibilityHeading(cardTitle!!, true)
                }
            }
        })
    }
}


/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * SallieCard - Card components for Sallie UI
 */

package com.sallie.ui.compose.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedCard
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.unit.dp
import com.sallie.ui.compose.theme.AnimationSpeed
import com.sallie.ui.compose.theme.EmotionalState
import com.sallie.ui.compose.theme.LocalAnimationSpeed
import com.sallie.ui.compose.theme.LocalEmotionalPalette
import com.sallie.ui.compose.theme.SallieDimensions

/**
 * Standard card component styled according to Sallie's design system
 * Subtly responds to emotional state with color accents
 * 
 * @param modifier Modifier for the card
 * @param emotionalState Optional emotional state override
 * @param content Card content
 */
@Composable
fun SallieCard(
    modifier: Modifier = Modifier,
    emotionalState: EmotionalState? = null,
    content: @Composable () -> Unit
) {
    val emotionalPalette = LocalEmotionalPalette.current
    val animationSpeed = LocalAnimationSpeed.current
    val currentEmotionalState = emotionalState ?: EmotionalState.Neutral
    
    // Calculate animation duration based on speed setting
    val animationDuration = remember(animationSpeed) {
        when (animationSpeed) {
            AnimationSpeed.NORMAL -> 300
            AnimationSpeed.SLOW -> 500
            AnimationSpeed.FAST -> 150
            AnimationSpeed.NONE -> 0
        }
    }
    
    // Color animation for emotional state
    val containerColor by animateColorAsState(
        targetValue = MaterialTheme.colorScheme.surface,
        animationSpec = tween(durationMillis = animationDuration),
        label = "CardColor"
    )
    
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(
            containerColor = containerColor
        ),
        shape = MaterialTheme.shapes.medium
    ) {
        // Subtle accent bar on top reflecting emotional state
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    brush = Brush.horizontalGradient(
                        colors = listOf(
                            emotionalPalette.primary,
                            emotionalPalette.accent
                        )
                    )
                )
                .padding(2.dp)
        ) {}
        
        // Card content
        Box(modifier = Modifier.padding(SallieDimensions.spacing_16)) {
            content()
        }
    }
}

/**
 * Elevated card component with shadow
 * 
 * @param modifier Modifier for the card
 * @param emotionalState Optional emotional state override
 * @param content Card content
 */
@Composable
fun SallieElevatedCard(
    modifier: Modifier = Modifier,
    emotionalState: EmotionalState? = null,
    content: @Composable () -> Unit
) {
    val emotionalPalette = LocalEmotionalPalette.current
    val animationSpeed = LocalAnimationSpeed.current
    val currentEmotionalState = emotionalState ?: EmotionalState.Neutral
    
    // Calculate animation duration based on speed setting
    val animationDuration = remember(animationSpeed) {
        when (animationSpeed) {
            AnimationSpeed.NORMAL -> 300
            AnimationSpeed.SLOW -> 500
            AnimationSpeed.FAST -> 150
            AnimationSpeed.NONE -> 0
        }
    }
    
    // Elevation animation based on emotional state
    val elevation by animateFloatAsState(
        targetValue = when(currentEmotionalState) {
            EmotionalState.Excited -> 8f
            EmotionalState.Happy -> 6f 
            EmotionalState.Neutral -> 4f
            EmotionalState.Calm -> 2f
            EmotionalState.Concerned -> 3f
            EmotionalState.Focused -> 5f
        },
        animationSpec = tween(durationMillis = animationDuration),
        label = "CardElevation"
    )
    
    ElevatedCard(
        modifier = modifier,
        colors = CardDefaults.elevatedCardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.elevatedCardElevation(
            defaultElevation = elevation.dp
        ),
        shape = MaterialTheme.shapes.medium
    ) {
        // Subtle accent bar on top reflecting emotional state
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    brush = Brush.horizontalGradient(
                        colors = listOf(
                            emotionalPalette.primary,
                            emotionalPalette.accent
                        )
                    )
                )
                .padding(2.dp)
        ) {}
        
        // Card content
        Box(modifier = Modifier.padding(SallieDimensions.spacing_16)) {
            content()
        }
    }
}

/**
 * Outlined card component with border
 * 
 * @param modifier Modifier for the card
 * @param emotionalState Optional emotional state override
 * @param content Card content
 */
@Composable
fun SallieOutlinedCard(
    modifier: Modifier = Modifier,
    emotionalState: EmotionalState? = null,
    content: @Composable () -> Unit
) {
    val emotionalPalette = LocalEmotionalPalette.current
    val animationSpeed = LocalAnimationSpeed.current
    val currentEmotionalState = emotionalState ?: EmotionalState.Neutral
    
    // Calculate animation duration based on speed setting
    val animationDuration = remember(animationSpeed) {
        when (animationSpeed) {
            AnimationSpeed.NORMAL -> 300
            AnimationSpeed.SLOW -> 500
            AnimationSpeed.FAST -> 150
            AnimationSpeed.NONE -> 0
        }
    }
    
    // Border color based on emotional state
    val borderColor by animateColorAsState(
        targetValue = emotionalPalette.primary.copy(alpha = 0.6f),
        animationSpec = tween(durationMillis = animationDuration),
        label = "BorderColor"
    )
    
    OutlinedCard(
        modifier = modifier,
        colors = CardDefaults.outlinedCardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        border = BorderStroke(1.dp, borderColor),
        shape = MaterialTheme.shapes.medium
    ) {
        // Card content
        Box(modifier = Modifier.padding(SallieDimensions.spacing_16)) {
            content()
        }
    }
}

/**
 * Interactive card component that can be clicked
 * 
 * @param onClick Click handler
 * @param modifier Modifier for the card
 * @param emotionalState Optional emotional state override
 * @param content Card content
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SallieClickableCard(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    emotionalState: EmotionalState? = null,
    content: @Composable () -> Unit
) {
    val emotionalPalette = LocalEmotionalPalette.current
    val animationSpeed = LocalAnimationSpeed.current
    val currentEmotionalState = emotionalState ?: EmotionalState.Neutral
    
    // Calculate animation duration based on speed setting
    val animationDuration = remember(animationSpeed) {
        when (animationSpeed) {
            AnimationSpeed.NORMAL -> 300
            AnimationSpeed.SLOW -> 500
            AnimationSpeed.FAST -> 150
            AnimationSpeed.NONE -> 0
        }
    }
    
    // Color animation for emotional state
    val containerColor by animateColorAsState(
        targetValue = MaterialTheme.colorScheme.surface,
        animationSpec = tween(durationMillis = animationDuration),
        label = "CardColor"
    )
    
    // Elevation animation based on emotional state
    val elevation by animateFloatAsState(
        targetValue = when(currentEmotionalState) {
            EmotionalState.Excited -> 8f
            EmotionalState.Happy -> 6f 
            EmotionalState.Neutral -> 4f
            EmotionalState.Calm -> 2f
            EmotionalState.Concerned -> 3f
            EmotionalState.Focused -> 5f
        },
        animationSpec = tween(durationMillis = animationDuration),
        label = "CardElevation"
    )
    
    Card(
        onClick = onClick,
        modifier = modifier,
        colors = CardDefaults.cardColors(
            containerColor = containerColor
        ),
        elevation = CardDefaults.cardElevation(
            defaultElevation = elevation.dp,
            pressedElevation = (elevation + 2).dp,
            hoveredElevation = (elevation + 4).dp
        ),
        shape = MaterialTheme.shapes.medium
    ) {
        // Subtle accent bar on top reflecting emotional state
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    brush = Brush.horizontalGradient(
                        colors = listOf(
                            emotionalPalette.primary,
                            emotionalPalette.accent
                        )
                    )
                )
                .padding(2.dp)
        ) {}
        
        // Card content
        Box(modifier = Modifier.padding(SallieDimensions.spacing_16)) {
            content()
        }
    }
}

/**
 * Accent card with background color based on emotional state
 * 
 * @param modifier Modifier for the card
 * @param emotionalState Optional emotional state override
 * @param content Card content
 */
@Composable
fun SallieAccentCard(
    modifier: Modifier = Modifier,
    emotionalState: EmotionalState? = null,
    content: @Composable () -> Unit
) {
    val emotionalPalette = LocalEmotionalPalette.current
    val animationSpeed = LocalAnimationSpeed.current
    val currentEmotionalState = emotionalState ?: EmotionalState.Neutral
    
    // Calculate animation duration based on speed setting
    val animationDuration = remember(animationSpeed) {
        when (animationSpeed) {
            AnimationSpeed.NORMAL -> 300
            AnimationSpeed.SLOW -> 500
            AnimationSpeed.FAST -> 150
            AnimationSpeed.NONE -> 0
        }
    }
    
    // Color animation for emotional state
    val containerColor by animateColorAsState(
        targetValue = emotionalPalette.primary.copy(alpha = 0.1f),
        animationSpec = tween(durationMillis = animationDuration),
        label = "CardColor"
    )
    
    val borderColor by animateColorAsState(
        targetValue = emotionalPalette.primary.copy(alpha = 0.3f),
        animationSpec = tween(durationMillis = animationDuration),
        label = "BorderColor"
    )
    
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(
            containerColor = containerColor
        ),
        border = BorderStroke(1.dp, borderColor),
        shape = MaterialTheme.shapes.medium
    ) {
        // Card content
        Box(modifier = Modifier.padding(SallieDimensions.spacing_16)) {
            content()
        }
    }
}


/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * SallieCard - Card components for Sallie UI
 */

package com.sallie.ui.compose.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedCard
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.unit.dp
import com.sallie.ui.compose.theme.AnimationSpeed
import com.sallie.ui.compose.theme.EmotionalState
import com.sallie.ui.compose.theme.LocalAnimationSpeed
import com.sallie.ui.compose.theme.LocalEmotionalPalette
import com.sallie.ui.compose.theme.SallieDimensions

/**
 * Standard card component styled according to Sallie's design system
 * Subtly responds to emotional state with color accents
 * 
 * @param modifier Modifier for the card
 * @param emotionalState Optional emotional state override
 * @param content Card content
 */
@Composable
fun SallieCard(
    modifier: Modifier = Modifier,
    emotionalState: EmotionalState? = null,
    content: @Composable () -> Unit
) {
    val emotionalPalette = LocalEmotionalPalette.current
    val animationSpeed = LocalAnimationSpeed.current
    val currentEmotionalState = emotionalState ?: EmotionalState.Neutral
    
    // Calculate animation duration based on speed setting
    val animationDuration = remember(animationSpeed) {
        when (animationSpeed) {
            AnimationSpeed.NORMAL -> 300
            AnimationSpeed.SLOW -> 500
            AnimationSpeed.FAST -> 150
            AnimationSpeed.NONE -> 0
        }
    }
    
    // Color animation for emotional state
    val containerColor by animateColorAsState(
        targetValue = MaterialTheme.colorScheme.surface,
        animationSpec = tween(durationMillis = animationDuration),
        label = "CardColor"
    )
    
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(
            containerColor = containerColor
        ),
        shape = MaterialTheme.shapes.medium
    ) {
        // Subtle accent bar on top reflecting emotional state
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    brush = Brush.horizontalGradient(
                        colors = listOf(
                            emotionalPalette.primary,
                            emotionalPalette.accent
                        )
                    )
                )
                .padding(2.dp)
        ) {}
        
        // Card content
        Box(modifier = Modifier.padding(SallieDimensions.spacing_16)) {
            content()
        }
    }
}

/**
 * Elevated card component with shadow
 * 
 * @param modifier Modifier for the card
 * @param emotionalState Optional emotional state override
 * @param content Card content
 */
@Composable
fun SallieElevatedCard(
    modifier: Modifier = Modifier,
    emotionalState: EmotionalState? = null,
    content: @Composable () -> Unit
) {
    val emotionalPalette = LocalEmotionalPalette.current
    val animationSpeed = LocalAnimationSpeed.current
    val currentEmotionalState = emotionalState ?: EmotionalState.Neutral
    
    // Calculate animation duration based on speed setting
    val animationDuration = remember(animationSpeed) {
        when (animationSpeed) {
            AnimationSpeed.NORMAL -> 300
            AnimationSpeed.SLOW -> 500
            AnimationSpeed.FAST -> 150
            AnimationSpeed.NONE -> 0
        }
    }
    
    // Elevation animation based on emotional state
    val elevation by animateFloatAsState(
        targetValue = when(currentEmotionalState) {
            EmotionalState.Excited -> 8f
            EmotionalState.Happy -> 6f 
            EmotionalState.Neutral -> 4f
            EmotionalState.Calm -> 2f
            EmotionalState.Concerned -> 3f
            EmotionalState.Focused -> 5f
        },
        animationSpec = tween(durationMillis = animationDuration),
        label = "CardElevation"
    )
    
    ElevatedCard(
        modifier = modifier,
        colors = CardDefaults.elevatedCardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.elevatedCardElevation(
            defaultElevation = elevation.dp
        ),
        shape = MaterialTheme.shapes.medium
    ) {
        // Subtle accent bar on top reflecting emotional state
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    brush = Brush.horizontalGradient(
                        colors = listOf(
                            emotionalPalette.primary,
                            emotionalPalette.accent
                        )
                    )
                )
                .padding(2.dp)
        ) {}
        
        // Card content
        Box(modifier = Modifier.padding(SallieDimensions.spacing_16)) {
            content()
        }
    }
}

/**
 * Outlined card component with border
 * 
 * @param modifier Modifier for the card
 * @param emotionalState Optional emotional state override
 * @param content Card content
 */
@Composable
fun SallieOutlinedCard(
    modifier: Modifier = Modifier,
    emotionalState: EmotionalState? = null,
    content: @Composable () -> Unit
) {
    val emotionalPalette = LocalEmotionalPalette.current
    val animationSpeed = LocalAnimationSpeed.current
    val currentEmotionalState = emotionalState ?: EmotionalState.Neutral
    
    // Calculate animation duration based on speed setting
    val animationDuration = remember(animationSpeed) {
        when (animationSpeed) {
            AnimationSpeed.NORMAL -> 300
            AnimationSpeed.SLOW -> 500
            AnimationSpeed.FAST -> 150
            AnimationSpeed.NONE -> 0
        }
    }
    
    // Border color based on emotional state
    val borderColor by animateColorAsState(
        targetValue = emotionalPalette.primary.copy(alpha = 0.6f),
        animationSpec = tween(durationMillis = animationDuration),
        label = "BorderColor"
    )
    
    OutlinedCard(
        modifier = modifier,
        colors = CardDefaults.outlinedCardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        border = BorderStroke(1.dp, borderColor),
        shape = MaterialTheme.shapes.medium
    ) {
        // Card content
        Box(modifier = Modifier.padding(SallieDimensions.spacing_16)) {
            content()
        }
    }
}

/**
 * Interactive card component that can be clicked
 * 
 * @param onClick Click handler
 * @param modifier Modifier for the card
 * @param emotionalState Optional emotional state override
 * @param content Card content
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SallieClickableCard(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    emotionalState: EmotionalState? = null,
    content: @Composable () -> Unit
) {
    val emotionalPalette = LocalEmotionalPalette.current
    val animationSpeed = LocalAnimationSpeed.current
    val currentEmotionalState = emotionalState ?: EmotionalState.Neutral
    
    // Calculate animation duration based on speed setting
    val animationDuration = remember(animationSpeed) {
        when (animationSpeed) {
            AnimationSpeed.NORMAL -> 300
            AnimationSpeed.SLOW -> 500
            AnimationSpeed.FAST -> 150
            AnimationSpeed.NONE -> 0
        }
    }
    
    // Color animation for emotional state
    val containerColor by animateColorAsState(
        targetValue = MaterialTheme.colorScheme.surface,
        animationSpec = tween(durationMillis = animationDuration),
        label = "CardColor"
    )
    
    // Elevation animation based on emotional state
    val elevation by animateFloatAsState(
        targetValue = when(currentEmotionalState) {
            EmotionalState.Excited -> 8f
            EmotionalState.Happy -> 6f 
            EmotionalState.Neutral -> 4f
            EmotionalState.Calm -> 2f
            EmotionalState.Concerned -> 3f
            EmotionalState.Focused -> 5f
        },
        animationSpec = tween(durationMillis = animationDuration),
        label = "CardElevation"
    )
    
    Card(
        onClick = onClick,
        modifier = modifier,
        colors = CardDefaults.cardColors(
            containerColor = containerColor
        ),
        elevation = CardDefaults.cardElevation(
            defaultElevation = elevation.dp,
            pressedElevation = (elevation + 2).dp,
            hoveredElevation = (elevation + 4).dp
        ),
        shape = MaterialTheme.shapes.medium
    ) {
        // Subtle accent bar on top reflecting emotional state
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    brush = Brush.horizontalGradient(
                        colors = listOf(
                            emotionalPalette.primary,
                            emotionalPalette.accent
                        )
                    )
                )
                .padding(2.dp)
        ) {}
        
        // Card content
        Box(modifier = Modifier.padding(SallieDimensions.spacing_16)) {
            content()
        }
    }
}

/**
 * Accent card with background color based on emotional state
 * 
 * @param modifier Modifier for the card
 * @param emotionalState Optional emotional state override
 * @param content Card content
 */
@Composable
fun SallieAccentCard(
    modifier: Modifier = Modifier,
    emotionalState: EmotionalState? = null,
    content: @Composable () -> Unit
) {
    val emotionalPalette = LocalEmotionalPalette.current
    val animationSpeed = LocalAnimationSpeed.current
    val currentEmotionalState = emotionalState ?: EmotionalState.Neutral
    
    // Calculate animation duration based on speed setting
    val animationDuration = remember(animationSpeed) {
        when (animationSpeed) {
            AnimationSpeed.NORMAL -> 300
            AnimationSpeed.SLOW -> 500
            AnimationSpeed.FAST -> 150
            AnimationSpeed.NONE -> 0
        }
    }
    
    // Color animation for emotional state
    val containerColor by animateColorAsState(
        targetValue = emotionalPalette.primary.copy(alpha = 0.1f),
        animationSpec = tween(durationMillis = animationDuration),
        label = "CardColor"
    )
    
    val borderColor by animateColorAsState(
        targetValue = emotionalPalette.primary.copy(alpha = 0.3f),
        animationSpec = tween(durationMillis = animationDuration),
        label = "BorderColor"
    )
    
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(
            containerColor = containerColor
        ),
        border = BorderStroke(1.dp, borderColor),
        shape = MaterialTheme.shapes.medium
    ) {
        // Card content
        Box(modifier = Modifier.padding(SallieDimensions.spacing_16)) {
            content()
        }
    }
}


package com.sallie.ui.components

import android.content.Context
import android.graphics.drawable.GradientDrawable
import android.util.AttributeSet
import android.view.View
import android.view.accessibility.AccessibilityNodeInfo
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.view.AccessibilityDelegateCompat
import androidx.core.view.ViewCompat
import androidx.core.view.accessibility.AccessibilityNodeInfoCompat
import com.sallie.ui.adaptation.UIAdaptationState

/**
 * Sallie's Adaptive Card
 * 
 * A container component that displays content in a card format with adaptive
 * styling based on theme, accessibility, device, and user context.
 */
class SallieCard @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : AdaptiveLayout(context, attrs, defStyleAttr) {

    // UI elements
    private var cardTitle: TextView? = null
    private var cardContent: LinearLayout? = null
    
    // Card properties
    private var cardElevation = 4f
    private var hasHeader = false
    
    init {
        // Inflate the card layout
        View.inflate(context, R.layout.sallie_card, this)
        
        // Get references to views
        cardTitle = findViewById(R.id.card_title)
        cardContent = findViewById(R.id.card_content)
        
        // Set default card properties
        clipToOutline = true
        
        // Parse attributes
        val typedArray = context.obtainStyledAttributes(
            attrs, R.styleable.SallieCard, defStyleAttr, 0
        )
        
        try {
            // Get card title
            val title = typedArray.getString(R.styleable.SallieCard_cardTitle)
            if (title != null) {
                setCardTitle(title)
            } else {
                cardTitle?.visibility = View.GONE
                hasHeader = false
            }
            
            // Get card elevation
            cardElevation = typedArray.getDimension(
                R.styleable.SallieCard_cardElevation,
                resources.getDimension(R.dimen.card_default_elevation)
            )
            elevation = cardElevation
        } finally {
            typedArray.recycle()
        }
        
        // Setup enhanced accessibility
        setupAccessibility()
    }
    
    /**
     * Set card title
     */
    fun setCardTitle(title: String) {
        cardTitle?.text = title
        cardTitle?.visibility = View.VISIBLE
        hasHeader = true
    }
    
    /**
     * Add content to the card
     */
    fun addContent(view: View) {
        cardContent?.addView(view)
    }
    
    /**
     * Remove all content from the card
     */
    fun clearContent() {
        cardContent?.removeAllViews()
    }
    
    /**
     * Apply theme adaptations
     */
    override fun applyTheme(state: UIAdaptationState) {
        super.applyTheme(state)
        
        val theme = state.themeConfig
        
        // Apply card styling
        val background = GradientDrawable().apply {
            shape = GradientDrawable.RECTANGLE
            cornerRadius = theme.cornerRadius.toFloat()
            setColor(if (theme.isDarkMode) darkenColor(theme.backgroundColor) else theme.backgroundColor)
        }
        this.background = background
        
        // Apply elevation based on theme
        elevation = theme.elevationLevel * resources.displayMetrics.density
        
        // Apply header styling if present
        if (hasHeader) {
            cardTitle?.setTextColor(theme.textColor)
        }
    }
    
    /**
     * Apply accessibility adaptations
     */
    override fun applyAccessibility(state: UIAdaptationState) {
        super.applyAccessibility(state)
        
        val accessibility = state.accessibilityConfig
        
        // Adjust text size for accessibility
        if (hasHeader) {
            cardTitle?.textSize = 18 * accessibility.fontScale
        }
        
        // Increase contrast if needed
        if (accessibility.contrastEnhanced) {
            if (hasHeader) {
                cardTitle?.setTextColor(enhanceContrast(state.themeConfig.textColor))
            }
        }
    }
    
    /**
     * Apply tablet-specific layout adaptations
     */
    override fun applyTabletLayout() {
        val horizontalPadding = (24 * resources.displayMetrics.density).toInt()
        val verticalPadding = (16 * resources.displayMetrics.density).toInt()
        
        cardContent?.setPadding(horizontalPadding, verticalPadding, horizontalPadding, verticalPadding)
        
        if (hasHeader) {
            val headerPadding = (24 * resources.displayMetrics.density).toInt()
            cardTitle?.setPadding(headerPadding, headerPadding, headerPadding, headerPadding / 2)
            cardTitle?.textSize = 20f
        }
    }
    
    /**
     * Apply phone-specific layout adaptations
     */
    override fun applyPhoneLayout() {
        val horizontalPadding = (16 * resources.displayMetrics.density).toInt()
        val verticalPadding = (12 * resources.displayMetrics.density).toInt()
        
        cardContent?.setPadding(horizontalPadding, verticalPadding, horizontalPadding, verticalPadding)
        
        if (hasHeader) {
            val headerPadding = (16 * resources.displayMetrics.density).toInt()
            cardTitle?.setPadding(headerPadding, headerPadding, headerPadding, headerPadding / 2)
            cardTitle?.textSize = 18f
        }
    }
    
    /**
     * Apply simplified layout for first-time users
     */
    override fun applySimplifiedLayout() {
        // Reduce visual complexity by simplifying the card
        val simpleBackground = GradientDrawable().apply {
            shape = GradientDrawable.RECTANGLE
            cornerRadius = 8f
            setColor(currentState.themeConfig.backgroundColor)
        }
        background = simpleBackground
        
        // Reduce elevation for simpler look
        elevation = 2 * resources.displayMetrics.density
        
        // Increase padding for better readability
        val padding = (16 * resources.displayMetrics.density).toInt()
        cardContent?.setPadding(padding, padding, padding, padding)
    }
    
    /**
     * Get default content description
     */
    override fun getDefaultContentDescription(): String {
        return if (hasHeader) {
            cardTitle?.text.toString() + " card"
        } else {
            "Information card"
        }
    }
    
    /**
     * Add custom accessibility actions
     */
    override fun addCustomAccessibilityActions(info: AccessibilityNodeInfo) {
        // Could add expand/collapse action if the card supports it
    }
    
    /**
     * Set up enhanced accessibility
     */
    private fun setupAccessibility() {
        // Set up accessibility delegate
        ViewCompat.setAccessibilityDelegate(this, object : AccessibilityDelegateCompat() {
            override fun onInitializeAccessibilityNodeInfo(
                host: View,
                info: AccessibilityNodeInfoCompat
            ) {
                super.onInitializeAccessibilityNodeInfo(host, info)
                
                // Mark this as a card
                info.roleDescription = "card"
                
                // Set the heading property for the title if present
                if (hasHeader) {
                    ViewCompat.setAccessibilityHeading(cardTitle!!, true)
                }
            }
        })
    }
}
