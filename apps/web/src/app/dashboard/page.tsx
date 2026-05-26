'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';

export default function DashboardPage() {
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would use tRPC query
    setLoading(false);
  }, []);

  const handleNewForm = () => {
    // Navigate to create form
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Forms Dashboard</h1>
            <p className="text-gray-600 mt-2">Create and manage your forms</p>
          </div>
          <Link
            href="/forms/create"
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            + New Form
          </Link>
        </div>

        {forms.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-600 mb-4">No forms yet</p>
            <Link
              href="/forms/create"
              className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              Create Your First Form
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {forms.map((form) => (
              <div
                key={form.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{form.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">{form.description}</p>
                    <div className="flex gap-4 mt-4">
                      <span className="text-sm text-gray-500">
                        {form.responseCount} responses
                      </span>
                      <span className={`text-sm font-medium px-2 py-1 rounded ${
                        form.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {form.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/forms/${form.id}/edit`}
                      className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/forms/${form.id}/responses`}
                      className="px-4 py-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition"
                    >
                      Responses
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
