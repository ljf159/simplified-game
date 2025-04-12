import React, { useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import FloodEstimationGame from './FloodEstimationGame'
import ConsentForm from './ConsentForm'
import GameInstructions from './GameInstructions'
import PreGameSurvey from './PreGameSurvey'
import { PreGameSurveyAnswers } from './PreGameSurvey'
import ThankYouPage from './ThankYouPage'
import GameAssignment from './GameAssignment'

function App() {
  const navigate = useNavigate();
  // 状态管理
  const [showConsentForm, setShowConsentForm] = useState(true);
  const [showGameInstructions, setShowGameInstructions] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [preGameSurveyAnswers, setPreGameSurveyAnswers] = useState<PreGameSurveyAnswers | null>(null);

  // 处理同意书提交
  const handleConsentSubmit = (consented: boolean) => {
    if (consented) {
      setShowConsentForm(false);
      setShowGameInstructions(true);
    } else {
      // 如果用户不同意，可以显示一个消息或重定向到其他页面
      alert("You have declined to participate in the study. Thank you for your time.");
      // 可以在这里添加重定向逻辑
    }
  };

  // 处理游戏说明关闭
  const handleGameInstructionsClose = () => {
    setShowGameInstructions(false);
    // 修改：当游戏说明关闭后，导航到游戏分配页面
    navigate('/assign-game');
  };

  // 处理预游戏调查提交
  const handlePreGameSurveySubmit = (answers: PreGameSurveyAnswers) => {
    setPreGameSurveyAnswers(answers);
    // 使用React Router的state传递预游戏调查结果
    navigate('/', { state: { preGameSurvey: answers } });
  };

  return (
    <div>
      <Routes>
        <Route path="/assign-game" element={<GameAssignment />} />
        <Route path="/thank-you" element={<ThankYouPage />} />
        <Route path="/" element={
          <>
            {showConsentForm && (
              <ConsentForm 
                open={showConsentForm} 
                onClose={handleConsentSubmit} 
              />
            )}
            
            {showGameInstructions && (
              <GameInstructions 
                open={showGameInstructions} 
                onClose={handleGameInstructionsClose} 
              />
            )}
            
            {!showConsentForm && !showGameInstructions && (
              <FloodEstimationGame preGameSurveyAnswers={preGameSurveyAnswers} />
            )}
          </>
        } />
      </Routes>
    </div>
  )
}

export default App 