import React, { useState } from 'react';
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
  Divider,
  Dialog,
  DialogTitle,
  DialogContent
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { Fab } from '../components/ui/Button';
import { ExpenseFormContainer } from '../components/forms/ExpenseForm';
import { useExpenses } from '../hooks/useExpenses';

const Expenses: React.FC = () => {
  const { state, deleteExpense } = useExpenses();
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const expenses = state.expenses || [];

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
            ₩{expenses.reduce((sum, expense) => sum + expense.amount, 0).toLocaleString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            총 {expenses.length}건의 거래
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
          {expenses.map((expense, index) => (
            <React.Fragment key={expense.id}>
              <ListItem>
                <ListItemText
                  primary={expense.description}
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(expense.date).toLocaleDateString('ko-KR')} • {expense.paymentMethod}
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Chip
                          label={expense.category}
                          size="small"
                          variant="outlined"
                        />
                        {expense.tags.map((tag, tagIndex) => (
                          <Chip
                            key={tagIndex}
                            label={tag}
                            size="small"
                            variant="outlined"
                            sx={{ ml: 0.5 }}
                          />
                        ))}
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
                    <IconButton 
                      size="small" 
                      onClick={() => deleteExpense(expense.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
              {index < expenses.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>

        {expenses.length === 0 && (
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
        onClick={() => setIsFormOpen(true)}
      >
        <AddIcon />
      </Fab>

      {/* 지출 추가/수정 다이얼로그 */}
      <Dialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={false}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          지출 추가
          <IconButton
            onClick={() => setIsFormOpen(false)}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          <ExpenseFormContainer
            onSuccess={() => {
              setIsFormOpen(false);
            }}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Expenses;