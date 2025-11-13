"use client";

import React from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="p-8 text-center max-w-md mx-auto mt-8">
          <h2 className="text-xl font-semibold mb-4 text-destructive">
            Something went wrong
          </h2>
          <p className="text-muted-foreground mb-4">
            We encountered an unexpected error. Please try refreshing the page.
          </p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Refresh Page
          </Button>
        </Card>
      );
    }

    return this.props.children;
  }
}
