import React, { useState, useEffect, useContext } from 'react';
import { Line } from 'react-chartjs-2';
import { Card, Select, message } from 'antd';
import { UserContext } from '../../contexts/UserContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const { Option } = Select;

const PipelineChart = ({ selectedRepoId, selectedBranch, selectedWorkflowId }) => {
  const { user } = useContext(UserContext);
  const [timeUnit, setTimeUnit] = useState('day');
  const [chartDataRaw, setChartDataRaw] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPipelineData = async () => {
      if (!selectedRepoId || !selectedBranch || !selectedWorkflowId) {
        setChartDataRaw([]);
        return;
      }

      setLoading(true);
      try {
        let url = `http://localhost:5000/api/pipeline-data?user_id=${user.id}&timeUnit=${timeUnit}&recentDays=500`;
        if (selectedRepoId) {
          url += `&repo_id=${selectedRepoId}`;
        }
        if (selectedBranch) {
          url += `&branch=${selectedBranch}`;
        }
        if (selectedWorkflowId) {
          url += `&workflow_id=${selectedWorkflowId}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch pipeline data');
        }
        const data = await response.json();
        setChartDataRaw(data);
      } catch (error) {
        message.error(error.message);
        setChartDataRaw([]);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchPipelineData();
    }
  }, [user?.id, timeUnit, selectedRepoId, selectedBranch, selectedWorkflowId]);

  const labels = chartDataRaw.map((item) => item.timeText);
  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'Success',
        data: chartDataRaw.map((item) => item.success),
        borderColor: '#52C41A',
        backgroundColor: '#52C41A',
        fill: false,
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: '#52C41A',
        pointBorderColor: '#fff',
        pointBorderWidth: 1,
      },
      {
        label: 'Failed',
        data: chartDataRaw.map((item) => item.failed),
        borderColor: '#F5222D',
        backgroundColor: '#F5222D',
        fill: false,
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: '#F5222D',
        pointBorderColor: '#fff',
        pointBorderWidth: 1,
      },
      {
        label: 'Predicted Failed',
        data: chartDataRaw.map((item) => item.predictedFailed),
        borderColor: '#FAAD14',
        backgroundColor: '#FAAD14',
        fill: false,
        tension: 0.3,
        borderDash: [4, 4],
        pointRadius: 4,
        pointBackgroundColor: '#FAAD14',
        pointBorderColor: '#fff',
        pointBorderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 12,
            weight: 'bold',
          },
          color: '#6B7280',
          usePointStyle: true,
          pointStyle: 'rect',
          padding: 20,
          boxWidth: 8,
          boxHeight: 8,
        },
        display: true,
        onHover: (event, legendItem) => {
          event.native.target.style.cursor = 'pointer';
        },
        onLeave: (event) => {
          event.native.target.style.cursor = 'default';
        },
      },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#333',
        bodyColor: '#666',
        borderColor: '#ddd',
        borderWidth: 1,
        cornerRadius: 4,
        padding: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: ${context.raw} pipelines`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 12,
          },
          color: '#666',
        },
      },
      y: {
        ticks: {
          callback: (value) => `${value}`,
          font: {
            size: 12,
          },
          color: '#666',
        },
        grid: {
          color: '#e8e8e8',
          lineWidth: 1,
          borderDash: [4, 4],
        },
      },
    },
    elements: {
      line: {
        borderWidth: 2,
      },
    },
    interaction: {
      mode: 'nearest',
      intersect: true,
    },
  };

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
            Pipeline Chart
          </span>
        </div>
      }
      extra={
        <Select
          value={timeUnit}
          onChange={(value) => setTimeUnit(value)}
          style={{
            width: 120,
            borderRadius: '4px',
            fontSize: '14px',
          }}
          dropdownStyle={{
            borderRadius: '4px',
          }}
        >
          <Option value="day">Day</Option>
          <Option value="week">Week</Option>
          <Option value="month">Month</Option>
        </Select>
      }
      style={{
        height: '100%',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        backgroundColor: '#fff',
      }}
      styles={{
        header: {
          padding: '12px 16px',
          borderBottom: '1px solid #e8e8e8',
        },
        body: {
          padding: '24px',
        },
      }}
    >
      <div style={{ height: '325px' }}>
        {loading ? <p>Loading...</p> : chartDataRaw.length > 0 ? (
          <Line data={chartData} options={options} />
        ) : (
          <p>No pipeline data available for this branch.</p>
        )}
      </div>
    </Card>
  );
};

export default PipelineChart;