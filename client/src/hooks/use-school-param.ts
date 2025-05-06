import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { School } from '@shared/schema';

// This hook extracts the school code from the URL parameter and fetches the corresponding school data
export function useSchoolParam() {
  const params = useParams<{ schoolCode: string }>();
  const schoolCode = params?.schoolCode;

  const { data: schools = [] } = useQuery<School[]>({
    queryKey: ['/api/schools'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (!schoolCode) return null;
  
  // Find the school by code
  const school = schools.find((s) => s.code === schoolCode);
  return school || null;
}
