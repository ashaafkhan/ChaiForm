'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button, Card } from '@chaiforms/ui';
import { SocialAccounts } from '@/components/SocialLogin';
import { TwoFactorSetup } from '@/components/TwoFactorSetup';
import { ChevronLeft, Shield, Smartphone, Lock } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface SecuritySettingsState {
  twoFactorEnabled: boolean;
  socialAccounts: Array<{
    id: string;
    provider: 'google' | 'github';
    email: string;
    name?: string;
  }>;
  isLoading: boolean;
  showTwoFactorSetup: boolean;
  showTwoFactorSetupModal: boolean;
}

export default function SecuritySettingsPage() {
  const [state, setState] = useState<SecuritySettingsState>({
    twoFactorEnabled: false,
    socialAccounts: [],
    isLoading: true,
    showTwoFactorSetup: false,
    showTwoFactorSetupModal: false,
  });

  const { data: twoFactorStatus, isLoading: isTwoFactorLoading, refetch: refetch2FA } = trpc.twoFactor.getStatus.useQuery(undefined);
  const { data: socialAccounts, isLoading: isSocialLoading, refetch: refetchSocial } = trpc.oauth.getSocialAccounts.useQuery(undefined);

  const setup2FAMutation = trpc.twoFactor.setup.useMutation();
  const verify2FAMutation = trpc.twoFactor.verify.useMutation({
    onSuccess: () => {
      refetch2FA();
      setState(prev => ({ ...prev, twoFactorEnabled: true, showTwoFactorSetupModal: false }));
    }
  });
  const disable2FAMutation = trpc.twoFactor.disable.useMutation({
    onSuccess: () => {
      refetch2FA();
      setState(prev => ({ ...prev, twoFactorEnabled: false }));
    }
  });
  const unlinkSocialMutation = trpc.oauth.unlinkSocialAccount.useMutation({
    onSuccess: () => {
      refetchSocial();
    }
  });

  useEffect(() => {
    const isL = isTwoFactorLoading || isSocialLoading;
    setState(prev => ({
      ...prev,
      twoFactorEnabled: twoFactorStatus?.enabled ?? false,
      socialAccounts: (socialAccounts || []) as any,
      isLoading: isL,
    }));
  }, [twoFactorStatus, socialAccounts, isTwoFactorLoading, isSocialLoading]);

  const handleTwoFactorSetup = async () => {
    const res = await setup2FAMutation.mutateAsync();
    return { secret: res.secret, qrCode: res.qrCode };
  };

  const handleTwoFactorVerify = async (secret: string, code: string) => {
    await verify2FAMutation.mutateAsync({ secret, code });
  };

  const handleDisableTwoFactor = async () => {
    await disable2FAMutation.mutateAsync();
  };

  const handleUnlinkSocial = async (provider: 'google' | 'github') => {
    await unlinkSocialMutation.mutateAsync({ provider });
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-6 h-6" />
              Security Settings
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        {state.isLoading ? (
          <div className="flex items-center justify-center h-96">
            <p className="text-slate-600">Loading security settings...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Two-Factor Authentication */}
            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Smartphone className="w-5 h-5 text-blue-600" />
                    <h2 className="text-lg font-semibold text-slate-900">Two-Factor Authentication</h2>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">
                    Add an extra layer of security to your account using your phone or authenticator app.
                  </p>

                  {state.twoFactorEnabled ? (
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      ✓ Enabled
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                      ✗ Disabled
                    </div>
                  )}
                </div>

                {state.twoFactorEnabled ? (
                  <Button
                    onClick={handleDisableTwoFactor}
                    variant="destructive"
                    size="sm"
                  >
                    <Lock className="w-4 h-4 mr-1" />
                    Disable
                  </Button>
                ) : (
                  <Button
                    onClick={() => setState(prev => ({ ...prev, showTwoFactorSetupModal: true }))}
                    size="sm"
                  >
                    <Smartphone className="w-4 h-4 mr-1" />
                    Enable
                  </Button>
                )}
              </div>

              {state.showTwoFactorSetupModal && (
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <TwoFactorSetup
                    onSetupStart={handleTwoFactorSetup}
                    onSetupVerify={handleTwoFactorVerify}
                    onCancel={() => setState(prev => ({ ...prev, showTwoFactorSetupModal: false }))}
                  />
                </div>
              )}
            </Card>

            {/* Social Login */}
            <Card className="p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-2">Connected Accounts</h2>
                <p className="text-sm text-slate-600">
                  Sign in faster by connecting your social media accounts.
                </p>
              </div>

              <SocialAccounts
                accounts={state.socialAccounts}
                onUnlink={handleUnlinkSocial}
              />
            </Card>

            {/* Password & Sessions */}
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-2">Password</h2>
                  <p className="text-sm text-slate-600 mb-4">
                    Keep your account secure with a strong password.
                  </p>
                  <Link href="/settings/change-password">
                    <Button variant="outline" size="sm">
                      <Lock className="w-4 h-4 mr-1" />
                      Change Password
                    </Button>
                  </Link>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <h3 className="text-base font-semibold text-slate-900 mb-2">Active Sessions</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Manage your active sessions across devices.
                  </p>
                  <Button variant="outline" size="sm" disabled>
                    View Sessions
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
