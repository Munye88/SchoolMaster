import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ReportsSimple() {
  // Academic year months in correct order
  const academicYearMonths = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
  
  // Academic year data - ordered correctly for display
  const academicYearData = [
    { month: 'Jun', attendance: 88, evaluation: 4.0, performance: 75, tests: 120 },
    { month: 'Jul', attendance: 90, evaluation: 4.1, performance: 78, tests: 130 },
    { month: 'Aug', attendance: 92, evaluation: 4.2, performance: 81, tests: 125 },
    { month: 'Sep', attendance: 94, evaluation: 4.3, performance: 84, tests: 135 },
    { month: 'Oct', attendance: 96, evaluation: 4.4, performance: 87, tests: 140 },
    { month: 'Nov', attendance: 90, evaluation: 4.2, performance: 80, tests: 128 },
    { month: 'Dec', attendance: 92, evaluation: 4.3, performance: 82, tests: 132 },
    { month: 'Jan', attendance: 94, evaluation: 4.4, performance: 85, tests: 138 },
    { month: 'Feb', attendance: 90, evaluation: 4.1, performance: 79, tests: 126 },
    { month: 'Mar', attendance: 92, evaluation: 4.2, performance: 83, tests: 133 },
    { month: 'Apr', attendance: 94, evaluation: 4.3, performance: 86, tests: 139 },
    { month: 'May', attendance: 96, evaluation: 4.5, performance: 89, tests: 145 }
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center mb-8">Academic Year Reports (June - May)</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-none">
          <CardHeader className="text-center">
            <CardTitle className="text-center">Monthly Attendance Trend</CardTitle>
            <CardDescription>Academic Year Order (June to May)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {academicYearData.map((data, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <span className="font-medium w-12">{data.month}</span>
                  <div className="flex items-center flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                        style={{ width: `${data.attendance}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm font-medium w-12 text-right">{data.attendance}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-none">
          <CardHeader className="text-center">
            <CardTitle className="text-center">Monthly Evaluation Trend</CardTitle>
            <CardDescription>Academic Year Order (June to May)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {academicYearData.map((data, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <span className="font-medium w-12">{data.month}</span>
                  <div className="flex items-center flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-green-600 h-3 rounded-full transition-all duration-300" 
                        style={{ width: `${(data.evaluation / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm font-medium w-16 text-right">{data.evaluation}/5</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-none">
        <CardHeader className="text-center">
          <CardTitle className="text-center">Academic Year Summary</CardTitle>
          <CardDescription>Monthly data in correct academic order</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-center font-semibold">Month</th>
                  <th className="border border-gray-300 px-4 py-2 text-center font-semibold">Attendance %</th>
                  <th className="border border-gray-300 px-4 py-2 text-center font-semibold">Evaluation</th>
                  <th className="border border-gray-300 px-4 py-2 text-center font-semibold">Performance %</th>
                  <th className="border border-gray-300 px-4 py-2 text-center font-semibold">Tests</th>
                </tr>
              </thead>
              <tbody>
                {academicYearData.map((data, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 text-center font-medium">{data.month}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{data.attendance}%</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{data.evaluation}/5</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{data.performance}%</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{data.tests}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}