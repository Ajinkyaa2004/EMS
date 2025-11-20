import { useEffect } from 'react';
import { eventEmitter, EVENTS } from '../utils/eventEmitter';

/**
 * Hook to automatically refresh data when changes occur in other dashboards
 * @param callbacks Object mapping event names to callback functions
 */
export const useRealtimeUpdates = (callbacks: { [key: string]: () => void }) => {
  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    // Subscribe to all provided events
    Object.entries(callbacks).forEach(([event, callback]) => {
      const unsubscribe = eventEmitter.on(event, callback);
      unsubscribers.push(unsubscribe);
    });

    // Cleanup on unmount
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, []);
};

/**
 * Hook to refresh all data when any change occurs
 * @param refreshFunction Function to call when data changes
 */
export const useAutoRefresh = (refreshFunction: () => void) => {
  useEffect(() => {
    // Listen to all data change events
    const unsubscribers = [
      eventEmitter.on(EVENTS.TASK_CREATED, refreshFunction),
      eventEmitter.on(EVENTS.TASK_UPDATED, refreshFunction),
      eventEmitter.on(EVENTS.TASK_DELETED, refreshFunction),
      eventEmitter.on(EVENTS.PROJECT_CREATED, refreshFunction),
      eventEmitter.on(EVENTS.PROJECT_UPDATED, refreshFunction),
      eventEmitter.on(EVENTS.PROJECT_DELETED, refreshFunction),
      eventEmitter.on(EVENTS.EMPLOYEE_CREATED, refreshFunction),
      eventEmitter.on(EVENTS.EMPLOYEE_UPDATED, refreshFunction),
      eventEmitter.on(EVENTS.EMPLOYEE_DELETED, refreshFunction),
      eventEmitter.on(EVENTS.CLIENT_CREATED, refreshFunction),
      eventEmitter.on(EVENTS.CLIENT_UPDATED, refreshFunction),
      eventEmitter.on(EVENTS.CLIENT_DELETED, refreshFunction),
      eventEmitter.on(EVENTS.UPDATE_CREATED, refreshFunction),
      eventEmitter.on(EVENTS.UPDATE_UPDATED, refreshFunction),
      eventEmitter.on(EVENTS.UPDATE_DELETED, refreshFunction),
      eventEmitter.on(EVENTS.MESSAGE_SENT, refreshFunction),
      eventEmitter.on(EVENTS.ATTENDANCE_MARKED, refreshFunction),
      eventEmitter.on(EVENTS.REFRESH_ALL, refreshFunction),
    ];

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [refreshFunction]);
};
