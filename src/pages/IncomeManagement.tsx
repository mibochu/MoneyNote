import React, { useState, useMemo, useEffect } from 'react';
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
  Button,
  Fab,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Card,
  CardContent
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  TrendingUp,
  AccountBalance
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';

import { useIncome } from '../hooks/useIncome';
import IncomeDialog from '../components/common/IncomeDialog';
import { formatResponsiveCurrency, getResponsiveCurrencyStyle } from '../utils/formatters/currency';
import type { IncomeFormData, IncomeFilter } from '../types/income.types';
import { INCOME_SOURCES } from '../types/income.types';

const IncomeManagement: React.FC = () => {
  const { 
    state, 
    addIncome, 
    updateIncome, 
    deleteIncome, 
    setFilter,
    getFilteredIncomes,
    getMonthlyIncome 
  } = useIncome();

  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingIncomeId, setDeletingIncomeId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  });

  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // 현재 월 통계
  const currentMonthIncome = getMonthlyIncome();
  const filteredIncomes = useMemo(() => {
    let incomes = getFilteredIncomes();

    // 검색어 필터
    if (searchTerm) {
      incomes = incomes.filter(income => 
        income.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        income.source.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 출처 필터
    if (sourceFilter !== 'all') {
      incomes = incomes.filter(income => income.source === sourceFilter);
    }

    return incomes;
  }, [getFilteredIncomes, searchTerm, sourceFilter]);

  // 필터 적용
  useEffect(() => {
    const filter: IncomeFilter = {
      startDate: dateFilter.start || undefined,
      endDate: dateFilter.end || undefined,
      source: sourceFilter !== 'all' ? sourceFilter : undefined
    };
    setFilter(filter);
  }, [dateFilter, sourceFilter]); // setFilter 제거

  const handleAddIncome = (incomeData: IncomeFormData) => {
    try {
      addIncome(incomeData);
      setNotification({
        open: true,
        message: '수입이 성공적으로 추가되었습니다.',
        severity: 'success'
      });
    } catch (error) {
      setNotification({
        open: true,
        message: '수입 추가 중 오류가 발생했습니다.',
        severity: 'error'
      });
    }
  };

  const handleEditIncome = (income: any) => {
    setEditingIncome({
      ...income,
      date: new Date(income.date)
    });
    setIsIncomeDialogOpen(true);
  };

  const handleUpdateIncome = (incomeData: IncomeFormData) => {
    if (!editingIncome) return;
    
    try {
      updateIncome(editingIncome.id, incomeData);
      setEditingIncome(null);
      setNotification({
        open: true,
        message: '수입이 성공적으로 수정되었습니다.',
        severity: 'success'
      });
    } catch (error) {
      setNotification({
        open: true,
        message: '수입 수정 중 오류가 발생했습니다.',
        severity: 'error'
      });
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeletingIncomeId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deletingIncomeId) {
      try {
        deleteIncome(deletingIncomeId);
        setNotification({
          open: true,
          message: '수입이 성공적으로 삭제되었습니다.',
          severity: 'success'
        });
      } catch (error) {
        setNotification({
          open: true,
          message: '수입 삭제 중 오류가 발생했습니다.',
          severity: 'error'
        });
      }
    }
    setDeleteDialogOpen(false);
    setDeletingIncomeId(null);
  };

  const handleCloseDialog = () => {
    setIsIncomeDialogOpen(false);
    setEditingIncome(null);
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const getSourceLabel = (source: string) => {
    const found = INCOME_SOURCES.find(s => s.value === source);
    return found ? found.label : source;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            💰 수입 관리
          </Typography>
          <Typography variant="body1" color="text.secondary">
            수입 내역을 확인하고 관리하세요
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsIncomeDialogOpen(true)}
        >
          수입 추가
        </Button>
      </Box>

      {/* 요약 카드 */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        gap: 3,
        mb: 3
      }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TrendingUp color="primary" />
              <Typography variant="h6" sx={{ ml: 1 }}>
                이번 달 총 수입
              </Typography>
            </Box>
            <Typography 
              variant="h4" 
              color="primary"
              sx={getResponsiveCurrencyStyle(currentMonthIncome)}
            >
              {formatResponsiveCurrency(currentMonthIncome)}
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AccountBalance color="info" />
              <Typography variant="h6" sx={{ ml: 1 }}>
                등록된 수입 내역
              </Typography>
            </Box>
            <Typography variant="h4" color="info">
              {state.incomes.length}건
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* 검색 및 필터 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          검색 및 필터
        </Typography>
        
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '2fr 1fr 1fr 1fr' },
          gap: 2,
          alignItems: 'center'
        }}>
          <TextField
            label="검색"
            placeholder="설명 또는 출처로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
            }}
            fullWidth
          />

          <TextField
            label="수입 출처"
            select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            fullWidth
          >
            <MenuItem value="all">전체</MenuItem>
            {INCOME_SOURCES.map((source) => (
              <MenuItem key={source.value} value={source.value}>
                {source.label}
              </MenuItem>
            ))}
          </TextField>

          <DatePicker
            label="시작 날짜"
            format="YYYY/MM/DD"
            value={dateFilter.start ? dayjs(dateFilter.start) : null}
            onChange={(date) => setDateFilter(prev => ({ 
              ...prev, 
              start: date ? date.toDate() : null 
            }))}
            slotProps={{ textField: { fullWidth: true } }}
          />

          <DatePicker
            label="종료 날짜"
            format="YYYY/MM/DD"
            value={dateFilter.end ? dayjs(dateFilter.end) : null}
            onChange={(date) => setDateFilter(prev => ({ 
              ...prev, 
              end: date ? date.toDate() : null 
            }))}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </Box>

        {(searchTerm || sourceFilter !== 'all' || dateFilter.start || dateFilter.end) && (
          <Box sx={{ mt: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              활성 필터:
            </Typography>
            {searchTerm && (
              <Chip 
                label={`검색: "${searchTerm}"`} 
                size="small" 
                onDelete={() => setSearchTerm('')} 
              />
            )}
            {sourceFilter !== 'all' && (
              <Chip 
                label={`출처: ${getSourceLabel(sourceFilter)}`} 
                size="small" 
                onDelete={() => setSourceFilter('all')} 
              />
            )}
            {dateFilter.start && (
              <Chip 
                label={`시작: ${dateFilter.start.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\./g, '/').replace(/ /g, '')}`} 
                size="small" 
                onDelete={() => setDateFilter(prev => ({ ...prev, start: null }))} 
              />
            )}
            {dateFilter.end && (
              <Chip 
                label={`종료: ${dateFilter.end.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\./g, '/').replace(/ /g, '')}`} 
                size="small" 
                onDelete={() => setDateFilter(prev => ({ ...prev, end: null }))} 
              />
            )}
            <Button 
              size="small" 
              onClick={() => {
                setSearchTerm('');
                setSourceFilter('all');
                setDateFilter({ start: null, end: null });
              }}
            >
              전체 초기화
            </Button>
          </Box>
        )}
      </Paper>

      {/* 수입 목록 */}
      <Paper>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            수입 내역 ({filteredIncomes.length}건)
          </Typography>
          
          {filteredIncomes.length > 0 ? (
            <List>
              {filteredIncomes.map((income, index) => (
                <ListItem 
                  key={income.id} 
                  divider={index < filteredIncomes.length - 1}
                  sx={{ px: 0, py: 2 }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {income.description}
                        </Typography>
                        <Chip 
                          label={getSourceLabel(income.source)} 
                          size="small" 
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography 
                          variant="h6" 
                          color="primary" 
                          fontWeight="bold" 
                          gutterBottom
                          sx={{
                            ...getResponsiveCurrencyStyle(income.amount),
                            fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' } // 리스트에서는 조금 작게
                          }}
                        >
                          +{formatResponsiveCurrency(income.amount)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(income.date).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\./g, '/').replace(/ /g, '')} | 
                          등록: {new Date(income.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\./g, '/').replace(/ /g, '')}
                          {income.updatedAt.getTime() !== income.createdAt.getTime() && (
                            <> | 수정: {new Date(income.updatedAt).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\./g, '/').replace(/ /g, '')}</>
                          )}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton onClick={() => handleEditIncome(income)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteClick(income.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          ) : (
            <Box
              sx={{
                py: 8,
                textAlign: 'center',
                color: 'text.secondary'
              }}
            >
              <Typography variant="h6" gutterBottom>
                수입 내역이 없습니다
              </Typography>
              <Typography variant="body2" sx={{ mb: 3 }}>
                {state.incomes.length === 0 
                  ? '첫 번째 수입을 추가해보세요!'
                  : '검색 조건에 맞는 수입 내역이 없습니다.'
                }
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => setIsIncomeDialogOpen(true)}
              >
                수입 추가
              </Button>
            </Box>
          )}
        </Box>
      </Paper>

      {/* 플로팅 액션 버튼 */}
      <Fab
        color="primary"
        aria-label="add income"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setIsIncomeDialogOpen(true)}
      >
        <AddIcon />
      </Fab>

      {/* 수입 추가/수정 다이얼로그 */}
      <IncomeDialog
        open={isIncomeDialogOpen}
        onClose={handleCloseDialog}
        onSave={editingIncome ? handleUpdateIncome : handleAddIncome}
        initialData={editingIncome || undefined}
      />

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>수입 삭제</DialogTitle>
        <DialogContent>
          정말로 이 수입 내역을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            취소
          </Button>
          <Button onClick={handleDeleteConfirm} color="error">
            삭제
          </Button>
        </DialogActions>
      </Dialog>

      {/* 알림 스낵바 */}
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default IncomeManagement;