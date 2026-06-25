import { Component } from 'react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      console.error('[CentreHub] Render error:', error, info?.componentStack);
    }
  }

  render() {
    const { error } = this.state;
    const { children, fallback } = this.props;

    if (error) {
      if (fallback) return fallback;

      return (
        <div className="min-h-[40vh] flex flex-col items-center justify-center px-4 py-16 text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">Something went wrong</h2>
          <p className="text-muted-foreground text-sm mb-4 max-w-md">
            {import.meta.env.DEV ? error.message : 'This section failed to load. Please refresh the page.'}
          </p>
          <Link to="/" className="btn-primary text-sm">
            Back to Home
          </Link>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
