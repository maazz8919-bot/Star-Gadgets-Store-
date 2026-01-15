
export interface StockLog {
  id: string;
  productId: string;
  type: 'IN' | 'OUT';
  quantity: number;
  timestamp: number;
}

export interface Product {
  id: string;
  image: string;
  title: string;
  mrp: number;
  stock: number;
  category: string;
  createdAt: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  products: Product[];
  history: StockLog[];
  createdAt: number;
}

export interface AppState {
  projects: Project[];
  activeProjectId: string | null;
}
