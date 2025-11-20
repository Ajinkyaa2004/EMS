// Simple event emitter for cross-component/dashboard communication
type EventCallback = (data?: any) => void;

class EventEmitter {
  private events: { [key: string]: EventCallback[] } = {};

  // Subscribe to an event
  on(event: string, callback: EventCallback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);

    // Return unsubscribe function
    return () => {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    };
  }

  // Emit an event
  emit(event: string, data?: any) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }

  // Remove all listeners for an event
  off(event: string) {
    delete this.events[event];
  }
}

// Create singleton instance
export const eventEmitter = new EventEmitter();

// Event names for different data types
export const EVENTS = {
  TASK_CREATED: 'task:created',
  TASK_UPDATED: 'task:updated',
  TASK_DELETED: 'task:deleted',
  PROJECT_CREATED: 'project:created',
  PROJECT_UPDATED: 'project:updated',
  PROJECT_DELETED: 'project:deleted',
  EMPLOYEE_CREATED: 'employee:created',
  EMPLOYEE_UPDATED: 'employee:updated',
  EMPLOYEE_DELETED: 'employee:deleted',
  CLIENT_CREATED: 'client:created',
  CLIENT_UPDATED: 'client:updated',
  CLIENT_DELETED: 'client:deleted',
  UPDATE_CREATED: 'update:created',
  UPDATE_UPDATED: 'update:updated',
  UPDATE_DELETED: 'update:deleted',
  MESSAGE_SENT: 'message:sent',
  ATTENDANCE_MARKED: 'attendance:marked',
  REFRESH_ALL: 'data:refresh_all',
};
