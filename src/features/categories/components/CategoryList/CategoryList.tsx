import React, { useState } from 'react';
import {
  Paper,
  Stack,
  Typography,
  Box,
  IconButton,
  Collapse,
  alpha,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Lock as LockIcon,
  Add as AddIcon,
  DragIndicator as DragIndicatorIcon
} from '@mui/icons-material';

import type { Category, Subcategory } from '../../../../types';

interface CategoryListProps {
  categories: Category[];
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: string) => void;
  onEditSubcategory: (subcategory: Subcategory) => void;
  onDeleteSubcategory: (subcategoryId: string, categoryId: string) => void;
  onAddSubcategory: (categoryId: string) => void;
  showAll?: boolean;
}

/**
 * CategoryList 컴포넌트
 * 
 * 계층형 카테고리 구조를 표시하는 컴포넌트입니다.
 * 확장/축소 가능한 트리 구조로 대분류와 소분류를 보여주며,
 * 기본 카테고리 보호 표시와 컨텍스트 메뉴를 제공합니다.
 */
const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  onEditCategory,
  onDeleteCategory,
  onEditSubcategory,
  onDeleteSubcategory,
  onAddSubcategory,
  showAll = false
}) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    showAll ? categories.map(cat => cat.id) : []
  );
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItem, setSelectedItem] = useState<{
    type: 'category' | 'subcategory';
    item: Category | Subcategory;
    categoryId?: string;
  } | null>(null);

  const handleToggleExpand = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    type: 'category' | 'subcategory',
    item: Category | Subcategory,
    categoryId?: string
  ) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedItem({ type, item, categoryId });
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const handleEdit = () => {
    if (selectedItem) {
      if (selectedItem.type === 'category') {
        onEditCategory(selectedItem.item as Category);
      } else {
        onEditSubcategory(selectedItem.item as Subcategory);
      }
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedItem) {
      if (selectedItem.type === 'category') {
        onDeleteCategory(selectedItem.item.id);
      } else {
        onDeleteSubcategory(selectedItem.item.id, selectedItem.categoryId!);
      }
    }
    handleMenuClose();
  };

  const handleAddSubcategory = (categoryId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    onAddSubcategory(categoryId);
  };

  if (categories.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          카테고리가 없습니다
        </Typography>
        <Typography variant="body2" color="text.secondary">
          새 대분류를 추가하여 시작하세요
        </Typography>
      </Paper>
    );
  }

  return (
    <Stack spacing={2}>
      {categories.map((category) => {
        const isExpanded = expandedCategories.includes(category.id);
        
        return (
          <Paper
            key={category.id}
            sx={{
              overflow: 'hidden',
              transition: 'box-shadow 0.2s ease',
              '&:hover': {
                boxShadow: 2
              }
            }}
          >
            {/* 대분류 헤더 */}
            <Box
              sx={{
                p: 2,
                cursor: 'pointer',
                backgroundColor: alpha(category.color, 0.05),
                borderBottom: isExpanded ? `1px solid ${alpha(category.color, 0.1)}` : 'none',
                '&:hover': {
                  backgroundColor: alpha(category.color, 0.1)
                }
              }}
              onClick={() => handleToggleExpand(category.id)}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                {/* 드래그 핸들 */}
                <DragIndicatorIcon 
                  sx={{ 
                    color: 'text.disabled',
                    cursor: 'grab'
                  }} 
                />
                
                {/* 카테고리 정보 */}
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: category.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    flexShrink: 0
                  }}
                >
                  {category.icon}
                </Box>
                
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="h6" fontWeight={600}>
                      {category.name}
                    </Typography>
                    {category.isDefault && (
                      <Tooltip title="기본 카테고리">
                        <LockIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                      </Tooltip>
                    )}
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {category.subcategories.length}개 소분류
                  </Typography>
                </Box>

                {/* 액션 버튼들 */}
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Tooltip title="소분류 추가">
                    <IconButton
                      size="small"
                      onClick={(e) => handleAddSubcategory(category.id, e)}
                    >
                      <AddIcon />
                    </IconButton>
                  </Tooltip>
                  
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, 'category', category)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                  
                  <IconButton
                    size="small"
                    onClick={() => handleToggleExpand(category.id)}
                  >
                    {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Stack>
              </Stack>
            </Box>

            {/* 소분류 목록 */}
            <Collapse in={isExpanded}>
              <Box sx={{ backgroundColor: alpha(category.color, 0.02) }}>
                {category.subcategories.length > 0 ? (
                  <Stack>
                    {category.subcategories.map((subcategory, index) => (
                      <Box
                        key={subcategory.id}
                        sx={{
                          p: 2,
                          pl: 6,
                          borderBottom: index < category.subcategories.length - 1 
                            ? `1px solid ${alpha(category.color, 0.1)}` 
                            : 'none',
                          '&:hover': {
                            backgroundColor: alpha(subcategory.color || category.color, 0.1)
                          }
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={2}>
                          {/* 소분류 정보 */}
                          <Box
                            sx={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              backgroundColor: subcategory.color || category.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              flexShrink: 0
                            }}
                          >
                            {subcategory.icon}
                          </Box>
                          
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Typography variant="body1" fontWeight={500}>
                                {subcategory.name}
                              </Typography>
                              {subcategory.isDefault && (
                                <Tooltip title="기본 소분류">
                                  <LockIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                                </Tooltip>
                              )}
                            </Stack>
                          </Box>

                          {/* 소분류 액션 */}
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, 'subcategory', subcategory, category.id)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      소분류가 없습니다
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      "+" 버튼을 클릭하여 소분류를 추가하세요
                    </Typography>
                  </Box>
                )}
              </Box>
            </Collapse>
          </Paper>
        );
      })}

      {/* 컨텍스트 메뉴 */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          수정
        </MenuItem>
        
        {selectedItem?.item && !selectedItem.item.isDefault && (
          <>
            <Divider />
            <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" sx={{ color: 'error.main' }} />
              </ListItemIcon>
              삭제
            </MenuItem>
          </>
        )}
        
        {selectedItem?.item?.isDefault && (
          <MenuItem disabled>
            <ListItemIcon>
              <LockIcon fontSize="small" />
            </ListItemIcon>
            기본 항목은 삭제할 수 없습니다
          </MenuItem>
        )}
      </Menu>
    </Stack>
  );
};

export default CategoryList;