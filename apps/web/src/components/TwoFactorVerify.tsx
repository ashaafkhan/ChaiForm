'use client';

import React, { useState } from 'react';
import { Button } from '@chaiforms/ui/components/button';
import { Card } from '@chaiforms/ui/components/card';
import { Input } from '@chaiforms/ui/components/input';
import { Label } from '@chaiforms/ui/components/label';
import { AlertCircle, Shield } from 'lucide-react';

interface TwoFactorVerifyProps {
  userEmail: string;
  tempToken: string;
  onVerify: (code: string, tempToken: string) => Promise<{ token: string }>;
  onBack?: () => void;
}

export const TwoFactorVerify: React.FC<TwoFactorVerifyProps> = ({
  userEmail,
  tempToken,
  onVerify,
  onBack,
}) => {
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleVerify = async () => {
    setLoading(true);
    setError('');

    try {
      if (!code || code.length !== 6) {
        setError('Please enter a valid 6-digit code');
        setLoading(false);
        return;
      }

      await onVerify(code, tempToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code. Please try again.');
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && code.length === 6) {
      handleVerify();
    }
  };

  return (
    <Card className="max-w-md mx-auto p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto">
          <Shield className="w-6 h-6 text-blue-600" />
        </div>

        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900">Two-Factor Authentication</h2>
          <p className="text-sm text-slate-600 mt-1">{userEmail}</p>
        </div>

        <p className="text-sm text-slate-600 text-center">
          Enter the 6-digit code from your authenticator app:
        </p>

        <div>
          <Label>Authentication Code</Label>
          <Input
            type="text"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            onKeyPress={handleKeyPress}
            className="font-mono text-center text-3xl tracking-widest mt-1 py-6"
            disabled={loading}
            autoFocus
          />
        </div>

        {error && (
          <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <Button
          onClick={handleVerify}
          disabled={loading || code.length !== 6}
          className="w-full"
        >
          {loading ? 'Verifying...' : 'Verify'}
        </Button>

        {onBack && (
          <Button onClick={onBack} variant="ghost" className="w-full">
            Back to Login
          </Button>
        )}
      </div>
    </Card>
  );
};
