import React, { useState } from 'react';
import {
  Button,
  Typography,
  FormControlLabel,
  Checkbox,
  Box,
  Paper,
  Divider,
  Container,
  Grid,
} from '@mui/material';

interface ConsentFormProps {
  open: boolean;
  onClose: (consented: boolean) => void;
}

const ConsentForm: React.FC<ConsentFormProps> = ({ open, onClose }) => {
  const [consentAnswers, setConsentAnswers] = useState({
    eligible: false,
    age18: false,
    understand: false,
    participate: false,
  });

  const handleCheckboxChange = (field: keyof typeof consentAnswers) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConsentAnswers({
      ...consentAnswers,
      [field]: event.target.checked,
    });
  };

  const handleSubmit = () => {
    // 只有当所有选项都被选中时，才允许提交
    if (Object.values(consentAnswers).every((value) => value)) {
      onClose(true);
    }
  };

  const handleDecline = () => {
    onClose(false);
  };

  if (!open) return null;

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4, fontWeight: 'bold', color: 'primary.main' }}>
          Online Consent
        </Typography>
        
        <Box sx={{ mb: 4, p: 3, bgcolor: 'background.default', borderRadius: 1 }}>
          <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.6, textAlign: 'left' }}>
            <strong>This online game is part of a research study conducted by Dr. Jinfeng Lou (Principal Investigator [PI]) at Carnegie Mellon University and is funded by Carnegie Bosch Institute.</strong>
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Summary
            </Typography>
            <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.6, textAlign: 'left' }}>
              You are invited to participate in a research study about decision-making under uncertainty. This study involves playing an online game where you will manage a simplified subway network and make predictions to prevent train disruptions due to flooding. You will also be asked to complete brief surveys before, during, and after the game. Your participation will take approximately 50 minutes.
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Purpose
            </Typography>
            <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.6, textAlign: 'left' }}>
              The purpose of this research is to understand how people make decisions when faced with uncertain outcomes and how their risk-taking behavior might change over time. We are also interested in how different scoring systems (reward versus punishment) affect these decisions. This research aims to contribute to our understanding of decision-making processes.
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Procedures
            </Typography>
            <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.6, textAlign: 'left' }}>
              If you agree to participate, you will be randomly assigned into two groups with different scoring schemes. We have no control over which group the participant gets assigned into. You will be asked to:
            </Typography>
            <Typography component="ol" sx={{ pl: 2, fontSize: '1.1rem', lineHeight: 1.6, textAlign: 'left' }}>
              <li>Complete a brief pre-game survey.</li>
              <li>Play 10 episodes of the game. Each episode consists of 10 rounds. In each round, you will observe water levels at two subway stations, predict the water level at a connecting track node, and decide whether to allow a train to pass.</li>
              <li>Complete a short survey after each of the 10 episodes.</li>
              <li>Complete a final post-game survey.</li>
            </Typography>
            <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.6, textAlign: 'left' }}>
              The surveys and web-based game have been developed by the PI without the use of third-party services such as Amazon Mechanical Turk, Prolific, or Qualtrics. They will be hosted on a server at Carnegie Mellon University (CMU). You will connect directly to the server via a link, without going through any third-party vendors. Your total participation time is expected to be approximately 50 minutes.
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Participant Requirements
            </Typography>
            <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.6, textAlign: 'left' }}>
              Participation in this study is limited to individuals age 18 and older.
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Risks
            </Typography>
            <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.6, textAlign: 'left' }}>
              There is a possible risk of a breach of confidentiality associated with this study.
            </Typography>
            <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.6, textAlign: 'left' }}>
              Payment Confidentiality: Payment methods, especially those facilitated by third-party vendors (such as Venmo, Amazon, PayPal), may require that the researchers and/or the vendor collect and use personal information (such as your first and last name, email addresses, phone numbers, banking information) provided by you in order for your payment to be processed. As with any payment transaction, there is the risk of a breach of confidentiality from the third-party vendor. All personal information collected by the researcher will be held as strictly confidential and stored in a password-protected digital file, or in a locked file cabinet, until payments are processed and reconciled. This information will be destroyed at the earliest acceptable time. Personal information held by the third-party vendor will be held according to their terms of use policy.
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Benefits
            </Typography>
            <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.6, textAlign: 'left' }}>
              There may be no direct personal benefit from your participation in this study. However, the knowledge gained from this research may contribute to a better understanding of human decision-making under uncertainty, which could be of value to the scientific community.
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Compensation & Costs
            </Typography>
            <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.6, textAlign: 'left' }}>
              You will be compensated after the study is completed (pre-game survey, game play, post-episode surveys, and post-game survey). You will receive $10 via an Amazon gift card as compensation for your participation in this study. There will be no cost to you if you participate in this study.
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Future Use of Information
            </Typography>
            <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.6, textAlign: 'left' }}>
              In the future, once we have removed all identifiable information from your data, we may use the data for our future research studies, or we may distribute the data to other researchers for their research studies. We would do this without getting additional informed consent from you. Sharing of data with other researchers will only be done in such a manner that you will not be identified.
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Confidentiality
            </Typography>
            <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.6, textAlign: 'left' }}>
              The data captured for this research will be kept confidential. Your IP address will not be captured. We do not use any third-party vendor to collect your data. 
            </Typography>
            <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.6, textAlign: 'left' }}>
              By participating in this research, you understand and agree that Carnegie Mellon may be required to disclose your consent form, data and other personally identifiable information as required by law, regulation, subpoena or court order. Otherwise, your confidentiality will be maintained in the following manner:
            </Typography>
            <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.6, textAlign: 'left' }}>
              Your data and consent form will be kept separate. Your consent form will be stored securely and will not be disclosed to third parties. By participating, you understand and agree that the data and information gathered during this study may be used by Carnegie Mellon and published and/or disclosed by Carnegie Mellon to others outside of Carnegie Mellon. However, your name, contact information, and other direct personal identifiers will not be mentioned in any such publication or dissemination of the research data and/or results by Carnegie Mellon. Note that per regulation, all research data must be kept for a minimum of 3 years.
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Right to Ask Questions & Contact Information
            </Typography>
            <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.6, textAlign: 'left' }}>
              If you have any questions about this study, you should feel free to ask them by contacting the Principal Investigator now at Dr. Jinfeng Lou, Department of Civil and Environmental Engineering, Pittsburgh, Pennsylvania, 15213, 412-320-6522, jinfengl@andrew.cmu.edu. If you have questions later, desire additional information, or wish to withdraw your participation, please contact the Principal Investigator by mail, phone, or e-mail using the contact information listed above.
            </Typography>
            <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.6, textAlign: 'left' }}>
              If you have questions pertaining to your rights as a research participant or to report concerns about this study, you should contact the Office of Research Integrity and Compliance at Carnegie Mellon University. Email: irb-review@andrew.cmu.edu. Phone: 412-268-4721.
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Voluntary Participation
            </Typography>
            <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.6, textAlign: 'left' }}>
              Your participation in this research is voluntary. You may refuse or discontinue participation at any time without any loss of benefits to which you are otherwise entitled.
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Please answer the following questions to proceed:
            </Typography>
            
            <Box sx={{ mt: 2, mb: 4, p: 3, bgcolor: 'background.default', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={consentAnswers.eligible}
                      onChange={handleCheckboxChange('eligible')}
                      color="primary"
                      sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: '1.1rem', lineHeight: 1.6, textAlign: 'left' }}>
                      I have reviewed the eligibility requirements listed in the Participant Requirements section of this consent form and certify that I am eligible to participate in this research, to the best of my knowledge.
                    </Typography>
                  }
                  sx={{ alignItems: 'flex-start', margin: 0 }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={consentAnswers.age18}
                      onChange={handleCheckboxChange('age18')}
                      color="primary"
                      sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: '1.1rem', lineHeight: 1.6, textAlign: 'left' }}>
                      I am age 18 or older.
                    </Typography>
                  }
                  sx={{ alignItems: 'flex-start', margin: 0 }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={consentAnswers.understand}
                      onChange={handleCheckboxChange('understand')}
                      color="primary"
                      sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: '1.1rem', lineHeight: 1.6, textAlign: 'left' }}>
                      I have read and understand the information above.
                    </Typography>
                  }
                  sx={{ alignItems: 'flex-start', margin: 0 }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={consentAnswers.participate}
                      onChange={handleCheckboxChange('participate')}
                      color="primary"
                      sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: '1.1rem', lineHeight: 1.6, textAlign: 'left' }}>
                      I want to participate in this research and continue with the study.
                    </Typography>
                  }
                  sx={{ alignItems: 'flex-start', margin: 0 }}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleDecline}
            size="large"
            sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
          >
            Decline
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={!Object.values(consentAnswers).every((value) => value)}
            size="large"
            sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
          >
            I Consent
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ConsentForm; 