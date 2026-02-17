export const DEMO_CREDENTIALS = {
  admin: {
    email: 'admin@quickbee.com',
    password: 'Admin123',
    role: 'Admin'
  },
  manager: {
    email: 'manager@quickbee.com',
    password: 'Manager123',
    role: 'Manager'
  },
  client: {
    email: 'client@quickbee.com',
    password: 'Client123',
    role: 'Client'
  }
};

export type DemoRole = 'Admin' | 'Manager' | 'Client';

export function validateDemoCredentials(email: string, password: string): DemoRole | null {
  const cred = Object.values(DEMO_CREDENTIALS).find(
    c => c.email === email && c.password === password
  );
  return cred ? (cred.role as DemoRole) : null;
}
