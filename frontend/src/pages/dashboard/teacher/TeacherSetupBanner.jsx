import { FiAlertCircle } from 'react-icons/fi';

import { useTranslation } from 'react-i18next';

import CreateTeacherProfile from './CreateTeacherProfile';



const TeacherSetupBanner = ({ onComplete }) => {

  const { t } = useTranslation();



  return (

    <div className="card p-6 mb-6 border-2 border-primary/25 bg-accent/40">

      <div className="flex items-start gap-3 mb-5">

        <FiAlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />

        <div>

          <h2 className="font-semibold text-foreground">{t('dashboard.teacher.setupTitle')}</h2>

          <p className="text-sm text-muted-foreground mt-1">

            {t('dashboard.teacher.setupSubtitle')}

          </p>

        </div>

      </div>

      <CreateTeacherProfile embedded onCreated={onComplete} />

    </div>

  );

};



export default TeacherSetupBanner;

