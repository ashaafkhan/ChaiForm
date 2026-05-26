'use client';

import React, { useState } from 'react';
import { Button, Card, Input, Label } from '@chaiforms/ui';
import { AlertCircle, CheckCircle, Shield } from 'lucide-react';

interface TwoFactorSetupProps {
  onSetupStart?: () => Promise<{ secret: string; qrCode: string }>;
  onSetupVerify?: (secret: string, code: string) => Promise<void>;
  onCancel?: () => void;
}

export const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({
  onSetupStart,
  onSetupVerify,
  onCancel,
}) => {
  const [step, setStep] = useState<'start' | 'scan' | 'verify' | 'success'>('start');
  const [secret, setSecret] = useState<string>('');
  const [qrCode, setQrCode] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleStart = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await onSetupStart?.();
      if (data) {
        setSecret(data.secret);
        setQrCode(data.qrCode);
        setStep('scan');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start setup');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    setError('');
    try {
      if (!code || code.length !== 6) {
        setError('Please enter a valid 6-digit code');
        return;
      }
      await onSetupVerify?.(secret, code);
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto p-6">
      {step === 'start' && (
        <div className="space-y-4">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-slate-900">Enable Two-Factor Authentication</h2>
            <p className="text-sm text-slate-600 mt-2">
              Add an extra layer of security to your ChaiForms account
            </p>
          </div>
          <Button onClick={handleStart} disabled={loading} className="w-full">
            {loading ? 'Setting up...' : 'Get Started'}
          </Button>
          {onCancel && (
            <Button onClick={onCancel} variant="ghost" className="w-full">
              Cancel
            </Button>
          )}
        </div>
      )}

      {step === 'scan' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Step 1: Scan QR Code</h2>
          <p className="text-sm text-slate-600">
            Open your authenticator app (Google Authenticator, Authy, Microsoft Authenticator, etc.) and scan this QR code:
          </p>

          {qrCode && (
            <div className="flex justify-center p-4 bg-slate-100 rounded-lg">
              <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
            </div>
          )}

          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-xs text-slate-600 mb-2">Or enter this key manually:</p>
            <p className="font-mono text-sm text-slate-900 break-all">{secret}</p>
          </div>

          <Button
            onClick={() => setStep('verify')}
            className="w-full"
          >
            Next: Verify Code
          </Button>
        </div>
      )}

      {step === 'verify' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Step 2: Verify Code</h2>
          <p className="text-sm text-slate-600">
            Enter the 6-digit code from your authenticator app:
          </p>

          <div>
            <Label>6-Digit Code</Label>
            <Input
              type="text"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCode(e.target.value.replace(/\D/g, ''))}
              className="font-mono text-center text-2xl tracking-widest mt-1"
            />
          </div>

          {error && (
            <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <Button
            onClick={handleVerify}
            disabled={loading || code.length !== 6}
            className="w-full"
          >
            {loading ? 'Verifying...' : 'Verify & Enable'}
          </Button>

          <Button
            onClick={() => setStep('scan')}
            variant="ghost"
            className="w-full"
          >
            Back
          </Button>
        </div>
      )}

      {step === 'success' && (
        <div className="space-y-4 text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">All Set!</h2>
          <p className="text-sm text-slate-600">
            Two-factor authentication has been enabled on your account. You'll be asked for a code when logging in.
          </p>
          <Button onClick={onCancel} className="w-full">
            Done
          </Button>
        </div>
      )}
    </Card>
  );
};
