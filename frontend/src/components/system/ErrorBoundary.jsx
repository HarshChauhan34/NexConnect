import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("UI error boundary caught:", error);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center px-4">
          <section className="w-full max-w-lg rounded-3xl border border-slate-300 bg-white p-8 text-center shadow-xl dark:border-slate-800 dark:bg-slate-950">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Unexpected Error
            </p>
            <h1 className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">
              Something broke on this screen
            </h1>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              The app state is safe, but this view failed to render. Reload to recover.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="mt-6 rounded-xl bg-linear-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5"
            >
              Reload App
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
