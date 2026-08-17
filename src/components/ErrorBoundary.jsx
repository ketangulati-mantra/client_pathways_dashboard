import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', background: '#fef2f2', minHeight: '100vh', color: '#991b1b', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', justifyContent: 'center' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Something went wrong</h1>
          <p>We apologize for the inconvenience. A technical error occurred while trying to load this lesson.</p>
          <details style={{ whiteSpace: 'pre-wrap', background: '#fff', padding: '20px', borderRadius: '8px', width: '100%', maxWidth: '800px', overflow: 'auto' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 600, marginBottom: '12px' }}>View Error Details</summary>
            <span style={{ color: '#dc2626' }}>{this.state.error && this.state.error.toString()}</span>
            <br />
            <span style={{ color: '#475569', fontSize: '0.85rem' }}>{this.state.errorInfo && this.state.errorInfo.componentStack}</span>
          </details>
          <button 
            onClick={() => window.location.href = '/'} 
            style={{ padding: '12px 24px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, marginTop: '20px' }}
          >
            Return to Dashboard
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
