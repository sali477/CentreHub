export const JITSI_DOMAIN =
  import.meta.env.VITE_JITSI_DOMAIN || 'meet.jit.si';

export const getJitsiExternalApiScript = () =>
  `https://${JITSI_DOMAIN}/external_api.js`;

export const buildJitsiMeetingUrl = (roomName) =>
  `https://${JITSI_DOMAIN}/${roomName}`;

/** Direct iframe URL — more reliable on public meet.jit.si than External API embed. */
export const buildJitsiEmbedUrl = (roomName, { displayName } = {}) => {
  if (!roomName) return '';

  const params = [
    'config.prejoinPageEnabled=false',
    'config.prejoinConfig.enabled=false',
    'config.disableDeepLinking=true',
    'config.enableWelcomePage=false',
    'config.enableRecentList=false',
    'config.startWithAudioMuted=false',
    'config.startWithVideoMuted=false',
  ];

  if (displayName) {
    params.push(`config.defaultLocalDisplayName=${encodeURIComponent(displayName)}`);
  }

  return `${buildJitsiMeetingUrl(roomName)}#${params.join('&')}`;
};

export const getSessionRoomSlug = (session) =>
  session?.roomId || session?.jitsiRoomName || '';
