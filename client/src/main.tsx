import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { createContext, useState } from "react";

// Create a context for currently selected school
export const SchoolContext = createContext<{
  selectedSchool: string;
  setSelectedSchool: (school: string) => void;
}>({
  selectedSchool: "",
  setSelectedSchool: () => {},
});

// Main app with context provider
const Main = () => {
  const [selectedSchool, setSelectedSchool] = useState<string>("");
  
  return (
    <SchoolContext.Provider value={{ selectedSchool, setSelectedSchool }}>
      <App />
    </SchoolContext.Provider>
  );
};

createRoot(document.getElementById("root")!).render(<Main />);
