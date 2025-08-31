import React from "react";
import Icon from "./Icon";
import { ApiError } from "../utils/api";

interface LoadingProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export const Loading: React.FC<LoadingProps> = ({ message = "Loading...", size = "md" }) => {
  const iconSize = size === "sm" ? 24 : size === "lg" ? 48 : 32;
  const fontSize = size === "sm" ? "sm" : size === "lg" ? "xl" : "md";

  return (
    <div
      className="flex flex-col items-center justify-center text-muted"
      style={{ padding: "var(--spacing-lg)" }}
    >
      <div className="mb-4">
        <Icon name="loader" size={iconSize} />
      </div>
      <p className={`text-${fontSize}`}>{message}</p>
    </div>
  );
};

interface ErrorDisplayProps {
  error: Error | ApiError;
  onRetry?: () => void;
  title?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry, title = "Error" }) => {
  const isApiError = error instanceof ApiError;

  return (
    <div
      className="rounded-lg m-4"
      style={{
        padding: "var(--spacing-lg)",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        border: "1px solid var(--color-error)",
      }}
    >
      <div className="flex items-center mb-4">
        <Icon
          name="alert-triangle"
          size={24}
          color="var(--color-error)"
          style={{ marginRight: "var(--spacing-sm)" }}
        />
        <h3 className="text-lg font-semibold m-0" style={{ color: "var(--color-error)" }}>
          {title}
        </h3>
      </div>

      <p className={`text-secondary ${onRetry ? "mb-4" : ""}`}>{error.message}</p>

      {isApiError && (
        <p className={`text-small ${onRetry ? "mb-4" : ""}`}>
          Status: {error.status} {error.statusText}
        </p>
      )}

      {onRetry && (
        <button onClick={onRetry} className="btn btn-secondary">
          Try Again
        </button>
      )}
    </div>
  );
};
