import { configureStore } from '@reduxjs/toolkit';
import filesReducer from './filesSlice';
import { localStorageMiddleware } from './localStorageMiddleware';

export const store = configureStore({
  reducer: {
    files: filesReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Blob nesneleri serileştirilemediği için serializableCheck'i bu alan için devre dışı bırakıyoruz
        ignoredActionPaths: ['payload.blob'],
        ignoredPaths: ['files.sharedFiles.*.blob'],
      },
    }).concat(localStorageMiddleware),
});

// RootState ve AppDispatch tiplerini tanımlama
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 