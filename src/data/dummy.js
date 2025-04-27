export const cards = [
  {
    title: "Pipeline Overview",
    stats: [
      { label: "Active Pipelines", value: 5 },
      { label: "Success Rate", value: "85%" },
    ],
    progress: { value: 85, color: "bg-blue-theme" },
  },
  {
    title: "Build Status",
    stats: [
      { label: "Total Builds", value: 120 },
      { label: "Failed Builds", value: 8 },
    ],
    progress: { value: 6.67, color: "bg-red-theme" },
  },
  {
    title: "Model Performance",
    stats: [
      { label: "Accuracy", value: "92%" },
      { label: "Last Updated", value: "1h ago" },
    ],
    progress: { value: 92, color: "bg-green-theme" },
  },
];

export const lineChartData = [
  [
    { x: new Date(2005, 0, 1), y: 21 },
    { x: new Date(2006, 0, 1), y: 24 },
    { x: new Date(2007, 0, 1), y: 36 },
    { x: new Date(2008, 0, 1), y: 38 },
    { x: new Date(2009, 0, 1), y: 54 },
    { x: new Date(2010, 0, 1), y: 57 },
    { x: new Date(2011, 0, 1), y: 70 },
  ],
  [
    { x: new Date(2005, 0, 1), y: 28 },
    { x: new Date(2006, 0, 1), y: 44 },
    { x: new Date(2007, 0, 1), y: 48 },
    { x: new Date(2008, 0, 1), y: 50 },
    { x: new Date(2009, 0, 1), y: 66 },
    { x: new Date(2010, 0, 1), y: 78 },
    { x: new Date(2011, 0, 1), y: 84 },
  ],

  [
    { x: new Date(2005, 0, 1), y: 10 },
    { x: new Date(2006, 0, 1), y: 20 },
    { x: new Date(2007, 0, 1), y: 30 },
    { x: new Date(2008, 0, 1), y: 39 },
    { x: new Date(2009, 0, 1), y: 50 },
    { x: new Date(2010, 0, 1), y: 70 },
    { x: new Date(2011, 0, 1), y: 100 },
  ],
];

export const lineCustomSeries = [
  { dataSource: lineChartData[0],
    xName: 'x',
    yName: 'y',
    name: 'Germany',
    width: '2',
    marker: { visible: true, width: 10, height: 10 },
    type: 'Line' },

  { dataSource: lineChartData[1],
    xName: 'x',
    yName: 'y',
    name: 'England',
    width: '2',
    marker: { visible: true, width: 10, height: 10 },
    type: 'Line' },

  { dataSource: lineChartData[2],
    xName: 'x',
    yName: 'y',
    name: 'India',
    width: '2',
    marker: { visible: true, width: 10, height: 10 },
    type: 'Line' },
];

export const LinePrimaryXAxis = {
  valueType: 'DateTime',
  labelFormat: 'y',
  intervalType: 'Years',
  edgeLabelPlacement: 'Shift',
  majorGridLines: { width: 0 },
  background: 'white',
};

export const LinePrimaryYAxis = {
  labelFormat: '{value}%',
  rangePadding: 'None',
  minimum: 0,
  maximum: 100,
  interval: 20,
  lineStyle: { width: 0 },
  majorTickLines: { width: 0 },
  minorTickLines: { width: 0 },
};

const pipelineData = [
  { date: '2025-04-01', success: 10, failed: 5 },
  { date: '2025-04-02', success: 12, failed: 3 },
  { date: '2025-04-03', success: 15, failed: 7 },
  { date: '2025-04-04', success: 8, failed: 4 },
  { date: '2025-04-05', success: 20, failed: 6 },
  { date: '2025-04-06', success: 18, failed: 8 },
  { date: '2025-04-07', success: 22, failed: 10 },
  { date: '2025-04-08', success: 19, failed: 9 },
  { date: '2025-04-09', success: 14, failed: 5 },
  { date: '2025-04-10', success: 16, failed: 6 },
  { date: '2025-04-14', success: 25, failed: 12 },
  { date: '2025-04-15', success: 23, failed: 11 },
  { date: '2025-04-16', success: 27, failed: 13 },
  { date: '2025-04-21', success: 30, failed: 15 },
  { date: '2025-04-22', success: 28, failed: 14 },
  { date: '2025-04-28', success: 26, failed: 13 },
  { date: '2025-04-29', success: 29, failed: 16 },
  { date: '2025-05-01', success: 32, failed: 18 },
  { date: '2025-05-02', success: 30, failed: 17 },
  { date: '2025-05-03', success: 35, failed: 20 },
];

export default pipelineData;