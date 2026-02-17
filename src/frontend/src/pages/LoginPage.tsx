import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useQueries';
import { validateDemoCredentials, type DemoRole } from '../auth/demoCredentials';
import { useSession } from '../auth/useSession';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';

export default function LoginPage() {
  const { login, loginStatus, identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  const { saveSession } = useSession();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<DemoRole>('Client');
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  const isAuthenticated = !!identity;
  const needsProfile = isAuthenticated && userProfile === null;

  const handleLogin = async () => {
    const role = validateDemoCredentials(email, password);
    if (!role) {
      toast.error('Invalid credentials');
      return;
    }

    saveSession(email, role);
    
    try {
      await login();
      setShowProfileSetup(true);
    } catch (error: any) {
      if (error.message === 'User is already authenticated') {
        setShowProfileSetup(true);
      } else {
        toast.error('Login failed');
      }
    }
  };

  const handleProfileSetup = async () => {
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    try {
      await saveProfile.mutateAsync({
        name: name.trim(),
        email,
        role: selectedRole,
        businessName: businessName.trim() || undefined
      });
      toast.success('Profile created successfully');
    } catch (error) {
      toast.error('Failed to create profile');
    }
  };

  if (needsProfile || showProfileSetup) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img src="/assets/generated/quickbee-bg-mesh.dim_1920x1080.png" alt="" className="w-full h-full object-cover" />
        </div>
        
        <div className="glass-panel rounded-2xl p-8 w-full max-w-md relative z-10">
          <h1 className="text-3xl font-bold text-[#00C2A8] mb-2">Complete Your Profile</h1>
          <p className="text-soft-gray mb-6">Tell us a bit about yourself</p>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-foreground">Full Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="mt-1 bg-input border-border focus:ring-primary"
              />
            </div>

            <div>
              <Label htmlFor="businessName" className="text-foreground">Business Name (Optional)</Label>
              <Input
                id="businessName"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Your business name"
                className="mt-1 bg-input border-border focus:ring-primary"
              />
            </div>

            <Button
              onClick={handleProfileSetup}
              disabled={saveProfile.isPending}
              className="w-full gradient-teal-glow text-black font-semibold hover:scale-105 transition-transform duration-300"
            >
              {saveProfile.isPending ? 'Creating...' : 'Complete Setup'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <img src="/assets/generated/quickbee-bg-mesh.dim_1920x1080.png" alt="" className="w-full h-full object-cover" />
      </div>
      
      <div className="glass-panel rounded-2xl p-8 w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#00C2A8] mb-2">Quick Bee Agency</h1>
          <p className="text-soft-gray">AI-Powered Agency Management</p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="role" className="text-foreground">Select Role</Label>
            <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as DemoRole)}>
              <SelectTrigger className="mt-1 bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="Client">Client</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="email" className="text-foreground">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter demo email"
              className="mt-1 bg-input border-border focus:ring-primary"
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-foreground">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter demo password"
              className="mt-1 bg-input border-border focus:ring-primary"
            />
          </div>

          <Button
            onClick={handleLogin}
            disabled={loginStatus === 'logging-in'}
            className="w-full gradient-teal-glow text-black font-semibold hover:scale-105 transition-transform duration-300"
          >
            {loginStatus === 'logging-in' ? 'Logging in...' : 'Login'}
          </Button>

          <div className="mt-6 p-4 bg-secondary/50 rounded-lg text-sm text-soft-gray">
            <p className="font-semibold text-foreground mb-2">Demo Credentials:</p>
            <p>Admin: admin@quickbee.com / Admin123</p>
            <p>Manager: manager@quickbee.com / Manager123</p>
            <p>Client: client@quickbee.com / Client123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
