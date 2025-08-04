import React from 'react';
import {
  FormControl,
  InputLabel,
  Select as MuiSelect,
  MenuItem,
  FormHelperText,
  ListSubheader
} from '@mui/material';
import type { SelectProps as MuiSelectProps, FormControlProps } from '@mui/material';

export interface CategoryOption {
  id: string;
  name: string;
  subcategories?: SubcategoryOption[];
}

export interface SubcategoryOption {
  id: string;
  name: string;
  parentId: string;
}

export interface CategorySelectProps extends Omit<MuiSelectProps, 'variant'> {
  label?: string;
  categories: CategoryOption[];
  helperText?: string;
  error?: boolean;
  required?: boolean;
  variant?: 'filled' | 'outlined' | 'standard';
  fullWidth?: boolean;
  includeSubcategories?: boolean;
  FormControlProps?: FormControlProps;
}

const CategorySelect: React.FC<CategorySelectProps> = ({
  label,
  categories,
  helperText,
  error = false,
  required = false,
  variant = 'outlined',
  fullWidth = true,
  includeSubcategories = true,
  FormControlProps,
  ...selectProps
}) => {
  const labelId = React.useMemo(() => 
    label ? `category-select-label-${Math.random().toString(36).substr(2, 9)}` : undefined, 
    [label]
  );

  const renderMenuItems = () => {
    const items: React.ReactNode[] = [];

    categories.forEach((category) => {
      // 대분류 항목 추가
      items.push(
        <MenuItem key={category.id} value={category.id}>
          {category.name}
        </MenuItem>
      );

      // 소분류 항목 추가 (있는 경우)
      if (includeSubcategories && category.subcategories && category.subcategories.length > 0) {
        items.push(
          <ListSubheader key={`${category.id}-header`} sx={{ fontSize: '0.875rem' }}>
            {category.name} 하위 카테고리
          </ListSubheader>
        );
        
        category.subcategories.forEach((subcategory) => {
          items.push(
            <MenuItem
              key={subcategory.id}
              value={subcategory.id}
              sx={{ pl: 4 }}
            >
              {subcategory.name}
            </MenuItem>
          );
        });
      }
    });

    return items;
  };

  return (
    <FormControl
      variant={variant}
      fullWidth={fullWidth}
      error={error}
      required={required}
      {...FormControlProps}
    >
      {label && (
        <InputLabel id={labelId}>
          {label}
        </InputLabel>
      )}
      <MuiSelect
        {...selectProps}
        labelId={labelId}
        label={label}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 400
            }
          },
          ...selectProps.MenuProps
        }}
      >
        {renderMenuItems()}
      </MuiSelect>
      {helperText && (
        <FormHelperText>{helperText}</FormHelperText>
      )}
    </FormControl>
  );
};

export default CategorySelect;