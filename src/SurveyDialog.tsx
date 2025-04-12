import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Box
} from '@mui/material';

interface SurveyDialogProps {
  open: boolean;
  onClose: (answers: SurveyAnswers) => void;
  episodeNumber: number;
}

export interface SurveyAnswers {
  familiarity: number;
  confidence: number;
  riskiness: number;
}

const SurveyDialog: React.FC<SurveyDialogProps> = ({ open, onClose, episodeNumber }) => {
  const [answers, setAnswers] = useState<SurveyAnswers>({
    familiarity: 0,
    confidence: 0,
    riskiness: 0
  });

  const handleSubmit = () => {
    if (answers.familiarity && answers.confidence && answers.riskiness) {
      onClose(answers);
      setAnswers({ familiarity: 0, confidence: 0, riskiness: 0 });
    }
  };

  const handleChange = (question: keyof SurveyAnswers) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setAnswers({
      ...answers,
      [question]: parseInt(event.target.value)
    });
  };

  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography component="span" variant="h5" align="center">
          Episode {episodeNumber} Survey
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
            <FormLabel component="legend">
              1. Familiarity with the Episode's Conditions: How familiar did you feel with the specific flood level rise rate and elevation conditions in this episode? (1 = Not Familiar, 5 = Very Familiar)
            </FormLabel>
            <RadioGroup
              row
              value={answers.familiarity}
              onChange={handleChange('familiarity')}
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

          <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
            <FormLabel component="legend">
              2. Confidence in Predictions: How confident were you in your predictions of the track node water level during this episode? (1 = Not Confident, 5 = Very Confident)
            </FormLabel>
            <RadioGroup
              row
              value={answers.confidence}
              onChange={handleChange('confidence')}
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

          <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
            <FormLabel component="legend">
              3. Perceived Riskiness of Decisions: How risky did you perceive your decisions to be during this episode? (1 = Not Risky, 5 = Very Risky)
            </FormLabel>
            <RadioGroup
              row
              value={answers.riskiness}
              onChange={handleChange('riskiness')}
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
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          disabled={!answers.familiarity || !answers.confidence || !answers.riskiness}
        >
          Submit and Next
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SurveyDialog; 