import { db } from '../firebase';
import { collection, addDoc, doc, getDoc, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { getOrCreateSessionId } from '../utils/session';

export interface GameSession {
  sessionId: string;
  startTime: string;
  endTime?: string;
  gameSettings?: any;
  totalScore?: number;
  episodesCompleted?: number;
  isCompleted?: boolean;
  rewardEmail?: string;
}

interface GameRound {
  sessionId: string;
  episodeNumber: number;
  roundNumber: number;
  timestamp: string;
  prediction: number | null;
  decision: 'allow' | 'deny';
  actualWaterLevel: number;
  score: number;
  timeRemaining: number;
  stationAWaterLevel: number;
  stationBWaterLevel: number;
  trackNodeWaterLevel: number;
  isTrainTrapped: boolean;
  stationAElevation: number;
  stationBElevation: number;
  trackNodeElevation: number;
}

export interface SurveyData {
  sessionId: string;
  surveyType: 'pre-game' | 'post-game' | 'episode';
  episodeNumber?: number;
  answers: Record<string, any>;
  timestamp: number;
}

// 创建或更新游戏会话
export const createOrUpdateGameSession = async (sessionData: Partial<GameSession>): Promise<void> => {
  const sessionId = getOrCreateSessionId();
  const sessionsRef = collection(db, 'sessions');
  
  try {
    const q = query(sessionsRef, where('sessionId', '==', sessionId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      // 创建新会话
      await addDoc(sessionsRef, {
        sessionId,
        startTime: new Date().toISOString(),
        ...sessionData
      });
    } else {
      // 更新现有会话
      const sessionDoc = querySnapshot.docs[0];
      await updateDoc(doc(db, 'sessions', sessionDoc.id), {
        ...sessionData,
        lastUpdated: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error creating/updating game session:', error);
    throw error;
  }
};

// 保存回合数据
export const saveGameRound = async (roundData: Omit<GameRound, 'sessionId' | 'timestamp'>): Promise<void> => {
  const sessionId = getOrCreateSessionId();
  const roundsRef = collection(db, 'gameRounds');
  
  try {
    await addDoc(roundsRef, {
      ...roundData,
      sessionId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving game round:', error);
    throw error;
  }
};

// 保存问卷调查数据
export const saveSurveyData = async (data: Partial<SurveyData>): Promise<void> => {
  try {
    const sessionId = getOrCreateSessionId();
    const timestamp = Date.now();
    
    // Create survey data with proper type checking
    const surveyData: SurveyData = {
      sessionId,
      surveyType: data.surveyType || 'episode',
      answers: data.answers || {},
      timestamp,
      ...(data.surveyType === 'episode' && typeof data.episodeNumber === 'number' 
          ? { episodeNumber: data.episodeNumber } 
          : {})
    } as SurveyData;

    // Filter out undefined values in a type-safe way
    const cleanedData = Object.fromEntries(
      Object.entries(surveyData).filter(([_, value]) => value !== undefined)
    ) as SurveyData;

    await addDoc(collection(db, 'surveys'), cleanedData);
    console.log('Survey data saved successfully');
  } catch (error) {
    console.error('Error saving survey data:', error);
    throw error;
  }
};

// 获取会话数据
export const getSessionData = async (sessionId: string): Promise<GameSession | null> => {
  try {
    const sessionsRef = collection(db, 'sessions');
    const q = query(sessionsRef, where('sessionId', '==', sessionId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const sessionData = querySnapshot.docs[0].data() as GameSession;
      return sessionData;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting session data:', error);
    throw error;
  }
};

// 获取回合数据
export const getGameRounds = async (sessionId: string): Promise<GameRound[]> => {
  try {
    const roundsRef = collection(db, 'gameRounds');
    const q = query(roundsRef, where('sessionId', '==', sessionId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => doc.data() as GameRound);
  } catch (error) {
    console.error('Error getting game rounds:', error);
    throw error;
  }
};

// 获取问卷调查数据
export const getSurveyData = async (sessionId: string): Promise<SurveyData[]> => {
  try {
    const surveysRef = collection(db, 'surveys');
    const q = query(surveysRef, where('sessionId', '==', sessionId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => doc.data() as SurveyData);
  } catch (error) {
    console.error('Error getting survey data:', error);
    throw error;
  }
}; 