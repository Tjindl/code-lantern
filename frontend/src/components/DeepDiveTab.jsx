import React, { useState } from 'react';

// DeepDiveTab receives data from parent - uses lazy loading for function details
export default function DeepDiveTab({ analysisData, apiBase = 'http://localhost:8000' }) {
  const [expandedFiles, setExpandedFiles] = useState(new Set());
  const [expandedFunctions, setExpandedFunctions] = useState(new Set());
  const [functionDetails, setFunctionDetails] = useState({});
  const [loadingFunction, setLoadingFunction] = useState(null);
  const [rateLimit, setRateLimit] = useState({ used: 0, max: 5, remaining: 5 });
  const [rateLimitError, setRateLimitError] = useState(null);

  const architectureMap = analysisData?.architecture_map;

  if (!analysisData) {
    return <div className="text-gray-400">Loading architecture...</div>;
  }

  if (!architectureMap || !architectureMap.listOfFiles) {
    return <div className="text-gray-400">No architecture data available.</div>;
  }

  const files = architectureMap.listOfFiles;

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
      // Only call API when expanding function for the first time
      if (!functionDetails[key]) {
        setLoadingFunction(key);
        setRateLimitError(null);
        try {
          const baseFunctionName = functionName.includes('-') ? functionName.split('-').pop() : functionName;
          const res = await fetch(`${apiBase}/api/function?file_path=${encodeURIComponent(filePath)}&function_name=${encodeURIComponent(baseFunctionName)}`);

          if (res.status === 429) {
            const errorData = await res.json();
            setRateLimitError(errorData.detail || { message: "Rate limit reached" });
            setFunctionDetails(prev => ({ ...prev, [key]: { rateLimited: true } }));
          } else if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          } else {
            const json = await res.json();
            setFunctionDetails(prev => ({ ...prev, [key]: json.details || json }));
            // Update rate limit info
            if (json.rate_limit) {
              setRateLimit(json.rate_limit);
            }
          }
        } catch (e) {
          setFunctionDetails(prev => ({ ...prev, [key]: { error: e.message } }));
        }
        setLoadingFunction(null);
      }
    }
    setExpandedFunctions(next);
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-[#00E0B8] flex items-center gap-4">
            deep dive - files & functions
            <span className="text-sm font-normal text-gray-400">
              ({files.length} files)
            </span>
          </h3>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">AI Credits:</span>
            <span className={`font-mono ${rateLimit.remaining > 2 ? 'text-[#00E0B8]' : rateLimit.remaining > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
              {rateLimit.remaining}/{rateLimit.max}
            </span>
          </div>
        </div>

        {rateLimitError && (
          <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-400 text-sm font-medium">
              ⚠️ {rateLimitError.message || "Rate limit reached"}
            </p>
            <p className="text-gray-400 text-xs mt-1">
              {rateLimitError.tip || "Upload a new project to reset your limit."}
            </p>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {files.map((fileData) => {
          const filePath = fileData.filePath;
          const functions = fileData.listOfFunctions || [];
          const isFileExpanded = expandedFiles.has(filePath);

          // Skip files with no functions
          if (functions.length === 0) return null;

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
                  {functions.map((func) => {
                    const funcName = func.functionName;
                    const key = `${filePath}::${funcName}`;
                    const isFuncExpanded = expandedFunctions.has(key);
                    const details = functionDetails[key];
                    const isLoading = loadingFunction === key;

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
                            {isLoading ? (
                              <div className="text-gray-400 italic flex items-center gap-2">
                                <span className="animate-pulse">🤖</span> Generating AI description...
                              </div>
                            ) : !details ? (
                              <div className="text-gray-400 italic">Loading details...</div>
                            ) : details.error ? (
                              <div className="text-red-400">⚠️ Error: {details.error}</div>
                            ) : details.rateLimited ? (
                              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-yellow-400 text-sm">
                                ⚠️ <strong>Limit Reached:</strong> Cannot generate more AI descriptions for this project.
                              </div>
                            ) : (
                              <>
                                <div className="flex gap-2">
                                  <strong className="text-[#00E0B8] min-w-[80px]">Inputs:</strong>
                                  <span className="text-gray-300">{String(details.inputs) || '—'}</span>
                                </div>
                                <div className="flex gap-2">
                                  <strong className="text-[#00E0B8] min-w-[80px]">Outputs:</strong>
                                  <span className="text-gray-300">{String(details.outputs) || '—'}</span>
                                </div>
                                <div className="flex gap-2">
                                  <strong className="text-[#00E0B8] min-w-[80px]">Description:</strong>
                                  <span className="text-gray-300">{String(details.description) || '—'}</span>
                                </div>
                                {details.calls && Array.isArray(details.calls) && details.calls.length > 0 && (
                                  <div>
                                    <strong className="text-[#00E0B8]">Calls:</strong>
                                    <ul className="list-disc ml-5 mt-1 space-y-1 text-gray-300">
                                      {details.calls.map((c, i) => (<li key={i}>{String(c)}</li>))}
                                    </ul>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
