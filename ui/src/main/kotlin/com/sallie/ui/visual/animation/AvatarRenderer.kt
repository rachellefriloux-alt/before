package com.sallie.ui.visual.animation

import com.sallie.core.context.InteractionContext
import com.sallie.core.emotion.EmotionState
import com.sallie.ui.theme.SallieTheme
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.launch

/**
 * AvatarRenderer renders the animated avatar using the current animation state.
 * It handles the actual rendering of animations defined by the AvatarAnimationSystem,
 * applying visual styles from the theme system and managing the animation lifecycle.
 */
class AvatarRenderer(
    private val animationSystem: AvatarAnimationSystem,
    private val theme: SallieTheme
) {
    // Canvas/Surface for rendering
    private var renderSurface: RenderSurface? = null
    
    // Animation assets
    private val assetManager = AnimationAssetManager()
    
    // Animation controller for managing animation playback
    private val animationController = AnimationController()
    
    // Animation playback state
    private var isAnimating = false
    
    // Coroutine scope for animation collection
    private val animationScope = CoroutineScope(Dispatchers.Main)
    
    init {
        // Collect animation state changes
        animationScope.launch {
            animationSystem.animationState
                .distinctUntilChanged()
                .collect { animationState ->
                    updateAnimationState(animationState)
                }
        }
    }
    
    /**
     * Attach a rendering surface to display the avatar
     */
    fun attachRenderSurface(surface: RenderSurface) {
        renderSurface = surface
        
        // Load assets appropriate for the current theme
        loadAssetsForTheme(theme)
        
        // Initial render
        render()
    }
    
    /**
     * Update the animation state based on new animation data
     */
    private fun updateAnimationState(animationState: AnimationState) {
        // Cancel any running animations
        animationController.cancelCurrentAnimation()
        
        // Configure the new animation
        val animation = when (animationState) {
            is AnimationState.Happy -> configureHappyAnimation(animationState)
            is AnimationState.Sad -> configureSadAnimation(animationState)
            is AnimationState.Excited -> configureExcitedAnimation(animationState)
            is AnimationState.Calm -> configureCalmAnimation(animationState)
            is AnimationState.Focused -> configureFocusedAnimation(animationState)
            is AnimationState.Protective -> configureProtectiveAnimation(animationState)
            is AnimationState.Empathetic -> configureEmpatheticAnimation(animationState)
            else -> configureNeutralAnimation(animationState)
        }
        
        // Start the new animation
        animationController.startAnimation(
            animation = animation,
            transitionType = animationState.transitionType,
            onFrame = { frame -> renderFrame(frame) },
            onComplete = { isAnimating = false }
        )
        
        isAnimating = true
    }
    
    /**
     * Renders the current animation frame
     */
    private fun renderFrame(frame: AnimationFrame) {
        renderSurface?.let { surface ->
            // Apply the animation frame to the render surface
            surface.clear()
            
            // Apply theme-specific visual adjustments
            val themeAdjustedFrame = applyThemeAdjustments(frame)
            
            // Draw the various components of the avatar
            drawBodyPose(surface, themeAdjustedFrame)
            drawFacialExpression(surface, themeAdjustedFrame)
            drawEyeExpression(surface, themeAdjustedFrame)
            drawMouthExpression(surface, themeAdjustedFrame)
            drawAccessories(surface, themeAdjustedFrame)
            
            // Apply any visual effects (glow, particles, etc.)
            applyVisualEffects(surface, themeAdjustedFrame)
            
            // Commit the drawing
            surface.present()
        }
    }
    
    /**
     * Apply theme-specific visual adjustments to animation frames
     */
    private fun applyThemeAdjustments(frame: AnimationFrame): AnimationFrame {
        return frame.copy(
            // Adjust colors based on theme
            primaryColor = theme.avatarColors.primary,
            secondaryColor = theme.avatarColors.secondary,
            accentColor = theme.avatarColors.accent,
            
            // Adjust size based on theme settings
            scale = frame.scale * theme.avatarScale,
            
            // Apply theme-specific filters
            filters = frame.filters + theme.avatarFilters
        )
    }
    
    /**
     * Load animation assets for the current theme
     */
    private fun loadAssetsForTheme(theme: SallieTheme) {
        assetManager.loadAssets(
            themeId = theme.id,
            avatarStyle = theme.avatarStyle,
            onComplete = { render() }
        )
    }
    
    /**
     * Render the current animation state
     */
    private fun render() {
        if (!isAnimating) {
            // If no animation is currently running, render the static state
            renderSurface?.let { surface ->
                // Create a static frame based on the last animation state
                val staticFrame = createStaticFrame(animationSystem.animationState.value)
                
                // Render the static frame
                renderFrame(staticFrame)
            }
        }
    }
    
    /**
     * Create a static frame from an animation state
     */
    private fun createStaticFrame(animationState: AnimationState): AnimationFrame {
        // Basic animation frame properties
        return AnimationFrame(
            bodyPose = assetManager.getBodyPoseAsset(animationState.bodyPose),
            eyeExpression = assetManager.getEyeExpressionAsset(animationState.eyeExpression),
            mouthExpression = assetManager.getMouthExpressionAsset(animationState.mouthExpression),
            
            // Default colors (will be adjusted by theme)
            primaryColor = 0xFF3366CC.toInt(),
            secondaryColor = 0xFF6699FF.toInt(),
            accentColor = 0xFFCC3366.toInt(),
            
            // Default scale and position
            scale = 1.0f,
            position = Point(0.5f, 0.5f),
            
            // No filters by default
            filters = emptyList()
        )
    }
    
    // Drawing methods for different avatar components
    
    private fun drawBodyPose(surface: RenderSurface, frame: AnimationFrame) {
        surface.drawImage(
            image = frame.bodyPose,
            position = frame.position,
            scale = frame.scale,
            color = frame.primaryColor
        )
    }
    
    private fun drawFacialExpression(surface: RenderSurface, frame: AnimationFrame) {
        // Face is drawn using a combination of eyes and mouth
        // Additional facial elements for enhanced expression

        // Draw eyebrows based on expression
        drawEyebrows(surface, frame)

        // Draw nose
        drawNose(surface, frame)

        // Draw cheeks/blush for certain expressions
        if (frame.eyeExpression == EyeExpression.HAPPY || frame.mouthExpression == MouthExpression.SMILE) {
            drawCheeks(surface, frame)
        }

        // Draw sweat drops for nervous/anxious expressions
        if (frame.eyeExpression == EyeExpression.WORRIED || frame.mouthExpression == MouthExpression.FROWN) {
            drawSweatDrops(surface, frame)
        }
    }

    private fun drawEyebrows(surface: RenderSurface, frame: AnimationFrame) {
        val eyebrowAsset = getEyebrowAsset(frame.eyeExpression)
        val eyebrowPosition = calculateEyebrowPosition(frame.position, frame.bodyPose)

        surface.drawImage(
            image = eyebrowAsset,
            position = eyebrowPosition,
            scale = frame.scale * 0.8f,
            color = frame.secondaryColor
        )
    }

    private fun drawNose(surface: RenderSurface, frame: AnimationFrame) {
        val noseAsset = getNoseAsset()
        val nosePosition = calculateNosePosition(frame.position, frame.bodyPose)

        surface.drawImage(
            image = noseAsset,
            position = nosePosition,
            scale = frame.scale * 0.6f,
            color = frame.primaryColor
        )
    }

    private fun drawCheeks(surface: RenderSurface, frame: AnimationFrame) {
        val cheekAsset = getCheekAsset()
        val leftCheekPosition = calculateLeftCheekPosition(frame.position, frame.bodyPose)
        val rightCheekPosition = calculateRightCheekPosition(frame.position, frame.bodyPose)

        // Draw both cheeks
        surface.drawImage(
            image = cheekAsset,
            position = leftCheekPosition,
            scale = frame.scale * 0.5f,
            color = Color(255, 182, 193, 150) // Light pink with transparency
        )

        surface.drawImage(
            image = cheekAsset,
            position = rightCheekPosition,
            scale = frame.scale * 0.5f,
            color = Color(255, 182, 193, 150) // Light pink with transparency
        )
    }

    private fun drawSweatDrops(surface: RenderSurface, frame: AnimationFrame) {
        val sweatAsset = getSweatDropAsset()
        val sweatPositions = calculateSweatPositions(frame.position, frame.bodyPose)

        sweatPositions.forEach { position ->
            surface.drawImage(
                image = sweatAsset,
                position = position,
                scale = frame.scale * 0.3f,
                color = Color(173, 216, 230, 180) // Light blue with transparency
            )
        }
    }

    private fun getEyebrowAsset(expression: EyeExpression): ImageAsset {
        // Try to get expression-specific eyebrows first
        val expressionAsset = assets["eyebrows_${expression.name.toLowerCase()}"]
        if (expressionAsset != null) return expressionAsset

        // Fallback to default eyebrows
        val defaultAsset = assets["eyebrows_default"]
        if (defaultAsset != null) return defaultAsset

        // Generate programmatic eyebrows if no assets available
        return GeneratedFacialAsset("eyebrows_${expression.name.toLowerCase()}", FacialFeature.EYEBROWS, expression)
    }

    private fun getNoseAsset(): ImageAsset {
        // Try to get nose asset
        val noseAsset = assets["nose"]
        if (noseAsset != null) return noseAsset

        // Generate programmatic nose if no asset available
        return GeneratedFacialAsset("nose", FacialFeature.NOSE, null)
    }

    private fun getCheekAsset(): ImageAsset {
        // Try to get cheek blush asset
        val cheekAsset = assets["cheek_blush"]
        if (cheekAsset != null) return cheekAsset

        // Generate programmatic cheeks if no asset available
        return GeneratedFacialAsset("cheek_blush", FacialFeature.CHEEKS, null)
    }

    private fun getSweatDropAsset(): ImageAsset {
        // Try to get sweat drop asset
        val sweatAsset = assets["sweat_drop"]
        if (sweatAsset != null) return sweatAsset

        // Generate programmatic sweat drops if no asset available
        return GeneratedFacialAsset("sweat_drop", FacialFeature.SWEAT_DROP, null)
    }

    private fun calculateEyebrowPosition(position: Vector2, bodyPose: BodyPose): Vector2 {
        return when (bodyPose) {
            BodyPose.STANDING -> Vector2(position.x, position.y - 15f)
            BodyPose.SITTING -> Vector2(position.x, position.y - 12f)
            BodyPose.WALKING -> Vector2(position.x, position.y - 14f)
        }
    }

    private fun calculateNosePosition(position: Vector2, bodyPose: BodyPose): Vector2 {
        return when (bodyPose) {
            BodyPose.STANDING -> Vector2(position.x, position.y + 5f)
            BodyPose.SITTING -> Vector2(position.x, position.y + 4f)
            BodyPose.WALKING -> Vector2(position.x, position.y + 5f)
        }
    }

    private fun calculateLeftCheekPosition(position: Vector2, bodyPose: BodyPose): Vector2 {
        return when (bodyPose) {
            BodyPose.STANDING -> Vector2(position.x - 8f, position.y + 8f)
            BodyPose.SITTING -> Vector2(position.x - 7f, position.y + 6f)
            BodyPose.WALKING -> Vector2(position.x - 8f, position.y + 7f)
        }
    }

    private fun calculateRightCheekPosition(position: Vector2, bodyPose: BodyPose): Vector2 {
        return when (bodyPose) {
            BodyPose.STANDING -> Vector2(position.x + 8f, position.y + 8f)
            BodyPose.SITTING -> Vector2(position.x + 7f, position.y + 6f)
            BodyPose.WALKING -> Vector2(position.x + 8f, position.y + 7f)
        }
    }

    private fun calculateSweatPositions(position: Vector2, bodyPose: BodyPose): List<Vector2> {
        return when (bodyPose) {
            BodyPose.STANDING -> listOf(
                Vector2(position.x - 12f, position.y - 8f),
                Vector2(position.x + 10f, position.y - 5f)
            )
            BodyPose.SITTING -> listOf(
                Vector2(position.x - 10f, position.y - 6f),
                Vector2(position.x + 8f, position.y - 3f)
            )
            BodyPose.WALKING -> listOf(
                Vector2(position.x - 11f, position.y - 7f),
                Vector2(position.x + 9f, position.y - 4f)
            )
        }
    }
    
    private fun drawEyeExpression(surface: RenderSurface, frame: AnimationFrame) {
        val eyePosition = calculateEyePosition(frame.position, frame.bodyPose)
        
        surface.drawImage(
            image = frame.eyeExpression,
            position = eyePosition,
            scale = frame.scale,
            color = frame.secondaryColor
        )
    }
    
    private fun drawMouthExpression(surface: RenderSurface, frame: AnimationFrame) {
        val mouthPosition = calculateMouthPosition(frame.position, frame.bodyPose)
        
        surface.drawImage(
            image = frame.mouthExpression,
            position = mouthPosition,
            scale = frame.scale,
            color = frame.secondaryColor
        )
    }
    
    private fun drawAccessories(surface: RenderSurface, frame: AnimationFrame) {
        // Draw any accessories like hats, glasses, etc. based on theme
        theme.avatarAccessories.forEach { accessory ->
            val accessoryPosition = calculateAccessoryPosition(
                basePosition = frame.position,
                bodyPose = frame.bodyPose,
                accessoryType = accessory.type
            )
            
            surface.drawImage(
                image = assetManager.getAccessoryAsset(accessory.id),
                position = accessoryPosition,
                scale = frame.scale * accessory.scale,
                color = accessory.color
            )
        }
    }
    
    private fun applyVisualEffects(surface: RenderSurface, frame: AnimationFrame) {
        // Apply any visual effects defined in the frame
        frame.filters.forEach { filter ->
            surface.applyFilter(filter)
        }
        
        // Apply theme-specific effects
        theme.avatarEffects.forEach { effect ->
            when (effect.type) {
                EffectType.GLOW -> applyGlowEffect(surface, effect, frame.position)
                EffectType.PARTICLES -> applyParticleEffect(surface, effect, frame.position)
                EffectType.COLOR_SHIFT -> applyColorShiftEffect(surface, effect)
            }
        }
    }
    
    // Helper methods for calculating positions
    
    private fun calculateEyePosition(basePosition: Point, bodyPose: ImageAsset): Point {
        // Calculate eye position relative to the body pose
        // This would use metadata from the body pose asset
        return Point(
            x = basePosition.x,
            y = basePosition.y - 0.1f  // Eyes are slightly above center
        )
    }
    
    private fun calculateMouthPosition(basePosition: Point, bodyPose: ImageAsset): Point {
        // Calculate mouth position relative to the body pose
        return Point(
            x = basePosition.x,
            y = basePosition.y + 0.05f  // Mouth is slightly below center
        )
    }
    
    private fun calculateAccessoryPosition(
        basePosition: Point,
        bodyPose: ImageAsset,
        accessoryType: AccessoryType
    ): Point {
        // Calculate accessory position based on type and body pose
        return when (accessoryType) {
            AccessoryType.HAT -> Point(basePosition.x, basePosition.y - 0.2f)
            AccessoryType.GLASSES -> Point(basePosition.x, basePosition.y - 0.05f)
            AccessoryType.NECKLACE -> Point(basePosition.x, basePosition.y + 0.15f)
            else -> basePosition
        }
    }
    
    // Effect application methods
    
    private fun applyGlowEffect(surface: RenderSurface, effect: VisualEffect, position: Point) {
        surface.drawGlow(
            position = position,
            radius = effect.intensity * 0.2f,
            color = effect.color,
            opacity = effect.opacity
        )
    }
    
    private fun applyParticleEffect(surface: RenderSurface, effect: VisualEffect, position: Point) {
        surface.drawParticles(
            position = position,
            particleCount = (effect.intensity * 20).toInt(),
            particleSize = effect.intensity * 0.05f,
            color = effect.color,
            opacity = effect.opacity,
            spread = effect.intensity * 0.3f
        )
    }
    
    private fun applyColorShiftEffect(surface: RenderSurface, effect: VisualEffect) {
        surface.applyColorFilter(
            filter = ColorFilter(
                hueShift = effect.intensity * 30f,
                saturation = 1.0f + effect.intensity * 0.5f,
                brightness = 1.0f + effect.intensity * 0.2f,
                opacity = effect.opacity
            )
        )
    }
    
    // Animation configuration methods
    
    private fun configureHappyAnimation(state: AnimationState.Happy): Animation {
        return Animation(
            frames = buildAnimationSequence(
                state = state,
                keyFrames = listOf(
                    KeyFrame(0.0f, createKeyFrameData(state, bounceAmount = 0.0f)),
                    KeyFrame(0.3f, createKeyFrameData(state, bounceAmount = 0.05f)),
                    KeyFrame(0.6f, createKeyFrameData(state, bounceAmount = -0.02f)),
                    KeyFrame(1.0f, createKeyFrameData(state, bounceAmount = 0.0f))
                )
            ),
            duration = 1.2f,
            isLooping = true
        )
    }
    
    private fun configureSadAnimation(state: AnimationState.Sad): Animation {
        return Animation(
            frames = buildAnimationSequence(
                state = state,
                keyFrames = listOf(
                    KeyFrame(0.0f, createKeyFrameData(state, slouchAmount = 0.0f)),
                    KeyFrame(0.4f, createKeyFrameData(state, slouchAmount = 0.03f)),
                    KeyFrame(0.7f, createKeyFrameData(state, slouchAmount = 0.02f)),
                    KeyFrame(1.0f, createKeyFrameData(state, slouchAmount = 0.0f))
                )
            ),
            duration = 2.0f,
            isLooping = true
        )
    }
    
    private fun configureExcitedAnimation(state: AnimationState.Excited): Animation {
        return Animation(
            frames = buildAnimationSequence(
                state = state,
                keyFrames = listOf(
                    KeyFrame(0.0f, createKeyFrameData(state, bounceAmount = 0.0f, scaleChange = 1.0f)),
                    KeyFrame(0.2f, createKeyFrameData(state, bounceAmount = 0.08f, scaleChange = 1.05f)),
                    KeyFrame(0.4f, createKeyFrameData(state, bounceAmount = -0.03f, scaleChange = 0.98f)),
                    KeyFrame(0.6f, createKeyFrameData(state, bounceAmount = 0.06f, scaleChange = 1.03f)),
                    KeyFrame(0.8f, createKeyFrameData(state, bounceAmount = -0.02f, scaleChange = 0.99f)),
                    KeyFrame(1.0f, createKeyFrameData(state, bounceAmount = 0.0f, scaleChange = 1.0f))
                )
            ),
            duration = 0.8f,
            isLooping = true
        )
    }
    
    private fun configureCalmAnimation(state: AnimationState.Calm): Animation {
        return Animation(
            frames = buildAnimationSequence(
                state = state,
                keyFrames = listOf(
                    KeyFrame(0.0f, createKeyFrameData(state, breatheAmount = 0.0f)),
                    KeyFrame(0.5f, createKeyFrameData(state, breatheAmount = 0.02f)),
                    KeyFrame(1.0f, createKeyFrameData(state, breatheAmount = 0.0f))
                )
            ),
            duration = 3.0f,
            isLooping = true
        )
    }
    
    private fun configureFocusedAnimation(state: AnimationState.Focused): Animation {
        return Animation(
            frames = buildAnimationSequence(
                state = state,
                keyFrames = listOf(
                    KeyFrame(0.0f, createKeyFrameData(state)),
                    KeyFrame(0.3f, createKeyFrameData(state, blinkAmount = 1.0f)),
                    KeyFrame(0.35f, createKeyFrameData(state, blinkAmount = 0.0f)),
                    KeyFrame(0.8f, createKeyFrameData(state)),
                    KeyFrame(1.0f, createKeyFrameData(state))
                )
            ),
            duration = 4.0f,
            isLooping = true
        )
    }
    
    private fun configureProtectiveAnimation(state: AnimationState.Protective): Animation {
        return Animation(
            frames = buildAnimationSequence(
                state = state,
                keyFrames = listOf(
                    KeyFrame(0.0f, createKeyFrameData(state, stanceWidth = 0.0f)),
                    KeyFrame(0.3f, createKeyFrameData(state, stanceWidth = 0.05f)),
                    KeyFrame(0.6f, createKeyFrameData(state, stanceWidth = 0.03f)),
                    KeyFrame(1.0f, createKeyFrameData(state, stanceWidth = 0.0f))
                )
            ),
            duration = 1.5f,
            isLooping = true
        )
    }
    
    private fun configureEmpatheticAnimation(state: AnimationState.Empathetic): Animation {
        return Animation(
            frames = buildAnimationSequence(
                state = state,
                keyFrames = listOf(
                    KeyFrame(0.0f, createKeyFrameData(state, tiltAmount = 0.0f)),
                    KeyFrame(0.4f, createKeyFrameData(state, tiltAmount = 0.03f)),
                    KeyFrame(0.7f, createKeyFrameData(state, tiltAmount = 0.01f)),
                    KeyFrame(1.0f, createKeyFrameData(state, tiltAmount = 0.0f))
                )
            ),
            duration = 2.0f,
            isLooping = true
        )
    }
    
    private fun configureNeutralAnimation(state: AnimationState): Animation {
        return Animation(
            frames = buildAnimationSequence(
                state = state,
                keyFrames = listOf(
                    KeyFrame(0.0f, createKeyFrameData(state)),
                    KeyFrame(0.4f, createKeyFrameData(state, breatheAmount = 0.01f)),
                    KeyFrame(0.7f, createKeyFrameData(state, blinkAmount = 1.0f)),
                    KeyFrame(0.75f, createKeyFrameData(state, blinkAmount = 0.0f)),
                    KeyFrame(1.0f, createKeyFrameData(state))
                )
            ),
            duration = 4.0f,
            isLooping = true
        )
    }
    
    /**
     * Create frame data for keyframes with animation-specific parameters
     */
    private fun createKeyFrameData(
        state: AnimationState,
        bounceAmount: Float = 0.0f,
        slouchAmount: Float = 0.0f,
        breatheAmount: Float = 0.0f,
        blinkAmount: Float = 0.0f,
        tiltAmount: Float = 0.0f,
        stanceWidth: Float = 0.0f,
        scaleChange: Float = 1.0f
    ): FrameData {
        return FrameData(
            // Base position adjusted by various animation factors
            position = Point(
                x = 0.5f + stanceWidth,
                y = 0.5f + bounceAmount - slouchAmount + breatheAmount
            ),
            
            // Scale modified by the animation
            scale = scaleChange,
            
            // Rotation for head tilts
            rotation = tiltAmount * 10f,
            
            // Whether eyes are blinking
            blinking = blinkAmount > 0.5f,
            
            // Intensity affects visual effects
            effectIntensity = state.intensity
        )
    }
    
    /**
     * Build a sequence of frames from keyframes
     */
    private fun buildAnimationSequence(
        state: AnimationState,
        keyFrames: List<KeyFrame>
    ): List<AnimationFrame> {
        // Convert key frames to full animation frames
        val frames = mutableListOf<AnimationFrame>()
        
        // For simplicity, we'll just use 30 frames regardless of duration
        val frameCount = 30
        
        for (i in 0 until frameCount) {
            val progress = i.toFloat() / (frameCount - 1)
            
            // Find surrounding keyframes
            var prevKeyFrame = keyFrames.first()
            var nextKeyFrame = keyFrames.last()
            
            for (j in 0 until keyFrames.size - 1) {
                if (progress >= keyFrames[j].progress && progress <= keyFrames[j + 1].progress) {
                    prevKeyFrame = keyFrames[j]
                    nextKeyFrame = keyFrames[j + 1]
                    break
                }
            }
            
            // Interpolate between keyframes
            val keyFrameProgress = if (nextKeyFrame.progress > prevKeyFrame.progress) {
                (progress - prevKeyFrame.progress) / (nextKeyFrame.progress - prevKeyFrame.progress)
            } else {
                0f
            }
            
            val frameData = interpolateFrameData(
                prevKeyFrame.data,
                nextKeyFrame.data,
                keyFrameProgress
            )
            
            // Create animation frame
            frames.add(
                AnimationFrame(
                    bodyPose = assetManager.getBodyPoseAsset(state.bodyPose),
                    eyeExpression = assetManager.getEyeExpressionAsset(
                        if (frameData.blinking) EyeExpression.NEUTRAL else state.eyeExpression
                    ),
                    mouthExpression = assetManager.getMouthExpressionAsset(state.mouthExpression),
                    
                    // Base colors (will be adjusted by theme)
                    primaryColor = 0xFF3366CC.toInt(),
                    secondaryColor = 0xFF6699FF.toInt(),
                    accentColor = 0xFFCC3366.toInt(),
                    
                    // Position and scale from frame data
                    scale = frameData.scale,
                    position = frameData.position,
                    
                    // Effects based on emotion intensity
                    filters = generateFilters(state, frameData.effectIntensity)
                )
            )
        }
        
        return frames
    }
    
    /**
     * Interpolate between two frame data points
     */
    private fun interpolateFrameData(from: FrameData, to: FrameData, progress: Float): FrameData {
        return FrameData(
            position = Point(
                x = from.position.x + (to.position.x - from.position.x) * progress,
                y = from.position.y + (to.position.y - from.position.y) * progress
            ),
            scale = from.scale + (to.scale - from.scale) * progress,
            rotation = from.rotation + (to.rotation - from.rotation) * progress,
            blinking = if (progress > 0.5f) to.blinking else from.blinking,
            effectIntensity = from.effectIntensity + (to.effectIntensity - from.effectIntensity) * progress
        )
    }
    
    /**
     * Generate visual filters based on emotional state
     */
    private fun generateFilters(state: AnimationState, intensity: Float): List<Filter> {
        val filters = mutableListOf<Filter>()
        
        // Add different filters based on emotion type
        when (state) {
            is AnimationState.Happy -> {
                filters.add(BloomFilter(intensity * 0.3f))
                filters.add(SaturationFilter(1.0f + intensity * 0.2f))
            }
            is AnimationState.Sad -> {
                filters.add(SaturationFilter(1.0f - intensity * 0.3f))
                filters.add(ContrastFilter(1.0f - intensity * 0.1f))
            }
            is AnimationState.Excited -> {
                filters.add(BloomFilter(intensity * 0.4f))
                filters.add(SaturationFilter(1.0f + intensity * 0.3f))
                filters.add(VibranceFilter(intensity * 0.2f))
            }
            is AnimationState.Calm -> {
                filters.add(SoftGlowFilter(intensity * 0.2f))
            }
            is AnimationState.Focused -> {
                filters.add(SharpenFilter(intensity * 0.2f))
            }
            is AnimationState.Protective -> {
                filters.add(ContrastFilter(1.0f + intensity * 0.15f))
                filters.add(SaturationFilter(1.0f + intensity * 0.1f))
            }
            is AnimationState.Empathetic -> {
                filters.add(SoftGlowFilter(intensity * 0.25f))
                filters.add(WarmthFilter(intensity * 0.3f))
            }
            else -> {
                // No filters for neutral
            }
        }
        
        return filters
    }
    
    /**
     * Update the theme and reload assets
     */
    fun updateTheme(newTheme: SallieTheme) {
        // Update the theme reference
        theme = newTheme
        
        // Reload assets for the new theme
        loadAssetsForTheme(newTheme)
        
        // Re-render with the new theme
        render()
    }
}

// Supporting data classes and interfaces

/**
 * Represents a point in 2D space (0.0-1.0 range for normalized coordinates)
 */
data class Point(val x: Float, val y: Float)

/**
 * Key frame for animation sequences
 */
data class KeyFrame(
    val progress: Float, // 0.0-1.0 range
    val data: FrameData
)

/**
 * Data for a specific frame
 */
data class FrameData(
    val position: Point,
    val scale: Float = 1.0f,
    val rotation: Float = 0.0f,
    val blinking: Boolean = false,
    val effectIntensity: Float = 0.5f
)

/**
 * Animation frame with all rendering information
 */
data class AnimationFrame(
    val bodyPose: ImageAsset,
    val eyeExpression: ImageAsset,
    val mouthExpression: ImageAsset,
    val primaryColor: Int,
    val secondaryColor: Int,
    val accentColor: Int,
    val scale: Float,
    val position: Point,
    val filters: List<Filter> = emptyList()
)

/**
 * Animation sequence
 */
data class Animation(
    val frames: List<AnimationFrame>,
    val duration: Float, // in seconds
    val isLooping: Boolean = false
)

/**
 * Interface for a rendering surface
 */
interface RenderSurface {
    fun clear()
    fun drawImage(image: ImageAsset, position: Point, scale: Float, color: Int)
    fun drawGlow(position: Point, radius: Float, color: Int, opacity: Float)
    fun drawParticles(position: Point, particleCount: Int, particleSize: Float, color: Int, opacity: Float, spread: Float)
    fun applyFilter(filter: Filter)
    fun applyColorFilter(filter: ColorFilter)
    fun present()
}

/**
 * Abstract class for all visual filters
 */
sealed class Filter

/**
 * Bloom visual filter
 */
data class BloomFilter(val intensity: Float) : Filter()

/**
 * Saturation adjustment filter
 */
data class SaturationFilter(val amount: Float) : Filter()

/**
 * Contrast adjustment filter
 */
data class ContrastFilter(val amount: Float) : Filter()

/**
 * Vibrance filter for color enhancement
 */
data class VibranceFilter(val amount: Float) : Filter()

/**
 * Soft glow filter
 */
data class SoftGlowFilter(val intensity: Float) : Filter()

/**
 * Sharpen filter
 */
data class SharpenFilter(val amount: Float) : Filter()

/**
 * Warmth filter (color temperature)
 */
data class WarmthFilter(val amount: Float) : Filter()

/**
 * Comprehensive color filter
 */
data class ColorFilter(
    val hueShift: Float = 0f,
    val saturation: Float = 1f,
    val brightness: Float = 1f,
    val opacity: Float = 1f
)

/**
 * Interface for image assets
 */
interface ImageAsset {
    val id: String
    val width: Int
    val height: Int
    fun load()
    fun unload()
    fun isLoaded(): Boolean
}

/**
 * Types of accessories
 */
enum class AccessoryType {
    HAT,
    GLASSES,
    NECKLACE,
    BACKGROUND,
    CLOTHING,
    PROP
}

/**
 * Types of visual effects
 */
enum class EffectType {
    GLOW,
    PARTICLES,
    COLOR_SHIFT
}

/**
 * Animation asset manager
 */
class AnimationAssetManager {
    private val assets = mutableMapOf<String, ImageAsset>()
    
    fun loadAssets(themeId: String, avatarStyle: String, onComplete: () -> Unit) {
        // Load assets based on theme and style
        // For now, just simulate loading
        onComplete()
    }
    
    fun getBodyPoseAsset(pose: BodyPose): ImageAsset {
        // Try to get pose-specific body asset
        val poseAsset = assets["body_${pose.name.toLowerCase()}"]
        if (poseAsset != null) return poseAsset

        // Fallback to default body
        val defaultAsset = assets["body_default"]
        if (defaultAsset != null) return defaultAsset

        // Generate programmatic body if no assets available
        return GeneratedFacialAsset("body_${pose.name.toLowerCase()}", FacialFeature.BODY, pose)
    }

    fun getEyeExpressionAsset(expression: EyeExpression): ImageAsset {
        // Try to get expression-specific eyes
        val expressionAsset = assets["eyes_${expression.name.toLowerCase()}"]
        if (expressionAsset != null) return expressionAsset

        // Fallback to default eyes
        val defaultAsset = assets["eyes_default"]
        if (defaultAsset != null) return defaultAsset

        // Generate programmatic eyes if no assets available
        return GeneratedFacialAsset("eyes_${expression.name.toLowerCase()}", FacialFeature.EYES, expression)
    }

    fun getMouthExpressionAsset(expression: MouthExpression): ImageAsset {
        // Try to get expression-specific mouth
        val expressionAsset = assets["mouth_${expression.name.toLowerCase()}"]
        if (expressionAsset != null) return expressionAsset

        // Fallback to default mouth
        val defaultAsset = assets["mouth_default"]
        if (defaultAsset != null) return defaultAsset

        // Generate programmatic mouth if no assets available
        return GeneratedFacialAsset("mouth_${expression.name.toLowerCase()}", FacialFeature.MOUTH, expression)
    }

    fun getAccessoryAsset(accessoryId: String): ImageAsset {
        // Try to get specific accessory
        val accessoryAsset = assets[accessoryId]
        if (accessoryAsset != null) return accessoryAsset

        // Generate programmatic accessory if no asset available
        return GeneratedFacialAsset(accessoryId, FacialFeature.ACCESSORY, null)
    }

    /**
     * Enum for different facial features
     */
    enum class FacialFeature {
        EYEBROWS,
        NOSE,
        CHEEKS,
        SWEAT_DROP,
        EYES,
        MOUTH,
        BODY,
        ACCESSORY
    }

    /**
     * Generated facial asset for when specific assets aren't available
     */
    private class GeneratedFacialAsset(
        override val id: String,
        private val feature: FacialFeature,
        private val expression: Any? = null
    ) : ImageAsset {
        override val width: Int = 100
        override val height: Int = 100
        private var isAssetLoaded = false

        override fun load() {
            // Generate the asset programmatically based on the feature type
            isAssetLoaded = true
        }

        override fun unload() {
            isAssetLoaded = false
        }

        override fun isLoaded(): Boolean = isAssetLoaded

        /**
         * Get the generated drawable for this facial feature
         */
        fun getGeneratedDrawable(): android.graphics.drawable.Drawable {
            return when (feature) {
                FacialFeature.EYEBROWS -> generateEyebrows()
                FacialFeature.NOSE -> generateNose()
                FacialFeature.CHEEKS -> generateCheeks()
                FacialFeature.SWEAT_DROP -> generateSweatDrop()
                FacialFeature.EYES -> generateEyes()
                FacialFeature.MOUTH -> generateMouth()
                FacialFeature.BODY -> generateBody()
                FacialFeature.ACCESSORY -> generateAccessory()
            }
        }

        private fun generateEyebrows(): android.graphics.drawable.Drawable {
            return object : android.graphics.drawable.Drawable() {
                override fun draw(canvas: android.graphics.Canvas) {
                    val paint = android.graphics.Paint(android.graphics.Paint.ANTI_ALIAS_FLAG).apply {
                        color = android.graphics.Color.BLACK
                        style = android.graphics.Paint.Style.STROKE
                        strokeWidth = 3f
                    }

                    val bounds = bounds
                    val centerX = bounds.centerX().toFloat()
                    val centerY = bounds.centerY().toFloat()

                    // Draw simple eyebrow arcs
                    val path = android.graphics.Path()
                    path.moveTo(centerX - 25f, centerY - 10f)
                    path.quadTo(centerX, centerY - 15f, centerX + 25f, centerY - 10f)
                    canvas.drawPath(path, paint)
                }

                override fun setAlpha(alpha: Int) {}
                override fun setColorFilter(colorFilter: android.graphics.ColorFilter?) {}
                override fun getOpacity(): Int = android.graphics.PixelFormat.OPAQUE
            }
        }

        private fun generateNose(): android.graphics.drawable.Drawable {
            return object : android.graphics.drawable.Drawable() {
                override fun draw(canvas: android.graphics.Canvas) {
                    val paint = android.graphics.Paint(android.graphics.Paint.ANTI_ALIAS_FLAG).apply {
                        color = android.graphics.Color.parseColor("#FFDBB4") // Skin tone
                        style = android.graphics.Paint.Style.FILL
                    }

                    val bounds = bounds
                    val centerX = bounds.centerX().toFloat()
                    val centerY = bounds.centerY().toFloat()

                    // Draw simple nose triangle
                    val path = android.graphics.Path()
                    path.moveTo(centerX, centerY - 15f)
                    path.lineTo(centerX - 8f, centerY + 10f)
                    path.lineTo(centerX + 8f, centerY + 10f)
                    path.close()
                    canvas.drawPath(path, paint)
                }

                override fun setAlpha(alpha: Int) {}
                override fun setColorFilter(colorFilter: android.graphics.ColorFilter?) {}
                override fun getOpacity(): Int = android.graphics.PixelFormat.OPAQUE
            }
        }

        private fun generateCheeks(): android.graphics.drawable.Drawable {
            return object : android.graphics.drawable.Drawable() {
                override fun draw(canvas: android.graphics.Canvas) {
                    val paint = android.graphics.Paint(android.graphics.Paint.ANTI_ALIAS_FLAG).apply {
                        color = android.graphics.Color.parseColor("#FFB6C1") // Light pink blush
                        style = android.graphics.Paint.Style.FILL
                    }

                    val bounds = bounds
                    val centerX = bounds.centerX().toFloat()
                    val centerY = bounds.centerY().toFloat()

                    // Draw circular blush on cheeks
                    canvas.drawCircle(centerX - 20f, centerY, 12f, paint)
                    canvas.drawCircle(centerX + 20f, centerY, 12f, paint)
                }

                override fun setAlpha(alpha: Int) {}
                override fun setColorFilter(colorFilter: android.graphics.ColorFilter?) {}
                override fun getOpacity(): Int = android.graphics.PixelFormat.OPAQUE
            }
        }

        private fun generateSweatDrop(): android.graphics.drawable.Drawable {
            return object : android.graphics.drawable.Drawable() {
                override fun draw(canvas: android.graphics.Canvas) {
                    val paint = android.graphics.Paint(android.graphics.Paint.ANTI_ALIAS_FLAG).apply {
                        color = android.graphics.Color.parseColor("#87CEEB") // Light blue
                        style = android.graphics.Paint.Style.FILL
                    }

                    val bounds = bounds
                    val centerX = bounds.centerX().toFloat()
                    val centerY = bounds.centerY().toFloat()

                    // Draw teardrop-shaped sweat drop
                    val path = android.graphics.Path()
                    path.moveTo(centerX, centerY - 15f)
                    path.quadTo(centerX - 8f, centerY - 5f, centerX - 5f, centerY + 10f)
                    path.quadTo(centerX, centerY + 15f, centerX + 5f, centerY + 10f)
                    path.quadTo(centerX + 8f, centerY - 5f, centerX, centerY - 15f)
                    canvas.drawPath(path, paint)
                }

                override fun setAlpha(alpha: Int) {}
                override fun setColorFilter(colorFilter: android.graphics.ColorFilter?) {}
                override fun getOpacity(): Int = android.graphics.PixelFormat.OPAQUE
            }
        }

        private fun generateEyes(): android.graphics.drawable.Drawable {
            return object : android.graphics.drawable.Drawable() {
                override fun draw(canvas: android.graphics.Canvas) {
                    val paint = android.graphics.Paint(android.graphics.Paint.ANTI_ALIAS_FLAG)

                    val bounds = bounds
                    val centerX = bounds.centerX().toFloat()
                    val centerY = bounds.centerY().toFloat()

                    // Draw eye whites
                    paint.color = android.graphics.Color.WHITE
                    paint.style = android.graphics.Paint.Style.FILL
                    canvas.drawOval(android.graphics.RectF(centerX - 35f, centerY - 10f, centerX - 15f, centerY + 10f), paint)
                    canvas.drawOval(android.graphics.RectF(centerX + 15f, centerY - 10f, centerX + 35f, centerY + 10f), paint)

                    // Draw pupils
                    paint.color = android.graphics.Color.BLACK
                    canvas.drawCircle(centerX - 25f, centerY, 4f, paint)
                    canvas.drawCircle(centerX + 25f, centerY, 4f, paint)
                }

                override fun setAlpha(alpha: Int) {}
                override fun setColorFilter(colorFilter: android.graphics.ColorFilter?) {}
                override fun getOpacity(): Int = android.graphics.PixelFormat.OPAQUE
            }
        }

        private fun generateMouth(): android.graphics.drawable.Drawable {
            return object : android.graphics.drawable.Drawable() {
                override fun draw(canvas: android.graphics.Canvas) {
                    val paint = android.graphics.Paint(android.graphics.Paint.ANTI_ALIAS_FLAG).apply {
                        color = android.graphics.Color.parseColor("#FFB6C1") // Light pink
                        style = android.graphics.Paint.Style.STROKE
                        strokeWidth = 3f
                        strokeCap = android.graphics.Paint.Cap.ROUND
                    }

                    val bounds = bounds
                    val centerX = bounds.centerX().toFloat()
                    val centerY = bounds.centerY().toFloat()

                    // Draw simple smile
                    val path = android.graphics.Path()
                    path.moveTo(centerX - 15f, centerY)
                    path.quadTo(centerX, centerY + 8f, centerX + 15f, centerY)
                    canvas.drawPath(path, paint)
                }

                override fun setAlpha(alpha: Int) {}
                override fun setColorFilter(colorFilter: android.graphics.ColorFilter?) {}
                override fun getOpacity(): Int = android.graphics.PixelFormat.OPAQUE
            }
        }

        private fun generateBody(): android.graphics.drawable.Drawable {
            return object : android.graphics.drawable.Drawable() {
                override fun draw(canvas: android.graphics.Canvas) {
                    val paint = android.graphics.Paint(android.graphics.Paint.ANTI_ALIAS_FLAG).apply {
                        color = android.graphics.Color.parseColor("#FFDBB4") // Skin tone
                        style = android.graphics.Paint.Style.FILL
                    }

                    val bounds = bounds
                    val centerX = bounds.centerX().toFloat()
                    val centerY = bounds.centerY().toFloat()

                    // Draw simple body shape
                    canvas.drawOval(android.graphics.RectF(centerX - 30f, centerY - 40f, centerX + 30f, centerY + 40f), paint)
                }

                override fun setAlpha(alpha: Int) {}
                override fun setColorFilter(colorFilter: android.graphics.ColorFilter?) {}
                override fun getOpacity(): Int = android.graphics.PixelFormat.OPAQUE
            }
        }

        private fun generateAccessory(): android.graphics.drawable.Drawable {
            return object : android.graphics.drawable.Drawable() {
                override fun draw(canvas: android.graphics.Canvas) {
                    val paint = android.graphics.Paint(android.graphics.Paint.ANTI_ALIAS_FLAG).apply {
                        color = android.graphics.Color.YELLOW
                        style = android.graphics.Paint.Style.FILL
                    }

                    val bounds = bounds
                    val centerX = bounds.centerX().toFloat()
                    val centerY = bounds.centerY().toFloat()

                    // Draw simple accessory (star shape)
                    val path = android.graphics.Path()
                    for (i in 0..4) {
                        val angle = (i * 72).toDouble()
                        val radius = if (i % 2 == 0) 15.0 else 8.0
                        val x = centerX + radius * Math.cos(Math.toRadians(angle))
                        val y = centerY + radius * Math.sin(Math.toRadians(angle))
                        if (i == 0) path.moveTo(x.toFloat(), y.toFloat()) else path.lineTo(x.toFloat(), y.toFloat())
                    }
                    path.close()
                    canvas.drawPath(path, paint)
                }

                override fun setAlpha(alpha: Int) {}
                override fun setColorFilter(colorFilter: android.graphics.ColorFilter?) {}
                override fun getOpacity(): Int = android.graphics.PixelFormat.OPAQUE
            }
        }
    }
}

/**
 * Controls animation playback
 */
class AnimationController {
    private var currentAnimation: Animation? = null
    private var currentFrame = 0
    private var isPlaying = false
    
    fun startAnimation(
        animation: Animation,
        transitionType: TransitionType,
        onFrame: (AnimationFrame) -> Unit,
        onComplete: () -> Unit
    ) {
        // Cancel any existing animation
        cancelCurrentAnimation()
        
        // Store the new animation
        currentAnimation = animation
        currentFrame = 0
        isPlaying = true
        
        // Start playback
        playAnimation(transitionType, onFrame, onComplete)
    }
    
    private fun playAnimation(
        transitionType: TransitionType,
        onFrame: (AnimationFrame) -> Unit,
        onComplete: () -> Unit
    ) {
        val animation = currentAnimation ?: return
        
        // Calculate frame timing based on transition type
        val frameDuration = when (transitionType) {
            TransitionType.QUICK -> animation.duration / animation.frames.size * 0.5f
            TransitionType.SMOOTH -> animation.duration / animation.frames.size
            TransitionType.MORPH -> animation.duration / animation.frames.size * 1.2f
            TransitionType.DISSOLVE -> animation.duration / animation.frames.size * 1.5f
        }
        
        // Simulate animation playback
        // In a real implementation, this would use a proper animation timer
        // For now, we'll just play the first frame
        if (animation.frames.isNotEmpty()) {
            onFrame(animation.frames.first())
        }
        
        // For simulation purposes, we'll just call onComplete
        if (!animation.isLooping) {
            isPlaying = false
            onComplete()
        }
    }
    
    fun cancelCurrentAnimation() {
        currentAnimation = null
        isPlaying = false
    }
}
