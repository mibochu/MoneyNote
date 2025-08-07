import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';

/**
 * Categories 페이지 컴포넌트
 * 
 * 카테고리 관리 시스템의 메인 페이지입니다.
 * 향후 CategoryManager 컴포넌트로 대체될 예정입니다.
 */
const Categories: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          카테고리 관리
        </Typography>
        <Typography variant="body1" color="text.secondary">
          대분류와 소분류를 관리하는 페이지입니다.
        </Typography>
      </Box>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          카테고리 관리 시스템
        </Typography>
        <Typography variant="body2" color="text.secondary">
          CategoryManager 컴포넌트 구현 예정
        </Typography>
      </Paper>
    </Container>
  );
};

export default Categories;