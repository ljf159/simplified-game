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
  TextField,
  Box,
  Slider,
  Divider
} from '@mui/material';

export interface PreGameSurveyAnswers {
  educationLevel: string;
  riskPreferenceGeneral: number;
  riskPreferenceFinancial: string;
  hasSimilarExperience: string;
  experienceDescription: string;
}

interface PreGameSurveyProps {
  open: boolean;
  onClose: (answers: PreGameSurveyAnswers) => void;
}

const PreGameSurvey: React.FC<PreGameSurveyProps> = ({ open, onClose }) => {
  const [answers, setAnswers] = useState<PreGameSurveyAnswers>({
    educationLevel: '',
    riskPreferenceGeneral: 0,
    riskPreferenceFinancial: '',
    hasSimilarExperience: '',
    experienceDescription: ''
  });

  const [showExperienceField, setShowExperienceField] = useState(false);

  const handleChange = (field: keyof PreGameSurveyAnswers) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setAnswers({
      ...answers,
      [field]: event.target.value
    });

    // 如果选择了"是"，显示描述字段
    if (field === 'hasSimilarExperience' && event.target.value === 'yes') {
      setShowExperienceField(true);
    } else if (field === 'hasSimilarExperience' && event.target.value === 'no') {
      setShowExperienceField(false);
    }
  };

  const handleSliderChange = (_: Event, newValue: number | number[]) => {
    setAnswers({
      ...answers,
      riskPreferenceGeneral: newValue as number
    });
  };

  const handleSubmit = () => {
    onClose(answers);
  };

  const isFormValid = () => {
    return (
      answers.educationLevel !== '' &&
      answers.riskPreferenceFinancial !== '' &&
      answers.hasSimilarExperience !== ''
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

        <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
          <FormLabel component="legend">
            1. Education Level: (Please select the highest level of education you have completed)
          </FormLabel>
          <RadioGroup
            value={answers.educationLevel}
            onChange={handleChange('educationLevel')}
          >
            <FormControlLabel value="less_than_high_school" control={<Radio />} label="Less than high school" />
            <FormControlLabel value="high_school" control={<Radio />} label="High school diploma or equivalent" />
            <FormControlLabel value="some_college" control={<Radio />} label="Some college" />
            <FormControlLabel value="associates" control={<Radio />} label="Associate's degree" />
            <FormControlLabel value="bachelors" control={<Radio />} label="Bachelor's degree" />
            <FormControlLabel value="masters" control={<Radio />} label="Master's degree" />
            <FormControlLabel value="doctoral" control={<Radio />} label="Doctoral degree or higher" />
          </RadioGroup>
        </FormControl>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" gutterBottom>
            2. Risk Preference (General): Please indicate how much you agree with the following statement. (1 = Strongly Disagree, 5 = Strongly Agree)
          </Typography>
          <Typography variant="body1" gutterBottom>
            "I am generally a risk-taker."
          </Typography>
          <FormControl component="fieldset" fullWidth>
            <RadioGroup
              row
              value={answers.riskPreferenceGeneral}
              onChange={(e) => setAnswers({ ...answers, riskPreferenceGeneral: Number(e.target.value) })}
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

        <Divider sx={{ my: 2 }} />

        <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
          <FormLabel component="legend">
            3. Risk Preference (Financial): Imagine you have a choice between receiving a guaranteed amount of $50 or a 50% chance of receiving $100 and a 50% chance of receiving $0. Which option would you choose?
          </FormLabel>
          <RadioGroup
            value={answers.riskPreferenceFinancial}
            onChange={handleChange('riskPreferenceFinancial')}
          >
            <FormControlLabel value="guaranteed" control={<Radio />} label="Guaranteed $50" />
            <FormControlLabel value="risky" control={<Radio />} label="50% chance of $100 / 50% chance of $0" />
          </RadioGroup>
        </FormControl>

        <Divider sx={{ my: 2 }} />

        <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
          <FormLabel component="legend">
            4. Experience with Similar Games: Have you played any games or simulations in the past that involved making decisions under uncertainty or predicting outcomes?
          </FormLabel>
          <RadioGroup
            value={answers.hasSimilarExperience}
            onChange={handleChange('hasSimilarExperience')}
          >
            <FormControlLabel value="yes" control={<Radio />} label="Yes" />
            <FormControlLabel value="no" control={<Radio />} label="No" />
          </RadioGroup>
        </FormControl>

        {showExperienceField && (
          <TextField
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            label="If yes, please briefly describe (optional)"
            value={answers.experienceDescription}
            onChange={handleChange('experienceDescription')}
            sx={{ mb: 3 }}
          />
        )}
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