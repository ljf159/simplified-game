import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  TextField,
  Box,
} from '@mui/material';

export interface PostGameSurveyAnswers {
  confidenceEffect: string;
  scoringSystemEffect: string;
  strategyEvolution: string;
  patternRecognition: string;
  decisionFactors: string;
  otherDecisionFactor: string;
  riskPreferencePostGame: string;
  wantsGiftCard: boolean;
  emailForGiftCard: string;
}

interface PostGameSurveyProps {
  open: boolean;
  onClose: (answers: PostGameSurveyAnswers) => void;
  gameType: 'punishment' | 'reward';
}

const PostGameSurvey: React.FC<PostGameSurveyProps> = ({ open, onClose, gameType }) => {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<PostGameSurveyAnswers>({
    confidenceEffect: '',
    scoringSystemEffect: '',
    strategyEvolution: '',
    patternRecognition: '',
    decisionFactors: '',
    otherDecisionFactor: '',
    riskPreferencePostGame: '',
    wantsGiftCard: false,
    emailForGiftCard: '',
  });

  const [showThankYouPage, setShowThankYouPage] = useState<boolean>(false);
  const [showGiftCardForm, setShowGiftCardForm] = useState<boolean>(false);
  const [showOtherDecisionFactor, setShowOtherDecisionFactor] = useState<boolean>(false);

  const handleChange = (field: keyof PostGameSurveyAnswers) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    setAnswers((prev) => ({ ...prev, [field]: value }));
    
    if (field === 'decisionFactors' && value === 'other') {
      setShowOtherDecisionFactor(true);
    } else if (field === 'decisionFactors' && value !== 'other') {
      setShowOtherDecisionFactor(false);
    }
  };

  const handleSubmit = () => {
    setShowThankYouPage(true);
  };

  const handleGiftCardSubmit = () => {
    onClose({
      ...answers,
      wantsGiftCard: true
    });
    
    navigate('/thank-you', { state: { wantsGiftCard: true } });
  };

  const handleNoGiftCard = () => {
    setAnswers({ ...answers, wantsGiftCard: false });
    
    onClose({
      ...answers,
      wantsGiftCard: false
    });
    
    navigate('/thank-you', { state: { wantsGiftCard: false } });
  };

  const isFormValid = () => {
    return (
      answers.confidenceEffect !== '' &&
      answers.scoringSystemEffect !== '' &&
      answers.strategyEvolution.trim() !== '' &&
      answers.patternRecognition.trim() !== '' &&
      answers.decisionFactors !== '' &&
      (answers.decisionFactors !== 'other' || answers.otherDecisionFactor.trim() !== '') &&
      answers.riskPreferencePostGame !== ''
    );
  };

  return (
    <Dialog open={open} maxWidth="md" fullWidth>
      {!showThankYouPage ? (
        <>
          <DialogTitle>Post-Game Survey</DialogTitle>
          <DialogContent>
            <Typography variant="body1" paragraph>
              Thank you for completing all episodes of the game! Please take a moment to complete this final survey about your experience.
            </Typography>

            {/* Question 1: Confidence Effect */}
            <FormControl component="fieldset" sx={{ mb: 4, width: '100%' }}>
              <FormLabel component="legend">
                1. As you gained experience with the game, did your willingness to allow trains to pass when water levels were close to 50%:
              </FormLabel>
              <RadioGroup
                value={answers.confidenceEffect}
                onChange={handleChange('confidenceEffect')}
              >
                <FormControlLabel 
                  value="increased" 
                  control={<Radio />} 
                  label="Increased (became more willing to risk it)" 
                />
                <FormControlLabel 
                  value="decreased" 
                  control={<Radio />} 
                  label="Decreased (became more cautious)" 
                />
                <FormControlLabel 
                  value="same" 
                  control={<Radio />} 
                  label="Remained about the same" 
                />
              </RadioGroup>
            </FormControl>

            {/* Question 2: Scoring System Effect */}
            <FormControl component="fieldset" sx={{ mb: 4, width: '100%' }}>
              <FormLabel component="legend">
                2. {gameType === 'punishment' 
                  ? "When your score was decreasing, did you tend to make:" 
                  : "When your score was increasing, did you tend to make:"}
              </FormLabel>
              <RadioGroup
                value={answers.scoringSystemEffect}
                onChange={handleChange('scoringSystemEffect')}
              >
                <FormControlLabel 
                  value="more_risky" 
                  control={<Radio />} 
                  label="More risky decisions (allowing trains to pass in uncertain conditions)" 
                />
                <FormControlLabel 
                  value="more_cautious" 
                  control={<Radio />} 
                  label="More cautious decisions (denying passage when uncertain)" 
                />
                <FormControlLabel 
                  value="no_change" 
                  control={<Radio />} 
                  label="No consistent change in approach" 
                />
              </RadioGroup>
            </FormControl>

            {/* Question 3: Strategy Evolution */}
            <FormControl component="fieldset" sx={{ mb: 4, width: '100%' }}>
              <FormLabel component="legend">
                3. Strategy Evolution: "How did your strategy change over the course of the game?"
              </FormLabel>
              <TextField
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                value={answers.strategyEvolution}
                onChange={handleChange('strategyEvolution')}
                sx={{ mt: 2 }}
              />
            </FormControl>

            {/* Question 4: Pattern Recognition */}
            <FormControl component="fieldset" sx={{ mb: 4, width: '100%' }}>
              <FormLabel component="legend">
                4. Pattern Recognition: "What relationships did you notice between station water levels and track node water levels?"
              </FormLabel>
              <TextField
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                value={answers.patternRecognition}
                onChange={handleChange('patternRecognition')}
                sx={{ mt: 2 }}
              />
            </FormControl>

            {/* Question 5: Decision Factors */}
            <FormControl component="fieldset" sx={{ mb: 4, width: '100%' }}>
              <FormLabel component="legend">
                5. Decision Factors: "Which factor most influenced your decisions by the end of the game?"
              </FormLabel>
              <RadioGroup
                value={answers.decisionFactors}
                onChange={handleChange('decisionFactors')}
              >
                <FormControlLabel 
                  value="water_levels" 
                  control={<Radio />} 
                  label="Water level percentages at stations" 
                />
                <FormControlLabel 
                  value="elevation" 
                  control={<Radio />} 
                  label="Elevation differences" 
                />
                <FormControlLabel 
                  value="experience" 
                  control={<Radio />} 
                  label="Previous outcomes/experience" 
                />
                <FormControlLabel 
                  value="scoring" 
                  control={<Radio />} 
                  label="Scoring results" 
                />
                <FormControlLabel 
                  value="other" 
                  control={<Radio />} 
                  label="Other" 
                />
              </RadioGroup>
              {showOtherDecisionFactor && (
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Please specify"
                  value={answers.otherDecisionFactor}
                  onChange={handleChange('otherDecisionFactor')}
                  sx={{ mt: 2 }}
                />
              )}
            </FormControl>

            {/* Question 6: Risk Preference (Post-Game) */}
            <FormControl component="fieldset" sx={{ mb: 4, width: '100%' }}>
              <FormLabel component="legend">
                6. Risk Preference (Post-Game): "After playing this game, how would you rate your current risk-taking preference?"
              </FormLabel>
              <Typography variant="caption" display="block" gutterBottom>
                1: Strongly prefer avoiding risks, 7: Strongly prefer taking risks
              </Typography>
              <RadioGroup
                row
                value={answers.riskPreferencePostGame}
                onChange={handleChange('riskPreferencePostGame')}
              >
                <FormControlLabel value="1" control={<Radio />} label="1" />
                <FormControlLabel value="2" control={<Radio />} label="2" />
                <FormControlLabel value="3" control={<Radio />} label="3" />
                <FormControlLabel value="4" control={<Radio />} label="4" />
                <FormControlLabel value="5" control={<Radio />} label="5" />
                <FormControlLabel value="6" control={<Radio />} label="6" />
                <FormControlLabel value="7" control={<Radio />} label="7" />
              </RadioGroup>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleSubmit} variant="contained" color="primary" disabled={!isFormValid()}>
              Submit Survey
            </Button>
          </DialogActions>
        </>
      ) : !showGiftCardForm ? (
        <>
          <DialogTitle>Thank You!</DialogTitle>
          <DialogContent>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h5" gutterBottom>
                Thank you for completing the game and survey!
              </Typography>
              <Typography variant="body1" paragraph>
                Your responses have been recorded. The game has ended.
              </Typography>
              <Typography variant="body1" paragraph sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                As a token of our appreciation, we would like to offer you an Amazon Gift Card based on your performance!
              </Typography>
              <Typography variant="body1" paragraph>
                Players who rank in the top 50% will receive a $15 Amazon Gift Card, while others will receive a $5 Amazon Gift Card. This ranking is based on your total game score.
              </Typography>
              <Typography variant="body1" paragraph>
                Would you like to receive your reward?
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={() => {
                    setAnswers({ ...answers, wantsGiftCard: true });
                    setShowGiftCardForm(true);
                  }}
                >
                  Yes, I want the gift card
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={handleNoGiftCard}
                >
                  No, thank you
                </Button>
              </Box>
            </Box>
          </DialogContent>
        </>
      ) : (
        <>
          <DialogTitle>Claim Your Gift Card</DialogTitle>
          <DialogContent>
            <Box sx={{ py: 2 }}>
              <Typography variant="body1" paragraph>
                Please provide your email address where we can send your Amazon Gift Card.
              </Typography>
              <TextField
                fullWidth
                label="Email Address"
                variant="outlined"
                value={answers.emailForGiftCard}
                onChange={(e) => setAnswers({ ...answers, emailForGiftCard: e.target.value })}
                sx={{ mt: 2, mb: 3 }}
              />
              <Typography variant="body2" color="text.secondary" paragraph>
                We will send your gift card within 5 business days after the data collection is complete. Your email will only be used for sending the gift card and will not be shared with any third parties.
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleGiftCardSubmit} variant="contained" color="primary" disabled={!answers.emailForGiftCard.trim()}>
              Submit
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default PostGameSurvey; 