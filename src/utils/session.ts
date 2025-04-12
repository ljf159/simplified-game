import { v4 as uuidv4 } from 'uuid';

const SESSION_ID_KEY = 'floodGameSessionId';

export const getOrCreateSessionId = (): string => {
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  
  return sessionId;
};

export const clearSessionId = (): void => {
  localStorage.removeItem(SESSION_ID_KEY);
}; 