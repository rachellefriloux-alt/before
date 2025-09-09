# Memory System Documentation

## Overview

Sallie's Memory System is a sophisticated cognitive architecture designed to simulate human-like memory processes. It provides a hierarchical, associative memory structure with episodic, semantic, and emotional memory types, along with advanced mechanisms for memory reinforcement, decay, and contextual retrieval.

The system's design follows principles from cognitive psychology, implementing features such as the forgetting curve, memory consolidation, emotional significance effects on memory strength, associative memory networks, and a working memory system that constrains active processing.

## Architecture

The Memory System consists of the following core components:

### 1. Memory Data Models

**BaseMemory**: The foundation class for all memory types, providing common properties such as:
- Unique identifier
- Timestamp
- Strength factor (how well the memory is remembered)
- Access metadata (last accessed, access count)
- Association list (connections to other memories)

**Memory Types**:
- **EpisodicMemory**: Experiences and events with time, location, and people metadata
- **SemanticMemory**: Facts, concepts, and knowledge
- **EmotionalMemory**: Emotional responses to triggers or events

### 2. Memory Storage

**Memory Stores**: Specialized containers for each memory type:
- **EpisodicMemoryStore**: Manages episodic memories
- **SemanticMemoryStore**: Manages semantic memories
- **EmotionalMemoryStore**: Manages emotional memories

**Working Memory Manager**: Manages the temporary active memory space, simulating the cognitive limitations of working memory.

### 3. Memory Processing

**Memory Indexer**: Indexes memory content for efficient retrieval based on semantic meaning

**Memory Association Engine**: Manages connections between related memories to enable association-based retrieval

**Memory Processor**: Handles new memory creation, processing, and integration with existing memories

### 4. Memory Decay and Reinforcement

**Memory Decay System**: Simulates the natural forgetting process using an Ebbinghaus-inspired forgetting curve algorithm

**Memory Reinforcement System**: Implements mechanisms to strengthen memories through recall, emotional significance, and associative reinforcement

### 5. Advanced Retrieval

**Advanced Memory Retrieval System**: Provides sophisticated retrieval capabilities including:
- Query-based search with context sensitivity
- Associative memory retrieval
- Working memory context-based retrieval
- Time-frame based retrieval
- Emotional context-based retrieval

### 6. Persistence

**Memory Persistence System**: Handles saving and loading memories from storage, ensuring memories persist between sessions

## Key Features

### 1. Human-Like Forgetting

The Memory Decay System implements a modified Ebbinghaus forgetting curve, where:
- Memories naturally decay over time
- Decay rate is influenced by memory strength, emotional significance, and access patterns
- Important or emotionally significant memories decay more slowly
- Very weak memories are eventually pruned unless they hold emotional significance

### 2. Memory Reinforcement

The Memory Reinforcement System simulates how memories are strengthened:
- Access reinforcement: memories are strengthened when accessed
- Emotional reinforcement: emotionally significant memories are strengthened more
- Explicit reinforcement: deliberate recall strengthens memories
- Associative reinforcement: related memories receive partial reinforcement
- Contextual reinforcement: clusters of related memories can be reinforced together

### 3. Associative Memory Networks

Memories are connected through an associative network:
- Memories can be retrieved by association from a source memory
- Association strength influences retrieval priority
- Multi-hop associations allow traversal across the memory network
- Associations can be strengthened through co-occurrence or explicit association

### 4. Working Memory Integration

The Working Memory Manager simulates cognitive working memory constraints:
- Limited capacity for active memories
- Recency-based displacement of older items
- Contextual retrieval based on current working memory content
- Priority-based retention for important or emotionally significant memories

### 5. Emotional Context Sensitivity

Memory retrieval is sensitive to emotional context:
- Retrieval can be biased by current emotional state
- Emotionally congruent memories are prioritized
- Emotional memory intensity influences retrieval priority
- Emotional significance affects memory strength and decay rate

## Implementation Components

### Core Data Structures

1. **MemorySystem.kt**: Main system architecture and organization
2. **MemoryDataModels.kt**: Memory type definitions and structures
3. **MemoryStores.kt**: Memory storage implementations
4. **MemoryProcessors.kt**: Memory processing components

### Advanced Features

1. **MemoryDecaySystem.kt**: Forgetting curve implementation
2. **MemoryReinforcementSystem.kt**: Memory strengthening mechanisms
3. **AdvancedMemoryRetrievalSystem.kt**: Sophisticated memory retrieval capabilities
4. **MemoryPersistenceSystem.kt**: Long-term memory storage

### Integration

**MemorySystemIntegration.kt**: Unified API for application interaction with the memory system

## Usage Examples

### Creating Memories

```kotlin
// Create an episodic memory
val episodicId = memorySystem.createEpisodicMemory(
    content = "Met Sarah at the coffee shop",
    location = "Downtown Coffee",
    people = listOf("Sarah"),
    emotionalValence = EmotionalValence.POSITIVE,
    importance = 0.7f
)

// Create a semantic memory
val semanticId = memorySystem.createSemanticMemory(
    concept = "Coffee",
    definition = "A brewed drink prepared from roasted coffee beans",
    confidence = 0.9f
)

// Create an emotional memory
val emotionalId = memorySystem.createEmotionalMemory(
    trigger = "Receiving praise for presentation",
    response = "Felt proud and accomplished",
    emotionalValence = EmotionalValence.STRONGLY_POSITIVE,
    intensity = 0.8f
)
```

### Retrieving Memories

```kotlin
// Query-based retrieval
val memories = memorySystem.retrieveMemoriesByQuery(
    query = "coffee shop meeting",
    memoryTypes = setOf(MemoryType.EPISODIC, MemoryType.SEMANTIC),
    emotionalContext = EmotionalValence.POSITIVE
)

// Association-based retrieval
val associations = memorySystem.retrieveAssociatedMemories(
    memoryType = MemoryType.EPISODIC,
    memoryId = episodicId,
    depth = 2
)

// Working memory context retrieval
val contextualMemories = memorySystem.retrieveFromWorkingMemoryContext()

// Emotional context retrieval
val emotionalMemories = memorySystem.retrieveByEmotionalContext(
    emotionalValence = EmotionalValence.POSITIVE,
    intensityThreshold = 0.6f
)
```

### Memory Operations

```kotlin
// Access a memory (updates access patterns)
val memory = memorySystem.accessMemory(MemoryType.EPISODIC, episodicId)

// Explicitly reinforce a memory
memorySystem.reinforceMemory(MemoryType.SEMANTIC, semanticId, 1.2f)

// Associate two memories
memorySystem.associateMemories(
    sourceType = MemoryType.EPISODIC,
    sourceId = episodicId,
    targetType = MemoryType.SEMANTIC,
    targetId = semanticId
)
```

## Integration with Other Systems

The Memory System integrates with other Sallie systems:

- **Personality System**: Memory retrieval is influenced by personality traits
- **Emotional Intelligence System**: Emotional context affects memory strength and retrieval
- **Communication System**: Memories inform conversational context and responses
- **Learning System**: New information is stored and associated with existing knowledge

## Technical Specifications

- **Storage Efficiency**: Optimized for mobile device constraints
- **Retrieval Performance**: Indexed for fast semantic retrieval
- **Persistence**: Room database integration for reliable storage
- **Concurrency**: Coroutine-based asynchronous operations
- **Memory Constraints**: Adaptive memory management based on device capabilities

## Future Enhancements

1. **Narrative Memory Construction**: Building coherent narratives from episodic memories
2. **Memory Consolidation**: Sleep-inspired memory optimization processes
3. **Counterfactual Reasoning**: Ability to reason about hypothetical scenarios
4. **Meta-Memory Awareness**: Consciousness of memory reliability and gaps
5. **Cross-Modal Associations**: Linking memories across different sensory modalities

## Demo Application

A demo application (MemorySystemDemoActivity) is provided to showcase the Memory System capabilities, allowing users to:

- Create different types of memories
- Query and retrieve memories
- Observe working memory content
- Reinforce selected memories
- Explore memory associations
