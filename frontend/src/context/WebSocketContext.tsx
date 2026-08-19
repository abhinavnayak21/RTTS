'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Info,
  X,
} from 'lucide-react';
import '../components/ui/toast.css';

export interface WebSocketEvent<T = any> {
  event: 'TICKET_CREATED' | 'TICKET_UPDATED' | 'TICKET_DELETED' | string;
  data: T;
}

export interface ToastNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'danger';
  title: string;
  message: string;
}

type EventListener = (event: WebSocketEvent) => void;

interface WebSocketContextType {
  isConnected: boolean;
  subscribe: (listener: EventListener) => () => void;
  showToast: (toast: Omit<ToastNotification, 'id'>) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const listenersRef = useRef<Set<EventListener>>(new Set());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<ToastNotification, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev.slice(-4), { ...toast, id }]); // max 5 toasts

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  const subscribe = useCallback((listener: EventListener) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const connect = useCallback(() => {
    if (!token || !isAuthenticated) return;

    // Clean up previous connection if any
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {}
      wsRef.current = null;
    }

    // Determine WebSocket URL
    const rawApiUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      (typeof window !== 'undefined' && (window as any).__ENV_API_URL) ||
      'https://rtts-backend.onrender.com';

    const cleanBase = rawApiUrl.replace(/\/+$/, '');
    const wsProto = cleanBase.startsWith('https') ? 'wss' : 'ws';
    const host = cleanBase.replace(/^https?:\/\//, '');
    const wsUrl = `${wsProto}://${host}/ws/tickets?token=${token}`;

    try {
      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        setIsConnected(true);
        retryCountRef.current = 0;
      };

      socket.onmessage = (event) => {
        try {
          const parsed: WebSocketEvent = JSON.parse(event.data);

          // Dispatch to all subscribed components (Kanban, Dashboard, Tables)
          listenersRef.current.forEach((listener) => {
            try {
              listener(parsed);
            } catch (err) {
              console.error('Error in WS subscriber:', err);
            }
          });

          // Show floating toast notification
          if (parsed.event === 'TICKET_CREATED') {
            showToast({
              type: 'info',
              title: 'New Ticket Created',
              message: `#${parsed.data?.id}: ${parsed.data?.title || 'Support inquiry'}`,
            });
          } else if (parsed.event === 'TICKET_UPDATED') {
            showToast({
              type: 'success',
              title: `Ticket #${parsed.data?.id} Updated`,
              message: `Status: ${parsed.data?.status || ''} • Priority: ${parsed.data?.priority || ''}`,
            });
          } else if (parsed.event === 'TICKET_DELETED') {
            showToast({
              type: 'warning',
              title: 'Ticket Deleted',
              message: `Ticket #${parsed.data?.id} has been removed.`,
            });
          }
        } catch (err) {
          // Ignore ping/pong text
        }
      };

      socket.onclose = () => {
        setIsConnected(false);
        wsRef.current = null;

        // Auto-reconnect with exponential backoff if user is still logged in
        if (token && isAuthenticated) {
          const timeout = Math.min(1000 * 2 ** retryCountRef.current, 15000);
          retryCountRef.current += 1;
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, timeout);
        }
      };

      socket.onerror = () => {
        setIsConnected(false);
      };
    } catch (err) {
      console.error('WebSocket connection attempt failed:', err);
    }
  }, [token, isAuthenticated, showToast]);

  useEffect(() => {
    if (isAuthenticated && token) {
      connect();
    } else {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setIsConnected(false);
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [isAuthenticated, token, connect]);

  const getToastIcon = (type: ToastNotification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} className="toast-icon success" />;
      case 'warning':
        return <AlertCircle size={18} className="toast-icon warning" />;
      case 'danger':
        return <AlertCircle size={18} className="toast-icon danger" />;
      default:
        return <Bell size={18} className="toast-icon info" />;
    }
  };

  return (
    <WebSocketContext.Provider value={{ isConnected, subscribe, showToast }}>
      {children}

      {/* Floating Toast Notification Container */}
      {toasts.length > 0 && (
        <div className="toast-container">
          {toasts.map((toast) => (
            <div key={toast.id} className={`toast-item ${toast.type}`}>
              {getToastIcon(toast.type)}
              <div className="toast-content">
                <div className="toast-title">{toast.title}</div>
                <div className="toast-message">{toast.message}</div>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="toast-close-btn"
                title="Dismiss"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
