'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import AppLogo from '@/components/ui/AppLogo';
import { Eye, EyeOff, Loader2, Copy, CheckCheck, Briefcase, User, Sparkles, Trophy, Users, ArrowRight } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


type AuthMode = 'login' | 'signup';
type Role = 'recruiter' | 'applicant';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

const signupSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(v => v === true, 'You must accept the terms'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type LoginForm = z.infer<typeof loginSchema>;
type SignupForm = z.infer<typeof signupSchema>;

interface DemoCredential {
  role: Role;
  email: string;
  password: string;
  label: string;
}

const DEMO_CREDENTIALS: DemoCredential[] = [
  { role: 'recruiter', email: 'aline.uwimana@umurava.africa', password: 'Recruiter2026!', label: 'Talent Acquisition Lead' },
  { role: 'applicant', email: 'nzinga.mwamba@outlook.com', password: 'Applicant2026!', label: 'AI Engineer (Applicant)' },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="p-1 rounded hover:bg-white/50 transition-colors" title="Copy">
      {copied ? <CheckCheck size={11} className="text-green-600" /> : <Copy size={11} className="text-muted-foreground" />}
    </button>
  );
}

export default function AuthClient() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [role, setRole] = useState<Role>('recruiter');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: false },
  });

  const signupForm = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { acceptTerms: false },
  });

  const handleDemoLogin = (cred: DemoCredential) => {
    setRole(cred.role);
    loginForm.setValue('email', cred.email);
    loginForm.setValue('password', cred.password);
    toast.info(`Demo credentials filled for ${cred.label}`);
  };

  const onLogin = async (data: LoginForm) => {
    setIsSubmitting(true);
    // Backend integration point: POST /api/auth/login { email, password, role }
    const validCred = DEMO_CREDENTIALS.find(c => c.email === data.email && c.password === data.password);
    await new Promise(r => setTimeout(r, 1200));
    if (!validCred) {
      setIsSubmitting(false);
      loginForm.setError('email', { message: 'Invalid credentials — use the demo accounts below to sign in' });
      return;
    }
    setIsSubmitting(false);
    toast.success(`Welcome back! Redirecting to your ${validCred.role} portal...`);
    setTimeout(() => {
      router.push(validCred.role === 'recruiter' ? '/recruiter-dashboard' : '/applicant-portal');
    }, 800);
  };

  const onSignup = async (data: SignupForm) => {
    setIsSubmitting(true);
    // Backend integration point: POST /api/auth/register { ...data, role }
    await new Promise(r => setTimeout(r, 1400));
    setIsSubmitting(false);
    toast.success('Account created! Redirecting to your portal...');
    setTimeout(() => {
      router.push(role === 'recruiter' ? '/recruiter-dashboard' : '/applicant-portal');
    }, 800);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Brand Panel */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] 2xl:w-[560px] shrink-0 bg-primary-700 flex-col justify-between p-10 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full" />
          <div className="absolute -bottom-32 -left-16 w-96 h-96 bg-white/5 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full" />
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <AppLogo size={40} />
          <span className="font-display text-2xl font-700 text-white">UmuravaAI</span>
        </div>

        {/* Main copy */}
        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1.5 mb-6">
            <Sparkles size={13} className="text-accent-500" />
            <span className="text-xs font-medium text-white/90">Powered by Gemini AI</span>
          </div>
          <h1 className="text-3xl xl:text-4xl font-display font-700 text-white leading-tight mb-4">
            Hire smarter.<br />
            Get hired faster.
          </h1>
          <p className="text-white/70 text-sm leading-relaxed mb-8 max-w-sm">
            UmuravaAI uses Gemini to screen and rank talent profiles with transparent scoring, explainable reasoning, and zero bias.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Users, label: 'Active Candidates', value: '2,400+' },
              { icon: Briefcase, label: 'Open Roles', value: '48' },
              { icon: Trophy, label: 'Placements', value: '312' },
            ].map(stat => {
              const Icon = stat.icon;
              return (
                <div key={`stat-${stat.label}`} className="bg-white/10 border border-white/15 rounded-xl p-3">
                  <Icon size={16} className="text-accent-500 mb-1.5" />
                  <p className="text-xl font-display font-700 text-white">{stat.value}</p>
                  <p className="text-[10px] text-white/60 leading-tight">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative">
          <p className="text-xs text-white/40">
            Part of the Umurava AI Hackathon 2026 · Africa's HR Innovation Challenge
          </p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-10 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <AppLogo size={32} />
            <span className="font-display text-xl font-700 text-primary-700">UmuravaAI</span>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-display font-700 text-foreground">
              {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === 'login' ? 'Welcome back — enter your credentials to continue' : 'Join thousands of talent and recruiters on Umurava'}
            </p>
          </div>

          {/* Role Selector */}
          <div className="flex items-center gap-2 bg-muted p-1 rounded-lg mb-6">
            <button
              onClick={() => setRole('recruiter')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                role === 'recruiter' ? 'bg-white text-primary-700 shadow-card' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Briefcase size={14} />
              I'm a Recruiter
            </button>
            <button
              onClick={() => setRole('applicant')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                role === 'applicant' ? 'bg-white text-primary-700 shadow-card' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <User size={14} />
              I'm a Candidate
            </button>
          </div>

          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Email Address</label>
                <input
                  {...loginForm.register('email')}
                  type="email"
                  placeholder={role === 'recruiter' ? 'aline.uwimana@umurava.africa' : 'nzinga.mwamba@outlook.com'}
                  className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-700/30 focus:border-primary-700 transition-colors"
                />
                {loginForm.formState.errors.email && (
                  <p className="text-xs text-red-500 mt-1">{loginForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-foreground">Password</label>
                  <button type="button" className="text-xs text-primary-700 hover:underline">Forgot password?</button>
                </div>
                <div className="relative">
                  <input
                    {...loginForm.register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="w-full px-3 py-2.5 pr-10 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-700/30 focus:border-primary-700 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-xs text-red-500 mt-1">{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  {...loginForm.register('rememberMe')}
                  type="checkbox"
                  id="rememberMe"
                  className="rounded border-border text-primary-700 focus:ring-primary-700"
                />
                <label htmlFor="rememberMe" className="text-xs text-muted-foreground">Remember me for 30 days</label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary-700 text-white text-sm font-semibold rounded-lg hover:bg-primary-800 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <><Loader2 size={15} className="animate-spin" /> Signing in...</> : <>Sign In <ArrowRight size={14} /></>}
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-background px-3 text-xs text-muted-foreground">or continue with</span>
                </div>
              </div>

              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>
            </form>
          )}

          {/* Signup Form */}
          {mode === 'signup' && (
            <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">First Name</label>
                  <input {...signupForm.register('firstName')} type="text" placeholder="Aline" className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-700/30 focus:border-primary-700" />
                  {signupForm.formState.errors.firstName && <p className="text-xs text-red-500 mt-1">{signupForm.formState.errors.firstName.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Last Name</label>
                  <input {...signupForm.register('lastName')} type="text" placeholder="Uwimana" className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-700/30 focus:border-primary-700" />
                  {signupForm.formState.errors.lastName && <p className="text-xs text-red-500 mt-1">{signupForm.formState.errors.lastName.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Email Address</label>
                <input {...signupForm.register('email')} type="email" placeholder="you@company.com" className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-700/30 focus:border-primary-700" />
                {signupForm.formState.errors.email && <p className="text-xs text-red-500 mt-1">{signupForm.formState.errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Password</label>
                <p className="text-[11px] text-muted-foreground mb-1.5">Minimum 8 characters</p>
                <div className="relative">
                  <input {...signupForm.register('password')} type={showPassword ? 'text' : 'password'} placeholder="Create a strong password" className="w-full px-3 py-2.5 pr-10 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-700/30 focus:border-primary-700" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {signupForm.formState.errors.password && <p className="text-xs text-red-500 mt-1">{signupForm.formState.errors.password.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Confirm Password</label>
                <div className="relative">
                  <input {...signupForm.register('confirmPassword')} type={showConfirmPassword ? 'text' : 'password'} placeholder="Repeat your password" className="w-full px-3 py-2.5 pr-10 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-700/30 focus:border-primary-700" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {signupForm.formState.errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{signupForm.formState.errors.confirmPassword.message}</p>}
              </div>

              <div className="flex items-start gap-2">
                <input {...signupForm.register('acceptTerms')} type="checkbox" id="acceptTerms" className="mt-0.5 rounded border-border text-primary-700 focus:ring-primary-700" />
                <label htmlFor="acceptTerms" className="text-xs text-muted-foreground leading-relaxed">
                  I agree to the{' '}
                  <a href="#" className="text-primary-700 hover:underline">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-primary-700 hover:underline">Privacy Policy</a>
                </label>
              </div>
              {signupForm.formState.errors.acceptTerms && <p className="text-xs text-red-500">{signupForm.formState.errors.acceptTerms.message}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary-700 text-white text-sm font-semibold rounded-lg hover:bg-primary-800 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <><Loader2 size={15} className="animate-spin" /> Creating account...</> : <>Create Account <ArrowRight size={14} /></>}
              </button>
            </form>
          )}

          {/* Toggle mode */}
          <p className="text-center text-sm text-muted-foreground mt-5">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-primary-700 font-semibold hover:underline">
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>

          {/* Demo Credentials */}
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-amber-800 mb-3">Demo Accounts — Click to autofill</p>
            <div className="space-y-2">
              {DEMO_CREDENTIALS.map(cred => (
                <div key={`demo-${cred.role}`} className="bg-white border border-amber-100 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      {cred.role === 'recruiter' ? <Briefcase size={11} className="text-primary-700" /> : <User size={11} className="text-primary-700" />}
                      <span className="text-[10px] font-semibold text-foreground capitalize">{cred.role}</span>
                      <span className="text-[10px] text-muted-foreground">— {cred.label}</span>
                    </div>
                    <button
                      onClick={() => handleDemoLogin(cred)}
                      className="text-[10px] font-semibold text-primary-700 hover:bg-primary-50 px-2 py-0.5 rounded transition-colors"
                    >
                      Use this →
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center justify-between bg-muted/60 rounded px-2 py-1">
                      <span className="text-[9px] font-mono text-foreground truncate mr-1">{cred.email}</span>
                      <CopyButton text={cred.email} />
                    </div>
                    <div className="flex items-center justify-between bg-muted/60 rounded px-2 py-1">
                      <span className="text-[9px] font-mono text-foreground">{cred.password}</span>
                      <CopyButton text={cred.password} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}