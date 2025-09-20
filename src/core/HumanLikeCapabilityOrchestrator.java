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