import React from 'react';
import { Box, Container, Paper } from '@mui/material';
import type { ReactNode } from 'react';

export interface LayoutProps {
  children: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  padding?: number;
  background?: 'default' | 'paper';
}

const Layout: React.FC<LayoutProps> = ({
  children,
  maxWidth = 'lg',
  padding = 3,
  background = 'default'
}) => {
  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        backgroundColor: background === 'default' ? 'background.default' : 'transparent',
        py: 2
      }}
    >
      <Container maxWidth={maxWidth}>
        {background === 'paper' ? (
          <Paper
            elevation={1}
            sx={{
              p: padding,
              borderRadius: 2
            }}
          >
            {children}
          </Paper>
        ) : (
          <Box sx={{ p: padding }}>
            {children}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Layout;