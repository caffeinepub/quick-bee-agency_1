import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useQueries';
import { Loader2, LogIn, User, Mail, Building2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, clear, loginStatus, identity, isInitializing } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileBusiness, setProfileBusiness] = useState('');
  const [profileError, setProfileError] = useState('');

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();

  const saveProfile = useSaveCallerUserProfile();

  useEffect(() => {
    if (!isAuthenticated || profileLoading || !profileFetched) return;
    if (userProfile === null) {
      setShowProfileSetup(true);
    } else {
      navigate({ to: '/authenticated' });
    }
  }, [isAuthenticated, profileLoading, profileFetched, userProfile, navigate]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: unknown) {
      const err = error as Error;
      if (err?.message === 'User is already authenticated') {
        await clear();
        setTimeout(() => login(), 300);
      }
    }
  };

  const handleProfileSave = async () => {
    if (!profileName.trim()) {
      setProfileError('Name is required');
      return;
    }
    if (!profileEmail.trim()) {
      setProfileError('Email is required');
      return;
    }
    setProfileError('');
    try {
      await saveProfile.mutateAsync({
        name: profileName.trim(),
        email: profileEmail.trim(),
        businessName: profileBusiness.trim() ? profileBusiness.trim() : undefined,
      });
      setShowProfileSetup(false);
      navigate({ to: '/authenticated' });
    } catch {
      setProfileError('Failed to save profile. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 mesh-bg">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl overflow-hidden mb-4 shadow-cyan logo-glow-lg">
            <img
              src="/assets/generated/quickbee-logo.dim_256x256.png"
              alt="QuickBee"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-3xl font-heading font-bold text-foreground">QuickBee CRM</h1>
          <p className="text-muted-foreground mt-1 text-sm">Your intelligent sales automation platform</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-card-lg border-border/60">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-heading">Welcome back</CardTitle>
            <CardDescription>Sign in with your Internet Identity to continue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Feature highlights */}
            <div className="grid grid-cols-3 gap-3 py-2">
              {[
                { icon: <Zap size={16} />, label: 'Smart CRM' },
                { icon: <User size={16} />, label: 'Lead Mgmt' },
                { icon: <Building2 size={16} />, label: 'Analytics' },
              ].map((feature) => (
                <div key={feature.label} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted/50 border border-border/50">
                  <span className="text-primary">{feature.icon}</span>
                  <span className="text-xs text-muted-foreground font-medium">{feature.label}</span>
                </div>
              ))}
            </div>

            <Button
              onClick={handleLogin}
              disabled={isLoggingIn || isInitializing}
              className="w-full h-11 font-semibold text-sm"
              size="lg"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <LogIn size={16} className="mr-2" />
                  Sign in with Internet Identity
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Secured by the Internet Computer Protocol.{' '}
              <span className="text-primary font-medium">No passwords required.</span>
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          © {new Date().getFullYear()} QuickBee CRM. Built with{' '}
          <span className="text-destructive">♥</span> using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            caffeine.ai
          </a>
        </p>
      </div>

      {/* Profile Setup Dialog */}
      <Dialog open={showProfileSetup} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="font-heading">Complete Your Profile</DialogTitle>
            <DialogDescription>
              Tell us a bit about yourself to get started with QuickBee CRM.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="business">Business Name</Label>
              <Input
                id="business"
                placeholder="Acme Corp (optional)"
                value={profileBusiness}
                onChange={(e) => setProfileBusiness(e.target.value)}
              />
            </div>
            {profileError && (
              <p className="text-sm text-destructive">{profileError}</p>
            )}
            <Button
              onClick={handleProfileSave}
              disabled={saveProfile.isPending}
              className="w-full"
            >
              {saveProfile.isPending ? (
                <>
                  <Loader2 size={14} className="mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Get Started'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
