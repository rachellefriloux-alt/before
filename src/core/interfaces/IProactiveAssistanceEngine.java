package org.sallie.core.interfaces;

import java.util.Map;

public interface IProactiveAssistanceEngine {
    void initialize();
    void loadFromMemory();
    void saveToMemory();
    void performTask(String taskName, Map<String, Object> context);
    String getStatus();
}