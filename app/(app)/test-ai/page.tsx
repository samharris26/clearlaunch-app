"use client";

import { useState } from "react";

export default function TestAIPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testAI = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/test-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("AI test result:", data);
      setResult(data);
    } catch (err) {
      console.error("Test AI error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test AI Generation</h1>
      
      <button
        onClick={testAI}
        disabled={loading}
        className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50"
      >
        {loading ? "Testing..." : "Test AI Generation"}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <h3 className="font-bold">Error:</h3>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          <h3 className="font-bold">Success! Generated {result.length} tasks:</h3>
          <pre className="mt-2 text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h3 className="font-bold">Instructions:</h3>
        <p>1. Click "Test AI Generation" to test the OpenAI integration</p>
        <p>2. Check the browser console and server logs for detailed output</p>
        <p>3. If successful, you should see generated tasks above</p>
      </div>
    </div>
  );
}
