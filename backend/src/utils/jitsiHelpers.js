export const getJitsiBaseUrl = () =>
  (process.env.JITSI_BASE_URL || 'https://meet.jit.si').replace(/\/$/, '');

export const buildJitsiRoomName = (sessionId) => {
  const idPart = sessionId?.toString().slice(-10) || Date.now().toString(36);
  return `centrehub-${idPart}-${Date.now().toString(36)}`;
};

export const buildMeetingUrl = (roomName) => `${getJitsiBaseUrl()}/${roomName}`;
