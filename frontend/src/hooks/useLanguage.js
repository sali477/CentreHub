import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { authAPI } from '../api/index';
import i18n, { SUPPORTED_LANGUAGES } from '../i18n';

export { SUPPORTED_LANGUAGES };

export const useLanguage = () => {
  const { i18n: i18nInstance } = useTranslation();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const current = i18nInstance.language?.startsWith('fr') ? 'fr' : 'en';

  const setLanguage = useCallback(
    async (code) => {
      if (!['en', 'fr'].includes(code)) return;
      await i18n.changeLanguage(code);
      if (isAuthenticated) {
        try {
          await authAPI.updateProfile({ preferredLanguage: code });
        } catch {
          /* keep local preference */
        }
      }
    },
    [isAuthenticated]
  );

  return { currentLanguage: current, setLanguage, languages: SUPPORTED_LANGUAGES };
};

export const applyUserLanguage = (preferredLanguage) => {
  if (preferredLanguage && ['en', 'fr'].includes(preferredLanguage)) {
    if (i18n.language !== preferredLanguage) {
      i18n.changeLanguage(preferredLanguage);
    }
  }
};
