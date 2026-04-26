'use client';

import { useEffect, useRef } from 'react';
import { X, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';

type ModalVariant = 'info' | 'success' | 'error' | 'warning' | 'confirm';

interface ModalAction {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'danger' | 'ghost';
}

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children?: React.ReactNode;
    variant?: ModalVariant;
    message?: string;
    actions?: ModalAction[];
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const variantConfig: Record<ModalVariant, {
    icon: React.ReactNode;
    iconBg: string;
    titleColor: string;
    headerGradient: string;
}> = {
    info: {
        icon: <Info className="w-6 h-6 text-blue-600" />,
        iconBg: 'bg-blue-100',
        titleColor: 'text-blue-700',
        headerGradient: 'from-blue-50 to-indigo-50',
    },
    success: {
        icon: <CheckCircle className="w-6 h-6 text-emerald-600" />,
        iconBg: 'bg-emerald-100',
        titleColor: 'text-emerald-700',
        headerGradient: 'from-emerald-50 to-green-50',
    },
    error: {
        icon: <XCircle className="w-6 h-6 text-red-600" />,
        iconBg: 'bg-red-100',
        titleColor: 'text-red-700',
        headerGradient: 'from-red-50 to-rose-50',
    },
    warning: {
        icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
        iconBg: 'bg-amber-100',
        titleColor: 'text-amber-700',
        headerGradient: 'from-amber-50 to-yellow-50',
    },
    confirm: {
        icon: <AlertTriangle className="w-6 h-6 text-orange-600" />,
        iconBg: 'bg-orange-100',
        titleColor: 'text-orange-700',
        headerGradient: 'from-orange-50 to-amber-50',
    },
};

const maxWidthMap = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
};

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    variant = 'info',
    message,
    actions,
    maxWidth = 'md',
}: ModalProps) {
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const config = variantConfig[variant];

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === overlayRef.current) onClose();
    };

    return (
        <div
            ref={overlayRef}
            onClick={handleOverlayClick}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(4px)',
                animation: 'fadeIn 0.15s ease-out',
            }}
        >
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>

            <div
                className={`relative bg-white rounded-2xl shadow-2xl w-full ${maxWidthMap[maxWidth]} overflow-hidden border border-gray-100`}
                style={{ animation: 'slideUp 0.2s ease-out' }}
            >
                {/* Header */}
                <div className={`bg-gradient-to-r ${config.headerGradient} px-6 py-5 flex items-start gap-4`}>
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full ${config.iconBg} flex items-center justify-center`}>
                        {config.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        {title && (
                            <h3 className={`text-base font-bold ${config.titleColor} leading-tight`}>
                                {title}
                            </h3>
                        )}
                        {message && (
                            <p className="mt-1 text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                                {message}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="flex-shrink-0 w-8 h-8 rounded-full bg-white/60 hover:bg-white flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                {children && (
                    <div className="px-6 py-5 text-sm text-gray-700">
                        {children}
                    </div>
                )}

                {/* Actions */}
                {actions && actions.length > 0 && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                        {actions.map((action, idx) => (
                            <button
                                key={idx}
                                onClick={action.onClick}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${action.variant === 'danger'
                                        ? 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
                                        : action.variant === 'ghost'
                                            ? 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 focus:ring-gray-300'
                                            : 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500'
                                    }`}
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
