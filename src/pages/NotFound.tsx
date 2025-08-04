import React from 'react';
import {
  Box,
  Typography,
  Container,
  Paper
} from '@mui/material';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowBack } from '@mui/icons-material';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center'
        }}
      >
        <Paper
          sx={{
            p: 4,
            borderRadius: 3,
            textAlign: 'center',
            width: '100%'
          }}
          elevation={0}
        >
          <Typography
            variant="h1"
            component="div"
            sx={{
              fontSize: '8rem',
              fontWeight: 'bold',
              color: 'primary.main',
              mb: 2
            }}
          >
            404
          </Typography>
          
          <Typography variant="h4" component="h1" gutterBottom>
            페이지를 찾을 수 없습니다
          </Typography>
          
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}
          >
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
            아래 버튼을 통해 다른 페이지로 이동해주세요.
          </Typography>
          
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}
          >
            <Button
              variant="contained"
              startIcon={<Home />}
              onClick={handleGoHome}
              size="large"
            >
              홈으로 가기
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={handleGoBack}
              size="large"
            >
              이전 페이지
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default NotFound;