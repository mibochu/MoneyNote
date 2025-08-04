import React from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { Fab } from '../components/ui/Button';

const Expenses: React.FC = () => {
  const mockExpenses = [
    {
      id: '1',
      date: '2025-08-03',
      description: '마트 장보기',
      amount: 45000,
      category: '식비',
      paymentMethod: '신용카드'
    },
    {
      id: '2',
      date: '2025-08-02',
      description: '지하철 교통비',
      amount: 1370,
      category: '교통비',
      paymentMethod: '교통카드'
    },
    {
      id: '3',
      date: '2025-08-01',
      description: '점심 식사',
      amount: 12000,
      category: '식비',
      paymentMethod: '현금'
    }
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        💳 지출 관리
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        지출 내역을 관리하고 분석하세요
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            이번 달 지출 현황
          </Typography>
          <Typography variant="h4" color="error" gutterBottom>
            ₩{mockExpenses.reduce((sum, expense) => sum + expense.amount, 0).toLocaleString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            총 {mockExpenses.length}건의 거래
          </Typography>
        </Box>
      </Paper>

      <Paper>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            최근 지출 내역
          </Typography>
        </Box>
        <Divider />
        
        <List>
          {mockExpenses.map((expense, index) => (
            <React.Fragment key={expense.id}>
              <ListItem>
                <ListItemText
                  primary={expense.description}
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {expense.date} • {expense.paymentMethod}
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Chip
                          label={expense.category}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6" color="error">
                      -₩{expense.amount.toLocaleString()}
                    </Typography>
                    <IconButton size="small">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
              {index < mockExpenses.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>

        {mockExpenses.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              아직 지출 내역이 없습니다
            </Typography>
          </Box>
        )}
      </Paper>

      {/* 지출 추가 플로팅 버튼 */}
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 80, right: 16 }}
        tooltip="지출 추가"
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default Expenses;