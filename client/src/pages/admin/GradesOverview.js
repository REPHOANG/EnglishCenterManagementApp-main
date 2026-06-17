import React from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { useGradesOverview } from "../../hooks/admin/useGradesOverview";
import { Search, Filter, RefreshCw, GraduationCap, Trophy } from "lucide-react";

export default function GradesOverview() {
  const {
    grades,
    loading,
    error,
    search,
    setSearch,
    filterClass,
    setFilterClass,
    classes,
    refresh
  } = useGradesOverview();

  // Calculate some quick stats
  const totalStudents = grades.length;
  const avgScore = totalStudents > 0 
    ? (grades.reduce((acc, g) => acc + (g.score.listening + g.score.reading + g.score.writing + g.score.speaking) / 4, 0) / totalStudents).toFixed(2)
    : 0;

  return (
    <AdminLayout>
      <div className="w-full min-h-screen px-4 py-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-3 rounded-xl">
              <GraduationCap className="w-6 h-6 text-purple-700" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Grades Oversight</h1>
              <p className="text-gray-500">Search for students to view their academic history</p>
            </div>
          </div>
          <button 
            onClick={refresh}
            className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
            title="Refresh Data"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px] flex flex-col">
          {/* Enhanced Filters */}
          <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-6 items-center bg-gray-50/30">
            <div className="relative w-full md:flex-1">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Search Student</label>
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter student name or email to start..."
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all text-gray-700 font-medium"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="w-full md:w-64">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Filter by Class</label>
              <div className="relative">
                <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  list="class-options"
                  placeholder="Type or select class..."
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-purple-500 transition-all text-sm font-medium text-gray-600"
                  value={filterClass === 'all' ? '' : filterClass}
                  onChange={(e) => setFilterClass(e.target.value || 'all')}
                />
                <datalist id="class-options">
                  {classes.filter(c => c !== 'all').map(c => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>

          {/* Table / Empty State */}
          <div className="flex-1 overflow-x-auto">
            {(search.trim() === "" && filterClass === "all") ? (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                <div className="bg-gray-50 p-6 rounded-full mb-4">
                  <Search className="w-12 h-12 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-400">Waiting for Search or Filter</h3>
                <p className="text-gray-400 mt-2 max-w-sm">
                  Please search for a student or select a specific class to view grade reports.
                </p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-600 text-xs border-b border-gray-100 font-bold uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-5">Student Details</th>
                    <th className="px-6 py-5">Class Info</th>
                    <th className="px-6 py-5 text-center">LISTENING</th>
                    <th className="px-6 py-5 text-center">READING</th>
                    <th className="px-6 py-5 text-center">WRITING</th>
                    <th className="px-6 py-5 text-center">SPEAKING</th>
                    <th className="px-6 py-5 text-center">RESULT</th>
                    <th className="px-6 py-5">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    Array(3).fill(0).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={8} className="px-6 py-6"><div className="h-4 bg-gray-100 rounded w-full"></div></td>
                      </tr>
                    ))
                  ) : grades.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-400 italic">
                        No grades found matching your current filters.
                      </td>
                    </tr>
                  ) : (
                    grades.map((g) => {
                      const avg = ((g.score.listening + g.score.reading + g.score.writing + g.score.speaking) / 4).toFixed(1);
                      return (
                        <tr key={g._id} className="hover:bg-purple-50/30 transition-colors">
                          <td className="px-6 py-5">
                            <div className="font-bold text-gray-800">{g.studentName}</div>
                            <div className="text-xs text-gray-400 font-medium">{g.studentEmail}</div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="text-gray-700 font-bold">{g.className}</div>
                            <div className="text-[10px] text-purple-600 font-black uppercase tracking-widest">{g.courseName}</div>
                          </td>
                          <ScoreCell value={g.score.listening} />
                          <ScoreCell value={g.score.reading} />
                          <ScoreCell value={g.score.writing} />
                          <ScoreCell value={g.score.speaking} />
                          <td className="px-6 py-5 text-center">
                            <span className={`inline-block px-3 py-1 rounded-lg text-xs font-black ${getScoreColor(avg)} shadow-sm`}>
                              {avg}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-sm text-gray-500 italic max-w-xs truncate" title={g.comment}>
                            {g.comment || "No comment"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function ScoreCell({ value }) {
  return (
    <td className="px-6 py-5 text-center">
      <span className="text-gray-700 font-bold">{value}</span>
    </td>
  );
}

function getScoreColor(score) {
  if (score >= 8) return "bg-green-100 text-green-700";
  if (score >= 5) return "bg-blue-100 text-blue-700";
  return "bg-red-100 text-red-700";
}
