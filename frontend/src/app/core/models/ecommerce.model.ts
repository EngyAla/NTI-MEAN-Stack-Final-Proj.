export interface BilingualText {
  en: string;
  ar: string;
}

export interface Category {
  _id: string;
  name: string;
  nameEn?: string;
  nameAr?: string;
  nameObj?: BilingualText;
  description?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  descriptionObj?: BilingualText;
  imageUrl?: string;
  image?: string;
  itemCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Item {
  _id: string;
  name: string;
  nameEn?: string;
  nameAr?: string;
  nameObj?: BilingualText;
  description: string;
  descriptionEn?: string;
  descriptionAr?: string;
  descriptionObj?: BilingualText;
  price: number;
  quantity?: number; // Only returned/visible in Manager dashboard
  category: string | Category | { _id: string; name: string };
  categoryName?: string;
  imageUrl: string;
  image?: string;
  images?: string[];
  material?: string;
  materialEn?: string;
  materialAr?: string;
  materialObj?: BilingualText;
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
  nameObj?: BilingualText;
  price: number;
  quantity: number;
  subtotal: number;
  imageUrl?: string;
  image?: string;
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
