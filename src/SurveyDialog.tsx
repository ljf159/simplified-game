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
  Box,
} from '@mui/material';

interface SurveyDialogProps {
  open: boolean;
  onClose: (answers: SurveyAnswers) => void;
  episodeNumber: number;
}

export interface SurveyAnswers {
  confidence: string;
  riskApproach: string;
  riskChange?: string;
}

const SurveyDialog: React.FC<SurveyDialogProps> = ({ open, onClose, episodeNumber }) => {
  const [answers, setAnswers] = useState<SurveyAnswers>({
    confidence: '',
    riskApproach: '',
    riskChange: ''
  });

  const handleSubmit = () => {
    if (answers.confidence && answers.riskApproach && (episodeNumber === 1 || answers.riskChange)) {
      onClose(answers);
      setAnswers({ confidence: '', riskApproach: '', riskChange: '' });
    }
  };

  const handleChange = (question: keyof SurveyAnswers) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setAnswers({
      ...answers,
      [question]: event.target.value
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
          {/* Question 1: Confidence */}
          <FormControl component="fieldset" sx={{ mb: 4, width: '100%' }}>
            <FormLabel component="legend">
              1. Confidence: "How confident were you in your water level predictions this episode?"
            </FormLabel>
            <Typography variant="caption" display="block" gutterBottom>
              1: Not at all confident, 7: Extremely confident
            </Typography>
            <RadioGroup
              row
              value={answers.confidence}
              onChange={handleChange('confidence')}
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

          {/* Question 2: Risk Approach */}
          <FormControl component="fieldset" sx={{ mb: 4, width: '100%' }}>
            <FormLabel component="legend">
              2. This episode, were your decisions primarily focused on:
            </FormLabel>
            <RadioGroup
              value={answers.riskApproach}
              onChange={handleChange('riskApproach')}
            >
              <FormControlLabel 
                value="avoid" 
                control={<Radio />} 
                label="Avoiding trapped trains" 
              />
              <FormControlLabel 
                value="maximize" 
                control={<Radio />} 
                label="Maximizing successful passages" 
              />
              <FormControlLabel 
                value="balance" 
                control={<Radio />} 
                label="Balancing both equally" 
              />
            </RadioGroup>
          </FormControl>

          {/* Question 3: Risk Change (only for episodes 2-10) */}
          {episodeNumber > 1 && (
            <FormControl component="fieldset" sx={{ mb: 4, width: '100%' }}>
              <FormLabel component="legend">
                3. Compared to the previous episode, did you take:
              </FormLabel>
              <RadioGroup
                value={answers.riskChange}
                onChange={handleChange('riskChange')}
              >
                <FormControlLabel 
                  value="more" 
                  control={<Radio />} 
                  label="More risks" 
                />
                <FormControlLabel 
                  value="fewer" 
                  control={<Radio />} 
                  label="Fewer risks" 
                />
                <FormControlLabel 
                  value="same" 
                  control={<Radio />} 
                  label="About the same level of risk" 
                />
              </RadioGroup>
            </FormControl>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          disabled={!answers.confidence || !answers.riskApproach || (episodeNumber > 1 && !answers.riskChange)}
        >
          Submit and Next
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SurveyDialog; 