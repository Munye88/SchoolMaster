import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ActionLog } from '@shared/schema';

interface ActionLogStatsProps {
  logs: ActionLog[];
}

export function ActionLogStats({ logs }: ActionLogStatsProps) {
  // Calculate status counts
  const statusCounts = logs.reduce(
    (acc, log) => {
      acc[log.status] = (acc[log.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Prepare data for the pie chart
  const statusData = [
    { name: 'Pending', value: statusCounts.pending || 0, color: '#2563eb' },
    { name: 'Completed', value: statusCounts.completed || 0, color: '#22c55e' },
    { name: 'Under Review', value: statusCounts.under_review || 0, color: '#ef4444' },
  ];

  // Calculate category counts if categories exist
  const categoryCounts = logs.reduce(
    (acc, log) => {
      if (log.category) {
        acc[log.category] = (acc[log.category] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>
  );

  // Prepare data for the category chart
  const categoryData = Object.entries(categoryCounts).map(([category, count], index) => ({
    name: category,
    value: count,
    color: `hsl(${index * 40}, 70%, 50%)`,
  }));

  // Only show category chart if we have categories
  const hasCategoryData = categoryData.length > 0;

  // Calculate due soon counts (due in next 7 days)
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);
  
  const dueSoonCount = logs.filter(log => {
    if (!log.dueDate) return false;
    const dueDate = new Date(log.dueDate);
    return dueDate >= today && dueDate <= nextWeek && log.status !== 'completed';
  }).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <Card className="col-span-1">
        <CardHeader className="pb-2">
          <CardTitle>Action Items Summary</CardTitle>
          <CardDescription>Status distribution overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [`${value} items`, name]}
                />
                <Legend layout="vertical" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {hasCategoryData && (
        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle>Categories</CardTitle>
            <CardDescription>Items by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [`${value} items`, name]}
                  />
                  <Legend layout="vertical" verticalAlign="bottom" align="center" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="col-span-1">
        <CardHeader className="pb-2">
          <CardTitle>Key Metrics</CardTitle>
          <CardDescription>Current action log stats</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <div className="flex items-center justify-between rounded-lg bg-muted p-3">
              <div className="text-sm font-medium">Total Items</div>
              <div className="text-xl font-bold">{logs.length}</div>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3">
              <div className="text-sm font-medium text-blue-700 dark:text-blue-300">Pending</div>
              <div className="text-xl font-bold text-blue-700 dark:text-blue-300">{statusCounts.pending || 0}</div>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-green-50 dark:bg-green-900/20 p-3">
              <div className="text-sm font-medium text-green-700 dark:text-green-300">Completed</div>
              <div className="text-xl font-bold text-green-700 dark:text-green-300">{statusCounts.completed || 0}</div>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-red-50 dark:bg-red-900/20 p-3">
              <div className="text-sm font-medium text-red-700 dark:text-red-300">Under Review</div>
              <div className="text-xl font-bold text-red-700 dark:text-red-300">{statusCounts.under_review || 0}</div>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-amber-50 dark:bg-amber-900/20 p-3">
              <div className="text-sm font-medium text-amber-700 dark:text-amber-300">Due Soon (7 days)</div>
              <div className="text-xl font-bold text-amber-700 dark:text-amber-300">{dueSoonCount}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}