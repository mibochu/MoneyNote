import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Box, Typography } from '@mui/material';

// Chart.js 컴포넌트 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export interface BarChartData {
  label: string;
  value: number;
}

export interface BarChartProps {
  data: BarChartData[];
  title?: string;
  height?: number;
  color?: string;
  horizontal?: boolean;
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  height = 300,
  color = '#1976d2',
  horizontal = false
}) => {
  const chartData = {
    labels: data.map(item => item.label),
    datasets: [
      {
        label: '지출 금액',
        data: data.map(item => item.value),
        backgroundColor: color,
        borderColor: color,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: horizontal ? 'y' as const : 'x' as const,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `₩${context.raw.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: !horizontal,
        },
      },
      y: {
        grid: {
          display: horizontal,
        },
        beginAtZero: true,
        ticks: {
          callback: (value: any) => {
            return `₩${value.toLocaleString()}`;
          },
        },
      },
    },
  };

  if (data.length === 0) {
    return (
      <Box 
        sx={{ 
          height, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          bgcolor: 'grey.50',
          borderRadius: 1 
        }}
      >
        <Typography color="text.secondary">
          표시할 데이터가 없습니다
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {title && (
        <Typography variant="h6" gutterBottom align="center">
          {title}
        </Typography>
      )}
      <Box sx={{ height, position: 'relative' }}>
        <Bar data={chartData} options={options} />
      </Box>
    </Box>
  );
};

export default BarChart;