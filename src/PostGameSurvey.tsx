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
  overallExperience: number;
  perceivedDifficulty: number;
  performanceAssessment: number;
  strategyChanged: string;
  strategyDescription: string;
  confidenceChange: string;
  confidenceChangeReason: string;
  riskPreferencePostGame: number;
  openFeedback: string;
  wantsGiftCard: boolean;
  emailForGiftCard: string;
}

interface PostGameSurveyProps {
  open: boolean;
  onClose: (answers: PostGameSurveyAnswers) => void;
}

const PostGameSurvey: React.FC<PostGameSurveyProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<PostGameSurveyAnswers>({
    overallExperience: 0,
    perceivedDifficulty: 0,
    performanceAssessment: 0,
    strategyChanged: '',
    strategyDescription: '',
    confidenceChange: '',
    confidenceChangeReason: '',
    riskPreferencePostGame: 0,
    openFeedback: '',
    wantsGiftCard: false,
    emailForGiftCard: '',
  });

  const [showStrategyDescription, setShowStrategyDescription] = useState<boolean>(false);
  const [showThankYouPage, setShowThankYouPage] = useState<boolean>(false);
  const [showGiftCardForm, setShowGiftCardForm] = useState<boolean>(false);
  const [showFinalThankYou, setShowFinalThankYou] = useState<boolean>(false);

  const handleChange = (field: keyof PostGameSurveyAnswers) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    setAnswers((prev) => ({ ...prev, [field]: value }));
    
    // 如果策略变化字段从"no"变为"yes"，显示描述字段
    if (field === 'strategyChanged' && value === 'yes') {
      setShowStrategyDescription(true);
    } else if (field === 'strategyChanged' && value === 'no') {
      setShowStrategyDescription(false);
    }
  };

  const handleSliderChange = (field: keyof PostGameSurveyAnswers) => (
    _: Event,
    value: number | number[]
  ) => {
    setAnswers((prev) => ({ ...prev, [field]: value as number }));
  };

  const handleSubmit = () => {
    // 先显示感谢页面
    setShowThankYouPage(true);
  };

  const handleGiftCardSubmit = () => {
    // // 显示最终感谢页面
    // setShowFinalThankYou(true);
    
    // 调用 onClose 并传递完整的答案
    onClose({
      ...answers,
      wantsGiftCard: true
    });
    
    // 跳转到感谢页面
    navigate('/thank-you', { state: { wantsGiftCard: true } });
  };

  const handleNoGiftCard = () => {
    // 设置不想要礼品卡
    setAnswers({ ...answers, wantsGiftCard: false });
    // // 显示最终感谢页面
    // setShowFinalThankYou(true);
    
    // 调用 onClose 并传递完整的答案
    onClose({
      ...answers,
      wantsGiftCard: false
    });
    
    // 跳转到感谢页面
    navigate('/thank-you', { state: { wantsGiftCard: false } });
  };

  const isFormValid = () => {
    return (
      answers.overallExperience > 0 &&
      answers.perceivedDifficulty > 0 &&
      answers.performanceAssessment > 0 &&
      answers.strategyChanged !== undefined &&
      answers.confidenceChange !== undefined &&
      answers.riskPreferencePostGame > 0 &&
      (answers.strategyChanged !== 'yes' || answers.strategyDescription.trim() !== '')
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

            {/* Question 1: Overall Experience */}
            <Box sx={{ mb: 4 }}>
              <FormControl component="fieldset">
                <FormLabel component="legend">
                  1. Overall Experience: How would you rate your overall experience playing this game? (1 = Very Negative, 5 = Very Positive)
                </FormLabel>
                <RadioGroup
                  row
                  value={answers.overallExperience}
                  onChange={(e) => setAnswers({ ...answers, overallExperience: Number(e.target.value) })}
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <FormControlLabel
                      key={value}
                      value={value}
                      control={<Radio />}
                      label={value.toString()}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </Box>

            {/* Question 2: Perceived Difficulty */}
            <Box sx={{ mb: 4 }}>
              <FormControl component="fieldset">
                <FormLabel component="legend">
                  2. Perceived Difficulty: How difficult did you find the game overall? (1 = Very Easy, 5 = Very Difficult)
                </FormLabel>
                <RadioGroup
                  row
                  value={answers.perceivedDifficulty}
                  onChange={(e) => setAnswers({ ...answers, perceivedDifficulty: Number(e.target.value) })}
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <FormControlLabel
                      key={value}
                      value={value}
                      control={<Radio />}
                      label={value.toString()}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </Box>

            {/* Question 3: Performance Assessment */}
            <Box sx={{ mb: 4 }}>
              <FormControl component="fieldset">
                <FormLabel component="legend">
                  3. Performance Assessment: How well do you think you performed in the game? (1 = Very Poor, 5 = Very Good)
                </FormLabel>
                <RadioGroup
                  row
                  value={answers.performanceAssessment}
                  onChange={(e) => setAnswers({ ...answers, performanceAssessment: Number(e.target.value) })}
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <FormControlLabel
                      key={value}
                      value={value}
                      control={<Radio />}
                      label={value.toString()}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </Box>

            {/* Question 4: Strategy Changes */}
            <Box sx={{ mb: 4 }}>
              <FormControl component="fieldset">
                <FormLabel component="legend">
                  4. Strategy Changes: Did your strategy for making decisions change as you played more rounds and episodes?
                </FormLabel>
                <RadioGroup
                  value={answers.strategyChanged}
                  onChange={handleChange('strategyChanged')}
                >
                  <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
              {showStrategyDescription && (
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                  label="If yes, please briefly describe how your strategy changed"
                  value={answers.strategyDescription}
                  onChange={handleChange('strategyDescription')}
                  sx={{ mt: 2 }}
                />
              )}
            </Box>

            {/* Question 5: Confidence Over Time */}
            <Box sx={{ mb: 4 }}>
              <FormControl component="fieldset">
                <FormLabel component="legend">
                  5. Confidence Over Time: Thinking back over the entire game, did your confidence in your ability to predict the track node water level increase, decrease, or stay the same?
                </FormLabel>
                <RadioGroup
                  value={answers.confidenceChange}
                  onChange={handleChange('confidenceChange')}
                >
                  <FormControlLabel value="increased" control={<Radio />} label="Increased" />
                  <FormControlLabel value="decreased" control={<Radio />} label="Decreased" />
                  <FormControlLabel value="stayed the same" control={<Radio />} label="Stayed the same" />
                </RadioGroup>
              </FormControl>
            </Box>

            {/* Question 6: Risk Preference (Post-Game) */}
            <Box sx={{ mb: 4 }}>
              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend">
                  6. Risk Preference (Post-Game): Please indicate how much you agree with the following statement. (1 = Strongly Disagree, 5 = Strongly Agree)
                </FormLabel>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  "After playing this game, I feel like I am generally more of a risk-taker."
                </Typography>
                <RadioGroup
                  row
                  value={answers.riskPreferencePostGame}
                  onChange={(e) => setAnswers({ ...answers, riskPreferencePostGame: Number(e.target.value) })}
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <FormControlLabel
                      key={value}
                      value={value}
                      control={<Radio />}
                      label={value.toString()}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </Box>

            {/* Question 7: Open Feedback */}
            <Box sx={{ mb: 4 }}>
              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend">
                  7. Open Feedback: Do you have any other comments or feedback about the game or the study?
                </FormLabel>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  value={answers.openFeedback}
                  onChange={handleChange('openFeedback')}
                  sx={{ mt: 2 }}
                />
              </FormControl>
            </Box>
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
                Please provide your email address where we can send your $10 Amazon Gift Card.
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
                We will send your gift card within 5 business days. Your email will only be used for sending the gift card and will not be shared with any third parties.
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