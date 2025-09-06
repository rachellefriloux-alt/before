import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

export interface UserState {
  // User profile
  name: string;
  email?: string;
  avatar?: string;

  // Preferences
  preferredName: string; // What they want to be called
  timezone: string;

  // Actions
  setName: (name: string) => void;
  setPreferredName: (preferredName: string) => void;
  setEmail: (email: string) => void;
  setAvatar: (avatar: string) => void;
  updateProfile: (updates: Partial<UserState>) => void;
  getDisplayName: () => string;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Initial state
      name: '',
      email: '',
      avatar: '',
      preferredName: 'love', // Default fallback
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,

      // Actions
      setName: (name: string) => set({ name }),

      setPreferredName: (preferredName: string) => set({ preferredName }),

      setEmail: (email: string) => set({ email }),

      setAvatar: (avatar: string) => set({ avatar }),

      updateProfile: (updates: Partial<UserState>) => set(updates),

      getDisplayName: () => {
        const state = get();
        return state.preferredName || state.name || 'love';
      }
    }),
    {
      name: 'user-storage',
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
