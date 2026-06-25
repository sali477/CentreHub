import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Logo from '../brand/Logo';



const Footer = () => {
  const { t } = useTranslation();

  return (

    <footer className="bg-surface-elevated text-surface-elevated-foreground mt-auto">

      <div className="page-container py-12 lg:py-14">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          <div className="sm:col-span-2 lg:col-span-1">

            <div className="mb-4">

              <Logo variant="full" size="md" theme="dark" />

            </div>

            <p className="text-sm text-surface-elevated-foreground/80 leading-relaxed max-w-xs">

              {t('footer.tagline')}

            </p>

          </div>



          <div>

            <h4 className="font-semibold text-surface-elevated-foreground mb-4 text-sm uppercase tracking-wider">{t('footer.explore')}</h4>

            <ul className="space-y-2.5 text-sm text-surface-elevated-foreground/85">

              <li><Link to="/centers" className="hover:text-surface-elevated-foreground transition-colors">{t('nav.centers')}</Link></li>

              <li><Link to="/courses" className="hover:text-surface-elevated-foreground transition-colors">{t('nav.courses')}</Link></li>

              <li><Link to="/ai" className="hover:text-surface-elevated-foreground transition-colors">{t('nav.aiChat')}</Link></li>

            </ul>

          </div>



          <div>

            <h4 className="font-semibold text-surface-elevated-foreground mb-4 text-sm uppercase tracking-wider">{t('footer.forPartners')}</h4>

            <ul className="space-y-2.5 text-sm text-surface-elevated-foreground/85">

              <li><Link to="/register" className="hover:text-surface-elevated-foreground transition-colors">{t('footer.registerCenter')}</Link></li>

              <li><Link to="/register" className="hover:text-surface-elevated-foreground transition-colors">{t('footer.becomeTeacher')}</Link></li>

            </ul>

          </div>



          <div>

            <h4 className="font-semibold text-surface-elevated-foreground mb-4 text-sm uppercase tracking-wider">{t('footer.support')}</h4>

            <ul className="space-y-2.5 text-sm text-surface-elevated-foreground/85">

              <li><a href="mailto:support@centrehub.ma" className="hover:text-surface-elevated-foreground transition-colors">{t('common.contactUs')}</a></li>

              <li><Link to="/privacy" className="hover:text-surface-elevated-foreground transition-colors">{t('footer.privacy')}</Link></li>

              <li><Link to="/terms" className="hover:text-surface-elevated-foreground transition-colors">{t('footer.terms')}</Link></li>

            </ul>

          </div>

        </div>



        <div className="border-t border-surface-elevated-muted mt-10 pt-8 text-center text-sm text-surface-elevated-foreground/75">

          {t('footer.copyright', { year: new Date().getFullYear() })}

        </div>

      </div>

    </footer>

  );

};



export default Footer;

