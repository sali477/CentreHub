import { useMemo, useState } from 'react';

import { Link } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

import { FiChevronLeft, FiChevronRight, FiCalendar } from 'react-icons/fi';

import { formatDate, formatDateTime } from '../../../utils/helpers';

import { useStudentEnrollments } from '../../../hooks/useStudentDashboard';



const EVENT_COLORS = {

  live: 'bg-primary',

  quiz: 'bg-secondary',

  exam: 'bg-accent-foreground',

};



const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];



const StudentCalendar = () => {

  const { t, i18n } = useTranslation();

  const { calendarEvents, loading, error } = useStudentEnrollments();

  const [monthOffset, setMonthOffset] = useState(0);

  const [selectedDay, setSelectedDay] = useState(null);



  const viewDate = useMemo(() => {

    const d = new Date();

    d.setDate(1);

    d.setMonth(d.getMonth() + monthOffset);

    return d;

  }, [monthOffset]);



  const monthLabel = viewDate.toLocaleString(i18n.language, { month: 'long', year: 'numeric' });



  const calendarDays = useMemo(() => {

    const year = viewDate.getFullYear();

    const month = viewDate.getMonth();

    const firstDay = new Date(year, month, 1);

    const startPad = firstDay.getDay();

    const daysInMonth = new Date(year, month + 1, 0).getDate();



    const days = [];

    for (let i = 0; i < startPad; i += 1) days.push(null);

    for (let d = 1; d <= daysInMonth; d += 1) {

      days.push(new Date(year, month, d));

    }

    return days;

  }, [viewDate]);



  const eventsByDay = useMemo(() => {

    const map = {};

    calendarEvents.forEach((event) => {

      const key = new Date(event.date).toDateString();

      if (!map[key]) map[key] = [];

      map[key].push(event);

    });

    return map;

  }, [calendarEvents]);



  const selectedEvents = selectedDay ? eventsByDay[selectedDay.toDateString()] || [] : [];



  if (loading) {

    return <div className="animate-pulse h-64 bg-muted rounded-xl" />;

  }



  return (

    <div className="space-y-8">

      <div>

        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">

          <FiCalendar className="w-6 h-6 text-primary" />

          {t('dashboard.student.calendarTitle')}

        </h1>

        <p className="text-muted-foreground mt-1">

          {t('dashboard.student.calendarSubtitle')}

        </p>

      </div>



      {error && (

        <div className="card p-4 text-sm text-destructive-muted-foreground">{error}</div>

      )}



      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 card p-4 sm:p-6">

          <div className="flex items-center justify-between mb-6">

            <h2 className="text-lg font-semibold text-foreground">{monthLabel}</h2>

            <div className="flex gap-1">

              <button

                type="button"

                onClick={() => setMonthOffset((m) => m - 1)}

                className="p-2 rounded-lg hover:bg-muted text-muted-foreground"

                aria-label={t('common.previousMonth')}

              >

                <FiChevronLeft />

              </button>

              <button

                type="button"

                onClick={() => setMonthOffset(0)}

                className="px-3 py-2 text-xs font-medium rounded-lg hover:bg-muted text-muted-foreground"

              >

                {t('common.today')}

              </button>

              <button

                type="button"

                onClick={() => setMonthOffset((m) => m + 1)}

                className="p-2 rounded-lg hover:bg-muted text-muted-foreground"

                aria-label={t('common.nextMonth')}

              >

                <FiChevronRight />

              </button>

            </div>

          </div>



          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted-foreground mb-2">

            {WEEKDAY_KEYS.map((d) => (

              <div key={d} className="py-2">{t(`dashboard.student.weekdays.${d}`)}</div>

            ))}

          </div>



          <div className="grid grid-cols-7 gap-1">

            {calendarDays.map((day, idx) => {

              if (!day) {

                return <div key={`empty-${idx}`} className="h-14 sm:h-16" />;

              }

              const key = day.toDateString();

              const dayEvents = eventsByDay[key] || [];

              const isToday = key === new Date().toDateString();

              const isSelected = selectedDay && key === selectedDay.toDateString();



              return (

                <button

                  key={key}

                  type="button"

                  onClick={() => setSelectedDay(day)}

                  className={`h-14 sm:h-16 rounded-xl border text-left p-1.5 transition-colors ${

                    isSelected

                      ? 'border-primary bg-accent ring-1 ring-primary/20'

                      : isToday

                        ? 'border-primary/40 bg-accent/40'

                        : 'border-border hover:bg-muted/50'

                  }`}

                >

                  <span className="text-xs font-semibold text-foreground">{day.getDate()}</span>

                  <div className="flex gap-0.5 mt-1 flex-wrap">

                    {dayEvents.slice(0, 3).map((ev) => (

                      <span

                        key={ev.id}

                        className={`h-1.5 w-1.5 rounded-full ${EVENT_COLORS[ev.type] || 'bg-muted-foreground'}`}

                      />

                    ))}

                  </div>

                </button>

              );

            })}

          </div>



          <div className="flex flex-wrap gap-4 mt-6 text-xs text-muted-foreground">

            <span className="flex items-center gap-1.5">

              <span className="h-2 w-2 rounded-full bg-primary" /> {t('dashboard.student.liveClass')}

            </span>

            <span className="flex items-center gap-1.5">

              <span className="h-2 w-2 rounded-full bg-secondary" /> {t('dashboard.student.quiz')}

            </span>

            <span className="flex items-center gap-1.5">

              <span className="h-2 w-2 rounded-full bg-accent-foreground" /> {t('dashboard.student.exam')}

            </span>

          </div>

        </div>



        <div className="card p-6">

          <h2 className="font-semibold text-foreground mb-4">

            {selectedDay ? formatDate(selectedDay) : t('dashboard.student.selectDay')}

          </h2>

          {!selectedDay ? (

            <p className="text-sm text-muted-foreground">{t('dashboard.student.clickDateHint')}</p>

          ) : selectedEvents.length === 0 ? (

            <p className="text-sm text-muted-foreground">{t('dashboard.student.noEventsDay')}</p>

          ) : (

            <ul className="space-y-3">

              {selectedEvents.map((event) => (

                <li key={event.id} className="text-sm border-b border-border pb-3 last:border-0">

                  <div className="flex items-center gap-2 mb-1">

                    <span

                      className={`h-2 w-2 rounded-full shrink-0 ${EVENT_COLORS[event.type] || 'bg-muted'}`}

                    />

                    <span className="font-medium text-foreground capitalize">{event.type}</span>

                    {event.status && (

                      <span className="text-[10px] uppercase text-muted-foreground">{t(`live.status.${event.status}`, { defaultValue: event.status })}</span>

                    )}

                  </div>

                  <p className="font-medium text-foreground">{event.title}</p>

                  <p className="text-muted-foreground text-xs mt-0.5">{event.courseTitle}</p>

                  <p className="text-muted-foreground text-xs">{formatDateTime(event.date)}</p>

                  {event.link && (

                    <Link to={event.link} className="text-primary text-xs mt-1 inline-block hover:underline">

                      {t('common.open')}

                    </Link>

                  )}

                </li>

              ))}

            </ul>

          )}

        </div>

      </div>



      <section className="card p-6">

        <h2 className="font-semibold text-foreground mb-4">{t('dashboard.student.allUpcomingEvents')}</h2>

        {calendarEvents.length === 0 ? (

          <p className="text-sm text-muted-foreground">{t('dashboard.student.noScheduledEvents')}</p>

        ) : (

          <div className="space-y-2 max-h-80 overflow-y-auto">

            {calendarEvents.map((event) => (

              <div

                key={event.id}

                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 border-b border-border last:border-0 text-sm"

              >

                <div>

                  <p className="font-medium text-foreground">{event.title}</p>

                  <p className="text-xs text-muted-foreground">

                    {event.courseTitle} • {formatDateTime(event.date)}

                  </p>

                </div>

                {event.link && (

                  <Link to={event.link} className="text-primary text-xs hover:underline shrink-0">

                    {t('common.view')}

                  </Link>

                )}

              </div>

            ))}

          </div>

        )}

      </section>

    </div>

  );

};



export default StudentCalendar;

