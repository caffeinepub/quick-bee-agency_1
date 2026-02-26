import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useQueries';
import { Loader2, Zap, Shield, TrendingUp, Users, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { DEMO_CREDENTIALS, validateDemoCredentials } from '../auth/demoCredentials';
import { useSession } from '../auth/useSession';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, clear, loginStatus, identity, isInitializing } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { saveSession } = useSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileBusiness, setProfileBusiness] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const isAuthenticated = !!identity;
  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();

  useEffect(() => {
    if (isAuthenticated && !profileLoading && profileFetched) {
      if (userProfile === null) {
        setShowProfileSetup(true);
      } else {
        navigate({ to: '/' });
      }
    }
  }, [isAuthenticated, profileLoading, profileFetched, userProfile, navigate]);

  const handleDemoLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    const role = validateDemoCredentials(email, password);
    if (!role) {
      setLoginError('Invalid email or password. Please check your credentials.');
      setIsLoggingIn(false);
      return;
    }

    try {
      await login();
      saveSession(email, role);
    } catch (err: unknown) {
      const error = err as Error;
      if (error.message === 'User is already authenticated') {
        await clear();
        queryClient.clear();
        setTimeout(() => login(), 300);
      } else {
        setLoginError('Login failed. Please try again.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleIILogin = async () => {
    setLoginError('');
    try {
      await login();
    } catch (err: unknown) {
      const error = err as Error;
      if (error.message === 'User is already authenticated') {
        await clear();
        queryClient.clear();
        setTimeout(() => login(), 300);
      } else {
        setLoginError('Login failed. Please try again.');
      }
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim() || !profileEmail.trim()) return;
    setIsSavingProfile(true);
    try {
      await saveProfile.mutateAsync({
        name: profileName.trim(),
        email: profileEmail.trim(),
        businessName: profileBusiness.trim() || undefined,
      });
      setShowProfileSetup(false);
      navigate({ to: '/' });
    } catch {
      // ignore
    } finally {
      setIsSavingProfile(false);
    }
  };

  const features = [
    { icon: Zap, label: 'AI-Powered Tools', desc: 'Smart recommendations & proposals' },
    { icon: TrendingUp, label: 'Revenue Growth', desc: 'Dynamic pricing & upsell engine' },
    { icon: Users, label: 'Lead Management', desc: 'Qualify & convert leads faster' },
    { icon: Shield, label: 'Secure Platform', desc: 'Enterprise-grade security' },
  ];

  // Demo credentials as array for display
  const demoCreds = Object.values(DEMO_CREDENTIALS);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center animate-pulse-glow">
            <Zap className="w-6 h-6 text-dark-500" />
          </div>
          <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
          <p className="text-muted-foreground text-sm">Initializing...</p>
        </div>
      </div>
    );
  }

  if (showProfileSetup) {
    return (
      <div className="min-h-screen bg-background bg-mesh flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="glass-card rounded-2xl p-8 border border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center">
                <Zap className="w-5 h-5 text-dark-500" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-foreground">Complete Your Profile</h2>
                <p className="text-sm text-muted-foreground">Tell us about yourself</p>
              </div>
            </div>
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Full Name *</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={e => setProfileName(e.target.value)}
                  placeholder="Your full name"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/40 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Email *</label>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={e => setProfileEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/40 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Business Name</label>
                <input
                  type="text"
                  value={profileBusiness}
                  onChange={e => setProfileBusiness(e.target.value)}
                  placeholder="Your company name (optional)"
                  className="w-full px-4 py-2.5 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/40 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={isSavingProfile || !profileName.trim() || !profileEmail.trim()}
                className="w-full py-3 rounded-xl gradient-brand text-dark-500 font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Get Started
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 bg-mesh" />
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 30% 40%, rgba(0, 191, 166, 0.12) 0%, transparent 60%), radial-gradient(ellipse at 70% 70%, rgba(0, 230, 118, 0.08) 0%, transparent 60%)'
        }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center glow-brand-sm">
            <Zap className="w-5 h-5 text-dark-500" />
          </div>
          <div>
            <span className="text-xl font-display font-bold gradient-text-brand">Quick Bee</span>
            <span className="text-xl font-display font-bold text-foreground"> Agency</span>
          </div>
        </div>

        {/* Hero content */}
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl font-display font-bold text-foreground leading-tight mb-4">
              AI-Powered Agency
              <br />
              <span className="gradient-text-brand">Platform</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Automate your agency operations with intelligent tools for lead management, proposals, pricing, and client onboarding.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {features.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="glass rounded-xl p-4 card-hover">
                <div className="w-8 h-8 rounded-lg gradient-brand-subtle border border-brand-500/20 flex items-center justify-center mb-3">
                  <Icon className="w-4 h-4 text-brand-400" />
                </div>
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10 flex gap-8">
          {[['500+', 'Clients Served'], ['₹2Cr+', 'Revenue Generated'], ['98%', 'Satisfaction Rate']].map(([val, label]) => (
            <div key={label}>
              <p className="text-2xl font-display font-bold gradient-text">{val}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center">
            <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center">
              <Zap className="w-5 h-5 text-dark-500" />
            </div>
            <span className="text-xl font-display font-bold gradient-text-brand">Quick Bee Agency</span>
          </div>

          <div>
            <h2 className="text-3xl font-display font-bold text-foreground">Welcome back</h2>
            <p className="text-muted-foreground mt-2">Sign in to your agency dashboard</p>
          </div>

          {/* Demo credentials info */}
          <div className="glass rounded-xl p-4 border border-brand-500/20">
            <p className="text-xs font-semibold text-brand-400 mb-2 uppercase tracking-wider">Demo Credentials</p>
            <div className="space-y-1">
              {demoCreds.map(cred => (
                <button
                  key={cred.email}
                  onClick={() => { setEmail(cred.email); setPassword(cred.password); }}
                  className="w-full text-left text-xs text-muted-foreground hover:text-brand-400 transition-colors flex items-center justify-between group"
                >
                  <span><span className="text-foreground font-medium">{cred.role}</span> — {cred.email}</span>
                  <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>

          {/* Login form */}
          <form onSubmit={handleDemoLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@quickbee.com"
                required
                className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/40 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/40 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn || loginStatus === 'logging-in'}
              className="w-full py-3 rounded-xl gradient-brand text-dark-500 font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed glow-brand-sm"
            >
              {(isLoggingIn || loginStatus === 'logging-in') ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : null}
              Sign In
            </button>
          </form>

          <div className="relative flex items-center gap-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button
            onClick={handleIILogin}
            disabled={loginStatus === 'logging-in'}
            className="w-full py-3 rounded-xl bg-card border border-border text-foreground font-medium flex items-center justify-center gap-2 hover:border-brand-500/50 hover:bg-brand-500/5 transition-all disabled:opacity-50"
          >
            <Shield className="w-4 h-4 text-brand-400" />
            Continue with Internet Identity
          </button>

          <p className="text-center text-xs text-muted-foreground">
            By signing in, you agree to our{' '}
            <a href="#" className="text-brand-400 hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-brand-400 hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
