import React, { useState, useEffect } from 'react';
import { runAllRulesTests, TestResult, UNIT_TEST_CASES } from '../engine/rules.test';
import { Language } from '../types';
import {
  Cpu,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  CheckCheck,
  Filter,
  Clock,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface UnitTestsPanelProps {
  language: Language;
}

export const UnitTestsPanel: React.FC<UnitTestsPanelProps> = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [filter, setFilter] = useState<'all' | 'passed' | 'failed'>('all');

  const handleRunTests = async () => {
    setIsRunning(true);
    try {
      const testResults = await runAllRulesTests();
      setResults(testResults);
    } catch (err) {
      console.error('Failed to run test suite:', err);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    // Run test suite automatically on mount to verify engine integrity
    handleRunTests();
  }, []);

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;
  const totalDuration = results.reduce((acc, r) => acc + r.durationMs, 0);

  const displayedResults = results.filter((r) => {
    if (filter === 'passed') return r.passed;
    if (filter === 'failed') return !r.passed;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                <Cpu className="w-5 h-5" />
              </span>
              <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold">
                Verification & Regression Testing
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Rules Engine Unit Test Suite (27 Test Cases)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Every defensive rule signal, PII redaction routine, Web Crypto signature verification, and boundary condition is verified against structured synthetic test assertions.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRunTests}
              disabled={isRunning}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isRunning ? <Clock className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              <span>{isRunning ? 'Executing Tests...' : 'Re-Run All 27 Tests'}</span>
            </button>
          </div>
        </div>

        {/* Statistics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800 text-center">
          <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700">
            <span className="block text-xl font-black text-white">{UNIT_TEST_CASES.length}</span>
            <span className="text-[11px] text-slate-400 font-medium">Total Test Cases</span>
          </div>
          <div className="bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-800/80">
            <span className="block text-xl font-black text-emerald-400">{passedCount}</span>
            <span className="text-[11px] text-emerald-300 font-medium">Passed Assertions</span>
          </div>
          <div className="bg-rose-950/60 p-2.5 rounded-xl border border-rose-800/80">
            <span className="block text-xl font-black text-rose-400">{failedCount}</span>
            <span className="text-[11px] text-rose-300 font-medium">Failed Assertions</span>
          </div>
          <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700">
            <span className="block text-xl font-black text-slate-300 font-mono">
              {totalDuration.toFixed(1)} ms
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Execution Latency</span>
          </div>
        </div>
      </div>

      {/* Honesty Disclosure Banner */}
      <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 text-xs text-amber-950 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Benchmarking Disclosure:</span> The metrics shown below are computed in real-time by the test suite on synthetic test data, not real-world deployment performance.
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer ${
              filter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Tests ({results.length})
          </button>
          <button
            onClick={() => setFilter('passed')}
            className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer ${
              filter === 'passed' ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Passed ({passedCount})
          </button>
          <button
            onClick={() => setFilter('failed')}
            className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer ${
              filter === 'failed' ? 'bg-rose-700 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Failed ({failedCount})
          </button>
        </div>
      </div>

      {/* Test Results Table / Cards */}
      <div className="space-y-2.5">
        {displayedResults.map((res) => (
          <div
            key={res.id}
            className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              res.passed
                ? 'bg-white border-slate-200 hover:border-emerald-300'
                : 'bg-rose-50 border-rose-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                {res.passed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-500">
                    {res.id}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900">
                    {res.name}
                  </span>
                </div>
                {res.details && (
                  <p className="text-xs text-slate-600 mt-0.5">{res.details}</p>
                )}
                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px]">
                  <span className="text-slate-500">Expected:</span>
                  <span className="font-mono bg-slate-100 px-1.5 py-0.2 rounded text-slate-700">
                    {res.expected}
                  </span>
                  <span className="text-slate-400">→</span>
                  <span className="text-slate-500">Actual:</span>
                  <span className={`font-mono px-1.5 py-0.2 rounded font-semibold ${
                    res.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {res.actual}
                  </span>
                </div>
              </div>
            </div>

            <div className="shrink-0 text-right self-end sm:self-center font-mono text-[11px] text-slate-400">
              {res.durationMs.toFixed(2)} ms
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
