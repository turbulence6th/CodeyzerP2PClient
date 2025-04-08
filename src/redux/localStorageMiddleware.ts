import { Middleware } from '@reduxjs/toolkit';
import { RootState } from './store';

// localStorage anahtarı
const SHARED_FILES_STORAGE_KEY = 'sharedFiles';

export const localStorageMiddleware: Middleware = store => next => action => {
  const result = next(action);
  const state = store.getState() as RootState;
  
  // Redux state değiştiğinde localStorage'a kaydet
  try {
    // Yalnızca dosya bilgilerini kaydet, socketConnected gibi in-memory durumları kaydetme
    const stateToSave = {
      sharedFiles: state.files.sharedFiles,
      pendingFiles: state.files.pendingFiles
    };
    
    // Blob nesnelerini JSON'a dönüştüremeyeceğimiz için onları hariç tutuyoruz
    const filesToSave = stateToSave.sharedFiles.map(({ blob, ...rest }) => rest);
    localStorage.setItem(SHARED_FILES_STORAGE_KEY, JSON.stringify({
      sharedFiles: filesToSave,
      pendingFiles: stateToSave.pendingFiles
    }));
  } catch (error) {
    console.error('Dosya bilgileri kaydedilirken hata oluştu:', error);
  }
  
  return result;
};

// localStorage'dan dosya bilgilerini yükle
export const loadFilesFromStorage = () => {
  try {
    const savedData = localStorage.getItem(SHARED_FILES_STORAGE_KEY);
    if (!savedData) return { sharedFiles: [], pendingFiles: [] };
    
    const parsedData = JSON.parse(savedData);
    
    // Eğer eski format ile kaydedilmiş ise (sadece dosya dizisi)
    if (Array.isArray(parsedData)) {
      return { 
        sharedFiles: parsedData,
        pendingFiles: parsedData.map((file: any) => file.hash)
      };
    }
    
    // Yeni format (nesne içinde sharedFiles ve pendingFiles)
    return parsedData;
    
  } catch (error) {
    console.error('Dosya bilgileri yüklenirken hata oluştu:', error);
    return { sharedFiles: [], pendingFiles: [] };
  }
}; 