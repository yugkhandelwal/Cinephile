import { useState, useEffect, useRef } from "react";
import { supabase } from "@/shared/api/supabase/client";
import Navbar from "@/shared/components/layout/Navbar";
import Footer from "@/shared/components/layout/Footer";
import { signInSchema, signUpSchema } from "@/shared/lib/validation";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Mail, Lock, Sparkles, TrendingUp } from "lucide-react";
import { z } from "zod";
import { useTrendingMovies } from "@/shared/api/tmdb/hooks";
import { motion } from "framer-motion";

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
    <div className="min-h-screen bg-background flex flex-col animate-fade-in relative">
      {/* Poster Wall Background */}
      {trendingMovies && trendingMovies.length > 0 && (
        <div className="absolute inset-0 z-0 overflow-hidden select-none pointer-events-none flex flex-col justify-center gap-6 rotate-[-6deg] scale-125 origin-center">
          <motion.div 
            className="flex w-max"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 80 }}
          >
            {/* First Set */}
            <div className="flex gap-6 pr-6">
              {trendingMovies.map((movie, i) => (
                <div key={`row1-a-${movie.id}-${i}`} className="w-40 sm:w-48 lg:w-56 aspect-[2/3] flex-shrink-0 rounded-xl overflow-hidden shadow-2xl border border-white/5">
                  <img src={movie.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            {/* Duplicate Set for Seamless Loop */}
            <div className="flex gap-6 pr-6">
              {trendingMovies.map((movie, i) => (
                <div key={`row1-b-${movie.id}-${i}`} className="w-40 sm:w-48 lg:w-56 aspect-[2/3] flex-shrink-0 rounded-xl overflow-hidden shadow-2xl border border-white/5">
                  <img src={movie.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            className="flex w-max"
            animate={{ x: ["-50%", "0%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 70 }}
          >
            <div className="flex gap-6 pr-6">
              {trendingMovies.map((movie, i) => (
                <div key={`row2-a-${movie.id}-${i}`} className="w-40 sm:w-48 lg:w-56 aspect-[2/3] flex-shrink-0 rounded-xl overflow-hidden shadow-2xl border border-white/5">
                  <img src={movie.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="flex gap-6 pr-6">
              {trendingMovies.map((movie, i) => (
                <div key={`row2-b-${movie.id}-${i}`} className="w-40 sm:w-48 lg:w-56 aspect-[2/3] flex-shrink-0 rounded-xl overflow-hidden shadow-2xl border border-white/5">
                  <img src={movie.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            className="flex w-max"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 90 }}
          >
            <div className="flex gap-6 pr-6">
              {trendingMovies.map((movie, i) => (
                <div key={`row3-a-${movie.id}-${i}`} className="w-40 sm:w-48 lg:w-56 aspect-[2/3] flex-shrink-0 rounded-xl overflow-hidden shadow-2xl border border-white/5">
                  <img src={movie.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="flex gap-6 pr-6">
              {trendingMovies.map((movie, i) => (
                <div key={`row3-b-${movie.id}-${i}`} className="w-40 sm:w-48 lg:w-56 aspect-[2/3] flex-shrink-0 rounded-xl overflow-hidden shadow-2xl border border-white/5">
                  <img src={movie.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
      
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-0 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col min-h-screen">

        
        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-4 py-24 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none z-0" />
          
          <div className="w-full max-w-md mx-auto relative z-10">
            <div className="bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 sm:p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              
              {/* Tab Switcher */}
              <div className="flex gap-2 p-1.5 bg-white/5 backdrop-blur-md rounded-xl mb-8 border border-white/5">
                <button
                  onClick={() => setIsSignUp(false)}
                  className={`flex-1 py-2.5 rounded-lg font-bold transition-all duration-300 ${
                    !isSignUp
                      ? 'bg-white text-black shadow-[0_4px_14px_rgba(255,255,255,0.25)] scale-100'
                      : 'text-gray-400 hover:text-white hover:bg-white/5 scale-95'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setIsSignUp(true)}
                  className={`flex-1 py-2.5 rounded-lg font-bold transition-all duration-300 ${
                    isSignUp
                      ? 'bg-white text-black shadow-[0_4px_14px_rgba(255,255,255,0.25)] scale-100'
                      : 'text-gray-400 hover:text-white hover:bg-white/5 scale-95'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              <div className="space-y-3 mb-8 text-center">
                <h2 className="text-3xl font-heading font-bold text-white tracking-wide drop-shadow-md">
                  {isSignUp ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p className="text-sm text-gray-400 font-medium">
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

              <div className="space-y-5">
                {/* Email Input with Icon */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold mb-2 text-gray-200">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-white transition-colors" />
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      className={`w-full h-12 rounded-xl border ${
                        validationErrors.email ? 'border-red-500/50 focus:ring-red-500/50' : 'border-white/10 focus:border-white/30 focus:ring-primary/50'
                      } bg-white/5 hover:bg-white/10 pl-11 pr-4 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:bg-white/10 transition-all shadow-inner`}
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
                    <p className="text-red-400 text-xs mt-2 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {validationErrors.email}
                    </p>
                  )}
                </div>

                {/* Password Input with Icon */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold mb-2 text-gray-200">
                    Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-white transition-colors" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      className={`w-full h-12 rounded-xl border ${
                        validationErrors.password ? 'border-red-500/50 focus:ring-red-500/50' : 'border-white/10 focus:border-white/30 focus:ring-primary/50'
                      } bg-white/5 hover:bg-white/10 pl-11 pr-11 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:bg-white/10 transition-all shadow-inner`}
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
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
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
                    <p className="text-red-400 text-xs mt-2 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {validationErrors.password}
                    </p>
                  )}
                  {isSignUp && (
                    <p className="text-xs text-gray-400 mt-2.5 font-medium leading-relaxed">
                      Must include uppercase, lowercase, number, and special character (min. 8 chars)
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  onClick={isSignUp ? onSignUp : onSignIn}
                  disabled={loading}
                  className="w-full h-12 mt-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all shadow-[0_0_20px_rgba(145,70,255,0.3)]"
                >
                  {loading
                    ? isSignUp ? 'Creating Account...' : 'Signing In...'
                    : isSignUp ? 'Create Account' : 'Sign In'}
                </button>

                {/* Divider */}
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest">
                    <span className="bg-[#151515] px-4 text-gray-400 rounded-full">Or continue with</span>
                  </div>
                </div>

                {/* Social Login Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={onGoogleSignIn}
                    disabled={loading}
                    className="h-12 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-white font-semibold"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </button>
                  <button 
                    onClick={onGitHubSignIn}
                    disabled={loading}
                    className="h-12 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-white font-semibold"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    GitHub
                  </button>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-xs text-gray-400 font-medium text-center">
                  By continuing, you agree to Cinephile's{' '}
                  <a href="#" className="text-gray-300 hover:text-white hover:underline transition-colors">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-gray-300 hover:text-white hover:underline transition-colors">Privacy Policy</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      
      <Footer />
      </div>
    </div>
  );
};

export default Auth;
