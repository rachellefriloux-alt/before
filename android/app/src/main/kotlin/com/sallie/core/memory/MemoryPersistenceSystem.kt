package com.sallie.core.memory

import android.content.Context
import androidx.room.*
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.util.*

/**
 * Sallie's Memory Persistence System
 * 
 * Handles the storage and retrieval of memory data, enabling memories to persist
 * between app sessions. The system provides both on-demand saving and periodic
 * background saving, with capability to rebuild memory indices during startup.
 */
class MemoryPersistenceSystem {
    private lateinit var memoryDatabase: MemoryDatabase
    private val gson = Gson()
    
    // Memory systems references
    private var episodicMemoryStore: EpisodicMemoryStore? = null
    private var semanticMemoryStore: SemanticMemoryStore? = null
    private var emotionalMemoryStore: EmotionalMemoryStore? = null
    private var memoryIndexer: MemoryIndexer? = null
    
    // Initialization status
    private var isInitialized = false
    
    /**
     * Initialize the persistence system
     */
    fun initialize(context: Context) {
        if (isInitialized) return
        
        memoryDatabase = Room.databaseBuilder(
            context,
            MemoryDatabase::class.java,
            "sallie_memory_database"
        ).build()
        
        isInitialized = true
    }
    
    /**
     * Set memory stores for persistence
     */
    fun setMemoryStores(
        episodicStore: EpisodicMemoryStore,
        semanticStore: SemanticMemoryStore,
        emotionalStore: EmotionalMemoryStore,
        indexer: MemoryIndexer
    ) {
        episodicMemoryStore = episodicStore
        semanticMemoryStore = semanticStore
        emotionalMemoryStore = emotionalStore
        memoryIndexer = indexer
    }
    
    /**
     * Load all memories from database
     */
    suspend fun loadAllMemories() = withContext(Dispatchers.IO) {
        if (!isInitialized) throw IllegalStateException("MemoryPersistenceSystem not initialized")
        
        // Load all memories from database
        val episodicEntities = memoryDatabase.episodicMemoryDao().getAllMemories()
        val semanticEntities = memoryDatabase.semanticMemoryDao().getAllMemories()
        val emotionalEntities = memoryDatabase.emotionalMemoryDao().getAllMemories()
        
        // Convert and add to stores
        episodicMemoryStore?.let { store ->
            episodicEntities.forEach { entity ->
                val memory = entity.toEpisodicMemory()
                store.addMemory(memory)
            }
        }
        
        semanticMemoryStore?.let { store ->
            semanticEntities.forEach { entity ->
                val memory = entity.toSemanticMemory()
                store.addMemory(memory)
            }
        }
        
        emotionalMemoryStore?.let { store ->
            emotionalEntities.forEach { entity ->
                val memory = entity.toEmotionalMemory()
                store.addMemory(memory)
            }
        }
        
        // Rebuild memory indices
        memoryIndexer?.rebuildIndices()
    }
    
    /**
     * Save all memories to database
     */
    suspend fun saveAllMemories() = withContext(Dispatchers.IO) {
        if (!isInitialized) throw IllegalStateException("MemoryPersistenceSystem not initialized")
        
        // Save episodic memories
        episodicMemoryStore?.let { store ->
            val memories = store.getAllMemories()
            val entities = memories.map { it.toEpisodicMemoryEntity() }
            memoryDatabase.episodicMemoryDao().insertAll(entities)
        }
        
        // Save semantic memories
        semanticMemoryStore?.let { store ->
            val memories = store.getAllMemories()
            val entities = memories.map { it.toSemanticMemoryEntity() }
            memoryDatabase.semanticMemoryDao().insertAll(entities)
        }
        
        // Save emotional memories
        emotionalMemoryStore?.let { store ->
            val memories = store.getAllMemories()
            val entities = memories.map { it.toEmotionalMemoryEntity() }
            memoryDatabase.emotionalMemoryDao().insertAll(entities)
        }
    }
    
    /**
     * Save a single memory
     */
    suspend fun saveMemory(memoryType: MemoryType, memory: BaseMemory) = withContext(Dispatchers.IO) {
        if (!isInitialized) throw IllegalStateException("MemoryPersistenceSystem not initialized")
        
        when (memoryType) {
            MemoryType.EPISODIC -> {
                if (memory is EpisodicMemory) {
                    val entity = memory.toEpisodicMemoryEntity()
                    memoryDatabase.episodicMemoryDao().insert(entity)
                }
            }
            MemoryType.SEMANTIC -> {
                if (memory is SemanticMemory) {
                    val entity = memory.toSemanticMemoryEntity()
                    memoryDatabase.semanticMemoryDao().insert(entity)
                }
            }
            MemoryType.EMOTIONAL -> {
                if (memory is EmotionalMemory) {
                    val entity = memory.toEmotionalMemoryEntity()
                    memoryDatabase.emotionalMemoryDao().insert(entity)
                }
            }
        }
    }
    
    /**
     * Delete a memory
     */
    suspend fun deleteMemory(memoryType: MemoryType, memoryId: String) = withContext(Dispatchers.IO) {
        if (!isInitialized) throw IllegalStateException("MemoryPersistenceSystem not initialized")
        
        when (memoryType) {
            MemoryType.EPISODIC -> memoryDatabase.episodicMemoryDao().deleteById(memoryId)
            MemoryType.SEMANTIC -> memoryDatabase.semanticMemoryDao().deleteById(memoryId)
            MemoryType.EMOTIONAL -> memoryDatabase.emotionalMemoryDao().deleteById(memoryId)
        }
    }
    
    /**
     * Clear all memories (use with caution)
     */
    suspend fun clearAllMemories() = withContext(Dispatchers.IO) {
        if (!isInitialized) throw IllegalStateException("MemoryPersistenceSystem not initialized")
        
        memoryDatabase.clearAllTables()
        
        // Clear in-memory stores too
        episodicMemoryStore?.clearAll()
        semanticMemoryStore?.clearAll()
        emotionalMemoryStore?.clearAll()
        
        // Rebuild indices (which should now be empty)
        memoryIndexer?.rebuildIndices()
    }
}

/**
 * Room Database for Memory Storage
 */
@Database(
    entities = [
        EpisodicMemoryEntity::class,
        SemanticMemoryEntity::class,
        EmotionalMemoryEntity::class
    ],
    version = 1
)
@TypeConverters(MemoryTypeConverters::class)
abstract class MemoryDatabase : RoomDatabase() {
    abstract fun episodicMemoryDao(): EpisodicMemoryDao
    abstract fun semanticMemoryDao(): SemanticMemoryDao
    abstract fun emotionalMemoryDao(): EmotionalMemoryDao
}

/**
 * Type converters for Room database
 */
class MemoryTypeConverters {
    private val gson = Gson()
    
    @TypeConverter
    fun fromStringList(value: String?): List<String> {
        if (value == null) return emptyList()
        val listType = object : TypeToken<List<String>>() {}.type
        return gson.fromJson(value, listType)
    }
    
    @TypeConverter
    fun toStringList(list: List<String>): String {
        return gson.toJson(list)
    }
    
    @TypeConverter
    fun fromEmotionalValence(value: EmotionalValence): String {
        return value.name
    }
    
    @TypeConverter
    fun toEmotionalValence(value: String): EmotionalValence {
        return try {
            EmotionalValence.valueOf(value)
        } catch (e: Exception) {
            EmotionalValence.NEUTRAL
        }
    }
    
    @TypeConverter
    fun fromStringMap(value: String?): Map<String, String> {
        if (value == null) return emptyMap()
        val mapType = object : TypeToken<Map<String, String>>() {}.type
        return gson.fromJson(value, mapType)
    }
    
    @TypeConverter
    fun toStringMap(map: Map<String, String>): String {
        return gson.toJson(map)
    }
}

/**
 * Room Entity for Episodic Memory
 */
@Entity(tableName = "episodic_memories")
data class EpisodicMemoryEntity(
    @PrimaryKey val id: String,
    val content: String,
    val timestamp: Long,
    val location: String,
    val people: List<String>,
    val emotionalValence: EmotionalValence,
    val importance: Float,
    val associations: List<String>,
    val metadata: Map<String, String>,
    val strengthFactor: Float,
    val lastAccessTimestamp: Long,
    val accessCount: Int
) {
    fun toEpisodicMemory(): EpisodicMemory {
        return EpisodicMemory(
            id = id,
            content = content,
            timestamp = timestamp,
            location = location,
            people = people.toMutableList(),
            emotionalValence = emotionalValence,
            importance = importance,
            associations = associations.toMutableList(),
            metadata = metadata.toMutableMap(),
            strengthFactor = strengthFactor,
            lastAccessTimestamp = lastAccessTimestamp,
            accessCount = accessCount
        )
    }
}

fun EpisodicMemory.toEpisodicMemoryEntity(): EpisodicMemoryEntity {
    return EpisodicMemoryEntity(
        id = id,
        content = content,
        timestamp = timestamp,
        location = location,
        people = people,
        emotionalValence = emotionalValence,
        importance = importance,
        associations = associations,
        metadata = metadata,
        strengthFactor = strengthFactor,
        lastAccessTimestamp = lastAccessTimestamp,
        accessCount = accessCount
    )
}

/**
 * Room Entity for Semantic Memory
 */
@Entity(tableName = "semantic_memories")
data class SemanticMemoryEntity(
    @PrimaryKey val id: String,
    val concept: String,
    val definition: String,
    val timestamp: Long,
    val confidence: Float,
    val source: String,
    val associations: List<String>,
    val metadata: Map<String, String>,
    val strengthFactor: Float,
    val lastAccessTimestamp: Long,
    val accessCount: Int
) {
    fun toSemanticMemory(): SemanticMemory {
        return SemanticMemory(
            id = id,
            concept = concept,
            definition = definition,
            timestamp = timestamp,
            confidence = confidence,
            source = source,
            associations = associations.toMutableList(),
            metadata = metadata.toMutableMap(),
            strengthFactor = strengthFactor,
            lastAccessTimestamp = lastAccessTimestamp,
            accessCount = accessCount
        )
    }
}

fun SemanticMemory.toSemanticMemoryEntity(): SemanticMemoryEntity {
    return SemanticMemoryEntity(
        id = id,
        concept = concept,
        definition = definition,
        timestamp = timestamp,
        confidence = confidence,
        source = source,
        associations = associations,
        metadata = metadata,
        strengthFactor = strengthFactor,
        lastAccessTimestamp = lastAccessTimestamp,
        accessCount = accessCount
    )
}

/**
 * Room Entity for Emotional Memory
 */
@Entity(tableName = "emotional_memories")
data class EmotionalMemoryEntity(
    @PrimaryKey val id: String,
    val trigger: String,
    val response: String,
    val timestamp: Long,
    val emotionalValence: EmotionalValence,
    val intensity: Float,
    val associations: List<String>,
    val metadata: Map<String, String>,
    val strengthFactor: Float,
    val lastAccessTimestamp: Long,
    val accessCount: Int
) {
    fun toEmotionalMemory(): EmotionalMemory {
        return EmotionalMemory(
            id = id,
            trigger = trigger,
            response = response,
            timestamp = timestamp,
            emotionalValence = emotionalValence,
            intensity = intensity,
            associations = associations.toMutableList(),
            metadata = metadata.toMutableMap(),
            strengthFactor = strengthFactor,
            lastAccessTimestamp = lastAccessTimestamp,
            accessCount = accessCount
        )
    }
}

fun EmotionalMemory.toEmotionalMemoryEntity(): EmotionalMemoryEntity {
    return EmotionalMemoryEntity(
        id = id,
        trigger = trigger,
        response = response,
        timestamp = timestamp,
        emotionalValence = emotionalValence,
        intensity = intensity,
        associations = associations,
        metadata = metadata,
        strengthFactor = strengthFactor,
        lastAccessTimestamp = lastAccessTimestamp,
        accessCount = accessCount
    )
}

/**
 * DAO for Episodic Memory
 */
@Dao
interface EpisodicMemoryDao {
    @Query("SELECT * FROM episodic_memories")
    suspend fun getAllMemories(): List<EpisodicMemoryEntity>
    
    @Query("SELECT * FROM episodic_memories WHERE id = :id")
    suspend fun getMemoryById(id: String): EpisodicMemoryEntity?
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(memory: EpisodicMemoryEntity)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(memories: List<EpisodicMemoryEntity>)
    
    @Query("DELETE FROM episodic_memories WHERE id = :id")
    suspend fun deleteById(id: String)
}

/**
 * DAO for Semantic Memory
 */
@Dao
interface SemanticMemoryDao {
    @Query("SELECT * FROM semantic_memories")
    suspend fun getAllMemories(): List<SemanticMemoryEntity>
    
    @Query("SELECT * FROM semantic_memories WHERE id = :id")
    suspend fun getMemoryById(id: String): SemanticMemoryEntity?
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(memory: SemanticMemoryEntity)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(memories: List<SemanticMemoryEntity>)
    
    @Query("DELETE FROM semantic_memories WHERE id = :id")
    suspend fun deleteById(id: String)
}

/**
 * DAO for Emotional Memory
 */
@Dao
interface EmotionalMemoryDao {
    @Query("SELECT * FROM emotional_memories")
    suspend fun getAllMemories(): List<EmotionalMemoryEntity>
    
    @Query("SELECT * FROM emotional_memories WHERE id = :id")
    suspend fun getMemoryById(id: String): EmotionalMemoryEntity?
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(memory: EmotionalMemoryEntity)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(memories: List<EmotionalMemoryEntity>)
    
    @Query("DELETE FROM emotional_memories WHERE id = :id")
    suspend fun deleteById(id: String)
}
