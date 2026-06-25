import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setTheme } from '../store/slices/uiSlice';

const STORAGE_KEY = 'centrehub-theme';

export const getSystemTheme = () =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export const applyTheme = (theme) => {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

export const initTheme = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  const theme = stored === 'dark' || stored === 'light' ? stored : getSystemTheme();
  applyTheme(theme);
  return theme;
};

export const useTheme = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.ui.theme);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    dispatch(setTheme(theme === 'dark' ? 'light' : 'dark'));
  }, [dispatch, theme]);

  return { theme, toggleTheme, setTheme: (value) => dispatch(setTheme(value)) };
};
