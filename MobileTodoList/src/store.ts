import {create} from 'zustand';
import {nanoid} from 'nanoid/non-secure';

export type NavPreference = 'apple' | 'google' | 'waze';

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
};

type TodoStore = {
  tasks: Task[];
  navPreference: NavPreference;
  addTask: (input: AddTaskInput) => void;
  toggleComplete: (id: string) => void;
  removeTask: (id: string) => void;
  setNavPreference: (value: NavPreference) => void;
  updateTaskLocation: (
    id: string,
    location: {locationLabel?: string; latitude?: number; longitude?: number},
  ) => void;
};

export const useTodoStore = create<TodoStore>((set, get) => ({
  tasks: [],
  navPreference: 'apple',
  addTask: input => {
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
      completed: false,
    };
    set(state => ({tasks: [task, ...state.tasks]}));
  },
  toggleComplete: id => {
    set(state => ({
      tasks: state.tasks.map(task =>
        task.id === id ? {...task, completed: !task.completed} : task,
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
        task.id === id ? {...task, ...location} : task,
      ),
    }));
  },
}));
