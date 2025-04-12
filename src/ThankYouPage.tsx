import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import { useLocation } from 'react-router-dom';

interface LocationState {
  wantsGiftCard: boolean;
}

const ThankYouPage: React.FC = () => {
  const location = useLocation();
  const { wantsGiftCard } = (location.state as LocationState) || { wantsGiftCard: false };

  return (
    <Container maxWidth="md">
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center',
        py: 8 
      }}>
        <Typography variant="h3" gutterBottom>
          Thank You!
        </Typography>
        <Box sx={{ textAlign: 'center', maxWidth: 600, mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Thank you for participating!
          </Typography>
          {wantsGiftCard ? (
            <>
              <Typography variant="body1" paragraph>
                We have received your email address. Once all participants have completed the game, we will rank all scores and determine your reward amount ($15 for top 50%, $5 for others).
              </Typography>
              <Typography variant="body1" paragraph>
                You will receive your Amazon Gift Card within 5 business days after the study concludes.
              </Typography>
              <Typography variant="body1" paragraph>
                You can now close this window.
              </Typography>
            </>
          ) : (
            <>
              <Typography variant="body1" paragraph>
                You can now close this window.
              </Typography>
            </>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default ThankYouPage; 