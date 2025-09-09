import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

interface ConsentRecord {
  id: string;
  type: 'privacy' | 'terms' | 'data_collection' | 'analytics' | 'marketing';
  version: string;
  accepted: boolean;
  acceptedAt?: Date;
  expiresAt?: Date;
  required: boolean;
}

interface ConsentState {
  consents: Record<string, ConsentRecord>;
  hasRequiredConsents: boolean;

  // Actions
  acceptConsent: (id: string, version: string, expiresAt?: Date) => void;
  rejectConsent: (id: string) => void;
  updateConsent: (id: string, updates: Partial<ConsentRecord>) => void;
  checkRequiredConsents: () => boolean;
  resetConsents: () => void;
}

const defaultConsents: Record<string, ConsentRecord> = {
  privacy_policy: {
    id: 'privacy_policy',
    type: 'privacy',
    version: '1.0.0',
    accepted: false,
    required: true,
  },
  terms_of_service: {
    id: 'terms_of_service',
    type: 'terms',
    version: '1.0.0',
    accepted: false,
    required: true,
  },
  data_collection: {
    id: 'data_collection',
    type: 'data_collection',
    version: '1.0.0',
    accepted: false,
    required: false,
  },
  analytics: {
    id: 'analytics',
    type: 'analytics',
    version: '1.0.0',
    accepted: false,
    required: false,
  },
  marketing: {
    id: 'marketing',
    type: 'marketing',
    version: '1.0.0',
    accepted: false,
    required: false,
  },
};

export const useConsentStore = create<ConsentState>()(
  persist(
    (set, get) => ({
      consents: { ...defaultConsents },
      hasRequiredConsents: false,

      acceptConsent: (id, version, expiresAt) => {
        set((state) => ({
          consents: {
            ...state.consents,
            [id]: {
              ...state.consents[id],
              accepted: true,
              acceptedAt: new Date(),
              expiresAt,
              version,
            },
          },
        }));
        get().checkRequiredConsents();
      },

      rejectConsent: (id) => {
        set((state) => ({
          consents: {
            ...state.consents,
            [id]: {
              ...state.consents[id],
              accepted: false,
              acceptedAt: undefined,
            },
          },
        }));
        get().checkRequiredConsents();
      },

      updateConsent: (id, updates) => {
        set((state) => ({
          consents: {
            ...state.consents,
            [id]: {
              ...state.consents[id],
              ...updates,
            },
          },
        }));
        get().checkRequiredConsents();
      },

      checkRequiredConsents: () => {
        const state = get();
        const requiredConsents = Object.values(state.consents).filter(
          (consent) => consent.required
        );
        const hasAllRequired = requiredConsents.every((consent) => consent.accepted);
        set({ hasRequiredConsents: hasAllRequired });
        return hasAllRequired;
      },

      resetConsents: () => {
        set({
          consents: { ...defaultConsents },
          hasRequiredConsents: false,
        });
      },
    }),
    {
      name: 'consent-storage',
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
        consents: state.consents,
      }),
    }
  )
);
