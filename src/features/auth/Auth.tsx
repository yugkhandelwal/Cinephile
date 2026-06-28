import { useState, useEffect, useRef } from "react";
import { supabase } from "@/shared/api/supabase/client";
import Navbar from "@/shared/components/layout/Navbar";
import Footer from "@/shared/components/layout/Footer";
import { signInSchema, signUpSchema } from "@/shared/lib/validation";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Mail, Lock, Sparkles, TrendingUp } from "lucide-react";
import { z } from "zod";
import { useTrendingMovies } from "@/shared/api/tmdb/hooks";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Fetch trending movies for background
  const { data: trendingMovies } = useTrendingMovies(1);

  // Force hot reload indicator
  useEffect(() => {
    console.log('🎬 Enhanced Auth Page Loaded - Version 2.0');
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const validateSignIn = (): boolean => {
    try {
      signInSchema.parse({ email, password });
      setValidationErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        err.errors.forEach((error) => {
          if (error.path[0]) {
            errors[error.path[0] as string] = error.message;
          }
        });
        setValidationErrors(errors);
      }
      return false;
    }
  };

  const validateSignUp = (): boolean => {
    try {
      signUpSchema.parse({ email, password });
      setValidationErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        err.errors.forEach((error) => {
          if (error.path[0]) {
            errors[error.path[0] as string] = error.message;
          }
        });
        setValidationErrors(errors);
      }
      return false;
    }
  };

  const onSignIn = async () => {
    setError(null);
    setSuccessMessage(null);
    
    if (!validateSignIn()) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setSuccessMessage("Successfully signed in! Redirecting...");
        // Redirect after short delay - store timeout ref for cleanup
        timeoutRef.current = setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onSignUp = async () => {
    setError(null);
    setSuccessMessage(null);
    
    if (!validateSignUp()) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setSuccessMessage("Account created! Please check your email to verify your account.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) {
        setError(error.message);
        setLoading(false);
      }
      // Note: The page will redirect, so we don't set loading to false here
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error(err);
      setLoading(false);
    }
  };

  const onGitHubSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) {
        setError(error.message);
        setLoading(false);
      }
      // Note: The page will redirect, so we don't set loading to false here
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-24">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-transparent border border-white/5 rounded-2xl p-8">
              
              {/* Tab Switcher */}
              <div className="flex gap-2 p-1 bg-muted/50 rounded-lg mb-6">
                <button
                  onClick={() => setIsSignUp(false)}
                  className={`flex-1 py-2.5 rounded-md font-medium transition-all ${
                    !isSignUp
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setIsSignUp(true)}
                  className={`flex-1 py-2.5 rounded-md font-medium transition-all ${
                    isSignUp
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              <div className="space-y-2 mb-6">
                <h2 className="text-3xl font-heading font-bold text-white tracking-tight">
                  {isSignUp ? 'Create Your Account' : 'Welcome Back!'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {isSignUp
                    ? 'Start your cinematic journey today'
                    : 'Sign in to continue to Cinephile'}
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3 animate-in slide-in-from-top-2">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-destructive">Authentication Error</p>
                    <p className="text-sm text-destructive/90 mt-1">{error}</p>
                  </div>
                </div>
              )}

              {/* Success Alert */}
              {successMessage && (
                <div className="mb-4 p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-start gap-3 animate-in slide-in-from-top-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-500">Success</p>
                    <p className="text-sm text-green-500/90 mt-1">{successMessage}</p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {/* Email Input with Icon */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      className={`w-full h-11 rounded-lg border ${
                        validationErrors.email ? 'border-destructive' : 'border-border'
                      } bg-background/50 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all`}
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (validationErrors.email) {
                          setValidationErrors(prev => ({ ...prev, email: '' }));
                        }
                      }}
                      disabled={loading}
                    />
                  </div>
                  {validationErrors.email && (
                    <p className="text-destructive text-xs mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {validationErrors.email}
                    </p>
                  )}
                </div>

                {/* Password Input with Icon */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      className={`w-full h-11 rounded-lg border ${
                        validationErrors.password ? 'border-destructive' : 'border-border'
                      } bg-background/50 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all`}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (validationErrors.password) {
                          setValidationErrors(prev => ({ ...prev, password: '' }));
                        }
                      }}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {validationErrors.password && (
                    <p className="text-destructive text-xs mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {validationErrors.password}
                    </p>
                  )}
                  {isSignUp && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Must include uppercase, lowercase, number, and special character (min. 8 chars)
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  onClick={isSignUp ? onSignUp : onSignIn}
                  disabled={loading}
                  className="w-full h-11 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  {loading
                    ? isSignUp ? 'Creating Account...' : 'Signing In...'
                    : isSignUp ? 'Create Account' : 'Sign In'}
                </button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                {/* Social Login Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={onGoogleSignIn}
                    disabled={loading}
                    className="h-10 border border-border rounded-lg hover:bg-accent transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-sm font-medium">Google</span>
                  </button>
                  <button 
                    onClick={onGitHubSignIn}
                    disabled={loading}
                    className="h-10 border border-border rounded-lg hover:bg-accent transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    <span className="text-sm font-medium">GitHub</span>
                  </button>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                  By continuing, you agree to Cinephile's{' '}
                  <a href="#" className="text-primary hover:underline">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      
      <Footer />
    </div>
  );
};

export default Auth;
