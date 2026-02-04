import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public handleReload = () => {
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                    <div className="glass max-w-md w-full p-8 rounded-2xl border-border flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
                            <AlertCircle className="w-8 h-8 text-destructive" />
                        </div>

                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            Something went wrong
                        </h1>

                        <p className="text-muted-foreground">
                            We encountered an unexpected error. Please check your connection or try refreshing the page.
                        </p>

                        {this.state.error && process.env.NODE_ENV === "development" && (
                            <div className="w-full bg-black/40 p-4 rounded-lg overflow-auto max-h-40 text-left">
                                <code className="text-xs text-red-300 font-mono break-all">
                                    {this.state.error.toString()}
                                </code>
                            </div>
                        )}

                        <Button
                            onClick={this.handleReload}
                            className="w-full glow"
                            size="lg"
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Reload Application
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
