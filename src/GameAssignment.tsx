import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Container } from '@mui/material';

// 定义所有可能的游戏组合
const GAME_COMBINATIONS = [
  { difficulty: 'Easy', gameType: 'punishment' },
  { difficulty: 'Easy', gameType: 'reward' },
  { difficulty: 'Medium', gameType: 'punishment' },
  { difficulty: 'Medium', gameType: 'reward' },
  { difficulty: 'Hard', gameType: 'punishment' },
  { difficulty: 'Hard', gameType: 'reward' }
];

const GameAssignment: React.FC = () => {
  const navigate = useNavigate();
  const [isAssigning, setIsAssigning] = useState(true);

  useEffect(() => {
    const assignGame = () => {
      // 随机选择一个组合
      const randomIndex = Math.floor(Math.random() * GAME_COMBINATIONS.length);
      const assignedCombination = GAME_COMBINATIONS[randomIndex];

      // 创建游戏设置
      const gameSettings = {
        ...assignedCombination,
        gameMode: 'Random', // 默认使用随机模式
        seed: Math.floor(Math.random() * 1000000) // 生成随机种子
      };

      // 使用 setTimeout 来模拟加载过程
      setTimeout(() => {
        setIsAssigning(false);
        // 导航到游戏页面，并传递分配的设置
        navigate('/', { 
          state: gameSettings,
          replace: true // 替换历史记录，这样用户不能返回到分配页面
        });
      }, 1500);
    };

    assignGame();
  }, [navigate]);

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center'
        }}
      >
        {isAssigning ? (
          <>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h5" gutterBottom>
              Preparing Your Game...
            </Typography>
            <Typography variant="body1" color="text.secondary">
              We are setting up a unique game experience for you
            </Typography>
          </>
        ) : (
          <Typography variant="h5">
            Redirecting to game...
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default GameAssignment; 