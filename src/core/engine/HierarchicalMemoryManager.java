package org.sallie.core.engine;

import java.util.*;

public class HierarchicalMemoryManager {
    private final Map<String, MemoryNode> rootNodes = new HashMap<>();

    public void addMemory(String key, String value, String hierarchyLevel) {
        rootNodes.computeIfAbsent(hierarchyLevel, k -> new MemoryNode(k)).addChild(new MemoryNode(key, value));
    }

    public String retrieveMemory(String key, String hierarchyLevel) {
        MemoryNode node = rootNodes.get(hierarchyLevel);
        if (node != null) {
            MemoryNode child = node.getChild(key);
            return child != null ? child.value : null;
        }
        return null;
    }

    public void persist() {
        // Implement persistence logic to disk or database
    }

    public void load() {
        // Implement loading logic from disk or database
    }

    private static class MemoryNode {
        String key;
        String value;
        Map<String, MemoryNode> children = new HashMap<>();

        MemoryNode(String key) { this.key = key; }
        MemoryNode(String key, String value) { this.key = key; this.value = value; }

        void addChild(MemoryNode node) { children.put(node.key, node); }
        MemoryNode getChild(String key) { return children.get(key); }
    }
}