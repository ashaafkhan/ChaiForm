'use client';

import React from 'react';
import { Button, Card } from '@chaiforms/ui';
import { Github, Chrome } from 'lucide-react';

interface SocialLoginButtonsProps {
  onGoogleClick?: () => void;
  onGithubClick?: () => void;
  isLoading?: boolean;
}

export const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({
  onGoogleClick,
  onGithubClick,
  isLoading = false,
}) => {
  return (
    <div className="space-y-3">
      <Button
        onClick={onGoogleClick}
        disabled={isLoading}
        variant="outline"
        className="w-full"
      >
        <Chrome className="w-4 h-4 mr-2" />
        Sign in with Google
      </Button>

      <Button
        onClick={onGithubClick}
        disabled={isLoading}
        variant="outline"
        className="w-full"
      >
        <Github className="w-4 h-4 mr-2" />
        Sign in with GitHub
      </Button>
    </div>
  );
};

interface SocialAccountsProps {
  accounts: Array<{
    id: string;
    provider: 'google' | 'github';
    email: string;
    name?: string;
  }>;
  onUnlink?: (provider: 'google' | 'github') => Promise<void>;
  isUnlinking?: string | null;
}

export const SocialAccounts: React.FC<SocialAccountsProps> = ({
  accounts,
  onUnlink,
  isUnlinking,
}) => {
  const providers = ['google', 'github'] as const;

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Connected Accounts</h3>
      <div className="space-y-3">
        {providers.map((provider) => {
          const account = accounts.find((a) => a.provider === provider);
          return (
            <div
              key={provider}
              className="flex items-center justify-between p-4 border border-slate-200 rounded-lg"
            >
              <div className="flex items-center gap-3">
                {provider === 'google' ? (
                  <Chrome className="w-5 h-5 text-blue-600" />
                ) : (
                  <Github className="w-5 h-5 text-slate-900" />
                )}
                <div>
                  <p className="font-medium text-slate-900 capitalize">{provider}</p>
                  {account ? (
                    <p className="text-sm text-slate-600">{account.email}</p>
                  ) : (
                    <p className="text-sm text-slate-500">Not connected</p>
                  )}
                </div>
              </div>

              {account ? (
                <Button
                  onClick={() => onUnlink?.(provider)}
                  disabled={isUnlinking === provider}
                  variant="destructive"
                  size="sm"
                >
                  {isUnlinking === provider ? 'Unlinking...' : 'Unlink'}
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  Connect
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
