
import { AppState, Project } from '../types';

const STORAGE_KEY = 'stockmaster_pro_data';

export const saveState = (state: AppState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const loadState = (): AppState => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return { projects: [], activeProjectId: null };
  return JSON.parse(data);
};

export const exportProject = (project: Project) => {
  const dataStr = JSON.stringify(project);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
  const exportFileDefaultName = `${project.name.replace(/\s+/g, '_')}_stock_data.json`;

  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

export const importProjectFromFile = (file: File): Promise<Project> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const project = JSON.parse(event.target?.result as string);
        resolve(project);
      } catch (e) {
        reject(new Error("Invalid file format"));
      }
    };
    reader.onerror = () => reject(new Error("Error reading file"));
    reader.readAsText(file);
  });
};
