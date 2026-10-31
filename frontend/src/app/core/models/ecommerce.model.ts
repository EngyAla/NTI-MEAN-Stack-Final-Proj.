export interface Category {
  _id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  itemCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Item {
  _id: string;
  name: string;
  description: string;
  price: number;
  quantity?: number; // Only returned/visible in Manager dashboard
  category: Category | { _id: string; name: string };
  imageUrl: string;
  images?: string[];
  material?: string;
  dimensions?: string;
  isFeatured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerInfo {
  fullName: string;
  phone: string;
  address: string;
  notes?: string;
}

export interface OrderItem {
  item: string | Item;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  imageUrl?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customer: CustomerInfo;
  items: OrderItem[];
  totalPrice: number;
  status: 'opened' | 'closed';
  internalNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ManagerUser {
  id: string;
  name: string;
  email: string;
  role: 'manager';
}

export interface DashboardStats {
  totalCategories: number;
  totalItems: number;
  totalOrders: number;
  openedOrders: number;
  closedOrders: number;
  totalClosedRevenue: number;
  totalPipelineRevenue: number;
  recentOrders: Array<{
    _id: string;
    orderNumber: string;
    customer: { fullName: string; phone: string };
    totalPrice: number;
    status: 'opened' | 'closed';
    createdAt: string;
  }>;
}

export interface CartItem {
  item: Item;
  quantity: number;
}
