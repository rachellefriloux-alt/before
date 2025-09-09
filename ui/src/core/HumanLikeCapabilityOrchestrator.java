/*
 * Persona: Tough love meets soul care.
 * Module: HumanLikeCapabilityOrchestrator
 * Intent: Handle functionality for HumanLikeCapabilityOrchestrator
 * Provenance-ID: 5b253587-c133-4cab-bdc6-49ae3c5201ab
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

package org.sallie.core;

import org.sallie.core.engine.ProactiveAssistanceEngine;
import org.sallie.core.interfaces.IProactiveAssistanceEngine;

import java.util.Map;

public class HumanLikeCapabilityOrchestrator {
    private final IProactiveAssistanceEngine engine;

    public HumanLikeCapabilityOrchestrator(IProactiveAssistanceEngine engine) {
        this.engine = engine;
        this.engine.initialize();
    }

    public void handleTask(String taskName, Map<String, Object> context) {
        engine.performTask(taskName, context);
    }

    public void saveState() {
        engine.saveToMemory();
    }

    public String reportStatus() {
        return engine.getStatus();
    }
}