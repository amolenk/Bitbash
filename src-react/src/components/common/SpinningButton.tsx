import React from "react";

interface SpinningButtonProps {
    loading: boolean;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
    className?: string;
    children: React.ReactNode;
}

export default function SpinningButton({
    loading,
    disabled,
    type = "submit",
    className = "",
    children
}: SpinningButtonProps) {
    const baseClass = "btn btn-primary text-light";
    return (
        <button
            type={type}
            className={`${baseClass} ${className}`.trim()}
            disabled={loading || disabled}
        >
            {loading && (
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            )}
            {children}
        </button>
    );
}
