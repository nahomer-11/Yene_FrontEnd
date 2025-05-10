
import axios from 'axios';

// Base API configuration
const API_URL = 'https://yenebackend.vercel.app/yene_api';

// Create main axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          // No refresh token available, redirect to login
          throw new Error('No refresh token available');
        }

        // Attempt to refresh token
        const response = await axios.post(`${API_URL}/user/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        
        // Store the new token
        localStorage.setItem('access_token', access);
        
        // Update authorization header
        originalRequest.headers['Authorization'] = `Bearer ${access}`;
        
        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh token failed, clear tokens and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// ===== Type Definitions =====

// User Types
export interface RegisterUserData {
  full_name: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  password: string;
}

export interface LoginUserData {
  email: string;
  password: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    // Add other user fields as needed
  };
}

export interface TokenRefreshData {
  refresh: string;
}

export interface TokenRefreshResponse {
  access: string;
}

// Product Types
export interface ProductVariantImage {
  image_url: string;
}

export interface ProductVariant {
  id: string;
  color: string;
  size: string;
  extra_price: string;
  images: ProductVariantImage[];
  product?: Product;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  image_url: string;
  base_price: string;
  variants: ProductVariant[];
}

export interface FeaturedCategory {
  title: string;
  description: string;
  image: string;
}

export interface CreateProductData {
  name: string;
  description: string;
  image_url: string;
  base_price: string;
  variants?: {
    color: string;
    size: string;
    extra_price: string;
    images: { image_url: string }[];
  }[];
}

export interface CreateProductVariantData {
  product: string;
  color: string;
  size: string;
  extra_price: string;
}

export interface CreateAdminProductData {
  name: string;
  description: string;
  base_price: number;
  image_url?: string;
}

// Order Types
export interface OrderItem {
  product_variant: string;
  quantity: number;
}

export interface OrderItemResponse {
  product_variant: string;
  quantity: number;
  price_per_unit: string;
}

export interface CreateOrderData {
  delivery_eta_days: number;
  customer_note: string;
  guest_name: string;
  guest_phone: string;
  guest_city: string;
  guest_address: string;
  items: OrderItem[];
}

export interface Order {
  order_code: string;
  status: string;
  total_price: string;
  items?: OrderItemResponse[];
  created_at?: string;
}

// Admin/Dashboard Types
export interface AdminUser {
  id: string;
  email: string;
  is_active: boolean;
}

export interface AdminOrderItem {
  product_variant: {
    id: string;
    color: string;
    size: string;
    extra_price?: string;
    product?: {
      id: string;
      name: string;
      image_url?: string;
      base_price?: string;
    };
  };
  quantity: number;
  total_price: string;
}

export interface AdminOrder {
  order_code: string;
  status: string;
  payment_method?: string;
  paid_amount?: number | null;
  delivery_eta_days?: number;
  customer_note?: string;
  guest_name?: string;
  guest_phone?: string;
  guest_city?: string;
  guest_address?: string;
  user?: string;
  total?: number;
  total_price?: string;
  items: AdminOrderItem[];
  created_at?: string;
}

// ===== API Services =====

// User Service
export const userService = {
  // Register a new user
  register: async (userData: RegisterUserData): Promise<AuthResponse> => {
    const response = await apiClient.post('/user/register/', userData);
    return response.data;
  },

  // Login user
  login: async (credentials: LoginUserData): Promise<AuthResponse> => {
    const response = await apiClient.post('/user/login/', credentials);
    
    // Store tokens in localStorage
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
    }
    
    if (response.data.refresh) {
      localStorage.setItem('refresh_token', response.data.refresh);
    }
    
    return response.data;
  },

  // Refresh access token
  refreshToken: async (refreshData: TokenRefreshData): Promise<TokenRefreshResponse> => {
    const response = await apiClient.post('/user/token/refresh/', refreshData);
    
    // Update access token in localStorage
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
    }
    
    return response.data;
  },

  // Logout - clear tokens from localStorage
  logout: (): void => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  // Check if user is logged in
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('access_token');
  }
};

// Product Service
export const productService = {
  // Get all products
  getAllProducts: async (): Promise<Product[]> => {
    try {
      console.log('Fetching products from API');
      // Add cache-busting timestamp parameter to prevent browser caching
      const timestamp = new Date().getTime();
      const response = await apiClient.get(`/products/?_=${timestamp}`);
      console.log('Products received:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Get single product by ID
  getProductById: async (productId: string): Promise<Product> => {
    const timestamp = new Date().getTime();
    const response = await apiClient.get(`/products/${productId}/?_=${timestamp}`);
    return response.data;
  },

  // Get all featured categories
  getFeaturedCategories: async (): Promise<FeaturedCategory[]> => {
    const response = await apiClient.get('/products/featured-categories/');
    return response.data;
  },
};

// Order Service
export const orderService = {
  // Create new order
  createOrder: async (orderData: CreateOrderData): Promise<Order> => {
    const response = await apiClient.post('/orders/', orderData);
    return response.data;
  },

  // Get user orders (if authenticated)
  getUserOrders: async (): Promise<Order[]> => {
    const response = await apiClient.get('/orders/');
    return response.data;
  }
};

// Admin Service
export const adminService = {
  // Admin Products
  getAdminProducts: async (): Promise<Product[]> => {
    const timestamp = new Date().getTime();
    const response = await apiClient.get(`/dashboard/yene_admin/products/?_=${timestamp}`);
    return response.data;
  },

  getAdminProductById: async (productId: string): Promise<Product> => {
    const timestamp = new Date().getTime();
    const response = await apiClient.get(`/dashboard/yene_admin/products/${productId}/?_=${timestamp}`);
    return response.data;
  },

  createAdminProduct: async (productData: CreateAdminProductData): Promise<Product> => {
    const response = await apiClient.post('/dashboard/yene_admin/products/', productData);
    return response.data;
  },

  updateAdminProduct: async (productId: string, productData: Partial<CreateAdminProductData>): Promise<Product> => {
    const response = await apiClient.put(`/dashboard/yene_admin/products/${productId}/`, productData);
    return response.data;
  },

  deleteAdminProduct: async (productId: string): Promise<void> => {
    await apiClient.delete(`/dashboard/yene_admin/products/${productId}/`);
  },

  // Admin Product Variants
  createProductVariant: async (variantData: CreateProductVariantData): Promise<ProductVariant> => {
    const response = await apiClient.post('/dashboard/yene_admin/product-variants/', variantData);
    return response.data;
  },

  // Admin Orders
  getAdminOrders: async (): Promise<AdminOrder[]> => {
    const timestamp = new Date().getTime();
    const response = await apiClient.get(`/dashboard/yene_admin/orders/?_=${timestamp}`);
    return response.data;
  },

  getOrderByCode: async (orderCode: string): Promise<AdminOrder> => {
    const timestamp = new Date().getTime();
    const response = await apiClient.get(`/dashboard/yene_admin/orders/${orderCode}/?_=${timestamp}`);
    return response.data;
  },

  updateOrderStatus: async (orderCode: string, status: string): Promise<AdminOrder> => {
    const response = await apiClient.put(`/dashboard/yene_admin/orders/${orderCode}/`, { status });
    return response.data;
  },

  deleteOrder: async (orderCode: string): Promise<void> => {
    await apiClient.delete(`/dashboard/yene_admin/orders/${orderCode}/`);
  },

  // Admin Users
  getAdminUsers: async (): Promise<AdminUser[]> => {
    const response = await apiClient.get('/dashboard/yene_admin/users/');
    return response.data;
  },

  getUserById: async (userId: string): Promise<AdminUser> => {
    const response = await apiClient.get(`/dashboard/yene_admin/users/${userId}/`);
    return response.data;
  }
};

// Export dashboardService as an alias for adminService for backward compatibility
export const dashboardService = adminService;

// Export all services
export default {
  apiClient,
  userService,
  productService,
  orderService,
  adminService,
  dashboardService
};
