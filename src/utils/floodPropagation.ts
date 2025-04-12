// 传播常量
export const PROPAGATION_THRESHOLD = 10; // 传播阈值
export const PROPAGATION_FLOOD_INCREASE = 100; // 基础传播增量

// 控制传播速度
export const ELEVATION_DIFFERENCE_FACTOR = 0.5; // 高度差影响系数
export const FLOOD_DIFFERENCE_FACTOR = 0.2; // 水位差影响系数

// mu和sigma
export const FLOOD_LOG_NORMAL_MU = 7;
export const FLOOD_LOG_NORMAL_SIGMA = 1;

// 高程常量
export const MIN_ELEVATION = 0; // 最低高程 (m)
export const MAX_ELEVATION = 10; // 最高高程 (m)

/**
 * 传播洪水的函数
 */
export const propagateFlood = (
  sourceLevel: number,
  targetLevel: number,
  sourceElevation: number,
  targetElevation: number,
  difficulty: string,
  params: {
    propagationThreshold: number,
    propagationFloodIncrease: number,
    elevationDifferenceFactor: number,
    floodDifferenceFactor: number
  }
): { floodLevel: number, increase: number } => {
  if (sourceLevel >= params.propagationThreshold && sourceLevel > targetLevel) {
    const floodDifference = sourceLevel - targetLevel;
    const elevationDifference = sourceElevation - targetElevation;

    let adjustedElevationDifferenceFactor = params.elevationDifferenceFactor;
    if(difficulty === 'Easy') {
      adjustedElevationDifferenceFactor = params.elevationDifferenceFactor * 0.4;
    } else if(difficulty === 'Medium') {
      adjustedElevationDifferenceFactor = params.elevationDifferenceFactor * 0.9;
    }
    
    // 将elevationFactor限制在0.1以上，防止出现负数
    const elevationFactor = Math.max(0.1, 1 + (elevationDifference * adjustedElevationDifferenceFactor));

    // 确保propagationAmount始终为正数
    const propagationAmount = Math.max(0, Math.min(
      params.propagationFloodIncrease,
      Math.ceil(floodDifference * params.floodDifferenceFactor * elevationFactor)
    ));
    
    console.log('propagationAmount', propagationAmount);
    
    const newLevel = Math.min(100, Math.max(0, targetLevel + propagationAmount));

    return {
      floodLevel: newLevel,
      increase: propagationAmount
    };
  }
  return { floodLevel: targetLevel, increase: 0 };
};

/**
 * 生成随机的洪水增长量
 */
export const generateRandomIncrease = (
  gameMode: string,
  randomGenerator: { random: () => number } | null,
  params: {
    floodLogNormalMu: number,
    floodLogNormalSigma: number
  }
): number => {
  const mu = Math.log(params.floodLogNormalMu);
  const sigma = params.floodLogNormalSigma;
  
  let normal;
  if (gameMode === 'Fixed' && randomGenerator) {
    // 使用种子随机数生成器的Box-Muller变换
    const u1 = randomGenerator.random();
    const u2 = randomGenerator.random();
    normal = mu + sigma * (Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2));
  } else {
    normal = mu + sigma * (Math.sqrt(-2 * Math.log(Math.random())) * Math.cos(2 * Math.PI * Math.random()));
  }
  
  return Math.round(Math.exp(normal) * 10) / 10; // 保留1位小数
};

/**
 * 根据高程对节点进行排序
 */
export const rankNodesByElevation = (elevation_A: number, elevation_track_node: number, elevation_B: number) => {
  // Create an array of objects with node index and elevation
  const nodes = [
    { index: 0, name: 'Station A', elevation: elevation_A },
    { index: 1, name: 'Track Node', elevation: elevation_track_node },
    { index: 2, name: 'Station B', elevation: elevation_B }
  ];
  
  // Sort by elevation in descending order
  nodes.sort((a, b) => b.elevation - a.elevation);
  
  // Return just the indices in order of highest to lowest elevation
  return nodes.map(node => node.index);
}; 