import {create} from 'zustand';
import {nanoid} from 'nanoid/non-secure';

export type NavPreference = 'apple' | 'google' | 'waze';

export type Comment = {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
};

export type Task = {
  id: string;
  title: string;
  note?: string;
  completed: boolean;
  locationLabel?: string;
  latitude?: number;
  longitude?: number;
  imageUri?: string;
  productBrand?: string;
  productDetails?: string;
  quantity?: number;
  dueDate?: number;
  priority?: 'low' | 'medium' | 'high';
  createdBy?: string;
  sharedWith?: string[];
  comments?: Comment[];
  lastModified?: number;
};

type AddTaskInput = {
  title: string;
  note?: string;
  locationLabel?: string;
  latitude?: number;
  longitude?: number;
  imageUri?: string;
  productBrand?: string;
  productDetails?: string;
  quantity?: number;
  dueDate?: number;
  priority?: 'low' | 'medium' | 'high';
};

type TodoStore = {
  tasks: Task[];
  navPreference: NavPreference;
  currentUserId?: string;
  currentUserName?: string;
  addTask: (input: AddTaskInput) => void;
  toggleComplete: (id: string) => void;
  removeTask: (id: string) => void;
  setNavPreference: (value: NavPreference) => void;
  updateTaskLocation: (
    id: string,
    location: {locationLabel?: string; latitude?: number; longitude?: number},
  ) => void;
  addComment: (taskId: string, text: string) => void;
  shareTask: (taskId: string, appleId: string) => void;
  setCurrentUser: (userId: string, userName: string) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
};

export const useTodoStore = create<TodoStore>((set, get) => ({
  tasks: [],
  navPreference: 'apple',
  currentUserId: undefined,
  currentUserName: undefined,
  addTask: input => {
    const state = get();
    const task: Task = {
      id: nanoid(),
      title: input.title,
      note: input.note,
      locationLabel: input.locationLabel,
      latitude: input.latitude,
      longitude: input.longitude,
      imageUri: input.imageUri,
      productBrand: input.productBrand,
      productDetails: input.productDetails,
      quantity: input.quantity,
      dueDate: input.dueDate,
      priority: input.priority || 'medium',
      completed: false,
      createdBy: state.currentUserId,
      sharedWith: [],
      comments: [],
      lastModified: Date.now(),
    };
    set(state => ({tasks: [task, ...state.tasks]}));
  },
  toggleComplete: id => {
    set(state => ({
      tasks: state.tasks.map(task =>
        task.id === id ? {...task, completed: !task.completed, lastModified: Date.now()} : task,
      ),
    }));
  },
  removeTask: id => {
    set(state => ({tasks: state.tasks.filter(task => task.id !== id)}));
  },
  setNavPreference: value => set({navPreference: value}),
  updateTaskLocation: (id, location) => {
    set(state => ({
      tasks: state.tasks.map(task =>
        task.id === id ? {...task, ...location, lastModified: Date.now()} : task,
      ),
    }));
  },
  addComment: (taskId, text) => {
    const state = get();
    set({
      tasks: state.tasks.map(task =>
        task.id === taskId
          ? {
              ...task,
              comments: [
                ...(task.comments || []),
                {
                  id: nanoid(),
                  userId: state.currentUserId || 'anonymous',
                  userName: state.currentUserName || 'Anonymous',
                  text,
                  timestamp: Date.now(),
                },
              ],
              lastModified: Date.now(),
            }
          : task
      ),
    });
  },
  shareTask: (taskId, appleId) => {
    set(state => ({
      tasks: state.tasks.map(task =>
        task.id === taskId
          ? {
              ...task,
              sharedWith: [...(task.sharedWith || []), appleId],
              lastModified: Date.now(),
            }
          : task
      ),
    }));
  },
  setCurrentUser: (userId, userName) => {
    set({currentUserId: userId, currentUserName: userName});
  },
  updateTask: (taskId, updates) => {
    set(state => ({
      tasks: state.tasks.map(task =>
        task.id === taskId
          ? {...task, ...updates, lastModified: Date.now()}
          : task
      ),
    }));
  },
}));
