import React, { useState } from 'react';
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
  Box,
  Divider,
} from '@mui/material';

export interface PreGameSurveyAnswers {
  riskPreference: string;
  decisionMakingStyle: string;
  lossAversion: string;
  safetyVsEfficiency: string;
}

interface PreGameSurveyProps {
  open: boolean;
  onClose: (answers: PreGameSurveyAnswers) => void;
}

const PreGameSurvey: React.FC<PreGameSurveyProps> = ({ open, onClose }) => {
  const [answers, setAnswers] = useState<PreGameSurveyAnswers>({
    riskPreference: '',
    decisionMakingStyle: '',
    lossAversion: '',
    safetyVsEfficiency: ''
  });

  const handleChange = (field: keyof PreGameSurveyAnswers) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setAnswers({
      ...answers,
      [field]: event.target.value
    });
  };

  const handleSubmit = () => {
    onClose(answers);
  };

  const isFormValid = () => {
    return (
      answers.riskPreference !== '' &&
      answers.decisionMakingStyle !== '' &&
      answers.lossAversion !== '' &&
      answers.safetyVsEfficiency !== ''
    );
  };

  return (
    <Dialog open={open} maxWidth="md" fullWidth>
      <DialogTitle>Pre-Game Survey</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" gutterBottom>
            Please complete this survey before starting the game. Your responses will help us understand how different factors influence decision-making in flood prediction scenarios.
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Question 1: Risk Preference */}
        <Box sx={{ mb: 4 }}>
          <FormControl component="fieldset" fullWidth>
            <FormLabel component="legend">
              1. Risk Preference: "On a scale of 1-7, how willing are you to take risks in safety-critical situations?"
            </FormLabel>
            <Typography variant="caption" display="block" gutterBottom>
              1: Very unwilling, 7: Very willing
            </Typography>
            <RadioGroup
              row
              value={answers.riskPreference}
              onChange={handleChange('riskPreference')}
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
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Question 2: Decision-Making Style */}
        <FormControl component="fieldset" sx={{ mb: 4, width: '100%' }}>
          <FormLabel component="legend">
            2. Decision-Making Style: "When making decisions under uncertainty, do you typically:"
          </FormLabel>
          <RadioGroup
            value={answers.decisionMakingStyle}
            onChange={handleChange('decisionMakingStyle')}
          >
            <FormControlLabel 
              value="cautious" 
              control={<Radio />} 
              label="Prefer to be cautious and avoid potential negative outcomes" 
            />
            <FormControlLabel 
              value="pursue" 
              control={<Radio />} 
              label="Prefer to pursue potential positive outcomes despite some risk" 
            />
            <FormControlLabel 
              value="depends" 
              control={<Radio />} 
              label="It depends on the specific situation" 
            />
          </RadioGroup>
        </FormControl>

        <Divider sx={{ my: 2 }} />

        {/* Question 3: Loss Aversion */}
        <FormControl component="fieldset" sx={{ mb: 4, width: '100%' }}>
          <FormLabel component="legend">
            3. Imagine you are playing a game where you can either: a) Guarantee keeping $50 you already have, or b) Take a 50% chance of keeping $100 and 50% chance of getting $0. Which would you choose?
          </FormLabel>
          <RadioGroup
            value={answers.lossAversion}
            onChange={handleChange('lossAversion')}
          >
            <FormControlLabel 
              value="keep" 
              control={<Radio />} 
              label="Keep $50 for sure" 
            />
            <FormControlLabel 
              value="gamble" 
              control={<Radio />} 
              label="Take the 50/50 gamble" 
            />
          </RadioGroup>
        </FormControl>

        <Divider sx={{ my: 2 }} />

        {/* Question 4: Safety vs. Efficiency */}
        <FormControl component="fieldset" sx={{ mb: 4, width: '100%' }}>
          <FormLabel component="legend">
            4. Safety vs. Efficiency: "In transportation operations, which do you generally consider more important?"
          </FormLabel>
          <RadioGroup
            value={answers.safetyVsEfficiency}
            onChange={handleChange('safetyVsEfficiency')}
          >
            <FormControlLabel 
              value="safety" 
              control={<Radio />} 
              label="Ensuring complete safety, even if it means delays" 
            />
            <FormControlLabel 
              value="efficiency" 
              control={<Radio />} 
              label="Maintaining efficient service, with reasonable safety measures" 
            />
            <FormControlLabel 
              value="both" 
              control={<Radio />} 
              label="Both are equally important" 
            />
          </RadioGroup>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSubmit} color="primary" disabled={!isFormValid()}>
          Start Game
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PreGameSurvey; 