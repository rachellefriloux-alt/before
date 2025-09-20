package com.sallie.tests.integration

import com.sallie.device.DeviceVoiceController
import com.sallie.expert.ExpertKnowledgeRegistry
import com.sallie.creative.CreativeExpressionRegistry
import kotlin.test.Test
import kotlin.test.assertTrue
import kotlin.test.assertEquals

class IntegrationTests {
    @Test
    fun testDeviceVoiceControllerCall() {
        val controller = DeviceVoiceController(/* provide mocks or real dependencies */)
        val result = controller.processVoiceCommand("Call John Doe")
        assertTrue(result.message.contains("Call"))
    }

    @Test
    fun testExpertKnowledgeMedical() {
        val advice = ExpertKnowledgeRegistry.getAdvice("Medical", "What is a healthy diet?")
        assertTrue(advice.answer.contains("medical"))
        assertTrue(advice.sources.isNotEmpty())
    }

    @Test
    fun testCreativeTextGeneration() {
        val content = CreativeExpressionRegistry.create("Text", "Write a poem about the sun")
        assertTrue(content.output.contains("Poetic response"))
        assertEquals(content.style, "poetry")
    }
}
