import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // eslint-disable-next-line no-console
    console.error('Weather Dashboard crashed:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          background: 'linear-gradient(180deg, #3f8fd6 0%, #7bb8e8 55%, #f6e3b4 100%)',
          fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: '26rem',
            width: '100%',
            textAlign: 'center',
            background: 'rgba(255, 253, 249, 0.95)',
            borderRadius: '1.25rem',
            padding: '2.5rem 2rem',
            boxShadow: '0 22px 44px -14px rgba(94, 62, 20, 0.3)',
          }}
        >
          <div style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }} aria-hidden="true">⛈️</div>
          <h1
            style={{
              fontFamily: "Fraunces, ui-serif, Georgia, serif",
              fontSize: '1.4rem',
              fontWeight: 600,
              color: '#101a24',
              margin: '0 0 0.5rem',
            }}
          >
            Something went wrong
          </h1>
          <p style={{ color: '#5b6b7c', fontSize: '0.9rem', lineHeight: 1.5, margin: '0 0 1.75rem' }}>
            The dashboard hit an unexpected error. Reloading usually fixes it — your favorites and
            recent searches are saved locally and won't be lost.
          </p>
          <button
            onClick={this.handleReload}
            style={{
              background: '#2c3b4a',
              color: '#fffdf9',
              border: 'none',
              borderRadius: '9999px',
              padding: '0.75rem 1.75rem',
              fontFamily: "'JetBrains Mono', ui-monospace, monospace",
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
