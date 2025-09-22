package org.sallie.core.values;

import java.util.*;

public class ValuesDrivenDecisionEngine {
    private final List<String> valuesHierarchy = new ArrayList<>();
    private final Map<String, Integer> valuesWeights = new HashMap<>();

    public ValuesDrivenDecisionEngine() {
        valuesHierarchy.addAll(Arrays.asList("honesty", "helpfulness", "efficiency", "empathy"));
        for (int i = 0; i < valuesHierarchy.size(); i++) {
            valuesWeights.put(valuesHierarchy.get(i), 10 - i);
        }
    }

    public String decide(Map<String, Integer> options) {
        return options.entrySet().stream()
            .max(Comparator.comparingInt(e -> valuesWeights.getOrDefault(e.getKey(), 0) + e.getValue()))
            .map(Map.Entry::getKey)
            .orElse("undecided");
    }

    public String explainDecision(String decision) {
        if (valuesWeights.containsKey(decision)) {
            return "Decision is aligned with value: " + decision + " (weight: " + valuesWeights.get(decision) + ")";
        }
        return "No values alignment found for decision: " + decision;
    }
}