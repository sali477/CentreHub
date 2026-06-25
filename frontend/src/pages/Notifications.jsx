import { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';

import { useTranslation } from 'react-i18next';

import { fetchNotifications, markNotificationRead } from '../store/slices/notificationSlice';

import { formatDateTime } from '../utils/helpers';



const Notifications = () => {

  const { t } = useTranslation();

  const dispatch = useDispatch();

  const { list: notifications } = useSelector((state) => state.notifications);



  useEffect(() => {

    dispatch(fetchNotifications());

  }, [dispatch]);



  const handleRead = (id) => {

    dispatch(markNotificationRead(id));

  };



  return (

    <div className="max-w-2xl mx-auto px-4 py-8">

      <h1 className="section-title mb-6">{t('notifications.title')}</h1>

      <div className="space-y-2">

        {notifications.length === 0 ? (

          <p className="text-muted-foreground text-center py-8">{t('notifications.empty')}</p>

        ) : (

          notifications.map((notif) => (

            <div

              key={notif._id}

              onClick={() => !notif.isRead && handleRead(notif._id)}

              className={`card p-4 cursor-pointer transition-colors ${

                !notif.isRead ? 'border-l-4 border-l-primary bg-accent/30' : ''

              }`}

            >

              <div className="flex justify-between items-start">

                <div>

                  <h3 className="font-medium text-foreground">{notif.title}</h3>

                  <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>

                  {notif.link && (

                    <Link to={notif.link} className="text-sm text-primary hover:underline mt-1 inline-block">

                      {t('notifications.viewDetails')}

                    </Link>

                  )}

                </div>

                <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">

                  {formatDateTime(notif.createdAt)}

                </span>

              </div>

            </div>

          ))

        )}

      </div>

    </div>

  );

};



export default Notifications;

