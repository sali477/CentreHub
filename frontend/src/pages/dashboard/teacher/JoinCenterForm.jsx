import { useState } from 'react';

import { useTranslation } from 'react-i18next';

import { teacherAPI } from '../../../api/index';



const JoinCenterForm = ({ onSuccess, compact = false }) => {

  const { t } = useTranslation();

  const [invitationCode, setInvitationCode] = useState('');

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');

  const [success, setSuccess] = useState('');



  const getErrorMessage = (err, fallback) => {

    if (err.response?.data?.message) return err.response.data.message;

    if (typeof err.response?.data === 'string') return err.response.data;

    if (err.response?.status === 429) return t('errors.tooManyRequests');

    if (!err.response) return t('errors.serverUnreachable');

    return fallback;

  };



  const handleJoinCenter = async (e) => {

    e.preventDefault();

    const code = invitationCode.trim().toUpperCase();

    if (!code) {

      setError(t('dashboard.teacher.joinCenterForm.enterCode'));

      return;

    }



    setLoading(true);

    setError('');

    setSuccess('');

    try {

      await teacherAPI.joinCenter(code);

      setSuccess(t('dashboard.teacher.joinCenterForm.success'));

      setInvitationCode('');

      onSuccess?.();

    } catch (err) {

      setError(getErrorMessage(err, t('dashboard.teacher.joinCenterForm.failed')));

    } finally {

      setLoading(false);

    }

  };



  return (

    <form onSubmit={handleJoinCenter} className={compact ? 'space-y-3' : 'card p-6 space-y-4'}>

      {!compact && (

        <p className="text-sm text-muted-foreground">

          {t('dashboard.teacher.joinCenterHint')}

        </p>

      )}

      {error && (

        <div className="bg-destructive-muted text-destructive-muted-foreground px-4 py-3 rounded-lg text-sm">{error}</div>

      )}

      {success && (

        <div className="bg-accent text-accent-foreground px-4 py-3 rounded-lg text-sm">{success}</div>

      )}

      <input

        type="text"

        required

        className="input-field font-mono uppercase"

        placeholder={t('dashboard.teacher.joinCenterForm.placeholder')}

        value={invitationCode}

        onChange={(e) => setInvitationCode(e.target.value.toUpperCase().replace(/\s/g, ''))}

      />

      <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto">

        {loading ? t('common.joining') : t('dashboard.teacher.joinCenterForm.joinButton')}

      </button>

    </form>

  );

};



export default JoinCenterForm;

