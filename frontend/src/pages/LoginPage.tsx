import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCallerUserProfile, useSaveCallerUserProfile, useGetCallerUserRole } from '../hooks/useQueries';
import { Loader2, Zap, Users, BarChart3, Shield, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserRole } from '../backend';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, clear, loginStatus, identity, isInitializing } = useInternetIdentity();
  const queryClient = useQueryClient();

  const [loginError, setLoginError] = useState<string | null>(null);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileBusiness, setProfileBusiness] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const saveProfile = useSaveCallerUserProfile();

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();

  const {
    data: userRole,
    isFetched: roleFetched,
  } = useGetCallerUserRole();

  // Track whether we've already triggered a redirect to avoid double-redirects
  const hasRedirected = useRef(false);

  const getRedirectPath = (role: UserRole | undefined): string => {
    if (role === UserRole.admin) return '/authenticated/admin-dashboard';
    if (role === UserRole.user) return '/authenticated/manager-dashboard';
    // fallback
    return '/authenticated/admin-dashboard';
  };

  const redirectUser = (role?: UserRole) => {
    if (hasRedirected.current) return;
    hasRedirected.current = true;
    setRedirecting(true);
    const path = getRedirectPath(role);
    navigate({ to: path as any, replace: true });
  };

  // After login: once profile is fetched, redirect or show profile setup
  useEffect(() => {
    if (!isAuthenticated) {
      hasRedirected.current = false;
      setRedirecting(false);
      return;
    }

    // Profile query hasn't resolved yet — wait
    if (profileLoading || !profileFetched) return;

    if (hasRedirected.current) return;

    if (userProfile === null) {
      // First-time user — show profile setup
      setShowProfileSetup(true);
    } else {
      // Existing user — redirect based on role
      // If role is fetched, use it; otherwise redirect to default
      redirectUser(roleFetched ? userRole : undefined);
    }
  }, [isAuthenticated, profileLoading, profileFetched, userProfile, userRole, roleFetched]);

  const handleLogin = () => {
    setLoginError(null);
    hasRedirected.current = false;

    // login() is synchronous — it opens the II popup with callbacks
    // It may throw synchronously if already authenticated
    try {
      login();
    } catch (error: any) {
      if (error?.message === 'User is already authenticated') {
        // Clear existing session and retry
        try {
          clear();
          queryClient.clear();
        } catch (_) {
          // ignore clear errors
        }
        setTimeout(() => {
          try {
            login();
          } catch (_) {
            // ignore
          }
        }, 400);
      } else if (
        error?.message &&
        !error.message.includes('UserInterrupt') &&
        !error.message.includes('closed') &&
        !error.message.includes('cancelled')
      ) {
        setLoginError('Login failed. Please try again.');
      }
    }
  };

  const handleSaveProfile = async () => {
    if (!profileName.trim() || !profileEmail.trim()) return;
    setSavingProfile(true);
    try {
      await saveProfile.mutateAsync({
        name: profileName.trim(),
        email: profileEmail.trim(),
        businessName: profileBusiness.trim() ? profileBusiness.trim() : undefined,
      });
      setShowProfileSetup(false);
      redirectUser(roleFetched ? userRole : undefined);
    } catch (e) {
      console.error('Failed to save profile', e);
    } finally {
      setSavingProfile(false);
    }
  };

  const features = [
    { icon: <Users className="w-5 h-5" />, title: 'Lead Management', desc: 'Track and convert leads efficiently' },
    { icon: <BarChart3 className="w-5 h-5" />, title: 'Analytics', desc: 'Real-time business insights' },
    { icon: <Zap className="w-5 h-5" />, title: 'AI Automation', desc: 'Smart sales automation tools' },
    { icon: <Shield className="w-5 h-5" />, title: 'Secure & Private', desc: 'Blockchain-powered security' },
  ];

  // Button is only disabled while the II popup is open or we're redirecting
  const buttonDisabled = isLoggingIn || redirecting;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-accent flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full bg-white blur-2xl" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <img
              src="/assets/generated/quickbee-logo.dim_256x256.png"
              alt="QuickBee"
              className="w-12 h-12 rounded-xl"
            />
            <div>
              <h1 className="text-2xl font-bold text-white">QuickBee</h1>
              <p className="text-white/70 text-sm">Business Growth Platform</p>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Grow Your Business<br />
            <span className="text-yellow-300">10x Faster</span>
          </h2>
          <p className="text-white/80 text-lg mb-10">
            The complete CRM and sales automation platform for modern businesses.
          </p>
          <div className="grid grid-cols-1 gap-4">
            {features.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-4 bg-white/10 rounded-xl p-4 backdrop-blur-sm"
              >
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-white">
                  {f.icon}
                </div>
                <div>
                  <p className="text-white font-semibold">{f.title}</p>
                  <p className="text-white/70 text-sm">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-2 text-white/60 text-sm">
          <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
          <span>Trusted by 500+ businesses across India</span>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
            <img
              src="/assets/generated/quickbee-logo.dim_256x256.png"
              alt="QuickBee"
              className="w-10 h-10 rounded-xl"
            />
            <h1 className="text-2xl font-bold text-foreground">QuickBee</h1>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h2>
            <p className="text-muted-foreground">Sign in to access your dashboard</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
            {loginError && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                {loginError}
              </div>
            )}

            {redirecting ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Redirecting to your dashboard...</p>
              </div>
            ) : (
              <Button
                onClick={handleLogin}
                disabled={buttonDisabled}
                className="w-full h-12 text-base font-semibold"
                size="lg"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5 mr-2" />
                    Sign In with Internet Identity
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}

            <div className="mt-6 p-4 bg-muted/50 rounded-xl">
              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                🔐 Secured by Internet Identity — a blockchain-based authentication system.
                No passwords required. Your data stays private and secure.
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            © {new Date().getFullYear()} QuickBee CRM. Built with ♥ using{' '}
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
      </div>

      {/* Profile Setup Dialog */}
      <Dialog open={showProfileSetup} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Complete Your Profile</DialogTitle>
            <DialogDescription>
              Welcome! Please set up your profile to get started.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="business">Business Name (Optional)</Label>
              <Input
                id="business"
                placeholder="Enter your business name"
                value={profileBusiness}
                onChange={(e) => setProfileBusiness(e.target.value)}
              />
            </div>
          </div>
          <Button
            onClick={handleSaveProfile}
            disabled={!profileName.trim() || !profileEmail.trim() || savingProfile}
            className="w-full"
          >
            {savingProfile ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Get Started'
            )}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
