import React from 'react';
import { Card, Statistic, Row, Col } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';

const PipelineStatsCards = ({ stats }) => {
  return (
    <Row gutter={16} className="mb-6">
      <Col span={8}>
        <Card className="shadow-md">
          <Statistic
            title="Success Rate"
            value={stats.success_rate}
            suffix="%"
            precision={2}
            valueStyle={{ color: '#3f8600' }}
          />
        </Card>
      </Col>
      <Col span={8}>
        <Card className="shadow-md">
          <Statistic
            title="Failed Builds"
            value={stats.failed_builds}
            valueStyle={{ color: '#cf1322' }}
          />
        </Card>
      </Col>
      <Col span={8}>
        <Card className="shadow-md">
          <Statistic
            title="Average Run Time"
            value={stats.average_run_time}
            suffix="seconds"
            precision={2}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default PipelineStatsCards;