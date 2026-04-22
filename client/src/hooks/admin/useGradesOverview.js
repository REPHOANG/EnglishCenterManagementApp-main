import { useState, useEffect } from "react";
import axios from "axios";

export function useGradesOverview() {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("all");

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const { data } = await axios.get("http://localhost:9999/api/grades/admin/overview", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setGrades(data.data);
      }
    } catch (e) {
      setError(e.response?.data?.message || "Failed to fetch grades");
    } finally {
      setLoading(false);
    }
  };

  // 1. Dynamic list of classes for the datalist
  // If searching for a student, show only their classes. 
  // If not, show all possible classes so admin can pick one.
  const availableClasses = search.trim() !== "" 
    ? ["all", ...new Set(grades.filter(g => 
        g.studentName.toLowerCase().includes(search.toLowerCase()) || 
        g.studentEmail.toLowerCase().includes(search.toLowerCase())
      ).map(g => g.className))]
    : ["all", ...new Set(grades.map(g => g.className))];

  // 2. Final filtered grades
  const getFilteredGrades = () => {
    const hasSearch = search.trim() !== "";
    const hasClassFilter = filterClass !== "all";

    // If nothing is entered, show nothing
    if (!hasSearch && !hasClassFilter) return [];

    return grades.filter(g => {
      const matchesSearch = !hasSearch || 
        g.studentName.toLowerCase().includes(search.toLowerCase()) || 
        g.studentEmail.toLowerCase().includes(search.toLowerCase());
      
      const matchesClass = !hasClassFilter || g.className === filterClass;
      
      return matchesSearch && matchesClass;
    });
  };

  const filteredGrades = getFilteredGrades();

  return {
    grades: filteredGrades,
    loading,
    error,
    search,
    setSearch,
    filterClass,
    setFilterClass,
    classes: availableClasses,
    refresh: fetchGrades
  };
}
