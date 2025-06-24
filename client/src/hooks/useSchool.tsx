import { createContext, useContext, useState, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { School } from '@shared/schema';

type SchoolContextType = {
  schools: School[];
  isLoading: boolean;
  error: Error | null;
  selectedSchool: School | null;
  selectSchool: (school: School | null) => void;
  setSelectedSchool: (school: School | null) => void;
};

export const SchoolContext = createContext<SchoolContextType | null>(null);

export function SchoolProvider({ children }: { children: ReactNode }) {
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  
  const { data: schools = [], error, isLoading } = useQuery<School[], Error>({
    queryKey: ['/api/schools'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return (
    <SchoolContext.Provider
      value={{
        schools,
        isLoading,
        error: error || null,
        selectedSchool,
        selectSchool: setSelectedSchool,
        setSelectedSchool,
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
}

export function useSchool() {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
}