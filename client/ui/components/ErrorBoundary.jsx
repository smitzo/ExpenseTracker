import { Component } from 'react';
export class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    console.error('The workspace could not render.');
  }
  render() {
    return this.state.failed ? (
      <main className="empty">
        <h1>Let’s take a fresh look.</h1>
        <p>The workspace couldn’t load. Please refresh and try again.</p>
        <button className="button" onClick={() => location.reload()}>
          Refresh workspace
        </button>
      </main>
    ) : (
      this.props.children
    );
  }
}
