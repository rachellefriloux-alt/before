/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * TTS Synthesis Exception
 */

package com.sallie.voice

/**
 * Exception thrown when text-to-speech synthesis fails
 */
class TtsSynthesisException(message: String, cause: Throwable? = null) : Exception(message, cause)
