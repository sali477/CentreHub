import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { applyUserLanguage } from '../../hooks/useLanguage';

const AppLanguageSync = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user?.preferredLanguage) {
      applyUserLanguage(user.preferredLanguage);
    }
  }, [isAuthenticated, user?.preferredLanguage]);

  return null;
};

export default AppLanguageSync;
