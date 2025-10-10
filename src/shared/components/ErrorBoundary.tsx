import { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from './ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * ErrorBoundary component to catch and handle React errors
 * Prevents entire app from crashing when a component throws an error
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Update state with error info
    this.setState({ errorInfo });
    
    // Call optional error callback
    this.props.onError?.(error, errorInfo);
    
    // In production, send to error tracking service (e.g., Sentry)
    if (import.meta.env.PROD) {
      this.logErrorToService(error, errorInfo);
    }
  }

  private logErrorToService(error: Error, errorInfo: React.ErrorInfo) {
    // TODO: Integrate with error tracking service like Sentry
    // Example:
    // Sentry.captureException(error, {
    //   contexts: {
    //     react: {
    //       componentStack: errorInfo.componentStack,
    //     },
    //   },
    // });
    
    console.log('Error logged to service:', { error, errorInfo });
  }

  private handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null
    });
  };

  private handleGoHome = () => {
    this.handleReset();
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <div className="text-center max-w-2xl w-full">
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <AlertCircle className="w-24 h-24 text-destructive animate-pulse" />
                <div className="absolute inset-0 bg-destructive/20 rounded-full blur-xl animate-pulse" />
              </div>
            </div>
            
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Oops! Something went wrong
            </h1>
            
            <p className="text-muted-foreground mb-2 text-lg">
              We encountered an unexpected error. Don't worry, it's not your fault!
            </p>
            
            <p className="text-muted-foreground mb-8">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                onClick={this.handleReset}
                size="lg"
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
              
              <Button 
                onClick={this.handleGoHome}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                <Home className="w-4 h-4" />
                Go Home
              </Button>
            </div>

            {/* Show error details in development */}
            {(import.meta.env.DEV || this.props.showDetails) && this.state.error && (
              <details className="mt-8 text-left bg-muted/50 rounded-lg p-4 border border-border">
                <summary className="cursor-pointer font-semibold mb-2 text-sm uppercase tracking-wide">
                  Error Details (Development Only)
                </summary>
                <div className="space-y-4 text-sm">
                  <div>
                    <strong className="text-destructive">Error:</strong>
                    <pre className="mt-2 p-3 bg-background rounded overflow-x-auto text-xs">
                      {this.state.error.toString()}
                    </pre>
                  </div>
                  
                  {this.state.error.stack && (
                    <div>
                      <strong className="text-destructive">Stack Trace:</strong>
                      <pre className="mt-2 p-3 bg-background rounded overflow-x-auto text-xs max-h-64 overflow-y-auto">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                  
                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <strong className="text-destructive">Component Stack:</strong>
                      <pre className="mt-2 p-3 bg-background rounded overflow-x-auto text-xs max-h-64 overflow-y-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <p className="text-xs text-muted-foreground mt-8">
              If this problem persists, please contact support or try refreshing the page.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Lightweight error boundary for smaller sections
 */
export class SectionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('SectionErrorBoundary caught:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-6 rounded-lg border border-destructive/20 bg-destructive/5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1">Section Error</h3>
              <p className="text-sm text-muted-foreground mb-3">
                {this.state.error?.message || 'This section failed to load'}
              </p>
              <Button 
                onClick={this.handleReset}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <RefreshCw className="w-3 h-3" />
                Retry
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
