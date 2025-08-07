import React from 'react';
import { CategoryManager } from '../features/categories/components/CategoryManager';

/**
 * Categories 페이지 컴포넌트
 * 
 * 카테고리 관리 시스템의 메인 페이지로, CategoryManager 컴포넌트를 래핑합니다.
 * 대분류/소분류의 추가, 수정, 삭제 및 관리 기능을 제공합니다.
 */
const Categories: React.FC = () => {
  return <CategoryManager />;
};

export default Categories;