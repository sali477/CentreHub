import { useState } from 'react';

import { useTranslation } from 'react-i18next';

import { FiKey } from 'react-icons/fi';

import { enrollmentAPI, teacherAPI } from '../../../api/index';



const StudentJoinByCode = ({ onEnrolled }) => {

  const { t } = useTranslation();

  const [teacherCode, setTeacherCode] = useState('');

  const [lookupLoading, setLookupLoading] = useState(false);

  const [teacherData, setTeacherData] = useState(null);

  const [joiningCourseId, setJoiningCourseId] = useState(null);

  const [lookupError, setLookupError] = useState('');



  const handleLookupTeacher = async (e) => {

    e.preventDefault();

    if (!teacherCode.trim()) return;

    setLookupLoading(true);

    setLookupError('');

    setTeacherData(null);

    try {

      const { data } = await teacherAPI.getByCode(teacherCode.trim().toUpperCase());

      setTeacherData(data.data);

    } catch (err) {

      setLookupError(err.response?.data?.message || t('dashboard.student.joinByCode.invalidCode'));

    } finally {

      setLookupLoading(false);

    }

  };



  const handleJoinCourse = async (courseId) => {

    setJoiningCourseId(courseId);

    try {

      await enrollmentAPI.joinByCode(teacherCode.trim().toUpperCase(), courseId);

      onEnrolled?.();

      alert(t('dashboard.student.joinByCode.enrollSuccess'));

    } catch (err) {

      alert(err.response?.data?.message || t('dashboard.student.joinByCode.enrollFailed'));

    } finally {

      setJoiningCourseId(null);

    }

  };



  return (

    <section className="card p-6">

      <div className="flex items-center gap-2 mb-3">

        <FiKey className="w-5 h-5 text-primary" />

        <h2 className="text-lg font-semibold text-foreground">{t('dashboard.student.joinByCode.title')}</h2>

      </div>

      <p className="text-sm text-muted-foreground mb-4">

        {t('dashboard.student.joinByCode.subtitle')}

      </p>

      <form onSubmit={handleLookupTeacher} className="flex flex-col sm:flex-row gap-3 mb-4">

        <input

          className="input-field flex-1 uppercase"

          placeholder={t('dashboard.student.joinByCode.placeholder')}

          value={teacherCode}

          onChange={(e) => setTeacherCode(e.target.value.toUpperCase())}

        />

        <button type="submit" disabled={lookupLoading} className="btn-primary sm:w-auto shrink-0">

          {lookupLoading ? t('common.lookingUp') : t('dashboard.student.joinByCode.findCourses')}

        </button>

      </form>

      {lookupError && (

        <p className="text-sm text-destructive-muted-foreground mb-4">{lookupError}</p>

      )}

      {teacherData && (

        <div className="border border-border rounded-xl p-4 bg-muted/40">

          <p className="font-medium text-foreground">{teacherData.teacher.user?.name}</p>

          <p className="text-sm text-muted-foreground mb-4">{teacherData.teacher.center?.name}</p>

          {teacherData.courses.length === 0 ? (

            <p className="text-sm text-muted-foreground">{t('dashboard.student.joinByCode.noPublishedCourses')}</p>

          ) : (

            <div className="space-y-2">

              {teacherData.courses.map((course) => (

                <div

                  key={course._id}

                  className="flex items-center justify-between gap-3 p-3 bg-card rounded-lg border border-border"

                >

                  <div className="min-w-0">

                    <p className="font-medium text-sm truncate">{course.title}</p>

                    <p className="text-xs text-muted-foreground">{course.subject}</p>

                  </div>

                  <button

                    type="button"

                    onClick={() => handleJoinCourse(course._id)}

                    disabled={joiningCourseId === course._id}

                    className="btn-primary text-sm py-2 shrink-0"

                  >

                    {joiningCourseId === course._id ? t('common.joining') : t('common.enroll')}

                  </button>

                </div>

              ))}

            </div>

          )}

        </div>

      )}

    </section>

  );

};



export default StudentJoinByCode;

