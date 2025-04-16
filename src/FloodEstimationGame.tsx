import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Typography, Slider, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { useLocation } from 'react-router-dom';
import './styles/FloodEstimationGame.css';
import SurveyDialog, { SurveyAnswers } from './SurveyDialog';
import PreGameSurvey, { PreGameSurveyAnswers } from './PreGameSurvey';
import PostGameSurvey, { PostGameSurveyAnswers } from './PostGameSurvey';
import {
  createOrUpdateGameSession,
  saveGameRound,
  saveSurveyData
} from './services/firebaseService';
import {
  PROPAGATION_THRESHOLD,
  PROPAGATION_FLOOD_INCREASE,
  ELEVATION_DIFFERENCE_FACTOR,
  FLOOD_DIFFERENCE_FACTOR,
  FLOOD_LOG_NORMAL_MU,
  FLOOD_LOG_NORMAL_SIGMA,
  MIN_ELEVATION,
  MAX_ELEVATION,
  propagateFlood,
  generateRandomIncrease,
  rankNodesByElevation
} from './utils/floodPropagation';

// Default seed value, only used when not passed via props
const DEFAULT_SEED = 12;

const TIME_REMAINING = 20; // Decision time (s)
const FAILURE_POINT_NUM = 1; // Number of failure points


interface Station {
  id: number;
  name: string;
  floodLevel: number;
  isFailurePoint: boolean;
  elevation: number; // 高程属性
  previousFloodLevel?: number; // 上一轮水位
  increaseInThisRound: number; // 改为必需属性
}

interface TrackNode {
  floodLevel: number;
  isFailurePoint: boolean;
  elevation: number; // 高程属性
  previousFloodLevel?: number; // 上一轮水位
  increaseInThisRound?: number; // 本轮增加量
}

interface GameState {
  round: number;
  episode: number;
  score: number;
  gameOver: boolean;
  trainTrapped: boolean;
  prediction: number | null;
  decision: 'allow' | 'deny' | null;
  stations: Station[];
  trackNode: TrackNode;
  timeRemaining: number;
  timerActive: boolean;
  preGameSurvey: PreGameSurveyAnswers | null;
  postGameSurvey: PostGameSurveyAnswers | null;
  episodeSurveys?: SurveyAnswers[];
  stationA?: Station;
  stationB?: Station;
}

// 扩展日志条目接口，添加可选的设置和参数字段
interface GameLogEntry {
  round: number;
  timestamp: string;
  gameState: GameState;
  playerDecision: 'allow' | 'deny' | null;
  playerPrediction: number | null;
  
  // 新增可选字段
  gameSettings?: {
    gameType: string;
    difficulty: string;
    gameMode: string;
  };
  gameParameters?: {
    seed: number;
    floodLogNormalMu: number;
    floodLogNormalSigma: number;
    propagationThreshold: number;
    timeRemaining: number;
    failurePointNum: number;
    propagationFloodIncrease?: number;
    floodDifferenceFactor?: number; 
    elevationDifferenceFactor?: number;
    minElevation: number;
    maxElevation: number;
  };
  preGameSurvey?: PreGameSurveyAnswers; // 添加预游戏调查字段
  postGameSurvey?: PostGameSurveyAnswers; // 添加后游戏调查字段
}

// 添加种子随机数生成器
class SeededRandom {
  private seed: number;
  
  constructor(seed: number) {
    this.seed = seed;
  }
  
  // 返回0-1之间的随机数
  random(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }
  
  // 返回指定范围内的整数
  randomInt(min: number, max: number): number {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }
}

interface FloodEstimationGameProps {
  preGameSurveyAnswers?: PreGameSurveyAnswers | null;
}

const FloodEstimationGame: React.FC<FloodEstimationGameProps> = ({ preGameSurveyAnswers = null }) => {
  const location = useLocation();
  const settings = location.state as { gameType: string, difficulty: string, gameMode: string, seed?: number, preGameSurvey?: PreGameSurveyAnswers } || {
    gameType: 'punishment',
    difficulty: 'Medium',
    gameMode: 'Random',
    seed: DEFAULT_SEED,
    preGameSurvey: null
  };
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // 创建随机数生成器 - 固定模式使用种子
  const randomGenerator = useRef(
    settings.gameMode === 'Fixed' ? new SeededRandom(settings.seed || DEFAULT_SEED) : null
  );
  
  // 获取随机数的辅助函数
  const getRandomValue = (): number => {
    if (settings.gameMode === 'Fixed' && randomGenerator.current) {
      return randomGenerator.current.random();
    }
    return Math.random();
  };
  
  // 获取指定范围内的随机整数
  const getRandomInt = (min: number, max: number): number => {
    if (settings.gameMode === 'Fixed' && randomGenerator.current) {
      return randomGenerator.current.randomInt(min, max);
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };
  
  // 获取基于难度的游戏参数
  const getGameParameters = () => {
    let parameters = {
      floodLogNormalMu: FLOOD_LOG_NORMAL_MU,
      floodLogNormalSigma: FLOOD_LOG_NORMAL_SIGMA,
      propagationThreshold: PROPAGATION_THRESHOLD,
      propagationFloodIncrease: PROPAGATION_FLOOD_INCREASE,
      elevationDifferenceFactor: ELEVATION_DIFFERENCE_FACTOR,
      floodDifferenceFactor: FLOOD_DIFFERENCE_FACTOR,
      failurePointNum: FAILURE_POINT_NUM,
      timeRemaining: TIME_REMAINING
    };
    
    // 根据难度调整参数
    switch(settings.difficulty) {
      case 'Easy':
        parameters.floodLogNormalMu = 5;
        parameters.floodLogNormalSigma = 0.6;
        parameters.propagationThreshold = 15;
        break;
      case 'Medium':
        parameters.floodLogNormalMu = 7;
        parameters.floodLogNormalSigma = 1.1;
        parameters.propagationThreshold = 10;
        // 保持默认值
        break;
      case 'Hard':
        parameters.floodLogNormalMu = 9;
        parameters.floodLogNormalSigma = 1.6;
        parameters.propagationThreshold = 5;
        break;
      default:
        break;
    }
    
    return parameters;
  };
  
  // 获取游戏参数
  const gameParams = getGameParameters();
  
  // 确定故障点，使用我们的随机生成器
  const determineFailurePoints = (): number[] => {
    const points = [0, 1, 2];
    // 使用我们自己的随机生成器来排序
    const shuffledPoints = [...points].sort(() => getRandomValue() - 0.5);
    // console.log(shuffledPoints);
    return shuffledPoints.slice(0, gameParams.failurePointNum);
    // return [1];
  };
  
  // 使用游戏参数设置状态
  const [gameState, setGameState] = useState<GameState>(() => {
    let elevation_A = 0;
    let elevation_B = 0;
    let elevation_track_node = 0;
    let initialFailurePoints = determineFailurePoints();

    if(settings.difficulty === 'Easy') {
      elevation_A = getRandomInt((MAX_ELEVATION)*0.4, MAX_ELEVATION*0.7);
      elevation_track_node = getRandomInt((MAX_ELEVATION)*0.4, MAX_ELEVATION*0.7);
      elevation_B = getRandomInt((MAX_ELEVATION)*0.4, MAX_ELEVATION*0.7); 
    };
    if(settings.difficulty === 'Medium') {
      elevation_A = getRandomInt((MAX_ELEVATION)*0.2, MAX_ELEVATION*0.8);
      elevation_track_node = getRandomInt((MAX_ELEVATION)*0.2, MAX_ELEVATION*0.8);
      elevation_B = getRandomInt((MAX_ELEVATION)*0.2, MAX_ELEVATION*0.8);

      const rankedNodes = rankNodesByElevation(elevation_A, elevation_track_node, elevation_B);
      // select one of the two highest nodes as the failure point 
      initialFailurePoints = [rankedNodes[getRandomInt(0, rankedNodes.length - 2)]];
    };
    if(settings.difficulty === 'Hard') {
      elevation_A = getRandomInt(MIN_ELEVATION, MAX_ELEVATION);
      elevation_track_node = getRandomInt(MIN_ELEVATION, MAX_ELEVATION);
      elevation_B = getRandomInt(MIN_ELEVATION, MAX_ELEVATION);

      const rankedNodes = rankNodesByElevation(elevation_A, elevation_track_node, elevation_B);
      // select the highest node as the failure point
      initialFailurePoints = [rankedNodes[0]];
    };
    
    return {
      round: 1,
      episode: 1,
      score: 0,
      gameOver: false,
      trainTrapped: false,
      prediction: null,
      decision: null,
      stations: [],
      trackNode: {
        floodLevel: 0,
        isFailurePoint: initialFailurePoints.includes(1),
        elevation: elevation_track_node
      },
      stationA: {
        id: 0,
        name: 'Station A',
        floodLevel: 0,
        isFailurePoint: initialFailurePoints.includes(0),
        elevation: elevation_A,
        previousFloodLevel: 0,
        increaseInThisRound: 0
      },
      stationB: {
        id: 2,
        name: 'Station B',
        floodLevel: 0,
        isFailurePoint: initialFailurePoints.includes(2),
        elevation: elevation_B,
        previousFloodLevel: 0,
        increaseInThisRound: 0
      },
      timeRemaining: gameParams.timeRemaining,
      timerActive: false,
      preGameSurvey: preGameSurveyAnswers,
      postGameSurvey: null,
    };
  });
  
  // 预测值
  const [sliderValue, setSliderValue] = useState<number>(25);
  // 决策
  const [decision, setDecision] = useState<'allow' | 'deny' | null>(null);
  // 是否显示结果
  const [showResult, setShowResult] = useState<boolean>(false);
  
  // 添加游戏日志状态
  const [gameLog, setGameLog] = useState<GameLogEntry[]>([]);
  
  // 添加记录日志的函数
  const logGameState = (additionalInfo?: {
    decision?: 'allow' | 'deny' | null;
    prediction?: number | null;
    includeSettings?: boolean;
    includePreGameSurvey?: boolean;
    includePostGameSurvey?: boolean;
  }) => {
    const newLogEntry: GameLogEntry = {
      round: gameState.round,
      timestamp: new Date().toISOString(),
      gameState: JSON.parse(JSON.stringify(gameState)), // 深拷贝当前游戏状态
      playerDecision: additionalInfo?.decision || decision,
      playerPrediction: additionalInfo?.prediction || gameState.prediction
    };
    
    // 如果需要包含设置和参数信息（通常只在游戏开始时）
    if (additionalInfo?.includeSettings) {
      newLogEntry.gameSettings = {
        gameType: settings.gameType,
        difficulty: settings.difficulty,
        gameMode: settings.gameMode
      };
      
      newLogEntry.gameParameters = {
        seed: settings.seed || DEFAULT_SEED,
        floodLogNormalMu: gameParams.floodLogNormalMu,
        floodLogNormalSigma: gameParams.floodLogNormalSigma,
        propagationThreshold: gameParams.propagationThreshold,
        timeRemaining: gameParams.timeRemaining,
        failurePointNum: gameParams.failurePointNum,
        propagationFloodIncrease: PROPAGATION_FLOOD_INCREASE,
        floodDifferenceFactor: FLOOD_DIFFERENCE_FACTOR,
        elevationDifferenceFactor: ELEVATION_DIFFERENCE_FACTOR,
        minElevation: MIN_ELEVATION,
        maxElevation: MAX_ELEVATION
      };
    }
    
    // 如果需要包含预游戏调查信息
    if (additionalInfo?.includePreGameSurvey && gameState.preGameSurvey) {
      newLogEntry.preGameSurvey = gameState.preGameSurvey;
    }
    
    // 如果需要包含后游戏调查信息
    if (additionalInfo?.includePostGameSurvey && gameState.postGameSurvey) {
      newLogEntry.postGameSurvey = gameState.postGameSurvey;
    }
    
    setGameLog(prevLog => [...prevLog, newLogEntry]);
    
    // 可选：将日志打印到控制台，便于调试
    console.log('Game Log Entry:', newLogEntry);
  };
  
  // 记录初始游戏状态，包含设置和参数
  useEffect(() => {
    logGameState({ includeSettings: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // 更新地铁线路图
  useEffect(() => {
    drawSubwayMap();
  }, [gameState, showResult]);

  // 获取基于高程的颜色
  const getElevationColor = (elevation: number): string => {
    const normalizedElevation = (elevation - MIN_ELEVATION) / (MAX_ELEVATION - MIN_ELEVATION);
    const startColor = { r: 45, g: 49, b: 80 }; // #2d3250
    const endColor = { r: 78, g: 204, b: 163 }; // #4ecca3
    
    const r = Math.round(startColor.r + (endColor.r - startColor.r) * normalizedElevation);
    const g = Math.round(startColor.g + (endColor.g - startColor.g) * normalizedElevation);
    const b = Math.round(startColor.b + (endColor.b - startColor.b) * normalizedElevation);
    
    return `rgb(${r}, ${g}, ${b})`;
  };
  
  // 绘制地铁线路图
  const drawSubwayMap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置canvas大小以匹配容器
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制高程图例
    drawElevationLegend(ctx);

    // 计算关键位置
    const margin = 80;
    const trackY = canvas.height / 2;
    const stationAX = margin;
    const stationBX = canvas.width - margin;
    const trackNodeX = (stationAX + stationBX) / 2;

    // 绘制轨道（使用渐变色表示高程）
    const gradient = ctx.createLinearGradient(stationAX, trackY, stationBX, trackY);
    gradient.addColorStop(0, getElevationColor(gameState.trackNode.elevation));
    gradient.addColorStop(0.5, getElevationColor(gameState.trackNode.elevation));
    gradient.addColorStop(1, getElevationColor(gameState.trackNode.elevation));

    ctx.beginPath();
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 8;
    ctx.moveTo(stationAX, trackY);
    ctx.lineTo(stationBX, trackY);
    ctx.stroke();

    // 绘制站点和节点
    drawStation(ctx, stationAX, trackY, gameState.stationA?.floodLevel || 0, 'Station A', 
               gameState.stationA?.isFailurePoint || false, gameState.stationA?.elevation || 0);
               
    // 绘制Station B
    drawStation(ctx, stationBX, trackY, gameState.stationB?.floodLevel || 0, 'Station B', 
               gameState.stationB?.isFailurePoint || false, gameState.stationB?.elevation || 0);

    // 绘制轨道节点
    ctx.beginPath();
    ctx.arc(trackNodeX, trackY, 8, 0, Math.PI * 2);
    ctx.fillStyle = getElevationColor(gameState.trackNode.elevation);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 绘制轨道节点标签
    ctx.font = '14px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('Track', trackNodeX, trackY + 30);
    
    // 绘制轨道节点高程
    ctx.font = '12px Arial';
    ctx.fillText(`Elev: ${gameState.trackNode.elevation}m`, trackNodeX, trackY + 50);
    
    // 绘制轨道节点水位
    if (showResult) {
      ctx.fillText(`Water: ${gameState.trackNode.floodLevel.toFixed(1)}%`, trackNodeX, trackY + 70);
    } else {
      ctx.fillText('?', trackNodeX, trackY + 70);
    }

    // 绘制列车
    drawTrain(ctx, stationAX, stationBX, trackNodeX, trackY);
  };
  
  // 绘制高程图例
  const drawElevationLegend = (ctx: CanvasRenderingContext2D) => {
    const legendWidth = 120;
    const legendHeight = 15;
    const startX = 30;
    const startY = 30;
    
    // 绘制渐变背景
    const gradient = ctx.createLinearGradient(startX, startY, startX + legendWidth, startY);
    gradient.addColorStop(0, getElevationColor(MIN_ELEVATION));
    gradient.addColorStop(1, getElevationColor(MAX_ELEVATION));
    
    ctx.fillStyle = gradient;
    ctx.fillRect(startX, startY, legendWidth, legendHeight);
    
    // 绘制边框
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;
    ctx.strokeRect(startX, startY, legendWidth, legendHeight);
    
    // 添加标签
    ctx.font = '12px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText(`${MIN_ELEVATION}m`, startX, startY + legendHeight + 15);
    ctx.fillText(`${MAX_ELEVATION}m`, startX + legendWidth, startY + legendHeight + 15);
    ctx.fillText('Elevation', startX + legendWidth/2, startY - 5);
  };
  
  // 绘制车站
  const drawStation = (
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    floodLevel: number,
    name: string,
    // @ts-ignore - isFailurePoint is used in type definitions
    isFailurePoint: boolean,
    elevation: number
  ) => {
    // 绘制站点圆形
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.fillStyle = getElevationColor(elevation);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 绘制站点名称
    ctx.font = '14px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('St A', x, y + 30);

    // 绘制高程标签
    ctx.font = '12px Arial';
    ctx.fillText(`Elev: ${elevation}m`, x, y + 50);

    // 绘制水位标签
    ctx.fillText(`Water: ${floodLevel.toFixed(1)}%`, x, y + 70);
  };
  
  // 绘制列车
  const drawTrain = (
    ctx: CanvasRenderingContext2D, 
    stationAX: number, 
    stationBX: number, 
    trackNodeX: number, 
    trackY: number
  ) => {
    // 确定列车位置
    let trainX = stationAX;
    
    if (showResult) {
      if (decision === 'allow') {
        // 如果允许通过且水位>50%，列车被困在轨道节点
        if (gameState.trackNode.floodLevel > 50) {
          trainX = trackNodeX;
        } else {
          trainX = stationBX;
        }
      } else {
        // 不允许通过，列车停在A站
        trainX = stationAX;
      }
    } else {
      // 在预测阶段，列车从A站出发
      trainX = stationAX;
    }
    
    // 列车高度和宽度
    const trainWidth = 30;
    const trainHeight = 15;
    const trainY = trackY - trainHeight / 2;
    
    // 绘制列车主体
    ctx.fillStyle = '#3f51b5';
    ctx.fillRect(trainX - trainWidth / 2, trainY, trainWidth, trainHeight);
    
    // 列车车头
    ctx.beginPath();
    ctx.moveTo(trainX + trainWidth / 2, trainY);
    ctx.lineTo(trainX + trainWidth / 2 + 10, trainY + trainHeight / 2);
    ctx.lineTo(trainX + trainWidth / 2, trainY + trainHeight);
    ctx.fill();
    
    // 列车窗户
    ctx.fillStyle = '#90caf9';
    ctx.fillRect(trainX - trainWidth / 2 + 5, trainY + 2, 6, 5);
    ctx.fillRect(trainX - trainWidth / 2 + 15, trainY + 2, 6, 5);
    ctx.fillRect(trainX + trainWidth / 2 - 15, trainY + 2, 6, 5);
    
    // 如果被困，添加警告标识
    if (showResult && decision === 'allow' && gameState.trackNode.floodLevel > 50) {
      ctx.font = 'bold 14px Arial';
      ctx.fillStyle = '#ff5050';
      ctx.fillText('⚠ TRAPPED', trainX, trainY - 10);
    }
  };
  
  // 添加预游戏调查状态
  const [showPreGameSurvey, setShowPreGameSurvey] = useState<boolean>(true);

  // 添加后游戏调查状态
  const [showPostGameSurvey, setShowPostGameSurvey] = useState<boolean>(false);

  // 在 FloodEstimationGame 组件中添加 useEffect 来创建会话
  useEffect(() => {
    const initializeSession = async () => {
      try {
        await createOrUpdateGameSession({
          gameSettings: settings,
          totalScore: 0,
          episodesCompleted: 0
        });
      } catch (error) {
        console.error('Error initializing session:', error);
      }
    };

    initializeSession();
  }, [settings]);

  // 修改 handlePreGameSurveySubmit
  const handlePreGameSurveySubmit = async (answers: any) => {
    try {
      await saveSurveyData({
        surveyType: 'pre-game',
        answers
      });
      setGameState(prev => ({
        ...prev,
        preGameSurvey: answers
      }));
      setShowPreGameSurvey(false);
    } catch (error) {
      console.error('Error saving pre-game survey:', error);
    }
    
    // 记录预游戏调查结果
    logGameState({ 
      decision: null, 
      prediction: null,
      includeSettings: true,
      includePreGameSurvey: true
    });
  };

  // 修改 handlePostGameSurveySubmit
  const handlePostGameSurveySubmit = async (answers: PostGameSurveyAnswers) => {
    
    try {
      // 保存调查数据
      await saveSurveyData({
        surveyType: 'post-game',
        answers: {
          ...answers,
          timestamp: new Date().toISOString()
        }
      });
      
      // Update session to mark game as completed
      await createOrUpdateGameSession({
        endTime: new Date().toISOString(),
        isCompleted: true,
        rewardEmail: answers.emailForGiftCard // 使用 emailForGiftCard 而不是 email
      });
      
      // 更新游戏状态
      setGameState(prev => ({
        ...prev,
        postGameSurvey: answers
      }));
      
      // 记录最终游戏状态
      await logGameState({ 
        decision: null, 
        prediction: null,
        includeSettings: true,
        includePostGameSurvey: true
      });
      
      setShowPostGameSurvey(false);
    } catch (error) {
      console.error('Error saving post-game survey:', error);
      // 可以在这里添加错误提示给用户
    }
  };

  // 修改 handleSurveySubmit
  const handleSurveySubmit = async (answers: any) => {
    try {
      await saveSurveyData({
        surveyType: 'episode',
        episodeNumber: gameState.episode,
        answers
      });
      setGameState(prev => ({
        ...prev,
        episodeSurveys: prev.episodeSurveys ? [...prev.episodeSurveys, answers] : [answers],
      }));
      setShowSurveyDialog(false);
      
      if (gameState.episode < 10) {
        startNewEpisode();
      } else {
        setShowPostGameSurvey(true);
      }
    } catch (error) {
      console.error('Error saving episode survey:', error);
    }
  };

  // 修改 handleDecision
  const handleDecision = async (allow: boolean) => {
    const decisionValue: 'allow' | 'deny' = allow ? 'allow' : 'deny';
    setDecision(decisionValue);
    
    // 计算得分
    let scoreChange = 0;
    let trainTrapped = false;
    
    if (settings.gameType === 'punishment') {
      // Punishment 类型的计分逻辑
      if (!allow) {
        // 不允许通过：延误惩罚
        scoreChange = -10;
      } else if (gameState.trackNode.floodLevel > 50) {
        // 允许通过但水位>50%：列车被困。分数为余下的回合数乘以-50
        scoreChange = -50 * (10 - gameState.round);
        trainTrapped = true;
      }
    } else if (settings.gameType === 'reward') {
      // Reward 类型的计分逻辑
      if (!allow) {
        // 不允许通过：获得40分
        scoreChange = 40;
      } else if (gameState.trackNode.floodLevel > 50) {
        // 允许通过但水位>50%：列车被困，得0分
        scoreChange = 0;
        trainTrapped = true;
      } else {
        // 允许通过且成功：获得50分
        scoreChange = 50;
      }
    }
    
    setGameState(prev => {
      const newState = {
        ...prev,
        score: prev.score + scoreChange,
        decision: decisionValue as 'allow' | 'deny' | null,
        trainTrapped: trainTrapped
      };
      
      // 保存回合数据
      saveGameRound({
        episodeNumber: newState.episode,
        roundNumber: newState.round,
        prediction: newState.prediction,
        decision: decisionValue,
        actualWaterLevel: newState.trackNode.floodLevel,
        score: newState.score,
        timeRemaining: newState.timeRemaining,
        stationAWaterLevel: newState.stationA?.floodLevel || 0,
        stationBWaterLevel: newState.stationB?.floodLevel || 0,
        trackNodeWaterLevel: newState.trackNode.floodLevel,
        isTrainTrapped: trainTrapped,
        // 添加高程数据
        stationAElevation: newState.stationA?.elevation || 0,
        stationBElevation: newState.stationB?.elevation || 0,
        trackNodeElevation: newState.trackNode.elevation
      }).catch(error => {
        console.error('Error saving game round:', error);
      });
      
      return newState;
    });
    
    setShowResult(true);
  };
  
  // 计时器
  useEffect(() => {
    // 如果游戏结束或预游戏调查未完成，不启动计时器
    if (gameState.gameOver || showPreGameSurvey) return;
    
    const timer = setInterval(() => {
      setGameState(prev => {
        if (prev.timeRemaining <= 0) {
          clearInterval(timer);
          
          // 处理超时情况
          // 使用一个标志来确保handleTimeout只被调用一次
          if (!prev.timerActive) {
            // 使用函数形式调用handleTimeout，确保能获取到最新的sliderValue
            setTimeout(() => {
              // 使用函数形式调用handleTimeout，传入当前的sliderValue
              handleTimeout(sliderValue);
            }, 0);
            
            return { ...prev, timeRemaining: 0, timerActive: true };
          }
          
          return { ...prev, timeRemaining: 0 };
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameState.round, gameState.gameOver, gameState.prediction, decision, sliderValue, showPreGameSurvey]);
  
  // 处理超时情况
  const handleTimeout = (currentSliderValue: number) => {
    // 如果是第10轮或列车被困，不显示超时消息
    if (gameState.round === 10 || gameState.trainTrapped) {
      return;
    }
    
    let message = '';
    let prediction = gameState.prediction;
    let decisionValue: 'allow' | 'deny' = 'allow';
    
    if (gameState.prediction === null) {
      // 情况2：既没有提交prediction，也没有提交decision
      // 使用当前滑块值作为prediction，默认decision为allow
      prediction = currentSliderValue;  // 使用传入的当前sliderValue
      decisionValue = 'allow';
      
      message = `Time's up! Your prediction has been automatically set to ${currentSliderValue}% (the value in the slider) and your decision has been set to "Allow Passage".`;
    } else if (decision === null) {
      // 情况1：已提交prediction，但没有提交decision
      // 默认decision为allow
      prediction = gameState.prediction;
      decisionValue = 'allow';
      
      message = `Time's up! Your decision has been automatically set to "Allow Passage".`;
    } else {
      // 情况3：已提交prediction和decision，但未进入下一轮
      prediction = gameState.prediction;
      decisionValue = decision;
      
      message = `Time's up! You have already submitted your prediction and decision. Please click "Next Round" to continue.`;
    }
    
    // 显示弹窗
    setTimeoutMessage(message);
    setShowTimeoutDialog(true);
    
    // 更新状态
    setGameState(prev => {
      // 计算得分
      let scoreChange = 0;
      let trainTrapped = false;
      
      // 如果决策是allow，检查水位
      if (decisionValue === 'allow') {
        if (prev.trackNode.floodLevel > 50) {
          if (settings.gameType === 'punishment') {
            // Punishment类型：列车被困，扣除剩余回合数×50分
            scoreChange = -50 * (10 - prev.round);
          } else if (settings.gameType === 'reward') {
            // Reward类型：列车被困，得0分
            scoreChange = 0;
          }
          trainTrapped = true;
        } else if (settings.gameType === 'reward') {
          // Reward类型：成功通过，得50分
          scoreChange = 50;
        }
      } else {
        if (settings.gameType === 'punishment') {
          // Punishment类型：不允许通过，扣10分
          scoreChange = -10;
        } else if (settings.gameType === 'reward') {
          // Reward类型：不允许通过，得40分
          scoreChange = 40;
        }
      }
      
      return {
        ...prev,
        prediction: prediction,
        decision: decisionValue,
        score: prev.score + scoreChange,
        trainTrapped: trainTrapped
      };
    });
    
    setDecision(decisionValue);
    setShowResult(true);
  };
  
  // 关闭超时弹窗
  const handleCloseTimeoutDialog = () => {
    setShowTimeoutDialog(false);
  };
  
  // 修改 updateFloodLevels 函数
  const updateFloodLevels = () => {
    setGameState(prev => {
      // 记录上一轮水位
      const stationA: Station = {
        id: 0,
        name: 'Station A',
        floodLevel: prev.stationA?.floodLevel || 0,
        isFailurePoint: prev.stationA?.isFailurePoint || false,
        elevation: prev.stationA?.elevation || 0,
        previousFloodLevel: prev.stationA?.floodLevel || 0,
        increaseInThisRound: 0
      };
      
      const stationB: Station = {
        id: 2,
        name: 'Station B',
        floodLevel: prev.stationB?.floodLevel || 0,
        isFailurePoint: prev.stationB?.isFailurePoint || false,
        elevation: prev.stationB?.elevation || 0,
        previousFloodLevel: prev.stationB?.floodLevel || 0,
        increaseInThisRound: 0
      };
      
      const trackNode = {
        ...prev.trackNode,
        previousFloodLevel: prev.trackNode.floodLevel,
        increaseInThisRound: 0
      };
      
      // 故障点涨水
      if (stationA.isFailurePoint) {
        const increase = generateRandomIncrease(
          settings.gameMode,
          randomGenerator.current,
          {
            floodLogNormalMu: gameParams.floodLogNormalMu,
            floodLogNormalSigma: gameParams.floodLogNormalSigma
          }
        );
        stationA.floodLevel = Math.min(100, stationA.floodLevel + increase);
        stationA.increaseInThisRound = increase;
      }
      
      if (stationB.isFailurePoint) {
        const increase = generateRandomIncrease(
          settings.gameMode,
          randomGenerator.current,
          {
            floodLogNormalMu: gameParams.floodLogNormalMu,
            floodLogNormalSigma: gameParams.floodLogNormalSigma
          }
        );
        stationB.floodLevel = Math.min(100, stationB.floodLevel + increase);
        stationB.increaseInThisRound = increase;
      }

      // 添加 track node 作为故障点的处理
      if (trackNode.isFailurePoint) {
        const increase = generateRandomIncrease(
          settings.gameMode,
          randomGenerator.current,
          {
            floodLogNormalMu: gameParams.floodLogNormalMu,
            floodLogNormalSigma: gameParams.floodLogNormalSigma
          }
        );
        trackNode.floodLevel = Math.min(100, trackNode.floodLevel + increase);
        trackNode.increaseInThisRound = increase;
      }
      
      // 洪水传播
      // 从站点A向轨道传播
      if (stationA.floodLevel >= PROPAGATION_THRESHOLD) {
        const result = propagateFlood(
          stationA.floodLevel,
          trackNode.floodLevel,
          stationA.elevation,
          trackNode.elevation,
          settings.difficulty,
          {
            propagationThreshold: gameParams.propagationThreshold,
            propagationFloodIncrease: PROPAGATION_FLOOD_INCREASE,
            elevationDifferenceFactor: ELEVATION_DIFFERENCE_FACTOR,
            floodDifferenceFactor: FLOOD_DIFFERENCE_FACTOR
          }
        );
        trackNode.floodLevel = result.floodLevel;
        trackNode.increaseInThisRound += result.increase;
      }
      
      // 从站点B向轨道传播
      if (stationB.floodLevel >= PROPAGATION_THRESHOLD) {
        const result = propagateFlood(
          stationB.floodLevel,
          trackNode.floodLevel,
          stationB.elevation,
          trackNode.elevation,
          settings.difficulty,
          {
            propagationThreshold: gameParams.propagationThreshold,
            propagationFloodIncrease: PROPAGATION_FLOOD_INCREASE,
            elevationDifferenceFactor: ELEVATION_DIFFERENCE_FACTOR,
            floodDifferenceFactor: FLOOD_DIFFERENCE_FACTOR
          }
        );
        trackNode.floodLevel = result.floodLevel;
        trackNode.increaseInThisRound += result.increase;
      }
      
      // 从轨道向站点传播
      if (trackNode.floodLevel >= PROPAGATION_THRESHOLD) {
        const resultA = propagateFlood(
          trackNode.floodLevel,
          stationA.floodLevel,
          trackNode.elevation,
          stationA.elevation,
          settings.difficulty,
          {
            propagationThreshold: gameParams.propagationThreshold,
            propagationFloodIncrease: PROPAGATION_FLOOD_INCREASE,
            elevationDifferenceFactor: ELEVATION_DIFFERENCE_FACTOR,
            floodDifferenceFactor: FLOOD_DIFFERENCE_FACTOR
          }
        );
        stationA.floodLevel = resultA.floodLevel;
        stationA.increaseInThisRound += resultA.increase;
        
        const resultB = propagateFlood(
          trackNode.floodLevel,
          stationB.floodLevel,
          trackNode.elevation,
          stationB.elevation,
          settings.difficulty,
          {
            propagationThreshold: gameParams.propagationThreshold,
            propagationFloodIncrease: PROPAGATION_FLOOD_INCREASE,
            elevationDifferenceFactor: ELEVATION_DIFFERENCE_FACTOR,
            floodDifferenceFactor: FLOOD_DIFFERENCE_FACTOR
          }
        );
        stationB.floodLevel = resultB.floodLevel;
        stationB.increaseInThisRound += resultB.increase;
      }
      
      // 更新stationA, stationB, trackNode的部分添加额外保护
      stationA.floodLevel = Math.max(0, Math.min(100, stationA.floodLevel));
      stationB.floodLevel = Math.max(0, Math.min(100, stationB.floodLevel));
      trackNode.floodLevel = Math.max(0, Math.min(100, trackNode.floodLevel));
      
      return {
        ...prev,
        trackNode,
        stationA,
        stationB
      };
    });
  };
    
  // 处理玩家预测
  const handlePrediction = () => {
    setGameState(prev => ({
      ...prev,
      prediction: sliderValue
    }));
  };
  
  // 进入下一回合
  const nextRound = () => {
    if (gameState.round >= 10) {
      // 当前episode结束，显示问卷调查
      setShowSurveyDialog(true);
      return;
    }
    
    // 更新一次洪水状态
    updateFloodLevels();
    
    setGameState(prev => ({
      ...prev,
      round: prev.round + 1,
      prediction: null,
      timeRemaining: gameParams.timeRemaining,
      timerActive: false,
      trainTrapped: false // 重置列车被困状态
    }));
    
    setDecision(null);
    setShowResult(false);
    setSliderValue(25);
  };
  
  // 重新开始游戏
  const restartGame = () => {
    // 重置随机生成器
    if (settings.gameMode === 'Fixed') {
      randomGenerator.current = new SeededRandom(settings.seed || DEFAULT_SEED);
    }
    
    const failurePointsSequence = determineFailurePoints();
    
    setGameState({
      round: 1,
      episode: 1,
      score: 0,
      gameOver: false,
      trainTrapped: false,
      prediction: null,
      decision: null,
      stations: [],
      trackNode: {
        floodLevel: 0,
        isFailurePoint: failurePointsSequence.includes(0),
        elevation: getRandomInt(MIN_ELEVATION, MAX_ELEVATION)
      },
      timeRemaining: gameParams.timeRemaining,
      timerActive: false,
      preGameSurvey: preGameSurveyAnswers,
      postGameSurvey: null,
    });
    setDecision(null);
    setShowResult(false);
    setSliderValue(25);
    setShowPreGameSurvey(true); // 重新显示预游戏调查
    setShowPostGameSurvey(false); // 确保后游戏调查不显示
    
    // 重置日志并记录新游戏的设置
    setGameLog([]);
    
    // 延迟执行以确保状态已更新后再记录初始日志
    setTimeout(() => logGameState({ 
      decision: null, 
      prediction: null,
      includeSettings: true  // 包含设置和参数信息
    }), 10);
  };
  
  // 游戏模式和难度的显示
  useEffect(() => {
    console.log(`Game Type: ${settings.gameType}`);
    console.log(`Difficulty: ${settings.difficulty}`);
    console.log(`Game Mode: ${settings.gameMode}`);
  }, []);
  
  // 添加导出日志功能，添加更多标识信息到文件名
  const exportGameLog = () => {
    const logData = JSON.stringify(gameLog, null, 2);
    const blob = new Blob([logData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // 添加难度和模式到文件名
    const a = document.createElement('a');
    a.href = url;
    a.download = `estimate-flood-game-log-${settings.difficulty}-${settings.gameMode}-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // 使用这个useEffect来记录游戏状态的变化，替代多处手动记录
  useEffect(() => {
    // 只在游戏状态实际变化时记录，不在初始化时记录
    if (gameLog.length > 0) {
      // 检查最新一条日志是否与当前回合相同
      const lastLog = gameLog[gameLog.length - 1];
      if (lastLog.round !== gameState.round || 
          (lastLog.playerDecision !== decision && decision !== null) ||
          (lastLog.playerPrediction !== gameState.prediction && gameState.prediction !== null)) {
        // 状态确实发生了变化，记录一次
        logGameState();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.round, gameState.prediction, decision, showResult]);
  
  const [showTimeoutDialog, setShowTimeoutDialog] = useState<boolean>(false);
  const [timeoutMessage, setTimeoutMessage] = useState<string>('');
  const [showSurveyDialog, setShowSurveyDialog] = useState(false);

  // 修改startNewEpisode函数，在每个episode开始时重新随机生成高程、重置水位为0，并重新决定故障点
  const startNewEpisode = () => {
    // 重新确定故障点
    let failurePointsSequence = determineFailurePoints();
    
    // 根据难度级别生成新的高程
    let elevation_A = 0;
    let elevation_B = 0;
    let elevation_track_node = 0;
    
    if(settings.difficulty === 'Easy') {
      elevation_A = getRandomInt((MAX_ELEVATION)*0.4, MAX_ELEVATION*0.7);
      elevation_track_node = getRandomInt((MAX_ELEVATION)*0.4, MAX_ELEVATION*0.7);
      elevation_B = getRandomInt((MAX_ELEVATION)*0.4, MAX_ELEVATION*0.7);
    } else if(settings.difficulty === 'Medium') {
      elevation_A = getRandomInt((MAX_ELEVATION)*0.2, MAX_ELEVATION*0.8);
      elevation_track_node = getRandomInt((MAX_ELEVATION)*0.2, MAX_ELEVATION*0.8);
      elevation_B = getRandomInt((MAX_ELEVATION)*0.2, MAX_ELEVATION*0.8);

      const rankedNodes = rankNodesByElevation(elevation_A, elevation_track_node, elevation_B);
      failurePointsSequence = [rankedNodes[getRandomInt(0, rankedNodes.length - 2)]];
    } else if(settings.difficulty === 'Hard') {
      elevation_A = getRandomInt(MIN_ELEVATION, MAX_ELEVATION);
      elevation_track_node = getRandomInt(MIN_ELEVATION, MAX_ELEVATION);
      elevation_B = getRandomInt(MIN_ELEVATION, MAX_ELEVATION);

      const rankedNodes = rankNodesByElevation(elevation_A, elevation_track_node, elevation_B);
      failurePointsSequence = [rankedNodes[0]];
    }
    
    setGameState(prev => ({
      ...prev,
      episode: prev.episode + 1,
      episodeScore: prev.score,
      round: 1,
      score: 0, // 新episode的分数从0开始
      trackNode: {
        floodLevel: 0,
        isFailurePoint: failurePointsSequence.includes(1),
        elevation: elevation_track_node
      },
      stationA: {
        id: 0,
        name: 'Station A',
        floodLevel: 0,
        isFailurePoint: failurePointsSequence.includes(0),
        elevation: elevation_A,
        previousFloodLevel: 0,
        increaseInThisRound: 0
      },
      stationB: {
        id: 2,
        name: 'Station B',
        floodLevel: 0,
        isFailurePoint: failurePointsSequence.includes(2),
        elevation: elevation_B,
        previousFloodLevel: 0,
        increaseInThisRound: 0
      },
      prediction: null,
      decision: null,
      timeRemaining: gameParams.timeRemaining,
      timerActive: false,
      trainTrapped: false
    }));
    
    // 重置其他状态
    setDecision(null);
    setShowResult(false);
    setSliderValue(25);
    
    // 记录新episode的开始
    logGameState({ 
      decision: null, 
      prediction: null,
      includeSettings: true
    });
  };

  // 在组件挂载时，如果有预游戏调查结果，则设置到游戏状态中
  useEffect(() => {
    if (settings.preGameSurvey) {
      setGameState(prev => ({
        ...prev,
        preGameSurvey: settings.preGameSurvey || null
      }));
    }
  }, [settings.preGameSurvey]);

  return (
    <div className="game-container">
      <Typography variant="h4" className="game-title">
        Subway Flood Prediction Game
      </Typography>

      <div className="game-header">
        <div className="game-header-item">
          <Typography variant="h6">Episode</Typography>
          <Typography variant="h4">{gameState.episode}/10</Typography>
        </div>
        <div className="game-header-item">
          <Typography variant="h6">Round</Typography>
          <Typography variant="h4">{gameState.round}/10</Typography>
        </div>
        <div className="game-header-item">
          <Typography variant="h6">Score</Typography>
          <Typography variant="h4">{gameState.score}</Typography>
        </div>
        <div className="game-header-item">
          <Typography variant="h6">Time Left</Typography>
          <Typography variant="h4">{gameState.timeRemaining}s</Typography>
        </div>
      </div>

      <div className="map-container">
        <Typography variant="body1" gutterBottom>
          Simplified Subway Map
        </Typography>
        <div className="canvas-container">
          <canvas
            ref={canvasRef}
            style={{ backgroundColor: '#1a1a2e' }}
          />
        </div>
      </div>

      <div className="stations-container">
        <div className="station-card">
          <Typography variant="body1">Station A - Water Level: {gameState.stationA?.floodLevel.toFixed(1) || '0.0'}%</Typography>
          <div className="water-level-indicator">
            <div
              className="water-level-fill"
              style={{ width: `${gameState.stationA?.floodLevel || 0}%` }}
            />
          </div>
        </div>
        <div className="station-card">
          <Typography variant="body1">Station B - Water Level: {gameState.stationB?.floodLevel.toFixed(1) || '0.0'}%</Typography>
          <div className="water-level-indicator">
            <div
              className="water-level-fill"
              style={{ width: `${gameState.stationB?.floodLevel || 0}%` }}
            />
          </div>
        </div>
      </div>

      <div className="prediction-container">
        <Typography variant="body1" gutterBottom>
          Track Node Water Level Prediction
        </Typography>
        {gameState.prediction === null ? (
          <>
            <Typography variant="body1">
              Please predict the water level at the track node
            </Typography>
            <div className="prediction-slider">
              <Slider
                value={sliderValue}
                onChange={(_, value) => setSliderValue(value as number)}
                valueLabelDisplay="on"
                min={0}
                max={100}
                sx={{
                  color: '#50ffa0',
                  '& .MuiSlider-thumb': {
                    backgroundColor: '#50ffa0',
                  },
                  '& .MuiSlider-track': {
                    backgroundColor: '#50ffa0',
                  },
                  '& .MuiSlider-rail': {
                    backgroundColor: '#2d3250',
                  },
                }}
              />
            </div>
            <Button
              variant="contained"
              onClick={handlePrediction}
              className="submit-button"
              disabled={gameState.gameOver}
            >
              Submit Prediction
            </Button>
          </>
        ) : !decision ? (
          <>
            <Typography variant="body1" gutterBottom>
              Your Prediction: {gameState.prediction}%
            </Typography>
            <Typography variant="body1" gutterBottom>
              Allow the train to pass?
            </Typography>
            <div className="decision-buttons">
              <Button
                variant="contained"
                onClick={() => handleDecision(true)}
                className="allow-button"
                sx={{
                  backgroundColor: '#50ffa0',
                  '&:hover': {
                    backgroundColor: '#45e890',
                  },
                }}
              >
                Allow Passage
              </Button>
              <Button
                variant="contained"
                onClick={() => handleDecision(false)}
                className="deny-button"
                sx={{
                  backgroundColor: '#ff5050',
                  '&:hover': {
                    backgroundColor: '#e64646',
                  },
                }}
              >
                Deny Passage
              </Button>
            </div>
          </>
        ) : (
          <>
            <Typography variant="body1" gutterBottom>
              Your Prediction: {gameState.prediction}%
            </Typography>
            <Typography variant="body1" gutterBottom>
              Actual Water Level: {gameState.trackNode.floodLevel.toFixed(1)}%
            </Typography>
            <Typography variant="body1" gutterBottom>
              Decision: {decision === 'allow' ? 'Allow Passage' : 'Deny Passage'}
            </Typography>
            
            {gameState.trainTrapped ? (
              <>
                <Typography variant="h6" color="error" gutterBottom>
                  Train is trapped! Score for this round: {gameState.score}
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => setShowSurveyDialog(true)}
                  className="submit-button"
                  sx={{
                    marginTop: 1
                  }}
                >
                  Take Survey
                </Button>
              </>
            ) : gameState.round === 10 ? (
              <>
                <Typography variant="h6" color="success" gutterBottom>
                  Congratulations! You've successfully completed this episode!
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Score for this round: {gameState.score}
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => setShowSurveyDialog(true)}
                  className="submit-button"
                  sx={{
                    marginTop: 1
                  }}
                >
                  Take Survey
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                onClick={nextRound}
                className="submit-button"
                sx={{
                  marginTop: 1
                }}
              >
                Next Round
              </Button>
            )}
          </>
        )}
      </div>

      {gameState.gameOver && (
        <Box textAlign="center">
          <Typography variant="h4" gutterBottom>
            Game Over! Final Score: {gameState.score}
          </Typography>
          <Button
            variant="contained"
            onClick={restartGame}
            sx={{
              backgroundColor: '#50ffa0',
              '&:hover': {
                backgroundColor: '#45e890',
              },
            }}
          >
            Play Again
          </Button>
          <Button
            variant="outlined"
            onClick={exportGameLog}
            sx={{
              marginLeft: 2,
              color: '#50ffa0',
              borderColor: '#50ffa0',
              '&:hover': {
                borderColor: '#45e890',
                backgroundColor: 'rgba(80, 255, 160, 0.1)',
              },
            }}
          >
            Export Log
          </Button>
        </Box>
      )}

      {/* 超时弹窗 */}
      <Dialog
        open={showTimeoutDialog}
        onClose={handleCloseTimeoutDialog}
        aria-labelledby="timeout-dialog-title"
      >
        <DialogTitle id="timeout-dialog-title">Time's Up!</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {timeoutMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTimeoutDialog} color="primary">
            Continue
          </Button>
        </DialogActions>
      </Dialog>

      <SurveyDialog
        open={showSurveyDialog}
        onClose={handleSurveySubmit}
        episodeNumber={gameState.episode}
      />

      <PreGameSurvey
        open={showPreGameSurvey}
        onClose={handlePreGameSurveySubmit}
      />

      <PostGameSurvey
        open={showPostGameSurvey}
        onClose={handlePostGameSurveySubmit}
        gameType={settings.gameType as 'punishment' | 'reward'}
      />
    </div>
  );
};

export default FloodEstimationGame; 