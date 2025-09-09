import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  subtasks: SubTask[];
}

interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

interface Goal {
  id: string;
  title: string;
  description?: string;
  targetDate?: Date;
  completed: boolean;
  progress: number; // 0-100
  category: string;
  milestones: Milestone[];
  createdAt: Date;
  updatedAt: Date;
}

interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  targetDate?: Date;
  createdAt: Date;
}

interface PlannerState {
  tasks: Task[];
  goals: Goal[];
  categories: string[];
  isLoading: boolean;

  // Task Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'subtasks'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  addSubtask: (taskId: string, subtask: Omit<SubTask, 'id' | 'createdAt'>) => void;
  updateSubtask: (taskId: string, subtaskId: string, updates: Partial<SubTask>) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;

  // Goal Actions
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'milestones'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  addMilestone: (goalId: string, milestone: Omit<Milestone, 'id' | 'createdAt'>) => void;
  updateMilestone: (goalId: string, milestoneId: string, updates: Partial<Milestone>) => void;
  deleteMilestone: (goalId: string, milestoneId: string) => void;

  // Category Actions
  addCategory: (category: string) => void;
  removeCategory: (category: string) => void;

  // Utility Actions
  getTasksByCategory: (category: string) => Task[];
  getGoalsByCategory: (category: string) => Goal[];
  getOverdueTasks: () => Task[];
  getUpcomingTasks: (days: number) => Task[];
  setLoading: (loading: boolean) => void;
  clearCompleted: () => void;
}

export const usePlannerStore = create<PlannerState>()(
  persist(
    (set, get) => ({
      tasks: [],
      goals: [],
      categories: ['Personal', 'Work', 'Health', 'Learning'],
      isLoading: false,

      addTask: (taskData) => {
        const newTask: Task = {
          ...taskData,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
          subtasks: [],
        };
        set((state) => ({
          tasks: [...state.tasks, newTask],
        }));
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, ...updates, updatedAt: new Date() }
              : task
          ),
        }));
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
      },

      toggleTask: (id) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, completed: !task.completed, updatedAt: new Date() }
              : task
          ),
        }));
      },

      addSubtask: (taskId, subtaskData) => {
        const newSubtask: SubTask = {
          ...subtaskData,
          id: Date.now().toString(),
          createdAt: new Date(),
        };
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? { ...task, subtasks: [...task.subtasks, newSubtask], updatedAt: new Date() }
              : task
          ),
        }));
      },

      updateSubtask: (taskId, subtaskId, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  subtasks: task.subtasks.map((subtask) =>
                    subtask.id === subtaskId ? { ...subtask, ...updates } : subtask
                  ),
                  updatedAt: new Date(),
                }
              : task
          ),
        }));
      },

      deleteSubtask: (taskId, subtaskId) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  subtasks: task.subtasks.filter((subtask) => subtask.id !== subtaskId),
                  updatedAt: new Date(),
                }
              : task
          ),
        }));
      },

      addGoal: (goalData) => {
        const newGoal: Goal = {
          ...goalData,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
          milestones: [],
        };
        set((state) => ({
          goals: [...state.goals, newGoal],
        }));
      },

      updateGoal: (id, updates) => {
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === id
              ? { ...goal, ...updates, updatedAt: new Date() }
              : goal
          ),
        }));
      },

      deleteGoal: (id) => {
        set((state) => ({
          goals: state.goals.filter((goal) => goal.id !== id),
        }));
      },

      addMilestone: (goalId, milestoneData) => {
        const newMilestone: Milestone = {
          ...milestoneData,
          id: Date.now().toString(),
          createdAt: new Date(),
        };
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === goalId
              ? { ...goal, milestones: [...goal.milestones, newMilestone], updatedAt: new Date() }
              : goal
          ),
        }));
      },

      updateMilestone: (goalId, milestoneId, updates) => {
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === goalId
              ? {
                  ...goal,
                  milestones: goal.milestones.map((milestone) =>
                    milestone.id === milestoneId ? { ...milestone, ...updates } : milestone
                  ),
                  updatedAt: new Date(),
                }
              : goal
          ),
        }));
      },

      deleteMilestone: (goalId, milestoneId) => {
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === goalId
              ? {
                  ...goal,
                  milestones: goal.milestones.filter((milestone) => milestone.id !== milestoneId),
                  updatedAt: new Date(),
                }
              : goal
          ),
        }));
      },

      addCategory: (category) => {
        set((state) => ({
          categories: [...new Set([...state.categories, category])],
        }));
      },

      removeCategory: (category) => {
        set((state) => ({
          categories: state.categories.filter((cat) => cat !== category),
        }));
      },

      getTasksByCategory: (category) => {
        return get().tasks.filter((task) => task.category === category);
      },

      getGoalsByCategory: (category) => {
        return get().goals.filter((goal) => goal.category === category);
      },

      getOverdueTasks: () => {
        const now = new Date();
        return get().tasks.filter(
          (task) => task.dueDate && task.dueDate < now && !task.completed
        );
      },

      getUpcomingTasks: (days) => {
        const now = new Date();
        const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
        return get().tasks.filter(
          (task) => task.dueDate && task.dueDate <= futureDate && task.dueDate >= now && !task.completed
        );
      },

      setLoading: (loading) => set({ isLoading: loading }),

      clearCompleted: () => {
        set((state) => ({
          tasks: state.tasks.filter((task) => !task.completed),
          goals: state.goals.filter((goal) => !goal.completed),
        }));
      },
    }),
    {
      name: 'planner-storage',
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          const value = storage.getString(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: (name, value) => {
          storage.set(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          storage.delete(name);
        },
      })),
    }
  )
);
