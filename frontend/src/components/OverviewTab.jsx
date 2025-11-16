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
    <div className="w-full space-y-4">
      
      {/* Summary & Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* AI Summary */}
        <div className="border border-[#333] rounded p-4">
          <h3 className="text-lg font-semibold mb-2">AI Summary</h3>

          <p className="text-gray-300 whitespace-pre-line">
            {ai?.overview || '—'}
          </p>

          {/* Strengths */}
          {ai?.strengths?.length > 0 && (
            <div className="mt-3">
              <strong>Strengths:</strong>
              <ul className="list-disc ml-5 space-y-1">
                {ai.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {ai?.recommendations?.length > 0 && (
            <div className="mt-3">
              <strong>Recommendations:</strong>
              <ul className="list-disc ml-5 space-y-1">
                {ai.recommendations.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Architecture */}
          {ai?.architecture_insights && (
            <div className="mt-3">
              <strong>Architecture:</strong>
              <p className="text-gray-300">{ai.architecture_insights}</p>
            </div>
          )}

          {/* Tech Assessment */}
          {ai?.technology_assessment && (
            <div className="mt-3">
              <strong>Technology:</strong>
              <p className="text-gray-300">{ai.technology_assessment}</p>
            </div>
          )}
        </div>

        {/* Key Metrics */}
        <div className="border border-[#333] rounded p-4">
          <h3 className="text-lg font-semibold mb-2">Key Metrics</h3>

          <div className="space-y-1">
            <div>Files: {stats?.file_stats?.total_files ?? '—'}</div>
            <div>
              Lines of Code:{' '}
              {stats?.file_stats?.estimated_lines_of_code ?? '—'}
            </div>
            <div>
              Functions: {stats?.function_stats?.total_functions ?? '—'}
            </div>
            <div>
              Total Calls: {stats?.function_stats?.total_function_calls ?? '—'}
            </div>
            <div>
              Avg Complexity:{' '}
              {stats?.function_stats?.average_complexity ?? '—'}
            </div>
            <div>
              Max Complexity:{' '}
              {stats?.function_stats?.max_complexity ?? '—'}
            </div>
            <div>
              Health Score:{' '}
              {stats?.complexity_metrics?.code_health_score ?? '—'}/100
            </div>
            <div>
              Project Size: {stats?.complexity_metrics?.project_size ?? '—'}
            </div>
            <div>
              Architecture Complexity:{' '}
              {stats?.complexity_metrics?.architecture_complexity ?? '—'}
            </div>

            {/* Languages */}
            {stats?.language_stats?.language_percentages && (
              <div className="mt-2">
                <strong>Languages:</strong>
                <div className="mt-1 space-y-1">
                  {Object.entries(
                    stats.language_stats.language_percentages
                  ).map(([lang, percent]) => (
                    <div key={lang}>
                      {lang}: {percent}%
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Raw Data */}
      <div className="border border-[#333] rounded p-4">
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
  );
}
