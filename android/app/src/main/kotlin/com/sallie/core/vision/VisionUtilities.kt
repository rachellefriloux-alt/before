/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * Values authenticity, respects boundaries, and maintains unwavering devotion
 * 
 * Computer Vision Utilities - Supporting classes for advanced image analysis
 */

package com.sallie.core.vision

import android.graphics.Bitmap
import android.graphics.Color
import com.sallie.core.input.BoundingBox
import com.sallie.core.input.Point
import com.sallie.core.input.RecognizedFace
import com.sallie.core.input.RecognizedObject
import com.sallie.core.input.RecognizedText
import kotlin.math.*

/**
 * Exception thrown by vision processing operations
 */
class VisionProcessorException(message: String, cause: Throwable? = null) : Exception(message, cause)

/**
 * Color analysis utilities for computer vision
 */
class ColorAnalyzer {
    
    fun analyzeColors(bitmap: Bitmap): ColorInfo {
        val width = bitmap.width
        val height = bitmap.height
        val pixels = IntArray(width * height)
        bitmap.getPixels(pixels, 0, width, 0, 0, width, height)
        
        // Calculate dominant colors
        val colorCounts = mutableMapOf<Int, Int>()
        var totalBrightness = 0f
        
        pixels.forEach { pixel ->
            val r = Color.red(pixel)
            val g = Color.green(pixel)
            val b = Color.blue(pixel)
            
            // Quantize color to reduce noise
            val quantizedColor = Color.rgb(
                (r / 32) * 32,
                (g / 32) * 32,
                (b / 32) * 32
            )
            
            colorCounts[quantizedColor] = colorCounts.getOrDefault(quantizedColor, 0) + 1
            
            // Calculate brightness
            val brightness = (r * 0.299f + g * 0.587f + b * 0.114f) / 255f
            totalBrightness += brightness
        }
        
        val dominantColors = colorCounts.entries
            .sortedByDescending { it.value }
            .take(5)
            .map { "#${Integer.toHexString(it.key).substring(2)}" }
        
        val averageBrightness = totalBrightness / pixels.size
        
        // Simple contrast calculation
        val contrast = calculateContrast(pixels)
        
        return ColorInfo(
            dominantColors = dominantColors,
            averageBrightness = averageBrightness,
            contrast = contrast
        )
    }
    
    fun segmentByColor(bitmap: Bitmap): List<ColorRegion> {
        val width = bitmap.width
        val height = bitmap.height
        val regions = mutableListOf<ColorRegion>()
        
        // Simple color segmentation using region growing
        val visited = Array(height) { BooleanArray(width) }
        
        for (y in 0 until height step 10) { // Sample every 10th pixel for efficiency
            for (x in 0 until width step 10) {
                if (!visited[y][x]) {
                    val region = growRegion(bitmap, x, y, visited)
                    if (region.area > 0.005f) { // At least 0.5% of image
                        regions.add(region)
                    }
                }
            }
        }
        
        return regions
    }
    
    private fun calculateContrast(pixels: IntArray): Float {
        if (pixels.isEmpty()) return 0f
        
        val brightnesses = pixels.map { pixel ->
            val r = Color.red(pixel)
            val g = Color.green(pixel)
            val b = Color.blue(pixel)
            (r * 0.299f + g * 0.587f + b * 0.114f) / 255f
        }
        
        val min = brightnesses.minOrNull() ?: 0f
        val max = brightnesses.maxOrNull() ?: 1f
        
        return if (max > 0f) (max - min) / max else 0f
    }
    
    private fun growRegion(bitmap: Bitmap, startX: Int, startY: Int, visited: Array<BooleanArray>): ColorRegion {
        val width = bitmap.width
        val height = bitmap.height
        val startColor = bitmap.getPixel(startX, startY)
        val tolerance = 50 // Color tolerance
        
        val points = mutableListOf<Point>()
        val stack = mutableListOf(Point(startX.toFloat(), startY.toFloat()))
        
        while (stack.isNotEmpty()) {
            val point = stack.removeAt(stack.size - 1)
            val x = point.x.toInt()
            val y = point.y.toInt()
            
            if (x < 0 || x >= width || y < 0 || y >= height || visited[y][x]) continue
            
            val currentColor = bitmap.getPixel(x, y)
            if (colorDistance(startColor, currentColor) > tolerance) continue
            
            visited[y][x] = true
            points.add(point)
            
            // Add neighbors
            stack.add(Point((x + 1).toFloat(), y.toFloat()))
            stack.add(Point((x - 1).toFloat(), y.toFloat()))
            stack.add(Point(x.toFloat(), (y + 1).toFloat()))
            stack.add(Point(x.toFloat(), (y - 1).toFloat()))
        }
        
        val minX = points.minOfOrNull { it.x } ?: 0f
        val maxX = points.maxOfOrNull { it.x } ?: 0f
        val minY = points.minOfOrNull { it.y } ?: 0f
        val maxY = points.maxOfOrNull { it.y } ?: 0f
        
        return ColorRegion(
            color = startColor,
            area = points.size.toFloat() / (width * height),
            boundingBox = BoundingBox(minX / width, minY / height, maxX / width, maxY / height),
            centerPoint = Point(
                points.map { it.x }.average().toFloat() / width,
                points.map { it.y }.average().toFloat() / height
            )
        )
    }
    
    private fun colorDistance(color1: Int, color2: Int): Double {
        val r1 = Color.red(color1)
        val g1 = Color.green(color1)
        val b1 = Color.blue(color1)
        val r2 = Color.red(color2)
        val g2 = Color.green(color2)
        val b2 = Color.blue(color2)
        
        return sqrt(((r1 - r2) * (r1 - r2) + (g1 - g2) * (g1 - g2) + (b1 - b2) * (b1 - b2)).toDouble())
    }
}

// Data classes for vision analysis results

data class ColorInfo(
    val dominantColors: List<String>,
    val averageBrightness: Float,
    val contrast: Float
)

data class ColorRegion(
    val color: Int,
    val area: Float,
    val boundingBox: BoundingBox,
    val centerPoint: Point
)