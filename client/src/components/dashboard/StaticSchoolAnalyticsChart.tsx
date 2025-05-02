import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

const StaticSchoolAnalyticsChart = () => {
  // Static data matching the screenshot exactly
  const data = [
    { name: 'Instructors', KFNA: 85, 'NFS East': 60, 'NFS West': 55 },
    { name: 'Courses', KFNA: 65, 'NFS East': 90, 'NFS West': 50 },
    { name: 'Students', KFNA: 260, 'NFS East': 165, 'NFS West': 135 }
  ];

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-[#0B1D51] text-3xl font-bold mb-6">School Analytics</h2>
            <h3 className="text-[#0B1D51] text-2xl font-semibold mb-8">Resource Distribution</h3>
            
            <div className="flex items-center gap-8 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-[#4B83F6]"></div>
                <span className="text-[#4B83F6] text-xl font-medium">KFNA</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-[#3CB179]"></div>
                <span className="text-[#3CB179] text-xl font-medium">NFS East</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-[#805AD5]"></div>
                <span className="text-[#805AD5] text-xl font-medium">NFS West</span>
              </div>
            </div>
            
            <div className="h-[400px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={data}
                  margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 20, fontWeight: 500, fill: '#111827' }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 16, fill: '#111827' }}
                    domain={[0, 300]}
                    ticks={[0, 65, 60, 165, 190, 260]}
                  />
                  <Bar dataKey="KFNA" fill="#4B83F6" barSize={50} />
                  <Bar dataKey="NFS East" fill="#3CB179" barSize={50} />
                  <Bar dataKey="NFS West" fill="#805AD5" barSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StaticSchoolAnalyticsChart;