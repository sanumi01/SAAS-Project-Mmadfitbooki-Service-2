import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/common/Card';
import { Spinner } from '../components/common/Spinner';
import * as authService from '../services/authService';

const MOCK_CREDENTIALS = [
    { role: 'Admin', email: 'admin@maadfit.com', pass: 'admin123' },
    { role: 'Staff', email: 'staff@maadfit.com', pass: 'staff123' },
];

const SignupForm: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { signup, isSigningUp } = useAuth();
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if(password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }
        try {
            await signup(name, email, password);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        }
    };

    return (
        <Card className="animate-fade-in">
            <h2 className="text-2xl font-bold text-text-primary text-center mb-2">Create Admin Account</h2>
            <p className="text-text-primary/70 text-center mb-6">Set up the primary administrator for the business.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label htmlFor="name" className="block text-sm font-medium text-text-primary/80 mb-1">Full Name</label>
                    <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-background-dark border border-border-dark rounded px-3 py-2 text-text-primary focus-ring transition" placeholder="Admin User" />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-text-primary/80 mb-1">Admin Email</label>
                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-background-dark border border-border-dark rounded px-3 py-2 text-text-primary focus-ring transition" placeholder="admin@maadfit.com" />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-text-primary/80 mb-1">Password</label>
                    <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full bg-background-dark border border-border-dark rounded px-3 py-2 text-text-primary focus-ring transition" placeholder="••••••••" />
                </div>
                {error && (<p className="text-sm text-red-500 text-center">{error}</p>)}
                <button type="submit" disabled={isSigningUp} className="w-full bg-brand-primary text-white font-bold py-3 px-4 rounded-md hover:bg-brand-secondary transition-colors duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center focus-ring">
                    {isSigningUp ? <Spinner size="6" /> : 'Create Account & Login'}
                </button>
            </form>
        </Card>
    );
};

const LoginForm: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { login, isLoggingIn } = useAuth();
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            await login(email, password);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        }
    };
    
    const handleQuickLogin = async (emailToLogin: string, passwordToLogin: string) => {
        setError(null);
        try {
            await login(emailToLogin, passwordToLogin);
        } catch (err: any) {
            // Populate fields on error to show what was attempted
            setEmail(emailToLogin);
            setPassword(passwordToLogin);
            setError(err.message || 'An unexpected error occurred.');
        }
    };

    return (
        <>
            <Card className="animate-fade-in">
                <h2 className="text-2xl font-bold text-text-primary text-center mb-2">Welcome Back</h2>
                <p className="text-text-primary/70 text-center mb-6">Sign in to continue</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email-login" className="block text-sm font-medium text-text-primary/80 mb-1">Email Address</label>
                        <input type="email" id="email-login" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-background-dark border border-border-dark rounded px-3 py-2 text-text-primary focus-ring transition" placeholder="you@example.com"/>
                    </div>
                    <div>
                        <label htmlFor="password-login" className="block text-sm font-medium text-text-primary/80 mb-1">Password</label>
                        <input type="password" id="password-login" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-background-dark border border-border-dark rounded px-3 py-2 text-text-primary focus-ring transition" placeholder="••••••••" />
                    </div>
                    {error && (<p className="text-sm text-red-500 text-center">{error}</p>)}
                    <button type="submit" disabled={isLoggingIn} className="w-full bg-brand-primary text-white font-bold py-3 px-4 rounded-md hover:bg-brand-secondary transition-colors duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center focus-ring">
                        {isLoggingIn ? <Spinner size="6" /> : 'Sign In'}
                    </button>
                </form>
            </Card>

            <Card className="mt-4 text-sm animate-fade-in [animation-delay:0.2s]">
                <h3 className="text-center font-semibold text-text-primary mb-3">Quick Logins (for Demo)</h3>
                <div className="flex justify-around gap-2">
                    {MOCK_CREDENTIALS.map(cred => (
                        <button key={cred.role} type="button" onClick={() => handleQuickLogin(cred.email, cred.pass)} disabled={isLoggingIn} className="text-xs px-3 py-1 rounded-full bg-surface-dark hover:bg-border-dark text-brand-primary font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-ring">
                            {cred.role}
                        </button>
                    ))}
                </div>
            </Card>
        </>
    );
};

export const LoginView: React.FC = () => {
    const [adminExists, setAdminExists] = useState<boolean | null>(null);

    useEffect(() => {
        // This check runs on component mount to see if we should show login or sign-up.
        setAdminExists(authService.hasAdminAccount());
    }, []);

    if (adminExists === null) {
        return (
             <div className="min-h-screen bg-background-dark flex justify-center items-center">
                <Spinner size="16" />
             </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-dark flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full">
                <div className="flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-brand-primary" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                        <span className="text-4xl font-extrabold text-text-primary ml-3">MmadFitbooki</span>
                </div>
                    {adminExists ? <LoginForm /> : <SignupForm />}
                
            </div>
                <div className="w-full max-w-md mt-6">
                    <footer className="text-center py-4">
                        <p className="text-text-primary/70 text-sm">&copy; {new Date().getFullYear()} MmadFitbooki. All rights reserved.</p>
                    </footer>
                </div>
        </div>
    );
};