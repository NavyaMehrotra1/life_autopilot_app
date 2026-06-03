import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage, PersistOptions } from 'zustand/middleware';

/** Standard AsyncStorage-backed persist config for a store. */
export function asyncPersist<T>(name: string, version = 1): PersistOptions<T, T> {
  return {
    name: `la:${name}`,
    version,
    storage: createJSONStorage(() => AsyncStorage),
  };
}

/** Lightweight id generator (good enough for local-only records). */
export function uid(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}
