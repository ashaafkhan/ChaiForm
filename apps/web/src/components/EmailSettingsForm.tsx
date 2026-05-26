'use client';

import React from 'react';
import { Card } from '@chaiforms/ui/components/card';
import { Label } from '@chaiforms/ui/components/label';
import { Input } from '@chaiforms/ui/components/input';
import { Button } from '@chaiforms/ui/components/button';
import { Switch } from '@chaiforms/ui/components/switch';
import { Mail } from 'lucide-react';

export interface EmailSettings {
  notifyCreator: boolean;
  notifyRespondent: boolean;
  respondentEmailSubject: string;
  respondentEmailBody: string;
  creatorEmailSubject: string;
  creatorEmailBody: string;
  collectRespondentEmail: boolean;
}

interface EmailSettingsFormProps {
  settings: EmailSettings;
  onUpdate: (settings: Partial<EmailSettings>) => void;
  onSendTest: (type: 'respondent' | 'creator', email: string) => void;
  testEmailAddress?: string;
  isSending?: boolean;
}

export const EmailSettingsForm: React.FC<EmailSettingsFormProps> = ({
  settings,
  onUpdate,
  onSendTest,
  testEmailAddress = '',
  isSending = false,
}) => {
  const [testEmail, setTestEmail] = React.useState(testEmailAddress);

  return (
    <div className="space-y-6">
      {/* Respondent Notifications */}
      <Card className="p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-900">Respondent Notifications</h3>
          </div>
          <Switch
            checked={settings.notifyRespondent}
            onCheckedChange={(checked) => onUpdate({ notifyRespondent: checked })}
          />
        </div>

        {settings.notifyRespondent && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="respondent-subject" className="text-slate-700">
                Email Subject
              </Label>
              <Input
                id="respondent-subject"
                value={settings.respondentEmailSubject}
                onChange={(e) => onUpdate({ respondentEmailSubject: e.target.value })}
                placeholder="Thank you for your response"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="respondent-body" className="text-slate-700">
                Email Body
              </Label>
              <textarea
                id="respondent-body"
                value={settings.respondentEmailBody}
                onChange={(e) => onUpdate({ respondentEmailBody: e.target.value })}
                placeholder="Enter the message respondents will receive..."
                rows={5}
                className="w-full mt-1.5 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <p className="text-xs text-slate-500 mt-2">
                💡 Available tags: {'{form_title}'}, {'{respondent_email}'}, {'{submission_date}'}
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => {
                if (testEmail) onSendTest('respondent', testEmail);
              }}
              disabled={isSending || !testEmail}
              className="w-full"
            >
              Send Test Email
            </Button>
          </div>
        )}
      </Card>

      {/* Creator Notifications */}
      <Card className="p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-semibold text-slate-900">Your Notifications</h3>
          </div>
          <Switch
            checked={settings.notifyCreator}
            onCheckedChange={(checked) => onUpdate({ notifyCreator: checked })}
          />
        </div>

        {settings.notifyCreator && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="creator-subject" className="text-slate-700">
                Email Subject
              </Label>
              <Input
                id="creator-subject"
                value={settings.creatorEmailSubject}
                onChange={(e) => onUpdate({ creatorEmailSubject: e.target.value })}
                placeholder="New form response received"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="creator-body" className="text-slate-700">
                Email Body
              </Label>
              <textarea
                id="creator-body"
                value={settings.creatorEmailBody}
                onChange={(e) => onUpdate({ creatorEmailBody: e.target.value })}
                placeholder="Enter the message you will receive for each response..."
                rows={5}
                className="w-full mt-1.5 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <p className="text-xs text-slate-500 mt-2">
                💡 Available tags: {'{form_title}'}, {'{response_count}'}, {'{respondent_name}'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="test-email" className="text-slate-700">
                Test Email Address
              </Label>
              <div className="flex gap-2">
                <Input
                  id="test-email"
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="your@email.com"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    if (testEmail) onSendTest('creator', testEmail);
                  }}
                  disabled={isSending || !testEmail}
                >
                  Test
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Respondent Email Collection */}
      <Card className="p-4 bg-blue-50 border border-blue-200">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-blue-900 cursor-pointer">
            Collect respondent email address
          </label>
          <Switch
            checked={settings.collectRespondentEmail}
            onCheckedChange={(checked) => onUpdate({ collectRespondentEmail: checked })}
          />
        </div>
        <p className="text-xs text-blue-800 mt-2">
          Enable this to automatically add an email field to your form and allow respondent notifications.
        </p>
      </Card>

      {/* Info */}
      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
        <p className="text-xs text-slate-600">
          💌 <strong>Pro Tip:</strong> Email notifications are sent automatically when respondents submit your form.
          You can customize the subject and body for each recipient type.
        </p>
      </div>
    </div>
  );
};
