import React, { useEffect, useRef } from 'react';

export default function OverviewTab({
  apiBase,
  setApiBase,
  status,
  error,
  summary,
  onRunAnalysis,
  onReloadSummary,
}) {
  const bootstrapped = useRef(false);

  // Auto-run analysis + summary on first load
  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    console.log('[OverviewTab] Auto-running analysis and summary...');

    (async () => {
      try {
        console.log('[OverviewTab] Calling onRunAnalysis...');
        await onRunAnalysis?.();
      } catch (e) {
        console.error('[OverviewTab] Analysis error:', e);
      }

      // Always call onReloadSummary after analysis
      try {
        console.log('[OverviewTab] Calling onReloadSummary...');
        await onReloadSummary?.();
      } catch (e) {
        console.error('[OverviewTab] Summary error:', e);
      }
    })();
  }, [onRunAnalysis, onReloadSummary]);

  console.log('[OverviewTab] Render - status:', status, 'summary:', !!summary, 'error:', error);
  console.log('[OverviewTab] AI summary object:', summary?.ai_summary);

  const ai = summary?.ai_summary;
  const stats = summary?.project_stats;

  if (!summary) {
    return (
      <div className="border border-dashed border-[#333] rounded p-4 text-gray-400">
        {status === 'error'
          ? error || 'Failed to load summary'
          : 'Analyzing repository and loading summary...'}
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto pr-2">
      <div className="space-y-4">
        {/* Summary & Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* AI Summary - takes 2 columns */}
          <div className="md:col-span-2 border-2 border-[#4FB3FF] rounded-lg p-4 bg-gradient-to-br from-[#1a1a2e] to-[#16213e]">
            <h3 className="text-xl font-bold mb-3 text-[#00E0B8] flex items-center gap-2">
              🤖 ai summary
            </h3>

            <p className="text-gray-200 whitespace-pre-line mb-3 leading-relaxed">
              {ai?.overview || '—'}
            </p>

            {/* Strengths */}
            {ai?.strengths?.length > 0 && (
              <div className="mt-4 p-3 bg-[#0a3d2c] rounded-lg border border-[#00E0B8]">
                <strong className="text-[#00E0B8] flex items-center gap-2">💪 strengths:</strong>
                <ul className="list-none ml-5 space-y-1 mt-2">
                  {ai.strengths.map((s, i) => (
                    <li key={i} className="text-gray-200 flex items-start gap-2">
                      <span className="text-[#00E0B8]">✓</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {ai?.recommendations?.length > 0 && (
              <div className="mt-4 p-3 bg-[#3d2a0a] rounded-lg border border-[#FFD93D]">
                <strong className="text-[#FFD93D] flex items-center gap-2">💡 recommendations:</strong>
                <ul className="list-none ml-5 space-y-1 mt-2">
                  {ai.recommendations.map((s, i) => (
                    <li key={i} className="text-gray-200 flex items-start gap-2">
                      <span className="text-[#FFD93D]">→</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Architecture */}
            {ai?.architecture_insights && (
              <div className="mt-4 p-3 bg-[#1a1a2e] rounded-lg border border-[#4FB3FF]">
                <strong className="text-[#4FB3FF] flex items-center gap-2">🏗️ architecture:</strong>
                <p className="text-gray-200 mt-2">{ai.architecture_insights}</p>
              </div>
            )}

            {/* Technology */}
            {ai?.technology_assessment && (
              <div className="mt-4 p-3 bg-[#2a1a2e] rounded-lg border border-[#FF6B9D]">
                <strong className="text-[#FF6B9D] flex items-center gap-2">⚡ technology:</strong>
                <p className="text-gray-200 mt-2">{ai.technology_assessment}</p>
              </div>
            )}
          </div>

          {/* Key Metrics */}
          <div className="border-2 border-[#FFD93D] rounded-lg p-4 bg-gradient-to-br from-[#2a2a1a] to-[#1e1e16]">
            <h3 className="text-xl font-bold mb-3 text-[#FFD93D] flex items-center gap-2">
              📊 key metrics
            </h3>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[#4FB3FF]">📁</span>
                <span className="text-gray-300">Files:</span>
                <span className="text-white font-bold ml-auto">{stats?.file_stats?.total_files ?? '—'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#00E0B8]">⚙️</span>
                <span className="text-gray-300">Functions:</span>
                <span className="text-white font-bold ml-auto">{stats?.function_stats?.total_functions ?? '—'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#FF6B9D]">🔗</span>
                <span className="text-gray-300">Total Calls:</span>
                <span className="text-white font-bold ml-auto">{stats?.function_stats?.total_function_calls ?? '—'}</span>
              </div>
              
              <div className="border-t border-[#3a3a2a] my-2"></div>
              
              <div className="flex items-center gap-2">
                <span className="text-[#FFD93D]">📈</span>
                <span className="text-gray-300">Avg Complexity:</span>
                <span className="text-white font-bold ml-auto">{stats?.function_stats?.average_complexity ?? '—'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#FF6B35]">⚠️</span>
                <span className="text-gray-300">Max Complexity:</span>
                <span className="text-white font-bold ml-auto">{stats?.function_stats?.max_complexity ?? '—'}</span>
              </div>
              
              <div className="border-t border-[#3a3a2a] my-2"></div>
              
              <div className="flex items-center gap-2">
                <span className="text-[#00E0B8]">💚</span>
                <span className="text-gray-300">Health Score:</span>
                <span className="text-[#00E0B8] font-bold ml-auto">{stats?.complexity_metrics?.code_health_score ?? '—'}/100</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#4FB3FF]">📦</span>
                <span className="text-gray-300">Project Size:</span>
                <span className="text-white font-bold ml-auto">{stats?.complexity_metrics?.project_size ?? '—'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#FF6B9D]">🏗️</span>
                <span className="text-gray-300">Complexity:</span>
                <span className="text-white font-bold ml-auto">{stats?.complexity_metrics?.architecture_complexity ?? '—'}</span>
              </div>

              {/* Languages */}
              {stats?.language_stats?.language_percentages && (
                <>
                  <div className="border-t border-[#3a3a2a] my-2"></div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[#FFD93D]">💻</span>
                      <strong className="text-[#FFD93D]">Languages:</strong>
                    </div>
                    <div className="ml-6 space-y-1">
                      {Object.entries(
                        stats.language_stats.language_percentages
                      ).map(([lang, percent]) => (
                        <div key={lang} className="flex items-center justify-between text-sm">
                          <span className="text-gray-300">{lang}</span>
                          <span className="text-white font-semibold">{percent}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>

        {/* Raw Data */}
        <div className="border border-[#333] rounded p-4 mt-4">
          <h3 className="text-lg font-semibold mb-2">Data Received</h3>

          <div className="text-sm text-gray-300">
            Generated at: {summary.generated_at || '—'}
          </div>
          <div className="text-sm text-gray-300">
            Primary language: {stats?.language_stats?.primary_language || '—'}
          </div>

          {/* File extensions */}
          {stats?.file_stats?.file_extensions && (
            <div className="mt-3">
              <strong>File Extensions:</strong>
              <ul className="list-disc ml-5 space-y-1">
                {Object.entries(stats.file_stats.file_extensions).map(
                  ([ext, count]) => (
                    <li key={ext}>
                      {ext}: {count}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
