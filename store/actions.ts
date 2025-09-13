import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

interface Action {
  id: string;
  type: 'navigation' | 'interaction' | 'setting_change' | 'error' | 'success' | 'custom';
  name: string;
  payload?: any;
  timestamp: Date;
  userId?: string;
  sessionId: string;
  metadata?: Record<string, any>;
}

interface ActionState {
  actions: Action[];
  maxActions: number;
  isRecording: boolean;

  // Actions
  recordAction: (action: Omit<Action, 'id' | 'timestamp' | 'sessionId'>) => void;
  clearActions: () => void;
  setMaxActions: (max: number) => void;
  toggleRecording: () => void;
  getActionsByType: (type: Action['type']) => Action[];
  getActionsByUser: (userId: string) => Action[];
  getRecentActions: (count: number) => Action[];
  exportActions: () => string;
  importActions: (actionsJson: string) => void;
}

export const useActionsStore = create<ActionState>()(
  persist(
    (set, get) => ({
      actions: [],
      maxActions: 1000,
      isRecording: true,

      recordAction: (actionData) => {
        if (!get().isRecording) return;

        const newAction: Action = {
          ...actionData,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          timestamp: new Date(),
          sessionId: 'session_' + Date.now().toString(),
        };

        set((state) => {
          const newActions = [newAction, ...state.actions];
          // Keep only the most recent actions up to maxActions
          if (newActions.length > state.maxActions) {
            newActions.splice(state.maxActions);
          }
          return { actions: newActions };
        });
      },

      clearActions: () => {
        set({ actions: [] });
      },

      setMaxActions: (max) => {
        set({ maxActions: max });
        // Trim existing actions if needed
        set((state) => {
          if (state.actions.length > max) {
            return { actions: state.actions.slice(0, max) };
          }
          return state;
        });
      },

      toggleRecording: () => {
        set((state) => ({ isRecording: !state.isRecording }));
      },

      getActionsByType: (type) => {
        return get().actions.filter((action) => action.type === type);
      },

      getActionsByUser: (userId) => {
        return get().actions.filter((action) => action.userId === userId);
      },

      getRecentActions: (count) => {
        return get().actions.slice(0, count);
      },

      exportActions: () => {
        return JSON.stringify(get().actions, null, 2);
      },

      importActions: (actionsJson) => {
        try {
          const importedActions = JSON.parse(actionsJson);
          if (Array.isArray(importedActions)) {
            set((state) => ({
              actions: [...importedActions, ...state.actions].slice(0, state.maxActions),
            }));
          }
        } catch (error) {
          console.error('Failed to import actions:', error);
        }
      },

      // Helper function to get session ID
      getSessionId: () => {
        // In a real app, this would be generated per session
        return 'session_' + Date.now().toString();
      },
    }),
    {
      name: 'actions-storage',
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
      partialize: (state) => ({
        actions: state.actions.slice(0, 100), // Only persist recent 100 actions
        maxActions: state.maxActions,
        isRecording: state.isRecording,
      }),
    }
  )
);

// Helper functions for common actions
export const recordNavigation = (screenName: string, params?: any) => {
  useActionsStore.getState().recordAction({
    type: 'navigation',
    name: 'screen_visit',
    payload: { screenName, params },
  });
};

export const recordInteraction = (elementName: string, action: string, data?: any) => {
  useActionsStore.getState().recordAction({
    type: 'interaction',
    name: action,
    payload: { elementName, data },
  });
};

export const recordSettingChange = (settingName: string, oldValue: any, newValue: any) => {
  useActionsStore.getState().recordAction({
    type: 'setting_change',
    name: 'setting_updated',
    payload: { settingName, oldValue, newValue },
  });
};

export const recordError = (errorName: string, error: any, context?: any) => {
  useActionsStore.getState().recordAction({
    type: 'error',
    name: errorName,
    payload: { error: error.message || error, context },
  });
};

export const recordSuccess = (actionName: string, data?: any) => {
  useActionsStore.getState().recordAction({
    type: 'success',
    name: actionName,
    payload: data,
  });
};
