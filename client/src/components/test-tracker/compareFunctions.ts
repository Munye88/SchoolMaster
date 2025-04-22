// Helper functions for historical data comparison

// Get historical comparison data
export const getComparisonData = (
  importedTestData: any[],
  compareSchool: string,
  compareTestType: 'Book' | 'ALCPT' | 'ECL' | 'OPI',
  compareYear1: number,
  compareYear2: number,
  comparePeriod1: string,
  comparePeriod2: string
) => {
  const dataset1 = importedTestData.filter(data => {
    const schoolMatch = compareSchool === 'all' || data.schoolId.toString() === compareSchool;
    const testTypeMatch = data.testType === compareTestType;
    const yearMatch = data.year === compareYear1;
    const periodMatch = compareTestType === 'Book' 
      ? data.cycle === parseInt(comparePeriod1)
      : data.month === comparePeriod1;
    
    return schoolMatch && testTypeMatch && yearMatch && periodMatch;
  });
  
  const dataset2 = importedTestData.filter(data => {
    const schoolMatch = compareSchool === 'all' || data.schoolId.toString() === compareSchool;
    const testTypeMatch = data.testType === compareTestType;
    const yearMatch = data.year === compareYear2;
    const periodMatch = compareTestType === 'Book' 
      ? data.cycle === parseInt(comparePeriod2)
      : data.month === comparePeriod2;
    
    return schoolMatch && testTypeMatch && yearMatch && periodMatch;
  });
  
  return { dataset1, dataset2 };
};