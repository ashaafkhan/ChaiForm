'use client';

import React from 'react';
import { Card } from '@chaiforms/ui/components/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@chaiforms/ui/components/tabs';

interface EmailPreviewProps {
  respondentSubject: string;
  respondentBody: string;
  creatorSubject: string;
  creatorBody: string;
  formTitle: string;
}

export const EmailPreview: React.FC<EmailPreviewProps> = ({
  respondentSubject,
  respondentBody,
  creatorSubject,
  creatorBody,
  formTitle,
}) => {
  return (
    <Card className="overflow-hidden">
      <Tabs defaultValue="respondent" className="w-full">
        <TabsList className="w-full border-b rounded-none bg-slate-100">
          <TabsTrigger value="respondent" className="flex-1">
            📧 Respondent Email
          </TabsTrigger>
          <TabsTrigger value="creator" className="flex-1">
            📬 Your Notification
          </TabsTrigger>
        </TabsList>

        <TabsContent value="respondent" className="p-0">
          <div className="bg-white">
            {/* Email Header */}
            <div className="bg-gradient-to-r from-green-400 to-green-600 text-white p-4">
              <p className="text-xs opacity-75">From: ChaiForms &lt;noreply@chaiforms.dev&gt;</p>
              <p className="text-sm font-medium mt-1">To: respondent@example.com</p>
              <p className="text-sm font-semibold mt-3">{respondentSubject}</p>
            </div>

            {/* Email Body */}
            <div className="p-6 bg-slate-50 min-h-96">
              <div className="bg-white p-6 rounded-lg border border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-4">{formTitle}</h2>
                <div className="prose prose-sm max-w-none">
                  {respondentBody.split('\n').map((line, idx) => (
                    <p key={idx} className="text-slate-700 mb-3">
                      {line}
                    </p>
                  ))}
                </div>

                <div className="mt-6">
                  <a
                    href="#"
                    className="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg transition"
                  >
                    View Form
                  </a>
                </div>
              </div>

              <div className="mt-4 text-xs text-slate-500 text-center">
                <p>© 2026 ChaiForms. All rights reserved.</p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="creator" className="p-0">
          <div className="bg-white">
            {/* Email Header */}
            <div className="bg-gradient-to-r from-amber-400 to-amber-600 text-white p-4">
              <p className="text-xs opacity-75">From: ChaiForms &lt;noreply@chaiforms.dev&gt;</p>
              <p className="text-sm font-medium mt-1">To: creator@example.com</p>
              <p className="text-sm font-semibold mt-3">{creatorSubject}</p>
            </div>

            {/* Email Body */}
            <div className="p-6 bg-slate-50 min-h-96">
              <div className="bg-white p-6 rounded-lg border border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-4">{formTitle}</h2>
                <div className="prose prose-sm max-w-none">
                  {creatorBody.split('\n').map((line, idx) => (
                    <p key={idx} className="text-slate-700 mb-3">
                      {line}
                    </p>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-slate-100 rounded-lg">
                  <div className="inline-block text-center">
                    <div className="text-2xl font-bold text-amber-600">1</div>
                    <div className="text-xs text-slate-600 mt-1">Total Responses</div>
                  </div>
                </div>

                <div className="mt-6">
                  <a
                    href="#"
                    className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-6 rounded-lg transition"
                  >
                    View Dashboard
                  </a>
                </div>
              </div>

              <div className="mt-4 text-xs text-slate-500 text-center">
                <p>© 2026 ChaiForms. All rights reserved.</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
