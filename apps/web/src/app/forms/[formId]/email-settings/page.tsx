'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@chaiforms/ui/components/button';
import { Card } from '@chaiforms/ui/components/card';
import { EmailSettingsForm } from '@/components/EmailSettingsForm';
import { EmailPreview } from '@/components/EmailPreview';
import { ChevronLeft, Mail } from 'lucide-react';

interface EmailSettings {
  notifyCreator: boolean;
  notifyRespondent: boolean;
  respondentEmailSubject: string;
  respondentEmailBody: string;
  creatorEmailSubject: string;
  creatorEmailBody: string;
  collectRespondentEmail: boolean;
}

export default function EmailSettingsPage() {
  const params = useParams();
  const formId = params.formId as string;

  const [settings, setSettings] = useState<EmailSettings>({
    notifyCreator: true,
    notifyRespondent: false,
    respondentEmailSubject: 'Thank you for your response',
    respondentEmailBody: 'Thank you for submitting the form!\n\nWe appreciate your time.',
    creatorEmailSubject: 'New form response received',
    creatorEmailBody: 'You have received a new response to your form.\n\nLog in to your dashboard to view the details.',
    collectRespondentEmail: false,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [formTitle, setFormTitle] = useState('My Form');

  // Load settings on mount
  React.useEffect(() => {
    const loadSettings = async () => {
      try {
        // TODO: Load email settings from tRPC
        // const emailSettings = await trpc.emails.getSettings.query({ formId });
        // setSettings(emailSettings);
        console.log('Loading email settings for form:', formId);
      } catch (error) {
        console.error('Failed to load email settings:', error);
      }
    };

    loadSettings();
  }, [formId]);

  const handleUpdateSettings = (updates: Partial<EmailSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // TODO: Save email settings to tRPC
      // await trpc.emails.updateSettings.mutate({
      //   formId,
      //   ...settings,
      // });
      console.log('Email settings saved:', settings);
    } catch (error) {
      console.error('Failed to save email settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTestEmail = async (type: 'respondent' | 'creator', email: string) => {
    setIsSending(true);
    try {
      // TODO: Send test email
      // await trpc.emails.sendTestEmail.mutate({
      //   formId,
      //   email,
      //   type,
      // });
      console.log(`Test ${type} email sent to ${email}`);
    } catch (error) {
      console.error('Failed to send test email:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href={`/forms/${formId}/edit`}>
                <Button variant="ghost" size="sm">
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back to Editor
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <Mail className="w-6 h-6" />
                  Email Notifications
                </h1>
              </div>
            </div>

            <Button
              onClick={handleSaveSettings}
              disabled={isSaving}
              size="sm"
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Panel */}
          <div className="lg:col-span-2">
            <EmailSettingsForm
              settings={settings}
              onUpdate={handleUpdateSettings}
              onSendTest={handleSendTestEmail}
              isSending={isSending}
            />
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Email Preview</h3>
              <EmailPreview
                respondentSubject={settings.respondentEmailSubject}
                respondentBody={settings.respondentEmailBody}
                creatorSubject={settings.creatorEmailSubject}
                creatorBody={settings.creatorEmailBody}
                formTitle={formTitle}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
