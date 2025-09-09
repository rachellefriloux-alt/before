import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

interface PermissionStatus {
  granted: boolean;
  requested: boolean;
  denied: boolean;
  lastRequested?: Date;
}

interface PermissionsState {
  camera: PermissionStatus;
  microphone: PermissionStatus;
  location: PermissionStatus;
  storage: PermissionStatus;
  notifications: PermissionStatus;
  contacts: PermissionStatus;

  // Actions
  updatePermission: (permission: keyof PermissionsState, status: Partial<PermissionStatus>) => void;
  requestPermission: (permission: keyof PermissionsState) => void;
  grantPermission: (permission: keyof PermissionsState) => void;
  denyPermission: (permission: keyof PermissionsState) => void;
  resetPermissions: () => void;
}

const defaultPermissionStatus: PermissionStatus = {
  granted: false,
  requested: false,
  denied: false,
};

export const usePermissionsStore = create<PermissionsState>()(
  persist(
    (set, get) => ({
      camera: { ...defaultPermissionStatus },
      microphone: { ...defaultPermissionStatus },
      location: { ...defaultPermissionStatus },
      storage: { ...defaultPermissionStatus },
      notifications: { ...defaultPermissionStatus },
      contacts: { ...defaultPermissionStatus },

      updatePermission: (permission, status) => {
        set((state) => ({
          [permission]: {
            ...state[permission],
            ...status,
            lastRequested: new Date(),
          },
        }));
      },

      requestPermission: (permission) => {
        set((state) => ({
          [permission]: {
            ...state[permission],
            requested: true,
            lastRequested: new Date(),
          },
        }));
      },

      grantPermission: (permission) => {
        set((state) => ({
          [permission]: {
            ...state[permission],
            granted: true,
            denied: false,
            requested: true,
            lastRequested: new Date(),
          },
        }));
      },

      denyPermission: (permission) => {
        set((state) => ({
          [permission]: {
            ...state[permission],
            granted: false,
            denied: true,
            requested: true,
            lastRequested: new Date(),
          },
        }));
      },

      resetPermissions: () => {
        set({
          camera: { ...defaultPermissionStatus },
          microphone: { ...defaultPermissionStatus },
          location: { ...defaultPermissionStatus },
          storage: { ...defaultPermissionStatus },
          notifications: { ...defaultPermissionStatus },
          contacts: { ...defaultPermissionStatus },
        });
      },
    }),
    {
      name: 'permissions-storage',
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
