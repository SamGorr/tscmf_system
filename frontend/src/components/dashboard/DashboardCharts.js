import React from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  AreaChart, Area
} from 'recharts';

// Chart colors
const COLORS = ['#007DB7', '#00A5D2', '#00B6C9', '#8DC63F', '#FDB515', '#FF7F50', '#9370DB', '#20B2AA'];

const DashboardCharts = ({ statusChartData, typeChartData, monthlyChartData }) => {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-medium text-gray-800 mb-4">Transaction Analytics</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Status Donut Chart */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">By Status</h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name.split(' ')[0]}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={true}
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} transactions`, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Transaction Type Bar Chart */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">By Type</h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={typeChartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="value" 
                  name="Transactions" 
                  fill="#8DC63F" 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Monthly Area Chart */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Monthly Trend</h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyChartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={70}
                  tick={{ fontSize: 11 }}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  name="Transactions" 
                  stroke="#007DB7" 
                  fill="#007DB7" 
                  fillOpacity={0.6} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts; 