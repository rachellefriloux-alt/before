

/*
Salle Persona Module: AutonomousTaskSystem
Implements advanced task planning, execution, monitoring, and self-correction capabilities.
Follows Salle architecture, modularity, and privacy rules.
*/

type TaskStatus = 'planned' | 'in-progress' | 'completed' | 'failed' | 'paused';
type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

interface Task {
  id: string;
  name: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  assignedTo: string; // userId
  requiredSkills: string[];
  subtasks: Task[];
  dependencies: string[]; // Task IDs
  progress: number; // 0-100
  result?: string;
  errorLog?: string[];
}

interface TaskPlan {
  taskId: string;
  steps: {
    stepId: string;
    description: string;
    completed: boolean;
    skillRequired?: string;
  }[];
}

export class AutonomousTaskSystem {
  private tasks: Map<string, Task> = new Map();
  private taskPlans: Map<string, TaskPlan> = new Map();
  
  /**
   * Create a new task
   */
  createTask(
    name: string,
    description: string,
    priority: TaskPriority,
    assignedTo: string,
    requiredSkills: string[] = []
  ): Task {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const task: Task = {
      id: taskId,
      name,
      description,
      status: 'planned',
      priority,
      createdAt: Date.now(),
      assignedTo,
      requiredSkills,
      subtasks: [],
      dependencies: [],
      progress: 0
    };
    
    this.tasks.set(taskId, task);
    return task;
  }
  
  /**
   * Plan execution steps for a task
   */
  planTask(taskId: string): TaskPlan | null {
    const task = this.tasks.get(taskId);
    if (!task) return null;
    
    // Create plan steps based on task description and requirements
    const steps: TaskPlan['steps'] = [];
    
    // Basic analysis of task description to extract potential steps
    const descriptionWords = task.description.toLowerCase().split(/\W+/);
    const actionWords = ['create', 'analyze', 'build', 'review', 'implement', 'design', 'test', 'deploy'];
    
    // Find action words in description
    const foundActions = actionWords.filter(action => 
      descriptionWords.includes(action)
    );
    
    // Create steps for each action word found
    foundActions.forEach((action, index) => {
      steps.push({
        stepId: `step_${taskId}_${index}`,
        description: `${action.charAt(0).toUpperCase() + action.slice(1)} ${task.name}`,
        completed: false,
        skillRequired: task.requiredSkills[index % task.requiredSkills.length]
      });
    });
    
    // Ensure at least basic steps if no action words found
    if (steps.length === 0) {
      steps.push({
        stepId: `step_${taskId}_1`,
        description: `Analyze requirements for ${task.name}`,
        completed: false
      });
      
      steps.push({
        stepId: `step_${taskId}_2`,
        description: `Execute ${task.name}`,
        completed: false
      });
      
      steps.push({
        stepId: `step_${taskId}_3`,
        description: `Verify results of ${task.name}`,
        completed: false
      });
    }
    
    // Create plan
    const plan: TaskPlan = {
      taskId,
      steps
    };
    
    this.taskPlans.set(taskId, plan);
    return plan;
  }
  
  /**
   * Start executing a task
   */
  async startTask(taskId: string, checkSkills: boolean = true, skillProvider?: any): Promise<boolean> {
    const task = this.tasks.get(taskId);
    if (!task) return false;
    
    // Check if task can be started
    if (task.status !== 'planned') return false;
    
    // Check dependencies
    for (const depId of task.dependencies) {
      const dep = this.tasks.get(depId);
      if (!dep || dep.status !== 'completed') return false;
    }
    
    // Check skills if required
    if (checkSkills && skillProvider && task.requiredSkills.length > 0) {
      for (const skill of task.requiredSkills) {
        const hasSkill = await this.ensureSkillAvailable(skill, skillProvider);
        if (!hasSkill) return false;
      }
    }
    
    // Update task status
    task.status = 'in-progress';
    task.startedAt = Date.now();
    
    // Get or create plan
    let plan = this.taskPlans.get(taskId);
    if (!plan) {
      plan = this.planTask(taskId);
      if (!plan) return false;
    }
    
    return true;
  }
  
  /**
   * Ensure a required skill is available
   */
  private async ensureSkillAvailable(skillName: string, skillProvider: any): Promise<boolean> {
    // Check if skill provider has the skill already
    const availableSkills = skillProvider.getAvailableSkills?.();
    if (availableSkills) {
      const hasSkill = availableSkills.some(
        (s: any) => s.skillName.toLowerCase() === skillName.toLowerCase() && 
        (s.proficiency === 'intermediate' || s.proficiency === 'advanced' || s.proficiency === 'expert')
      );
      
      if (hasSkill) return true;
    }
    
    // If not, try to learn the skill
    if (skillProvider.learnSkill) {
      try {
        await skillProvider.learnSkill(skillName, `Skill needed for task execution`);
        return true;
      } catch (error) {
        console.error(`Failed to learn skill ${skillName}:`, error);
        return false;
      }
    }
    
    return false;
  }
  
  /**
   * Execute a single step of a task
   */
  async executeTaskStep(taskId: string, stepId: string, skillProvider?: any): Promise<boolean> {
    const task = this.tasks.get(taskId);
    const plan = this.taskPlans.get(taskId);
    
    if (!task || !plan) return false;
    if (task.status !== 'in-progress') return false;
    
    // Find the step
    const step = plan.steps.find(s => s.stepId === stepId);
    if (!step || step.completed) return false;
    
    // If step requires skill, use skillProvider to apply it
    if (step.skillRequired && skillProvider) {
      try {
        const result = skillProvider.applySkill(
          step.skillRequired,
          `${task.name} - ${step.description}`
        );
        
        // Add result to task log
        task.result = task.result ? `${task.result}\n${result}` : result;
      } catch (error) {
        // Log error
        if (!task.errorLog) task.errorLog = [];
        task.errorLog.push(`Error in step ${step.description}: ${error}`);
        return false;
      }
    }
    
    // Mark step as completed
    step.completed = true;
    
    // Update task progress
    const completedSteps = plan.steps.filter(s => s.completed).length;
    task.progress = Math.floor((completedSteps / plan.steps.length) * 100);
    
    // Check if all steps completed
    if (task.progress === 100) {
      task.status = 'completed';
      task.completedAt = Date.now();
    }
    
    return true;
  }
  
  /**
   * Execute entire task automatically
   */
  async executeTaskAutonomously(taskId: string, skillProvider?: any): Promise<string> {
    const task = this.tasks.get(taskId);
    if (!task) return `Task not found: ${taskId}`;
    
    // Start the task
    const started = await this.startTask(taskId, true, skillProvider);
    if (!started) return `Failed to start task: ${task.name}`;
    
    // Get the plan
    const plan = this.taskPlans.get(taskId);
    if (!plan) return `No plan available for task: ${task.name}`;
    
    // Execute each step
    for (const step of plan.steps) {
      const success = await this.executeTaskStep(taskId, step.stepId, skillProvider);
      
      if (!success) {
        task.status = 'failed';
        return `Failed during step: ${step.description}`;
      }
      
      // Simulate some processing time
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Return results
    if (task.status === 'completed') {
      return task.result || `Successfully completed task: ${task.name}`;
    } else {
      return `Task execution incomplete: ${task.progress}% done`;
    }
  }
  
  /**
   * Add a subtask to an existing task
   */
  addSubtask(parentTaskId: string, subtaskName: string, subtaskDescription: string): Task | null {
    const parentTask = this.tasks.get(parentTaskId);
    if (!parentTask) return null;
    
    const subtask = this.createTask(
      subtaskName,
      subtaskDescription,
      parentTask.priority,
      parentTask.assignedTo,
      parentTask.requiredSkills
    );
    
    // Add to parent's subtasks
    parentTask.subtasks.push(subtask);
    
    return subtask;
  }
  
  /**
   * Add a dependency between tasks
   */
  addTaskDependency(taskId: string, dependsOnTaskId: string): boolean {
    const task = this.tasks.get(taskId);
    const dependencyTask = this.tasks.get(dependsOnTaskId);
    
    if (!task || !dependencyTask) return false;
    
    // Avoid circular dependencies
    if (this.wouldCreateCircularDependency(taskId, dependsOnTaskId)) {
      return false;
    }
    
    // Add dependency
    if (!task.dependencies.includes(dependsOnTaskId)) {
      task.dependencies.push(dependsOnTaskId);
    }
    
    return true;
  }
  
  /**
   * Check if adding a dependency would create a circular reference
   */
  private wouldCreateCircularDependency(taskId: string, dependsOnTaskId: string): boolean {
    // Check if dependsOnTask already depends on task
    const dependencyTask = this.tasks.get(dependsOnTaskId);
    if (!dependencyTask) return false;
    
    if (dependencyTask.dependencies.includes(taskId)) return true;
    
    // Check recursively through all dependencies
    for (const depId of dependencyTask.dependencies) {
      if (this.wouldCreateCircularDependency(taskId, depId)) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Get all tasks assigned to a user
   */
  getTasksForUser(userId: string): Task[] {
    return Array.from(this.tasks.values())
      .filter(task => task.assignedTo === userId);
  }
  
  /**
   * Get task by ID
   */
  getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }
  
  /**
   * Get task plan
   */
  getTaskPlan(taskId: string): TaskPlan | undefined {
    return this.taskPlans.get(taskId);
  }
}


/*
Salle Persona Module: AutonomousTaskSystem
Implements advanced task planning, execution, monitoring, and self-correction capabilities.
Follows Salle architecture, modularity, and privacy rules.
*/

type TaskStatus = 'planned' | 'in-progress' | 'completed' | 'failed' | 'paused';
type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

interface Task {
  id: string;
  name: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  assignedTo: string; // userId
  requiredSkills: string[];
  subtasks: Task[];
  dependencies: string[]; // Task IDs
  progress: number; // 0-100
  result?: string;
  errorLog?: string[];
}

interface TaskPlan {
  taskId: string;
  steps: {
    stepId: string;
    description: string;
    completed: boolean;
    skillRequired?: string;
  }[];
}

export class AutonomousTaskSystem {
  private tasks: Map<string, Task> = new Map();
  private taskPlans: Map<string, TaskPlan> = new Map();
  
  /**
   * Create a new task
   */
  createTask(
    name: string,
    description: string,
    priority: TaskPriority,
    assignedTo: string,
    requiredSkills: string[] = []
  ): Task {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const task: Task = {
      id: taskId,
      name,
      description,
      status: 'planned',
      priority,
      createdAt: Date.now(),
      assignedTo,
      requiredSkills,
      subtasks: [],
      dependencies: [],
      progress: 0
    };
    
    this.tasks.set(taskId, task);
    return task;
  }
  
  /**
   * Plan execution steps for a task
   */
  planTask(taskId: string): TaskPlan | null {
    const task = this.tasks.get(taskId);
    if (!task) return null;
    
    // Create plan steps based on task description and requirements
    const steps: TaskPlan['steps'] = [];
    
    // Basic analysis of task description to extract potential steps
    const descriptionWords = task.description.toLowerCase().split(/\W+/);
    const actionWords = ['create', 'analyze', 'build', 'review', 'implement', 'design', 'test', 'deploy'];
    
    // Find action words in description
    const foundActions = actionWords.filter(action => 
      descriptionWords.includes(action)
    );
    
    // Create steps for each action word found
    foundActions.forEach((action, index) => {
      steps.push({
        stepId: `step_${taskId}_${index}`,
        description: `${action.charAt(0).toUpperCase() + action.slice(1)} ${task.name}`,
        completed: false,
        skillRequired: task.requiredSkills[index % task.requiredSkills.length]
      });
    });
    
    // Ensure at least basic steps if no action words found
    if (steps.length === 0) {
      steps.push({
        stepId: `step_${taskId}_1`,
        description: `Analyze requirements for ${task.name}`,
        completed: false
      });
      
      steps.push({
        stepId: `step_${taskId}_2`,
        description: `Execute ${task.name}`,
        completed: false
      });
      
      steps.push({
        stepId: `step_${taskId}_3`,
        description: `Verify results of ${task.name}`,
        completed: false
      });
    }
    
    // Create plan
    const plan: TaskPlan = {
      taskId,
      steps
    };
    
    this.taskPlans.set(taskId, plan);
    return plan;
  }
  
  /**
   * Start executing a task
   */
  async startTask(taskId: string, checkSkills: boolean = true, skillProvider?: any): Promise<boolean> {
    const task = this.tasks.get(taskId);
    if (!task) return false;
    
    // Check if task can be started
    if (task.status !== 'planned') return false;
    
    // Check dependencies
    for (const depId of task.dependencies) {
      const dep = this.tasks.get(depId);
      if (!dep || dep.status !== 'completed') return false;
    }
    
    // Check skills if required
    if (checkSkills && skillProvider && task.requiredSkills.length > 0) {
      for (const skill of task.requiredSkills) {
        const hasSkill = await this.ensureSkillAvailable(skill, skillProvider);
        if (!hasSkill) return false;
      }
    }
    
    // Update task status
    task.status = 'in-progress';
    task.startedAt = Date.now();
    
    // Get or create plan
    let plan = this.taskPlans.get(taskId);
    if (!plan) {
      plan = this.planTask(taskId);
      if (!plan) return false;
    }
    
    return true;
  }
  
  /**
   * Ensure a required skill is available
   */
  private async ensureSkillAvailable(skillName: string, skillProvider: any): Promise<boolean> {
    // Check if skill provider has the skill already
    const availableSkills = skillProvider.getAvailableSkills?.();
    if (availableSkills) {
      const hasSkill = availableSkills.some(
        (s: any) => s.skillName.toLowerCase() === skillName.toLowerCase() && 
        (s.proficiency === 'intermediate' || s.proficiency === 'advanced' || s.proficiency === 'expert')
      );
      
      if (hasSkill) return true;
    }
    
    // If not, try to learn the skill
    if (skillProvider.learnSkill) {
      try {
        await skillProvider.learnSkill(skillName, `Skill needed for task execution`);
        return true;
      } catch (error) {
        console.error(`Failed to learn skill ${skillName}:`, error);
        return false;
      }
    }
    
    return false;
  }
  
  /**
   * Execute a single step of a task
   */
  async executeTaskStep(taskId: string, stepId: string, skillProvider?: any): Promise<boolean> {
    const task = this.tasks.get(taskId);
    const plan = this.taskPlans.get(taskId);
    
    if (!task || !plan) return false;
    if (task.status !== 'in-progress') return false;
    
    // Find the step
    const step = plan.steps.find(s => s.stepId === stepId);
    if (!step || step.completed) return false;
    
    // If step requires skill, use skillProvider to apply it
    if (step.skillRequired && skillProvider) {
      try {
        const result = skillProvider.applySkill(
          step.skillRequired,
          `${task.name} - ${step.description}`
        );
        
        // Add result to task log
        task.result = task.result ? `${task.result}\n${result}` : result;
      } catch (error) {
        // Log error
        if (!task.errorLog) task.errorLog = [];
        task.errorLog.push(`Error in step ${step.description}: ${error}`);
        return false;
      }
    }
    
    // Mark step as completed
    step.completed = true;
    
    // Update task progress
    const completedSteps = plan.steps.filter(s => s.completed).length;
    task.progress = Math.floor((completedSteps / plan.steps.length) * 100);
    
    // Check if all steps completed
    if (task.progress === 100) {
      task.status = 'completed';
      task.completedAt = Date.now();
    }
    
    return true;
  }
  
  /**
   * Execute entire task automatically
   */
  async executeTaskAutonomously(taskId: string, skillProvider?: any): Promise<string> {
    const task = this.tasks.get(taskId);
    if (!task) return `Task not found: ${taskId}`;
    
    // Start the task
    const started = await this.startTask(taskId, true, skillProvider);
    if (!started) return `Failed to start task: ${task.name}`;
    
    // Get the plan
    const plan = this.taskPlans.get(taskId);
    if (!plan) return `No plan available for task: ${task.name}`;
    
    // Execute each step
    for (const step of plan.steps) {
      const success = await this.executeTaskStep(taskId, step.stepId, skillProvider);
      
      if (!success) {
        task.status = 'failed';
        return `Failed during step: ${step.description}`;
      }
      
      // Simulate some processing time
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Return results
    if (task.status === 'completed') {
      return task.result || `Successfully completed task: ${task.name}`;
    } else {
      return `Task execution incomplete: ${task.progress}% done`;
    }
  }
  
  /**
   * Add a subtask to an existing task
   */
  addSubtask(parentTaskId: string, subtaskName: string, subtaskDescription: string): Task | null {
    const parentTask = this.tasks.get(parentTaskId);
    if (!parentTask) return null;
    
    const subtask = this.createTask(
      subtaskName,
      subtaskDescription,
      parentTask.priority,
      parentTask.assignedTo,
      parentTask.requiredSkills
    );
    
    // Add to parent's subtasks
    parentTask.subtasks.push(subtask);
    
    return subtask;
  }
  
  /**
   * Add a dependency between tasks
   */
  addTaskDependency(taskId: string, dependsOnTaskId: string): boolean {
    const task = this.tasks.get(taskId);
    const dependencyTask = this.tasks.get(dependsOnTaskId);
    
    if (!task || !dependencyTask) return false;
    
    // Avoid circular dependencies
    if (this.wouldCreateCircularDependency(taskId, dependsOnTaskId)) {
      return false;
    }
    
    // Add dependency
    if (!task.dependencies.includes(dependsOnTaskId)) {
      task.dependencies.push(dependsOnTaskId);
    }
    
    return true;
  }
  
  /**
   * Check if adding a dependency would create a circular reference
   */
  private wouldCreateCircularDependency(taskId: string, dependsOnTaskId: string): boolean {
    // Check if dependsOnTask already depends on task
    const dependencyTask = this.tasks.get(dependsOnTaskId);
    if (!dependencyTask) return false;
    
    if (dependencyTask.dependencies.includes(taskId)) return true;
    
    // Check recursively through all dependencies
    for (const depId of dependencyTask.dependencies) {
      if (this.wouldCreateCircularDependency(taskId, depId)) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Get all tasks assigned to a user
   */
  getTasksForUser(userId: string): Task[] {
    return Array.from(this.tasks.values())
      .filter(task => task.assignedTo === userId);
  }
  
  /**
   * Get task by ID
   */
  getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }
  
  /**
   * Get task plan
   */
  getTaskPlan(taskId: string): TaskPlan | undefined {
    return this.taskPlans.get(taskId);
  }
}
