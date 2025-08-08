import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Card,
  CardContent,
  Button,
  Stack,
  Chip,
  alpha,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Category as CategoryIcon,
  Label as LabelIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';

import type { Category, Subcategory, CategoryFormData, SubcategoryFormData } from '../../../../types';

// 초기 카테고리 생성 함수 (2025 React 패턴: 지연 초기화)
const createInitialCategories = (): Category[] => {
  const savedCategories = localStorage.getItem('moneyNote_categories');
  if (savedCategories) {
    try {
      return JSON.parse(savedCategories);
    } catch (error) {
      console.error('Failed to parse saved categories:', error);
      // 파싱 실패 시 기본값으로 fallback
    }
  }
  // 기본 카테고리 초기화
  return DEFAULT_CATEGORIES.map((cat, index) => ({
    ...cat,
    id: `cat-${index + 1}`,
    createdAt: new Date(),
    updatedAt: new Date()
  }));
};
import { DEFAULT_CATEGORIES } from '../../../../utils/constants/categories';
import { CategoryForm } from '../CategoryForm';
import { SubcategoryForm } from '../SubcategoryForm';
import { CategoryList } from '../CategoryList';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`category-tabpanel-${index}`}
      aria-labelledby={`category-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

/**
 * CategoryManager 컴포넌트
 * 
 * 카테고리 관리 시스템의 중심 컴포넌트로, 3단계 탭 인터페이스를 제공합니다:
 * 1. 전체보기 - 통계 대시보드 및 전체 카테고리 개요
 * 2. 대분류관리 - 대분류 카테고리 CRUD 관리
 * 3. 소분류관리 - 소분류 카테고리 CRUD 관리
 */
const CategoryManager: React.FC = () => {
  // 탭 상태 관리
  const [tabValue, setTabValue] = useState(0);
  
  // 카테고리 데이터 상태
  const [categories, setCategories] = useState<Category[]>(createInitialCategories);

  // UI 상태 관리
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // 폼 상태 관리
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [subcategoryFormOpen, setSubcategoryFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [preselectedCategoryId, setPreselectedCategoryId] = useState<string>('');

  // localStorage에 카테고리 저장 (2025 React 패턴: 에러 처리 강화)
  useEffect(() => {
    try {
      localStorage.setItem('moneyNote_categories', JSON.stringify(categories));
    } catch (error) {
      console.error('Failed to save categories to localStorage:', error);
      // localStorage 공간 부족 등의 이유로 저장 실패 가능
      showSnackbar('카테고리 저장 중 오류가 발생했습니다.', 'error');
    }
  }, [categories]); // 의존성 배열에는 categories만 필요

  // 통계 데이터 계산
  const statistics = useMemo(() => {
    const totalCategories = categories.length;
    const totalSubcategories = categories.reduce((sum, cat) => sum + cat.subcategories.length, 0);
    const defaultCategories = categories.filter(cat => cat.isDefault).length;
    const userCategories = totalCategories - defaultCategories;
    const defaultSubcategories = categories.reduce((sum, cat) => 
      sum + cat.subcategories.filter(sub => sub.isDefault).length, 0);
    const userSubcategories = totalSubcategories - defaultSubcategories;

    return {
      totalCategories,
      totalSubcategories,
      defaultCategories,
      userCategories,
      defaultSubcategories,
      userSubcategories
    };
  }, [categories]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // 2025 React 패턴: 함수형 상태 업데이트
  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' = 'success') => {
    setSnackbar(prev => ({
      ...prev,
      open: true,
      message,
      severity
    }));
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // 카테고리 CRUD 함수들
  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryFormOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryFormOpen(true);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const categoryToDelete = categories.find(cat => cat.id === categoryId);
    if (categoryToDelete) {
      if (categoryToDelete.isDefault) {
        showSnackbar('기본 카테고리는 삭제할 수 없습니다', 'error');
        return;
      }
      
      setCategories(prevCategories => 
        prevCategories.filter(category => category.id !== categoryId)
      );
      showSnackbar('카테고리가 삭제되었습니다', 'success');
    }
  };

  const handleCategorySubmit = (data: CategoryFormData) => {
    if (editingCategory) {
      // 수정 (2025 React 패턴: 명확한 변수명 사용)
      setCategories(prevCategories =>
        prevCategories.map(category =>
          category.id === editingCategory.id
            ? { ...category, ...data, updatedAt: new Date() }
            : category
        )
      );
      showSnackbar('카테고리가 수정되었습니다', 'success');
    } else {
      // 추가
      const newCategory: Category = {
        id: `cat-${Date.now()}`,
        ...data,
        isDefault: false,
        subcategories: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setCategories(prevCategories => [...prevCategories, newCategory]);
      showSnackbar('새 카테고리가 추가되었습니다', 'success');
    }
  };

  // 소분류 CRUD 함수들
  const handleAddSubcategory = (categoryId?: string) => {
    setEditingSubcategory(null);
    setPreselectedCategoryId(categoryId || '');
    setSubcategoryFormOpen(true);
  };

  const handleEditSubcategory = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory);
    setPreselectedCategoryId('');
    setSubcategoryFormOpen(true);
  };

  const handleDeleteSubcategory = (subcategoryId: string, categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    const subcategoryToDelete = category?.subcategories.find(sub => sub.id === subcategoryId);
    
    if (subcategoryToDelete?.isDefault) {
      showSnackbar('기본 소분류는 삭제할 수 없습니다', 'error');
      return;
    }

    setCategories(prevCategories =>
      prevCategories.map(category =>
        category.id === categoryId
          ? {
              ...category,
              subcategories: category.subcategories.filter(subcategory => subcategory.id !== subcategoryId),
              updatedAt: new Date()
            }
          : category
      )
    );
    showSnackbar('소분류가 삭제되었습니다', 'success');
  };

  const handleSubcategorySubmit = (data: SubcategoryFormData) => {
    if (editingSubcategory) {
      // 수정 (2025 React 패턴: 중첩 배열 불변성 업데이트)
      setCategories(prevCategories =>
        prevCategories.map(category =>
          category.id === data.categoryId
            ? {
                ...category,
                subcategories: category.subcategories.map(subcategory =>
                  subcategory.id === editingSubcategory.id
                    ? { ...subcategory, ...data, updatedAt: new Date() }
                    : subcategory
                ),
                updatedAt: new Date()
              }
            : category
        )
      );
      showSnackbar('소분류가 수정되었습니다', 'success');
    } else {
      // 추가
      const newSubcategory: Subcategory = {
        id: `sub-${Date.now()}`,
        ...data,
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setCategories(prevCategories =>
        prevCategories.map(category =>
          category.id === data.categoryId
            ? {
                ...category,
                subcategories: [...category.subcategories, newSubcategory],
                updatedAt: new Date()
              }
            : category
        )
      );
      showSnackbar('새 소분류가 추가되었습니다', 'success');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* 헤더 */}
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          카테고리 관리
        </Typography>
        <Typography variant="body1" color="text.secondary">
          대분류와 소분류를 체계적으로 관리하세요
        </Typography>
      </Box>

      {/* 탭 네비게이션 */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="category management tabs"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTabs-indicator': {
              height: 3
            }
          }}
        >
          <Tab
            icon={<AnalyticsIcon />}
            label="전체보기"
            id="category-tab-0"
            aria-controls="category-tabpanel-0"
          />
          <Tab
            icon={<CategoryIcon />}
            label="대분류 관리"
            id="category-tab-1"
            aria-controls="category-tabpanel-1"
          />
          <Tab
            icon={<LabelIcon />}
            label="소분류 관리"
            id="category-tab-2"
            aria-controls="category-tabpanel-2"
          />
        </Tabs>

        {/* 탭 1: 전체보기 - 통계 대시보드 */}
        <TabPanel value={tabValue} index={0}>
          <Stack spacing={3}>
            {/* 통계 카드 */}
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={3}
              flexWrap="wrap"
              useFlexGap
            >
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(33.33% - 16px)' } }}>
                <Card>
                  <CardContent>
                    <Stack spacing={1}>
                      <Typography variant="h6" color="primary">
                        총 대분류
                      </Typography>
                      <Typography variant="h4">
                        {statistics.totalCategories}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Chip 
                          size="small" 
                          label={`기본 ${statistics.defaultCategories}`}
                          color="default"
                        />
                        <Chip 
                          size="small" 
                          label={`사용자 ${statistics.userCategories}`}
                          color="primary"
                        />
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>

              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(33.33% - 16px)' } }}>
                <Card>
                  <CardContent>
                    <Stack spacing={1}>
                      <Typography variant="h6" color="secondary">
                        총 소분류
                      </Typography>
                      <Typography variant="h4">
                        {statistics.totalSubcategories}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Chip 
                          size="small" 
                          label={`기본 ${statistics.defaultSubcategories}`}
                          color="default"
                        />
                        <Chip 
                          size="small" 
                          label={`사용자 ${statistics.userSubcategories}`}
                          color="secondary"
                        />
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>

              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(33.33% - 16px)' } }}>
                <Card>
                  <CardContent>
                    <Stack spacing={1}>
                      <Typography variant="h6" color="success.main">
                        평균 소분류
                      </Typography>
                      <Typography variant="h4">
                        {statistics.totalCategories > 0 
                          ? (statistics.totalSubcategories / statistics.totalCategories).toFixed(1)
                          : 0
                        }
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        대분류당 평균 소분류 수
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
            </Stack>

            {/* 카테고리 목록 미리보기 */}
            <Paper sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">카테고리 구조 미리보기</Typography>
                <Button
                  startIcon={<AddIcon />}
                  variant="outlined"
                  onClick={() => setTabValue(1)}
                >
                  대분류 추가
                </Button>
              </Stack>
              
              <Stack spacing={2}>
                {categories.slice(0, 3).map((category) => (
                  <Box key={category.id}>
                    <Stack direction="row" alignItems="center" spacing={2} mb={1}>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          backgroundColor: category.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px'
                        }}
                      >
                        {category.icon}
                      </Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {category.name}
                      </Typography>
                      {category.isDefault && (
                        <Chip size="small" label="기본" color="default" />
                      )}
                      <Chip 
                        size="small" 
                        label={`${category.subcategories.length}개 소분류`}
                        variant="outlined"
                      />
                    </Stack>
                    
                    <Stack 
                      direction="row" 
                      flexWrap="wrap" 
                      gap={1} 
                      sx={{ ml: 4, mb: 1 }}
                    >
                      {category.subcategories.slice(0, 5).map((subcategory) => (
                        <Chip
                          key={subcategory.id}
                          size="small"
                          label={subcategory.name}
                          sx={{
                            backgroundColor: alpha(subcategory.color || category.color, 0.1),
                            color: subcategory.color || category.color,
                            border: `1px solid ${alpha(subcategory.color || category.color, 0.3)}`
                          }}
                        />
                      ))}
                      {category.subcategories.length > 5 && (
                        <Chip
                          size="small"
                          label={`+${category.subcategories.length - 5}개`}
                          variant="outlined"
                        />
                      )}
                    </Stack>
                  </Box>
                ))}
                
                {categories.length > 3 && (
                  <Box textAlign="center" pt={2}>
                    <Button
                      variant="text"
                      onClick={() => setTabValue(1)}
                    >
                      전체 {categories.length}개 카테고리 보기
                    </Button>
                  </Box>
                )}
              </Stack>
            </Paper>
          </Stack>
        </TabPanel>

        {/* 탭 2: 대분류 관리 */}
        <TabPanel value={tabValue} index={1}>
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">대분류 관리</Typography>
              <Button
                startIcon={<AddIcon />}
                variant="contained"
                onClick={handleAddCategory}
              >
                새 대분류 추가
              </Button>
            </Stack>
            
            <CategoryList
              categories={categories}
              onEditCategory={handleEditCategory}
              onDeleteCategory={handleDeleteCategory}
              onEditSubcategory={handleEditSubcategory}
              onDeleteSubcategory={handleDeleteSubcategory}
              onAddSubcategory={handleAddSubcategory}
              showAll
            />
          </Stack>
        </TabPanel>

        {/* 탭 3: 소분류 관리 */}
        <TabPanel value={tabValue} index={2}>
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">소분류 관리</Typography>
              <Button
                startIcon={<AddIcon />}
                variant="contained"
                onClick={() => handleAddSubcategory()}
              >
                새 소분류 추가
              </Button>
            </Stack>
            
            <CategoryList
              categories={categories}
              onEditCategory={handleEditCategory}
              onDeleteCategory={handleDeleteCategory}
              onEditSubcategory={handleEditSubcategory}
              onDeleteSubcategory={handleDeleteSubcategory}
              onAddSubcategory={handleAddSubcategory}
              showAll
            />
          </Stack>
        </TabPanel>
      </Paper>

      {/* 카테고리 폼 다이얼로그 */}
      <CategoryForm
        open={categoryFormOpen}
        onClose={() => setCategoryFormOpen(false)}
        onSubmit={handleCategorySubmit}
        initialData={editingCategory || undefined}
        mode={editingCategory ? 'edit' : 'add'}
      />

      {/* 소분류 폼 다이얼로그 */}
      <SubcategoryForm
        open={subcategoryFormOpen}
        onClose={() => setSubcategoryFormOpen(false)}
        onSubmit={handleSubcategorySubmit}
        categories={categories}
        initialData={editingSubcategory || undefined}
        preselectedCategoryId={preselectedCategoryId}
        mode={editingSubcategory ? 'edit' : 'add'}
      />

      {/* 스낵바 알림 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CategoryManager;