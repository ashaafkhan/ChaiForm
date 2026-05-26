'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CreateFormPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Form title is required');
      return;
    }

    setLoading(true);

    try {
      // Call tRPC create form endpoint
      const response = await fetch('/api/forms/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ title, description }),
      });

      if (!response.ok) {
        throw new Error('Failed to create form');
      }

      const data = await response.json();
      router.push(`/forms/${data.form.id}/edit`);
    } catch (err) {
      setError('Failed to create form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link
          href="/dashboard"
          className="inline-block mb-6 text-blue-600 hover:text-blue-700 font-semibold"
        >
          ← Back to Dashboard
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create a New Form</h1>
          <p className="text-gray-600 mb-6">Get started by giving your form a title</p>

          <form onSubmit={handleCreate} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-900 mb-2">
                Form Title *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Customer Feedback Survey"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-sm text-gray-600 mt-1">Give your form a descriptive title</p>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description (optional)"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="text-sm text-gray-600 mt-1">Help respondents understand the purpose of this form</p>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Form'}
              </button>
              <Link
                href="/dashboard"
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition text-center"
              >
                Cancel
              </Link>
            </div>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Form Types</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="font-medium text-gray-900">📋 Survey</p>
                <p className="text-sm text-gray-600 mt-1">Collect feedback and opinions</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="font-medium text-gray-900">✍️ Registration</p>
                <p className="text-sm text-gray-600 mt-1">Sign up forms and registrations</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="font-medium text-gray-900">📬 Newsletter</p>
                <p className="text-sm text-gray-600 mt-1">Email subscription forms</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="font-medium text-gray-900">❓ Quiz</p>
                <p className="text-sm text-gray-600 mt-1">Create engaging quizzes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
