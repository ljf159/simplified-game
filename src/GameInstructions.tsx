import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider
} from '@mui/material';

interface GameInstructionsProps {
  open: boolean;
  onClose: () => void;
}

const GameInstructions: React.FC<GameInstructionsProps> = ({ open, onClose }) => {
  return (
    <Dialog 
      open={open} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: '#f5f5f5',
          p: 2
        }
      }}
    >
      <DialogTitle>
        <Typography 
          variant="h4" 
          align="center" 
          gutterBottom 
          component="div"
        >
          Game Instructions
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" color="primary" gutterBottom>
            Game Overview
          </Typography>
          <Typography variant="body1" paragraph>
            You are a train operator managing a subway line during flooding situations. Your mission is to transport as many passengers as possible while ensuring their safety. The subway line has <strong>two stations (A and B) connected by a track node</strong>. Each round, trains travel from Station A through the track node to Station B.
          </Typography>
          <Typography variant="body1" paragraph color="error">
            <strong>Key Trade-off:</strong> Successfully transporting passengers (allowing train passage) versus ensuring safety (denying passage when flood risk is high). A trapped train endangers lives (major loss), while denying passage only causes delays (minor loss).
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Time Commitment:</strong> This study takes approximately 30-50 minutes, including:
            <br />
            • Pre-game survey
            <br />
            • 10 game episodes with brief surveys after each episode
            <br />
            • Post-game survey
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" color="primary" gutterBottom>
            Core Mechanics
          </Typography>
          <Typography variant="body1" component="div">
            • Each game consists of 10 episodes, with up to 10 rounds each
            <br />
            • <strong>Each episode features new scenarios</strong> with different:
            <Box sx={{ pl: 3, mt: 1 }}>
              - Elevation levels for stations and track node
              <br />
              - Water rising patterns
            </Box>
            • In each round, you will:
            <Box sx={{ pl: 3, mt: 1 }}>
              1. <strong>Observe</strong> water levels at stations A and B
              <br />
              2. <strong>Predict</strong> the water level at the track node
              <br />
              3. <strong>Decide</strong> whether to allow or deny train passage
            </Box>
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" color="primary" gutterBottom>
            Important Rules
          </Typography>
          <Typography variant="body1" component="div">
            • <strong>Only the track node can trap trains</strong> (water level {'>'} 50%)
            <br />
            • Stations A and B will never trap trains
            <br />
            • Water can spread between connected nodes when it reaches certain levels
            <br />
            • <strong>Higher elevation nodes</strong> are generally safer from flooding
            <br />
            • You have <strong>20 seconds</strong> to make prediction and decision
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" color="primary" gutterBottom>
            Scoring System
          </Typography>
          <Typography variant="body1" paragraph color="primary">
            <strong>You will be randomly assigned to one of these two scoring systems:</strong>
          </Typography>
          <Typography variant="body1" component="div">
            <strong>Scoring System 1:</strong>
            <Box sx={{ pl: 3 }}>
              • Successful passage: +50
              <br />
              • Denying passage: +40
              <br />
              • Train trapped: 0
            </Box>
          </Typography>
          <Typography variant="body1" component="div" sx={{ mt: 2 }}>
            <strong>Scoring System 2:</strong>
            <Box sx={{ pl: 3 }}>
              • Successful passage: 0
              <br />
              • Denying passage: -10
              <br />
              • Train trapped: -50 × remaining rounds
            </Box>
          </Typography>
        </Box>

        <Box>
          <Typography variant="h6" color="error">
            Important Notes
          </Typography>
          <Typography variant="body1" paragraph>
            • If a train gets trapped, the current episode will end immediately
            <br />
            • Brief surveys will be conducted before the game, after each episode, and after completing all episodes
          </Typography>
          <Typography variant="body1" paragraph sx={{ bgcolor: 'info.main', color: 'white', p: 1, borderRadius: 1 }}>
            <strong>Rewards:</strong> Based on your performance:
            <br />
            • Top 50% of participants: $15 Amazon gift card
            <br />
            • Others: $5 Amazon gift card
            <br />
            <em>Gift cards will be distributed after completing the entire study</em>
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button 
          onClick={onClose}
          variant="contained"
          color="primary"
          size="large"
          sx={{ px: 4 }}
        >
          Start Game
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GameInstructions; 