'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function ResponsesPage() {
  const params = useParams();
  const formId = params.formId as string;
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleExportCsv = () => {
    // Call API to export responses as CSV
    alert('Exporting responses as CSV...');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Form Responses</h1>
          <p className="text-sm text-gray-600 mt-1">{responses.length} responses received</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCsv}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            📥 Export CSV
          </button>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Responses Table */}
      <div className="max-w-6xl mx-auto p-8">
        {responses.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-600 mb-4">No responses yet</p>
            <p className="text-sm text-gray-500">
              Responses will appear here once users submit your form
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">
                    Submitted At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">
                    Respondent Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">
                    Answers
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {responses.map((response) => (
                  <tr key={response.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm text-gray-900">
                      {new Date(response.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-900">
                      {response.respondentEmail || 'Anonymous'}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      <button className="text-blue-600 hover:text-blue-700">View Details</button>
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <button className="text-red-600 hover:text-red-700">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
