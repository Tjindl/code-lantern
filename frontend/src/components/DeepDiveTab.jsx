import React, { useEffect, useState } from 'react';

export default function DeepDiveTab() {
  const [architectureMap, setArchitectureMap] = useState(null);
  const [expandedFiles, setExpandedFiles] = useState(new Set());
  const [expandedFunctions, setExpandedFunctions] = useState(new Set());
  const [functionDetails, setFunctionDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiBase = window.__API_BASE__ || 'http://localhost:8000';

  useEffect(() => {
    async function loadArchitecture() {
      setLoading(true); setError(null);
      try {
        const res = await fetch(`${apiBase}/api/analyze`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setArchitectureMap(json.architecture_map);
        setLoading(false);
      } catch (e) {
        setError(e.message || String(e));
        setLoading(false);
      }
    }
    loadArchitecture();
  }, [apiBase]);

  function toggleFile(filePath) {
    const next = new Set(expandedFiles);
    if (next.has(filePath)) next.delete(filePath);
    else next.add(filePath);
    setExpandedFiles(next);
  }

  async function toggleFunction(filePath, functionName) {
    const key = `${filePath}::${functionName}`;
    const next = new Set(expandedFunctions);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
      if (!functionDetails[key]) {
        try {
          const baseFunctionName = functionName.includes('-') ? functionName.split('-').pop() : functionName;
          const res = await fetch(`${apiBase}/api/function?file_path=${encodeURIComponent(filePath)}&function_name=${encodeURIComponent(baseFunctionName)}`);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const json = await res.json();
          setFunctionDetails(prev => ({ ...prev, [key]: json.details || json }));
        } catch (e) {
          setFunctionDetails(prev => ({ ...prev, [key]: { error: e.message } }));
        }
      }
    }
    setExpandedFunctions(next);
  }

  if (loading) return <div className="text-gray-400">Loading architecture...</div>;
  if (error) return <div className="text-red-400">Error: {error}</div>;
  if (!architectureMap || !architectureMap.listOfFiles) return <div className="text-gray-400">No data available.</div>;

  const files = architectureMap.listOfFiles;

  return (
    <div className="w-full h-full flex flex-col">
      <h3 className="text-xl font-bold mb-4 text-[#00E0B8]">deep dive - files & functions</h3>
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {files.map((fileData) => {
          const filePath = fileData.filePath;
          const functions = fileData.listOfFunctions || [];
          const isFileExpanded = expandedFiles.has(filePath);
          return (
            <div key={filePath} className="border border-[#444] rounded-lg bg-[#1a1a1a] overflow-hidden">
              <div
                className="flex items-center justify-between cursor-pointer hover:bg-[#252525] p-3 transition-colors"
                onClick={() => toggleFile(filePath)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[#4FB3FF]">{isFileExpanded ? '📂' : '📁'}</span>
                  <span className="font-mono text-sm text-gray-200">{filePath}</span>
                </div>
                <span className="text-gray-400 text-xs">{functions.length} function{functions.length !== 1 ? 's' : ''}</span>
              </div>

              {isFileExpanded && (
                <div className="bg-[#0f0f0f] p-3 space-y-2 max-h-96 overflow-y-auto">
                  {functions.length === 0 ? (
                    <div className="text-gray-500 text-xs italic">No functions found</div>
                  ) : (
                    functions.map((func) => {
                      const funcName = func.functionName;
                      const key = `${filePath}::${funcName}`;
                      const isFuncExpanded = expandedFunctions.has(key);
                      const details = functionDetails[key];
                      return (
                        <div key={funcName} className="border-l-2 border-[#4FB3FF] pl-3 py-1">
                          <div
                            className="flex items-center justify-between cursor-pointer hover:bg-[#252525] p-2 rounded transition-colors"
                            onClick={() => toggleFunction(filePath, funcName)}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-[#00E0B8]">⚙️</span>
                              <span className="font-mono text-sm text-[#4FB3FF]">{funcName.split('-').pop()}</span>
                            </div>
                            <span className="text-gray-500 text-xs">{isFuncExpanded ? '▼' : '▶'}</span>
                          </div>

                          {isFuncExpanded && (
                            <div className="ml-6 mt-2 p-3 bg-[#1a1a1a] border border-[#333] rounded-lg text-sm space-y-2">
                              {!details ? (
                                <div className="text-gray-400 italic">Loading details...</div>
                              ) : details.error ? (
                                <div className="text-red-400">⚠️ Error: {details.error}</div>
                              ) : (
                                <>
                                  <div className="flex gap-2">
                                    <strong className="text-[#00E0B8] min-w-[80px]">Inputs:</strong>
                                    <span className="text-gray-300">{details.inputs || '—'}</span>
                                  </div>
                                  <div className="flex gap-2">
                                    <strong className="text-[#00E0B8] min-w-[80px]">Outputs:</strong>
                                    <span className="text-gray-300">{details.outputs || '—'}</span>
                                  </div>
                                  <div className="flex gap-2">
                                    <strong className="text-[#00E0B8] min-w-[80px]">Description:</strong>
                                    <span className="text-gray-300">{details.description || '—'}</span>
                                  </div>
                                  {details.calls && details.calls.length > 0 && (
                                    <div>
                                      <strong className="text-[#00E0B8]">Calls:</strong>
                                      <ul className="list-disc ml-5 mt-1 space-y-1 text-gray-300">
                                        {details.calls.map((c, i) => (<li key={i}>{c}</li>))}
                                      </ul>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


