import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Box,
  useTheme,
  useMediaQuery
} from '@mui/material';
import type { NavigationItem } from './Navigation';

export interface SideNavigationProps {
  open: boolean;
  onClose: () => void;
  value: string;
  onChange: (event: React.SyntheticEvent, newValue: string) => void;
  items: NavigationItem[];
  appName?: string;
}

const drawerWidth = 240;

const SideNavigation: React.FC<SideNavigationProps> = ({
  open,
  onClose,
  value,
  onChange,
  items,
  appName = 'MoneyNote'
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleItemClick = (itemValue: string) => {
    onChange({} as React.SyntheticEvent, itemValue);
    if (isMobile) {
      onClose();
    }
  };

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          {appName}
        </Typography>
      </Toolbar>
      <List>
        {items.map((item) => (
          <ListItem key={item.value} disablePadding>
            <ListItemButton
              selected={value === item.value}
              onClick={() => handleItemClick(item.value)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main + '15',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.main + '25'
                  }
                }
              }}
            >
              <ListItemIcon
                sx={{
                  color: value === item.value ? theme.palette.primary.main : 'inherit'
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                sx={{
                  '& .MuiListItemText-primary': {
                    color: value === item.value ? theme.palette.primary.main : 'inherit',
                    fontWeight: value === item.value ? 600 : 400
                  }
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'persistent'}
      open={open}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box'
        }
      }}
      ModalProps={{
        keepMounted: true
      }}
    >
      {drawer}
    </Drawer>
  );
};

export default SideNavigation;