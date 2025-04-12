import { useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import FloodEstimationGame from './FloodEstimationGame'
import ConsentForm from './ConsentForm'
import GameInstructions from './GameInstructions'
import { PreGameSurveyAnswers } from './PreGameSurvey'
import ThankYouPage from './ThankYouPage'
import GameAssignment from './GameAssignment'

function App() {
  const navigate = useNavigate();
  const [showConsentForm, setShowConsentForm] = useState(true);
  const [showGameInstructions, setShowGameInstructions] = useState(false);
  const [preGameSurveyAnswers] = useState<PreGameSurveyAnswers | null>(null);

  // Handle consent form submission
  const handleConsentSubmit = (consented: boolean) => {
    if (consented) {
      setShowConsentForm(false);
      setShowGameInstructions(true);
    } else {
      alert("You have declined to participate in the study. Thank you for your time.");
    }
  };

  // Handle game instructions close
  const handleGameInstructionsClose = () => {
    setShowGameInstructions(false);
    navigate('/assign-game');
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