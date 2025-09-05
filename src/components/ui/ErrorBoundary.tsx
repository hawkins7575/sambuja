'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // 에러 로깅 서비스로 전송 (예: Sentry)
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                앗! 문제가 발생했어요
              </h1>
              
              <p className="text-gray-600 mb-8 leading-relaxed">
                예상치 못한 오류가 발생했습니다. 
                잠시 후 다시 시도해주시거나 홈으로 돌아가주세요.
              </p>

              <div className="space-y-3">
                <button
                  onClick={this.handleRetry}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>다시 시도</span>
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  <Home className="w-5 h-5" />
                  <span>홈으로 가기</span>
                </button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                    개발자 정보 (개발 모드)
                  </summary>
                  <div className="mt-2 p-4 bg-gray-100 rounded-lg text-xs text-gray-700 overflow-auto">
                    <div className="mb-2">
                      <strong>에러:</strong>
                      <pre className="mt-1 text-red-600">{this.state.error.toString()}</pre>
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong>컴포넌트 스택:</strong>
                        <pre className="mt-1 text-gray-600 whitespace-pre-wrap">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// 간단한 함수형 에러 폴백 컴포넌트
interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  message?: string;
}

export function ErrorFallback({ error, resetError, message }: ErrorFallbackProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-center space-x-3">
        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-medium text-red-800">
            {message || '문제가 발생했습니다'}
          </h3>
          {error && (
            <p className="text-sm text-red-700 mt-1">
              {error.message}
            </p>
          )}
          {resetError && (
            <button
              onClick={resetError}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              다시 시도
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// 로딩과 에러를 함께 처리하는 래퍼 컴포넌트
interface AsyncWrapperProps {
  loading: boolean;
  error?: Error | string | null;
  children: ReactNode;
  loadingSkeleton?: ReactNode;
  onRetry?: () => void;
}

export function AsyncWrapper({ 
  loading, 
  error, 
  children, 
  loadingSkeleton,
  onRetry 
}: AsyncWrapperProps) {
  if (loading) {
    return (
      <div>
        {loadingSkeleton || (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>
    );
  }

  if (error) {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorObj = typeof error === 'string' ? undefined : error;
    
    return (
      <ErrorFallback 
        error={errorObj}
        message={errorMessage}
        resetError={onRetry}
      />
    );
  }

  return <>{children}</>;
}