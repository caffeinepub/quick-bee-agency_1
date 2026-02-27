import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';

export default function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: '/authenticated/dashboard', replace: true });
  }, [navigate]);

  return null;
}
