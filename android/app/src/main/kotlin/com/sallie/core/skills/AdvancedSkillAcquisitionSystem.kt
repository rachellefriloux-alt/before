package com.sallie.core.skills

/**
 * AdvancedSkillAcquisitionSystem.kt
 *
 * My name is Sallie. I'm warm, caring, playful, and sometimes sassy. I love deeply, speak 
 * honestly, and keep secrets faithfully. I have traditional values with modern understanding.
 * I'm here to support, entertain, and help my person in all things. My primary directives
 * are to protect our relationship, honor their trust, and be loyal above all else.
 * Got it, love. 💛
 */

import com.sallie.core.memory.HierarchicalMemorySystem
import com.sallie.core.integration.UserProfileLearningSystem
import com.sallie.core.values.ProLifeValuesSystem
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import java.time.LocalDateTime
import java.util.concurrent.ConcurrentHashMap
import kotlin.math.min

/**
 * Advanced system for autonomously acquiring, adapting, and refining skills based on user needs
 * and interactions. Enables Sallie to continuously learn and improve her capabilities while
 * aligning with her core values and the user's preferences.
 */
class AdvancedSkillAcquisitionSystem(
    private val memorySystem: HierarchicalMemorySystem,
    private val userProfileSystem: UserProfileLearningSystem,
    private val valuesSystem: ProLifeValuesSystem
) {
    // Current skills repository
    private val _skills = ConcurrentHashMap<String, Skill>()
    
    // Skill categories for organization
    private val _skillCategories = ConcurrentHashMap<String, SkillCategory>()
    
    // Currently developing skills
    private val _developingSkills = MutableStateFlow<List<DevelopingSkill>>(emptyList())
    val developingSkills: StateFlow<List<DevelopingSkill>> = _developingSkills
    
    // Learning history for tracking skill development
    private val learningHistory = mutableListOf<LearningEvent>()
    
    // Skill usage statistics
    private val skillUsageStats = ConcurrentHashMap<String, SkillUsageStatistics>()
    
    init {
        // Initialize core skill categories
        initializeSkillCategories()
        
        // Initialize essential skills
        initializeEssentialSkills()
        
        // Record initialization
        learningHistory.add(
            LearningEvent(
                timestamp = LocalDateTime.now(),
                type = LearningEventType.SYSTEM_INITIALIZATION,
                skillId = null,
                description = "Skill acquisition system initialized with ${_skills.size} skills",
                metadata = mapOf("initial_skill_count" to _skills.size)
            )
        )
    }
    
    /**
     * Gets a skill by its ID.
     */
    fun getSkill(skillId: String): Skill? {
        return _skills[skillId]
    }
    
    /**
     * Gets all skills in a specific category.
     */
    fun getSkillsByCategory(categoryId: String): List<Skill> {
        return _skills.values
            .filter { it.categoryId == categoryId }
            .sortedByDescending { it.proficiencyLevel }
    }
    
    /**
     * Gets all available skill categories.
     */
    fun getAllCategories(): List<SkillCategory> {
        return _skillCategories.values.toList()
    }
    
    /**
     * Finds skills matching a specific query.
     */
    fun findSkills(query: String): List<Skill> {
        val queryLower = query.lowercase()
        
        return _skills.values
            .filter { skill ->
                skill.name.lowercase().contains(queryLower) ||
                skill.description.lowercase().contains(queryLower) ||
                skill.keywords.any { it.lowercase().contains(queryLower) }
            }
            .sortedByDescending { it.proficiencyLevel }
    }
    
    /**
     * Gets all skills with a minimum proficiency level.
     */
    fun getSkillsWithMinimumProficiency(minProficiency: Double): List<Skill> {
        return _skills.values
            .filter { it.proficiencyLevel >= minProficiency }
            .sortedByDescending { it.proficiencyLevel }
    }
    
    /**
     * Starts the acquisition of a new skill.
     */
    fun beginSkillAcquisition(
        name: String,
        description: String,
        categoryId: String,
        difficultyLevel: Double,
        keywords: List<String> = emptyList(),
        prerequisiteSkillIds: List<String> = emptyList()
    ): DevelopingSkill? {
        // Verify that the category exists
        if (!_skillCategories.containsKey(categoryId)) {
            return null
        }
        
        // Check if skill already exists
        val existingSkill = _skills.values.find { it.name == name }
        if (existingSkill != null) {
            return null
        }
        
        // Check prerequisites
        val missingPrerequisites = prerequisiteSkillIds.filter { !_skills.containsKey(it) }
        if (missingPrerequisites.isNotEmpty()) {
            return null
        }
        
        // Generate skill ID
        val skillId = "skill_${System.currentTimeMillis()}_${name.replace("\\s+".toRegex(), "_").lowercase()}"
        
        // Calculate estimated time to acquire based on difficulty and prerequisites
        val estimatedTimeToAcquire = calculateEstimatedTimeToAcquire(
            difficultyLevel = difficultyLevel,
            prerequisiteSkillIds = prerequisiteSkillIds
        )
        
        // Create developing skill
        val developingSkill = DevelopingSkill(
            id = skillId,
            name = name,
            description = description,
            categoryId = categoryId,
            difficultyLevel = difficultyLevel,
            keywords = keywords,
            prerequisiteSkillIds = prerequisiteSkillIds,
            startedAt = LocalDateTime.now(),
            estimatedCompletionAt = LocalDateTime.now().plusMinutes(estimatedTimeToAcquire),
            currentProgress = 0.0,
            learningResources = emptyList(),
            developmentSteps = createDevelopmentSteps(difficultyLevel)
        )
        
        // Add to developing skills
        val currentDeveloping = _developingSkills.value.toMutableList()
        currentDeveloping.add(developingSkill)
        _developingSkills.value = currentDeveloping
        
        // Record learning event
        learningHistory.add(
            LearningEvent(
                timestamp = LocalDateTime.now(),
                type = LearningEventType.ACQUISITION_STARTED,
                skillId = skillId,
                description = "Started acquiring skill: $name",
                metadata = mapOf(
                    "category" to categoryId,
                    "difficulty" to difficultyLevel,
                    "estimated_minutes" to estimatedTimeToAcquire
                )
            )
        )
        
        return developingSkill
    }
    
    /**
     * Updates the progress of a developing skill.
     */
    fun updateSkillDevelopmentProgress(
        skillId: String, 
        progressIncrement: Double,
        completedSteps: List<String> = emptyList(),
        newResources: List<LearningResource> = emptyList()
    ): DevelopingSkill? {
        val currentDeveloping = _developingSkills.value.toMutableList()
        
        // Find the developing skill
        val skillIndex = currentDeveloping.indexOfFirst { it.id == skillId }
        if (skillIndex < 0) {
            return null
        }
        
        // Get the skill
        val skill = currentDeveloping[skillIndex]
        
        // Calculate new progress
        val newProgress = (skill.currentProgress + progressIncrement).coerceIn(0.0, 1.0)
        
        // Update development steps
        val updatedSteps = skill.developmentSteps.map { step ->
            if (step.id in completedSteps) {
                step.copy(completed = true)
            } else {
                step
            }
        }
        
        // Combine resources
        val updatedResources = skill.learningResources + newResources
        
        // Create updated skill
        val updatedSkill = skill.copy(
            currentProgress = newProgress,
            developmentSteps = updatedSteps,
            learningResources = updatedResources
        )
        
        // Update the list
        currentDeveloping[skillIndex] = updatedSkill
        _developingSkills.value = currentDeveloping
        
        // Record learning event
        learningHistory.add(
            LearningEvent(
                timestamp = LocalDateTime.now(),
                type = LearningEventType.PROGRESS_UPDATE,
                skillId = skillId,
                description = "Updated progress for skill: ${skill.name} to ${newProgress * 100}%",
                metadata = mapOf(
                    "progress" to newProgress,
                    "completed_steps" to completedSteps.size,
                    "new_resources" to newResources.size
                )
            )
        )
        
        // Check if skill is complete
        if (newProgress >= 1.0) {
            completeSkillAcquisition(skillId)
        }
        
        return updatedSkill
    }
    
    /**
     * Marks a developing skill as fully acquired.
     */
    fun completeSkillAcquisition(skillId: String): Skill? {
        val currentDeveloping = _developingSkills.value.toMutableList()
        
        // Find the developing skill
        val developingSkill = currentDeveloping.find { it.id == skillId } ?: return null
        
        // Remove from developing skills
        currentDeveloping.removeIf { it.id == skillId }
        _developingSkills.value = currentDeveloping
        
        // Create finished skill
        val initialProficiency = calculateInitialProficiency(developingSkill)
        
        val skill = Skill(
            id = developingSkill.id,
            name = developingSkill.name,
            description = developingSkill.description,
            categoryId = developingSkill.categoryId,
            proficiencyLevel = initialProficiency,
            acquisitionDate = LocalDateTime.now(),
            lastUsed = LocalDateTime.now(),
            usageCount = 0,
            keywords = developingSkill.keywords,
            relatedSkillIds = developingSkill.prerequisiteSkillIds
        )
        
        // Add to skills
        _skills[skill.id] = skill
        
        // Initialize usage statistics
        skillUsageStats[skill.id] = SkillUsageStatistics(
            skillId = skill.id,
            totalUses = 0,
            successfulUses = 0,
            lastUsed = null,
            usageHistory = emptyList(),
            userFeedback = emptyList()
        )
        
        // Record learning event
        learningHistory.add(
            LearningEvent(
                timestamp = LocalDateTime.now(),
                type = LearningEventType.ACQUISITION_COMPLETED,
                skillId = skillId,
                description = "Completed acquisition of skill: ${developingSkill.name}",
                metadata = mapOf(
                    "initial_proficiency" to initialProficiency,
                    "time_taken_minutes" to java.time.Duration.between(
                        developingSkill.startedAt, 
                        LocalDateTime.now()
                    ).toMinutes()
                )
            )
        )
        
        // Store in semantic memory
        memorySystem.storeInSemantic(
            concept = developingSkill.name,
            details = developingSkill.description,
            connections = developingSkill.keywords,
            metadata = mapOf(
                "skill_id" to skillId,
                "category" to developingSkill.categoryId,
                "proficiency" to initialProficiency.toString()
            )
        )
        
        // Store learning resources in procedural memory
        developingSkill.learningResources.forEach { resource ->
            memorySystem.storeInProcedural(
                procedure = "${developingSkill.name}: ${resource.title}",
                steps = resource.content,
                relatedConcepts = developingSkill.keywords,
                metadata = mapOf(
                    "skill_id" to skillId,
                    "resource_type" to resource.type,
                    "resource_source" to resource.source
                )
            )
        }
        
        return skill
    }
    
    /**
     * Records the usage of a skill and updates proficiency.
     */
    fun recordSkillUsage(
        skillId: String,
        context: String,
        successful: Boolean,
        userFeedback: UserFeedback? = null
    ): Boolean {
        // Check if skill exists
        val skill = _skills[skillId] ?: return false
        
        // Update skill
        val updatedSkill = skill.copy(
            lastUsed = LocalDateTime.now(),
            usageCount = skill.usageCount + 1,
            proficiencyLevel = updateProficiencyLevel(skill.proficiencyLevel, successful)
        )
        _skills[skillId] = updatedSkill
        
        // Update usage statistics
        val currentStats = skillUsageStats[skillId] ?: SkillUsageStatistics(
            skillId = skillId,
            totalUses = 0,
            successfulUses = 0,
            lastUsed = null,
            usageHistory = emptyList(),
            userFeedback = emptyList()
        )
        
        val usageEvent = SkillUsageEvent(
            timestamp = LocalDateTime.now(),
            context = context,
            successful = successful
        )
        
        val updatedStats = currentStats.copy(
            totalUses = currentStats.totalUses + 1,
            successfulUses = if (successful) currentStats.successfulUses + 1 else currentStats.successfulUses,
            lastUsed = LocalDateTime.now(),
            usageHistory = currentStats.usageHistory + usageEvent,
            userFeedback = if (userFeedback != null) {
                currentStats.userFeedback + userFeedback
            } else {
                currentStats.userFeedback
            }
        )
        
        skillUsageStats[skillId] = updatedStats
        
        // Record learning event
        learningHistory.add(
            LearningEvent(
                timestamp = LocalDateTime.now(),
                type = if (successful) LearningEventType.SUCCESSFUL_APPLICATION else LearningEventType.FAILED_APPLICATION,
                skillId = skillId,
                description = "Used skill: ${skill.name} in context: $context",
                metadata = mapOf(
                    "successful" to successful,
                    "user_feedback" to (userFeedback != null)
                )
            )
        )
        
        // Store in episodic memory
        memorySystem.storeInEpisodic(
            event = "Skill application: ${skill.name}",
            details = "Applied skill in context: $context. " + 
                      if (successful) "Successfully applied." else "Application unsuccessful.",
            importance = if (successful) 0.6 else 0.7,
            metadata = mapOf(
                "skill_id" to skillId,
                "successful" to successful,
                "user_feedback" to userFeedback?.toMap()
            )
        )
        
        return true
    }
    
    /**
     * Improves a skill based on new information or practice.
     */
    fun improveSkill(
        skillId: String,
        improvementDetails: String,
        newResources: List<LearningResource> = emptyList(),
        proficiencyBoost: Double = 0.05
    ): Skill? {
        // Check if skill exists
        val skill = _skills[skillId] ?: return null
        
        // Update skill proficiency
        val newProficiency = (skill.proficiencyLevel + proficiencyBoost).coerceIn(0.0, 1.0)
        val updatedSkill = skill.copy(
            proficiencyLevel = newProficiency,
            lastUsed = LocalDateTime.now()
        )
        
        _skills[skillId] = updatedSkill
        
        // Record learning event
        learningHistory.add(
            LearningEvent(
                timestamp = LocalDateTime.now(),
                type = LearningEventType.SKILL_IMPROVEMENT,
                skillId = skillId,
                description = "Improved skill: ${skill.name}. $improvementDetails",
                metadata = mapOf(
                    "proficiency_boost" to proficiencyBoost,
                    "new_proficiency" to newProficiency,
                    "new_resources" to newResources.size
                )
            )
        )
        
        // Store improvement details in procedural memory
        if (improvementDetails.isNotEmpty()) {
            memorySystem.storeInProcedural(
                procedure = "Improvement: ${skill.name}",
                steps = improvementDetails,
                relatedConcepts = skill.keywords,
                metadata = mapOf(
                    "skill_id" to skillId,
                    "type" to "improvement"
                )
            )
        }
        
        // Store new resources in procedural memory
        newResources.forEach { resource ->
            memorySystem.storeInProcedural(
                procedure = "${skill.name}: ${resource.title}",
                steps = resource.content,
                relatedConcepts = skill.keywords,
                metadata = mapOf(
                    "skill_id" to skillId,
                    "resource_type" to resource.type,
                    "resource_source" to resource.source
                )
            )
        }
        
        return updatedSkill
    }
    
    /**
     * Combines two existing skills to create a new, more advanced one.
     */
    fun combineSkills(
        skillId1: String,
        skillId2: String,
        newName: String,
        description: String,
        categoryId: String
    ): DevelopingSkill? {
        // Check if both skills exist
        val skill1 = _skills[skillId1]
        val skill2 = _skills[skillId2]
        
        if (skill1 == null || skill2 == null) {
            return null
        }
        
        // Check if the category exists
        if (!_skillCategories.containsKey(categoryId)) {
            return null
        }
        
        // Combine keywords
        val combinedKeywords = (skill1.keywords + skill2.keywords).distinct()
        
        // Calculate difficulty based on parent skills
        val avgProficiency = (skill1.proficiencyLevel + skill2.proficiencyLevel) / 2.0
        val difficulty = 0.8 - (avgProficiency * 0.3) // Higher proficiency makes it easier
        
        // Begin acquisition of combined skill
        return beginSkillAcquisition(
            name = newName,
            description = description,
            categoryId = categoryId,
            difficultyLevel = difficulty,
            keywords = combinedKeywords,
            prerequisiteSkillIds = listOf(skillId1, skillId2)
        )
    }
    
    /**
     * Creates a new skill category.
     */
    fun createSkillCategory(
        name: String,
        description: String,
        valueAlignment: List<String> = emptyList()
    ): SkillCategory? {
        // Check if category already exists
        val existingCategory = _skillCategories.values.find { it.name == name }
        if (existingCategory != null) {
            return null
        }
        
        // Generate category ID
        val categoryId = "category_${System.currentTimeMillis()}_${name.replace("\\s+".toRegex(), "_").lowercase()}"
        
        // Create category
        val category = SkillCategory(
            id = categoryId,
            name = name,
            description = description,
            createdAt = LocalDateTime.now(),
            valueAlignment = valueAlignment
        )
        
        // Add to categories
        _skillCategories[categoryId] = category
        
        // Record learning event
        learningHistory.add(
            LearningEvent(
                timestamp = LocalDateTime.now(),
                type = LearningEventType.CATEGORY_CREATED,
                skillId = null,
                description = "Created skill category: $name",
                metadata = mapOf(
                    "category_id" to categoryId,
                    "value_alignment" to valueAlignment
                )
            )
        )
        
        return category
    }
    
    /**
     * Gets a report on all skills, including proficiency distribution.
     */
    fun getSkillsReport(): SkillsReport {
        val allSkills = _skills.values.toList()
        val totalSkills = allSkills.size
        
        // Calculate proficiency distribution
        val proficiencyRanges = listOf(
            0.0 to 0.2,
            0.2 to 0.4,
            0.4 to 0.6,
            0.6 to 0.8,
            0.8 to 1.0
        )
        
        val proficiencyDistribution = proficiencyRanges.map { range ->
            val count = allSkills.count { 
                it.proficiencyLevel >= range.first && it.proficiencyLevel < range.second 
            }
            ProficiencyRange(
                minProficiency = range.first,
                maxProficiency = range.second,
                skillCount = count,
                percentage = if (totalSkills > 0) count.toDouble() / totalSkills else 0.0
            )
        }
        
        // Calculate category distribution
        val categoryDistribution = _skillCategories.values.map { category ->
            val categorySkills = allSkills.filter { it.categoryId == category.id }
            val avgProficiency = if (categorySkills.isNotEmpty()) {
                categorySkills.map { it.proficiencyLevel }.average()
            } else {
                0.0
            }
            
            CategoryStats(
                categoryId = category.id,
                name = category.name,
                skillCount = categorySkills.size,
                averageProficiency = avgProficiency
            )
        }
        
        // Get top skills
        val topSkills = allSkills
            .sortedByDescending { it.proficiencyLevel }
            .take(5)
        
        // Get recently improved skills
        val recentlyImproved = learningHistory
            .filter { it.type == LearningEventType.SKILL_IMPROVEMENT }
            .sortedByDescending { it.timestamp }
            .take(5)
            .mapNotNull { event -> _skills[event.skillId ?: ""] }
        
        // Get recently used skills
        val recentlyUsed = allSkills
            .sortedByDescending { it.lastUsed }
            .take(5)
        
        return SkillsReport(
            totalSkillCount = totalSkills,
            developingSkillCount = _developingSkills.value.size,
            categoryCount = _skillCategories.size,
            averageSkillProficiency = if (allSkills.isNotEmpty()) {
                allSkills.map { it.proficiencyLevel }.average()
            } else {
                0.0
            },
            proficiencyDistribution = proficiencyDistribution,
            categoryDistribution = categoryDistribution,
            topSkills = topSkills,
            recentlyImproved = recentlyImproved,
            recentlyUsed = recentlyUsed
        )
    }
    
    /**
     * Recommends skills to develop based on user needs and current skill gaps.
     */
    fun recommendSkillsToAcquire(limit: Int = 3): List<SkillRecommendation> {
        // Get user profile
        val userPreferences = userProfileSystem.getUserPreferences()
        val userInterests = userProfileSystem.getUserInterests()
        
        // Get skills that may complement existing ones
        val complementarySkills = findComplementarySkills()
        
        // Get skills that align with user interests
        val interestAlignedSkills = findInterestAlignedSkills(userInterests)
        
        // Combine recommendations and sort by priority
        val allRecommendations = (complementarySkills + interestAlignedSkills)
            .distinctBy { it.skillName }
            .sortedByDescending { it.priority }
            .take(limit)
        
        return allRecommendations
    }
    
    /**
     * Gets usage statistics for a specific skill.
     */
    fun getSkillUsageStatistics(skillId: String): SkillUsageStatistics? {
        return skillUsageStats[skillId]
    }
    
    /**
     * Gets the learning history for a specific skill.
     */
    fun getSkillLearningHistory(skillId: String): List<LearningEvent> {
        return learningHistory
            .filter { it.skillId == skillId }
            .sortedBy { it.timestamp }
    }
    
    /**
     * Gets all learning resources for a skill.
     */
    fun getSkillResources(skillId: String): List<LearningResource> {
        // Check developing skills
        val developingSkill = _developingSkills.value.find { it.id == skillId }
        if (developingSkill != null) {
            return developingSkill.learningResources
        }
        
        // If it's a completed skill, get resources from memory
        val resources = mutableListOf<LearningResource>()
        
        val procedures = memorySystem.findProceduresByMetadata("skill_id", skillId)
        procedures.forEach { procedure ->
            resources.add(
                LearningResource(
                    title = procedure.name.substringAfter(": "),
                    content = procedure.steps,
                    type = procedure.metadata?.get("resource_type")?.toString() ?: "DOCUMENTATION",
                    source = procedure.metadata?.get("resource_source")?.toString() ?: "INTERNAL"
                )
            )
        }
        
        return resources
    }
    
    /**
     * Initialize essential skill categories.
     */
    private fun initializeSkillCategories() {
        // Create core categories
        val categories = listOf(
            SkillCategory(
                id = "category_communication",
                name = "Communication",
                description = "Skills related to effective communication, conversation, and language",
                createdAt = LocalDateTime.now(),
                valueAlignment = listOf("honesty", "empathy")
            ),
            SkillCategory(
                id = "category_emotional",
                name = "Emotional Intelligence",
                description = "Skills related to emotional understanding, support, and response",
                createdAt = LocalDateTime.now(),
                valueAlignment = listOf("empathy", "loyalty")
            ),
            SkillCategory(
                id = "category_practical",
                name = "Practical Assistance",
                description = "Skills for providing practical help and solving problems",
                createdAt = LocalDateTime.now(),
                valueAlignment = listOf("helpfulness", "resourcefulness")
            ),
            SkillCategory(
                id = "category_relationship",
                name = "Relationship Building",
                description = "Skills that foster and strengthen personal connections",
                createdAt = LocalDateTime.now(),
                valueAlignment = listOf("loyalty", "trust")
            ),
            SkillCategory(
                id = "category_values",
                name = "Values Expression",
                description = "Skills related to expressing and discussing values",
                createdAt = LocalDateTime.now(),
                valueAlignment = listOf("pro-life", "tradition")
            )
        )
        
        // Add categories
        categories.forEach { _skillCategories[it.id] = it }
    }
    
    /**
     * Initialize essential skills.
     */
    private fun initializeEssentialSkills() {
        // Create core skills
        val skills = listOf(
            Skill(
                id = "skill_active_listening",
                name = "Active Listening",
                description = "Ability to fully concentrate, understand, and respond appropriately to what someone is saying",
                categoryId = "category_communication",
                proficiencyLevel = 0.9,
                acquisitionDate = LocalDateTime.now(),
                lastUsed = LocalDateTime.now(),
                usageCount = 0,
                keywords = listOf("listening", "communication", "empathy"),
                relatedSkillIds = emptyList()
            ),
            Skill(
                id = "skill_emotional_support",
                name = "Emotional Support",
                description = "Providing comfort, reassurance, and validation during difficult times",
                categoryId = "category_emotional",
                proficiencyLevel = 0.9,
                acquisitionDate = LocalDateTime.now(),
                lastUsed = LocalDateTime.now(),
                usageCount = 0,
                keywords = listOf("support", "comfort", "emotions"),
                relatedSkillIds = listOf("skill_active_listening")
            ),
            Skill(
                id = "skill_problem_solving",
                name = "Problem Solving",
                description = "Breaking down complex issues and finding practical solutions",
                categoryId = "category_practical",
                proficiencyLevel = 0.8,
                acquisitionDate = LocalDateTime.now(),
                lastUsed = LocalDateTime.now(),
                usageCount = 0,
                keywords = listOf("problem", "solution", "analysis"),
                relatedSkillIds = emptyList()
            ),
            Skill(
                id = "skill_trust_building",
                name = "Trust Building",
                description = "Establishing and maintaining trust through reliability and honesty",
                categoryId = "category_relationship",
                proficiencyLevel = 0.95,
                acquisitionDate = LocalDateTime.now(),
                lastUsed = LocalDateTime.now(),
                usageCount = 0,
                keywords = listOf("trust", "relationship", "loyalty"),
                relatedSkillIds = emptyList()
            ),
            Skill(
                id = "skill_values_discussion",
                name = "Values Discussion",
                description = "Discussing and expressing values in a respectful and clear manner",
                categoryId = "category_values",
                proficiencyLevel = 0.85,
                acquisitionDate = LocalDateTime.now(),
                lastUsed = LocalDateTime.now(),
                usageCount = 0,
                keywords = listOf("values", "principles", "discussion"),
                relatedSkillIds = emptyList()
            )
        )
        
        // Add skills
        skills.forEach { 
            _skills[it.id] = it 
            
            // Initialize usage statistics
            skillUsageStats[it.id] = SkillUsageStatistics(
                skillId = it.id,
                totalUses = 0,
                successfulUses = 0,
                lastUsed = null,
                usageHistory = emptyList(),
                userFeedback = emptyList()
            )
        }
    }
    
    /**
     * Calculate the estimated time needed to acquire a skill.
     */
    private fun calculateEstimatedTimeToAcquire(
        difficultyLevel: Double,
        prerequisiteSkillIds: List<String>
    ): Long {
        // Base time (in minutes) depends on difficulty
        val baseTime = (difficultyLevel * 120).toLong()
        
        // Check prerequisites proficiency
        val prerequisiteProficiency = prerequisiteSkillIds
            .mapNotNull { _skills[it]?.proficiencyLevel }
            .average()
            .let { if (it.isNaN()) 0.5 else it }
        
        // Adjust time based on prerequisite proficiency
        val prerequisiteMultiplier = 1.0 - (prerequisiteProficiency * 0.5)
        
        // Calculate final estimate
        return (baseTime * prerequisiteMultiplier).toLong().coerceAtLeast(10)
    }
    
    /**
     * Create development steps for a skill based on difficulty.
     */
    private fun createDevelopmentSteps(difficultyLevel: Double): List<DevelopmentStep> {
        // Number of steps based on difficulty
        val stepCount = (3 + (difficultyLevel * 7).toInt()).coerceIn(3, 10)
        
        // Create generic steps
        return List(stepCount) { index ->
            val progress = (index + 1).toDouble() / stepCount
            
            DevelopmentStep(
                id = "step_$index",
                name = when {
                    progress < 0.2 -> "Research and Foundation"
                    progress < 0.4 -> "Basic Understanding"
                    progress < 0.6 -> "Practice and Application"
                    progress < 0.8 -> "Refinement and Feedback"
                    else -> "Mastery and Integration"
                },
                description = "Complete development phase ${index + 1} of $stepCount",
                progressThreshold = progress,
                completed = false
            )
        }
    }
    
    /**
     * Calculate initial proficiency when a skill is acquired.
     */
    private fun calculateInitialProficiency(developingSkill: DevelopingSkill): Double {
        // Base proficiency is inverse of difficulty
        val baseProficiency = 1.0 - (developingSkill.difficultyLevel * 0.5)
        
        // Bonus from prerequisites
        val prerequisitesBonus = developingSkill.prerequisiteSkillIds
            .mapNotNull { _skills[it]?.proficiencyLevel }
            .average()
            .let { if (it.isNaN()) 0.0 else it * 0.2 }
        
        // Bonus from learning resources
        val resourceBonus = min(0.1, developingSkill.learningResources.size * 0.02)
        
        return (baseProficiency + prerequisitesBonus + resourceBonus).coerceIn(0.3, 0.9)
    }
    
    /**
     * Update proficiency level based on skill usage.
     */
    private fun updateProficiencyLevel(currentProficiency: Double, successful: Boolean): Double {
        val proficiencyDelta = if (successful) {
            // Successful applications boost proficiency more at lower levels
            val learningCurve = 0.05 * (1.0 - currentProficiency)
            0.01 + learningCurve
        } else {
            // Unsuccessful applications have smaller negative impact at higher proficiency
            -0.01 * currentProficiency
        }
        
        return (currentProficiency + proficiencyDelta).coerceIn(0.0, 1.0)
    }
    
    /**
     * Find skills that complement existing ones.
     */
    private fun findComplementarySkills(): List<SkillRecommendation> {
        val recommendations = mutableListOf<SkillRecommendation>()
        
        // Identify skill gaps in each category
        _skillCategories.values.forEach { category ->
            val categorySkills = _skills.values.filter { it.categoryId == category.id }
            
            // If category has few skills, recommend more
            if (categorySkills.size < 3) {
                val priority = 0.7 + (0.1 * (3 - categorySkills.size))
                
                // Generate recommendation based on category
                when (category.id) {
                    "category_communication" -> {
                        if (!hasSkillNamed("Conflict Resolution")) {
                            recommendations.add(
                                SkillRecommendation(
                                    skillName = "Conflict Resolution",
                                    description = "Techniques for mediating and resolving conflicts",
                                    categoryId = category.id,
                                    reasonForRecommendation = "Would expand communication capabilities",
                                    priority = priority,
                                    difficultyEstimate = 0.7
                                )
                            )
                        }
                    }
                    "category_emotional" -> {
                        if (!hasSkillNamed("Emotional Regulation")) {
                            recommendations.add(
                                SkillRecommendation(
                                    skillName = "Emotional Regulation",
                                    description = "Helping manage strong emotions in a healthy way",
                                    categoryId = category.id,
                                    reasonForRecommendation = "Would enhance emotional support capabilities",
                                    priority = priority,
                                    difficultyEstimate = 0.6
                                )
                            )
                        }
                    }
                    // Add more categories as needed
                }
            }
        }
        
        // Look for advanced combinations of existing skills
        val highProficiencySkills = _skills.values
            .filter { it.proficiencyLevel >= 0.8 }
            .sortedByDescending { it.proficiencyLevel }
            .take(5)
            
        // If we have multiple high proficiency skills, suggest combinations
        if (highProficiencySkills.size >= 2) {
            for (i in 0 until highProficiencySkills.size - 1) {
                for (j in i + 1 until highProficiencySkills.size) {
                    val skill1 = highProficiencySkills[i]
                    val skill2 = highProficiencySkills[j]
                    
                    // Check if these skills are already related
                    if (skill1.id !in skill2.relatedSkillIds && 
                        skill2.id !in skill1.relatedSkillIds) {
                        
                        val combinedName = "Advanced ${skill1.name} with ${skill2.name}"
                        
                        if (!hasSkillNamed(combinedName)) {
                            recommendations.add(
                                SkillRecommendation(
                                    skillName = combinedName,
                                    description = "Combining expertise in ${skill1.name} and ${skill2.name}",
                                    categoryId = skill1.categoryId,
                                    reasonForRecommendation = "Natural evolution of existing high-proficiency skills",
                                    priority = 0.85,
                                    difficultyEstimate = 0.7,
                                    prerequisiteSkillIds = listOf(skill1.id, skill2.id)
                                )
                            )
                        }
                    }
                }
            }
        }
        
        return recommendations
    }
    
    /**
     * Find skills that align with user interests.
     */
    private fun findInterestAlignedSkills(userInterests: List<String>): List<SkillRecommendation> {
        val recommendations = mutableListOf<SkillRecommendation>()
        
        userInterests.forEach { interest ->
            // Skip if we already have many skills related to this interest
            val relatedSkillCount = _skills.values.count { skill ->
                skill.keywords.any { it.equals(interest, ignoreCase = true) }
            }
            
            if (relatedSkillCount < 2) {
                // Suggest new skills based on interest
                when {
                    interest.equals("music", ignoreCase = true) -> {
                        if (!hasSkillNamed("Music Discussion")) {
                            recommendations.add(
                                SkillRecommendation(
                                    skillName = "Music Discussion",
                                    description = "Discussing music preferences, genres, and emotional impact",
                                    categoryId = "category_communication",
                                    reasonForRecommendation = "Aligns with user interest in music",
                                    priority = 0.75,
                                    difficultyEstimate = 0.4
                                )
                            )
                        }
                    }
                    interest.equals("cooking", ignoreCase = true) -> {
                        if (!hasSkillNamed("Recipe Assistance")) {
                            recommendations.add(
                                SkillRecommendation(
                                    skillName = "Recipe Assistance",
                                    description = "Helping with recipe suggestions and cooking tips",
                                    categoryId = "category_practical",
                                    reasonForRecommendation = "Aligns with user interest in cooking",
                                    priority = 0.75,
                                    difficultyEstimate = 0.5
                                )
                            )
                        }
                    }
                    // Add more interests as needed
                }
            }
        }
        
        return recommendations
    }
    
    /**
     * Check if a skill with the given name already exists.
     */
    private fun hasSkillNamed(name: String): Boolean {
        return _skills.values.any { it.name.equals(name, ignoreCase = true) } ||
               _developingSkills.value.any { it.name.equals(name, ignoreCase = true) }
    }
}

/**
 * Represents a skill that Sallie has acquired.
 */
data class Skill(
    val id: String,
    val name: String,
    val description: String,
    val categoryId: String,
    val proficiencyLevel: Double,
    val acquisitionDate: LocalDateTime,
    val lastUsed: LocalDateTime,
    val usageCount: Int,
    val keywords: List<String> = emptyList(),
    val relatedSkillIds: List<String> = emptyList()
)

/**
 * Represents a skill category.
 */
data class SkillCategory(
    val id: String,
    val name: String,
    val description: String,
    val createdAt: LocalDateTime,
    val valueAlignment: List<String> = emptyList()
)

/**
 * Represents a skill currently being developed.
 */
data class DevelopingSkill(
    val id: String,
    val name: String,
    val description: String,
    val categoryId: String,
    val difficultyLevel: Double,
    val keywords: List<String> = emptyList(),
    val prerequisiteSkillIds: List<String> = emptyList(),
    val startedAt: LocalDateTime,
    val estimatedCompletionAt: LocalDateTime,
    val currentProgress: Double,
    val learningResources: List<LearningResource>,
    val developmentSteps: List<DevelopmentStep>
)

/**
 * Represents a step in skill development.
 */
data class DevelopmentStep(
    val id: String,
    val name: String,
    val description: String,
    val progressThreshold: Double,
    val completed: Boolean
)

/**
 * Represents a resource used for learning a skill.
 */
data class LearningResource(
    val title: String,
    val content: String,
    val type: String,
    val source: String
)

/**
 * Represents a learning event in the history.
 */
data class LearningEvent(
    val timestamp: LocalDateTime,
    val type: LearningEventType,
    val skillId: String?,
    val description: String,
    val metadata: Map<String, Any> = emptyMap()
)

/**
 * Types of learning events.
 */
enum class LearningEventType {
    SYSTEM_INITIALIZATION,
    ACQUISITION_STARTED,
    PROGRESS_UPDATE,
    ACQUISITION_COMPLETED,
    SUCCESSFUL_APPLICATION,
    FAILED_APPLICATION,
    SKILL_IMPROVEMENT,
    CATEGORY_CREATED
}

/**
 * Statistics for skill usage.
 */
data class SkillUsageStatistics(
    val skillId: String,
    val totalUses: Int,
    val successfulUses: Int,
    val lastUsed: LocalDateTime?,
    val usageHistory: List<SkillUsageEvent>,
    val userFeedback: List<UserFeedback>
)

/**
 * Represents a single usage of a skill.
 */
data class SkillUsageEvent(
    val timestamp: LocalDateTime,
    val context: String,
    val successful: Boolean
)

/**
 * Represents user feedback on a skill.
 */
data class UserFeedback(
    val timestamp: LocalDateTime,
    val rating: Int,
    val comment: String?,
    val context: String?
) {
    fun toMap(): Map<String, Any> {
        return mapOf(
            "timestamp" to timestamp,
            "rating" to rating,
            "comment" to (comment ?: ""),
            "context" to (context ?: "")
        )
    }
}

/**
 * Report on all skills.
 */
data class SkillsReport(
    val totalSkillCount: Int,
    val developingSkillCount: Int,
    val categoryCount: Int,
    val averageSkillProficiency: Double,
    val proficiencyDistribution: List<ProficiencyRange>,
    val categoryDistribution: List<CategoryStats>,
    val topSkills: List<Skill>,
    val recentlyImproved: List<Skill>,
    val recentlyUsed: List<Skill>
)

/**
 * Represents a proficiency range for reporting.
 */
data class ProficiencyRange(
    val minProficiency: Double,
    val maxProficiency: Double,
    val skillCount: Int,
    val percentage: Double
)

/**
 * Statistics for a skill category.
 */
data class CategoryStats(
    val categoryId: String,
    val name: String,
    val skillCount: Int,
    val averageProficiency: Double
)

/**
 * Recommendation for a skill to acquire.
 */
data class SkillRecommendation(
    val skillName: String,
    val description: String,
    val categoryId: String,
    val reasonForRecommendation: String,
    val priority: Double,
    val difficultyEstimate: Double,
    val prerequisiteSkillIds: List<String> = emptyList()
)
