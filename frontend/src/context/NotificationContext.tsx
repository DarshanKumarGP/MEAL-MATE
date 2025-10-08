import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import api from '../services/api';

interface NotificationContextValue {
  permission: NotificationPermission;
  requestPermission: () => Promise<void>;
  sendNotification: (title: string, body: string, data?: any) => void;
  isSupported: boolean;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const { user } = useAuth();
  const { addToast } = useToast();
  const isSupported = 'Notification' in window && 'serviceWorker' in navigator;

  useEffect(() => {
    if (isSupported) {
      setPermission(Notification.permission);
      
      // Register service worker
      registerServiceWorker();
      
      // Subscribe to order updates if user is logged in
      if (user && permission === 'granted') {
        subscribeToUpdates();
      }
    }
  }, [user, permission]);

  const registerServiceWorker = async () => {
  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('SW registered successfully:', registration);
    }
  } catch (error) {
    console.error('SW registration failed:', error);
  }
};

  const requestPermission = async () => {
    if (!isSupported) {
      addToast('Notifications not supported in this browser', 'error');
      return;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    
    if (result === 'granted') {
      addToast('Notifications enabled! You\'ll get order updates.', 'success');
      if (user) subscribeToUpdates();
    } else {
      addToast('Notification permission denied', 'error');
    }
  };

  const subscribeToUpdates = async () => {
    try {
      // In a real app, you'd register for push notifications here
      // For demo, we'll simulate with polling
      pollForUpdates();
    } catch (error) {
      console.error('Failed to subscribe to notifications:', error);
    }
  };

  const pollForUpdates = () => {
    // Simulate checking for order updates every 30 seconds
    const interval = setInterval(async () => {
      try {
        const { data } = await api.get('/orders/orders/?status=PREPARING,READY,OUT_FOR_DELIVERY');
        const activeOrders = data.results || [];
        
        // This would normally be handled by push notifications
        // For demo, we check if any orders have status changes
        activeOrders.forEach((order: any) => {
          if (order.status === 'READY') {
            sendNotification(
              '🍽️ Order Ready!',
              `Your order #${order.order_number} is ready for pickup!`,
              { orderId: order.id, type: 'order_ready' }
            );
          } else if (order.status === 'OUT_FOR_DELIVERY') {
            sendNotification(
              '🚚 On the way!',
              `Your order #${order.order_number} is out for delivery!`,
              { orderId: order.id, type: 'out_for_delivery' }
            );
          }
        });
      } catch (error) {
        console.error('Failed to check order updates:', error);
      }
    }, 30000);

    return () => clearInterval(interval);
  };

  const sendNotification = (title: string, body: string, data?: any) => {
  if (!isSupported || permission !== 'granted') return;

  const notification = new Notification(title, {
    body,
    icon: '/logo192.png',
    badge: '/logo192.png',
    data,
    requireInteraction: true
    // Remove 'actions' - not supported in basic Notification API
  });

  notification.onclick = () => {
    window.focus();
    if (data?.orderId) {
      window.location.href = `/orders/${data.orderId}`;
    }
    notification.close();
  };

  // Auto close after 10 seconds
  setTimeout(() => notification.close(), 10000);
};


  return (
    <NotificationContext.Provider value={{
      permission,
      requestPermission,
      sendNotification,
      isSupported
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextValue => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be inside NotificationProvider');
  return context;
};
