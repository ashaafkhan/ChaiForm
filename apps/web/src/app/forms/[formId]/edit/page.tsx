'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function FormEditorPage() {
  const params = useParams();
  const formId = params.formId as string;
  const [fields, setFields] = useState<any[]>([]);
  const [formTitle, setFormTitle] = useState('Untitled Form');
  const [published, setPublished] = useState(false);

  const handleAddField = () => {
    const newField = {
      id: `field-${Date.now()}`,
      type: 'short_text',
      label: 'New Field',
      order: fields.length + 1,
    };
    setFields([...fields, newField]);
  };

  const handleDeleteField = (fieldId: string) => {
    setFields(fields.filter(f => f.id !== fieldId));
  };

  const handlePublish = () => {
    setPublished(!published);
    // Call API to publish form
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
        <div className="flex-1">
          <input
            type="text"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            className="text-2xl font-bold bg-transparent border-b-2 border-transparent hover:border-gray-300 focus:border-blue-500 outline-none"
          />
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            Cancel
          </Link>
          <button
            onClick={handlePublish}
            className={`px-4 py-2 font-semibold rounded-lg transition ${
              published
                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {published ? 'Unpublish' : 'Publish'}
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Form Fields */}
          {fields.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No fields yet</p>
              <button
                onClick={handleAddField}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                + Add Field
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {fields.map((field) => (
                <div
                  key={field.id}
                  className="p-4 border border-gray-200 rounded-lg bg-gray-50 hover:shadow transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{field.label}</p>
                      <p className="text-sm text-gray-600">{field.type}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteField(field.id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={handleAddField}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 transition"
              >
                + Add Field
              </button>
            </div>
          )}
        </div>

        {/* Preview Link */}
        {published && (
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Form Published!</strong> Share this link:{' '}
              <a
                href={`/forms/${formId}`}
                className="text-blue-600 underline"
                target="_blank"
              >
                {`${window.location.origin}/forms/${formId}`}
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
