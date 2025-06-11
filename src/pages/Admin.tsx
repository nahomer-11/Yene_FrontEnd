
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService, userService, ProductVariant, CreateProductVariantData, AdminOrder, Product, CreateAdminProductData } from '@/api/yene_api';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Package, ShoppingBag, Users, Edit, Trash, Plus, Search } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip, ResponsiveContainer } from 'recharts';

// AddProductForm component with a scrollable area
const AddProductForm = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Product variant state
  const [variants, setVariants] = useState<Array<{
    color: string;
    size: string;
    extra_price: string;
    images: { image_url: string }[];
  }>>([]);
  const [currentVariant, setCurrentVariant] = useState({
    color: '',
    size: '',
    extra_price: '0',
    images: [{ image_url: '' }]
  });
  
  const queryClient = useQueryClient();
  
  // Reset add product form
  const resetAddProductForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setImageUrl('');
    setVariants([]);
  };

  // Add product handler
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !description || !price) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      
      // Create product first with the required base_price field
      const newProduct = await adminService.createAdminProduct({
        name,
        description,
        base_price: parseFloat(price),
        image_url: imageUrl
      });
      
      // Then add variants if any
      if (variants && variants.length > 0) {
        for (const variant of variants) {
          const variantData: CreateProductVariantData = {
            product: newProduct.id,
            color: variant.color,
            size: variant.size,
            extra_price: variant.extra_price
          };
          
          // Create the variant
          await adminService.createProductVariant(variantData);
        }
      }
      
      // Invalidate and refetch products query
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      
      toast.success('Product added successfully');
      resetAddProductForm();
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  // Add variant to the list
  const handleAddVariant = () => {
    if (!currentVariant.color || !currentVariant.size) {
      toast.error('Please fill in color and size for the variant');
      return;
    }
    
    setVariants([...variants, {...currentVariant}]);
    setCurrentVariant({
      color: '',
      size: '',
      extra_price: '0',
      images: [{ image_url: '' }]
    });
  };

  // Add variant image field
  const addVariantImageField = () => {
    setCurrentVariant({
      ...currentVariant,
      images: [...(currentVariant.images || []), { image_url: '' }]
    });
  };

  // Update variant image
  const handleVariantImageChange = (index: number, value: string) => {
    const updatedImages = [...(currentVariant.images || [])];
    updatedImages[index] = { image_url: value };
    setCurrentVariant({
      ...currentVariant,
      images: updatedImages
    });
  };

  // Remove variant
  const removeVariant = (index: number) => {
    const updatedVariants = [...variants];
    updatedVariants.splice(index, 1);
    setVariants(updatedVariants);
  };
  
  return (
    <ScrollArea className="h-[70vh]">
      <form onSubmit={handleAddProduct} className="space-y-4 py-4 px-1">
        <div className="grid gap-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input 
              id="name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3" 
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">Description</Label>
            <Input 
              id="description" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3" 
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">Base Price</Label>
            <Input 
              id="price" 
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="col-span-3" 
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="image" className="text-right">Main Image URL</Label>
            <Input 
              id="image" 
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="col-span-3" 
            />
          </div>
        </div>
        
        {/* Variants Section */}
        <div className="border-t pt-4 mt-4">
          <h3 className="text-lg font-medium mb-4">Variants</h3>
          
          {/* List of added variants */}
          {variants && variants.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Added Variants</h4>
              <div className="space-y-2">
                {variants.map((variant, idx) => (
                  <div key={idx} className="flex items-center justify-between border rounded-md p-3">
                    <div>
                      <p className="font-medium">{variant.color} - {variant.size}</p>
                      <p className="text-sm text-muted-foreground">
                        Extra Price: {variant.extra_price} ETB | 
                        Images: {(variant.images || []).filter(img => img.image_url).length}
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      type="button"
                      onClick={() => removeVariant(idx)}
                    >
                      <Trash className="h-4 w-4 mr-1" /> Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Add new variant form */}
          <div className="bg-muted/50 p-3 rounded-md">
            <h4 className="text-sm font-medium mb-3">Add New Variant</h4>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="variant-color">Color</Label>
                  <Input
                    id="variant-color"
                    placeholder="Red, Blue, etc."
                    value={currentVariant.color}
                    onChange={(e) => setCurrentVariant({...currentVariant, color: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="variant-size">Size</Label>
                  <Input
                    id="variant-size"
                    placeholder="S, M, L, XL, etc."
                    value={currentVariant.size}
                    onChange={(e) => setCurrentVariant({...currentVariant, size: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="variant-price">Extra Price</Label>
                <Input
                  id="variant-price"
                  type="number"
                  placeholder="Additional cost for this variant"
                  value={currentVariant.extra_price}
                  onChange={(e) => setCurrentVariant({...currentVariant, extra_price: e.target.value})}
                />
              </div>
              
              {/* Variant Images */}
              <div>
                <div className="flex items-center justify-between">
                  <Label>Variant Images</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={addVariantImageField}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add Image
                  </Button>
                </div>
                <div className="space-y-2 mt-2">
                  {(currentVariant.images || []).map((image, idx) => (
                    <Input
                      key={idx}
                      placeholder="Image URL"
                      value={image.image_url}
                      onChange={(e) => handleVariantImageChange(idx, e.target.value)}
                    />
                  ))}
                </div>
              </div>
              
              <Button 
                type="button" 
                onClick={handleAddVariant} 
                variant="secondary" 
                className="w-full"
              >
                Add Variant
              </Button>
            </div>
          </div>
        </div>
        
        <DialogFooter className="pt-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Product'}
          </Button>
        </DialogFooter>
      </form>
    </ScrollArea>
  );
};

// EditProductForm component with a scrollable area
const EditProductForm = ({ product, onClose }: { product: Product, onClose: () => void }) => {
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(product.base_price);
  const [imageUrl, setImageUrl] = useState(product.image_url || '');
  const [loading, setLoading] = useState(false);
  const [editVariants, setEditVariants] = useState<ProductVariant[]>(product.variants || []);
  const [isAddingVariant, setIsAddingVariant] = useState(false);
  const queryClient = useQueryClient();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !description || !price) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      await adminService.updateAdminProduct(product.id, {
        name,
        description,
        base_price: parseFloat(price.toString()),
        image_url: imageUrl
      });
      
      // Update for variants would go here
      // This would require additional API endpoints not shown in the provided API client
      
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      toast.success('Product updated successfully');
      onClose();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollArea className="h-[70vh]">
      <form onSubmit={handleSubmit} className="space-y-4 py-4 px-1">
        <div className="grid gap-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-name" className="text-right">Name</Label>
            <Input 
              id="edit-name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3" 
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-description" className="text-right">Description</Label>
            <Input 
              id="edit-description" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3" 
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-price" className="text-right">Price</Label>
            <Input 
              id="edit-price" 
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="col-span-3" 
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-image" className="text-right">Image URL</Label>
            <Input 
              id="edit-image" 
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="col-span-3" 
            />
          </div>
        </div>

        {/* Edit Existing Variants Section */}
        {editVariants && editVariants.length > 0 && (
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium mb-4">Current Variants</h3>
            <div className="space-y-3">
              {editVariants.map((variant, idx) => (
                <div key={idx} className="border rounded-md p-3">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{variant.color} - {variant.size}</h4>
                    <p className="text-sm">Extra Price: {variant.extra_price} ETB</p>
                  </div>
                  
                  {/* Variant Images */}
                  {variant.images && variant.images.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground mb-2">Variant Images:</p>
                      <div className="flex overflow-x-auto gap-2 pb-2">
                        {variant.images.map((img, imgIdx) => (
                          <div key={imgIdx} className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                            {img.image_url ? (
                              <img 
                                src={img.image_url} 
                                alt={`Variant ${idx} image ${imgIdx}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <Package size={16} />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Note: To add new variants or modify existing ones, please save your changes first and then use the
              variant management section.
            </p>
          </div>
        )}
        
        {/* Add new variant section could go here */}
        {isAddingVariant && (
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium mb-2">Add New Variant</h3>
            {/* New variant form would go here */}
          </div>
        )}
        
        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="mr-2">
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </form>
    </ScrollArea>
  );
};

// Order Details Component
const OrderDetails = ({ order }: { order: AdminOrder }) => {
  const [status, setStatus] = useState(order.status || 'draft');
  const [updating, setUpdating] = useState(false);
  const queryClient = useQueryClient();

  // Update order status using PUT
  const handleStatusUpdate = async () => {
    try {
      setUpdating(true);
      await adminService.updateOrderStatus(order.order_code, status);
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      toast.success('Order status updated successfully');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <ScrollArea className="h-[70vh]">
      <div className="space-y-6 p-1">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium text-sm text-muted-foreground">Order Code</h3>
            <p className="font-semibold">#{order.order_code}</p>
          </div>
          {order.created_at && (
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Date</h3>
              <p className="font-semibold">{new Date(order.created_at).toLocaleDateString()}</p>
            </div>
          )}
          <div>
            <h3 className="font-medium text-sm text-muted-foreground">Customer</h3>
            <p className="font-semibold">{order.guest_name || order.user || 'Anonymous'}</p>
          </div>
          <div>
            <h3 className="font-medium text-sm text-muted-foreground">Total</h3>
            <p className="font-semibold">
              {(order.total || parseFloat(order.total_price || '0'))?.toLocaleString()} ETB
            </p>
          </div>
          
          {order.payment_method && (
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Payment Method</h3>
              <p className="font-semibold">{order.payment_method || 'Not specified'}</p>
            </div>
          )}
          
          {order.paid_amount !== undefined && (
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Paid Amount</h3>
              <p className="font-semibold">
                {order.paid_amount !== null ? `${order.paid_amount.toLocaleString()} ETB` : 'Not paid'}
              </p>
            </div>
          )}
          
          {order.delivery_eta_days !== undefined && (
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Delivery ETA</h3>
              <p className="font-semibold">{order.delivery_eta_days} days</p>
            </div>
          )}
          
          {order.guest_phone && (
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Phone</h3>
              <p className="font-semibold">{order.guest_phone}</p>
            </div>
          )}
          {order.guest_city && (
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">City</h3>
              <p className="font-semibold">{order.guest_city}</p>
            </div>
          )}
          {order.guest_address && (
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Address</h3>
              <p className="font-semibold">{order.guest_address}</p>
            </div>
          )}
        </div>
        
        {/* Status Update Section */}
        <div className="border-t pt-4">
          <h3 className="font-medium mb-2">Status</h3>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleStatusUpdate}
              disabled={updating}
            >
              {updating ? 'Updating...' : 'Update Status'}
            </Button>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-2">Items</h3>
          <div className="border rounded-md overflow-hidden">
            {(order.items || []).map((item, index) => (
              <div key={index} className="flex items-center p-3 border-b last:border-b-0">
                <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden mr-4 flex-shrink-0">
                  {item.product_variant?.product?.image_url ? (
                    <img 
                      src={item.product_variant.product.image_url} 
                      alt={item.product_variant.product.name || 'Product'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Package size={24} />
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  <p className="font-medium">
                    {item.product_variant?.product?.name || 'Unknown Product'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Variant: {item.product_variant?.color || 'N/A'} - {item.product_variant?.size || 'N/A'}
                  </p>
                  <div className="flex justify-between mt-1">
                    <p className="text-sm text-muted-foreground">Quantity: {item.quantity || 0}</p>
                    <p className="text-sm font-medium">{parseFloat(item.total_price || '0')?.toLocaleString()} ETB</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {order.customer_note && (
          <div>
            <h3 className="font-medium text-sm text-muted-foreground">Customer Note</h3>
            <p className="p-3 bg-gray-50 rounded-md">{order.customer_note}</p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

const Admin = () => {
  const navigate = useNavigate();
  const isAuthenticated = userService.isAuthenticated();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch admin data with React Query
  const { data: products, isLoading: isLoadingProducts, refetch: refetchProducts } = useQuery({
    queryKey: ['adminProducts'],
    queryFn: adminService.getAdminProducts,
    enabled: isAuthenticated,
    meta: {
      onError: (error: any) => {
        console.error("Error fetching products:", error);
        toast.error("Failed to load products. Please try again.");
      }
    }
  });

  const { data: orders, isLoading: isLoadingOrders, refetch: refetchOrders } = useQuery({
    queryKey: ['adminOrders'],
    queryFn: adminService.getAdminOrders,
    enabled: isAuthenticated,
    meta: {
      onError: (error: any) => {
        console.error("Error fetching orders:", error);
        toast.error("Failed to load orders. Please try again.");
      }
    }
  });

  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: adminService.getAdminUsers,
    enabled: isAuthenticated,
    meta: {
      onError: (error: any) => {
        console.error("Error fetching users:", error);
        toast.error("Failed to load users. Please try again.");
      }
    }
  });

  // Delete product handler
  const handleDeleteProduct = async (productId: string) => {
    try {
      await adminService.deleteAdminProduct(productId);
      await refetchProducts();
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  // Order details handler
  const openOrderDetails = (order: AdminOrder) => {
    setSelectedOrder(order);
    setIsOrderDetailsOpen(true);
  };

  // Edit product handler
  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsEditDialogOpen(true);
  };

  // Calculate monthly sales data with safe array handling
  const generateMonthlySalesData = () => {
    if (!orders || !Array.isArray(orders) || orders.length === 0) return [];
    
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const monthlySales = new Array(12).fill(0);
    
    orders.forEach((order: AdminOrder) => {
      if (order.created_at) {
        const orderDate = new Date(order.created_at);
        if (orderDate.getFullYear() === currentYear) {
          monthlySales[orderDate.getMonth()] += order.total || parseFloat(order.total_price || '0') || 0;
        }
      }
    });
    
    return monthNames.map((name, index) => ({
      name,
      sales: monthlySales[index]
    }));
  };

  const salesData = generateMonthlySalesData();

  // Filter products by search term with safe array handling
  const filteredProducts = (products && Array.isArray(products)) 
    ? products.filter(product => 
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Helper function to get status display class
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-700';
      case 'processing':
      case 'shipped':
        return 'bg-blue-50 text-blue-700';
      case 'delivered':
        return 'bg-purple-50 text-purple-700';
      case 'cancelled':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  // Authentication check
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-16 px-4 max-w-screen-xl">
        <Card className="text-center p-8">
          <CardContent className="pt-6 flex flex-col items-center">
            <Lock className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground mb-6">
              You need to be logged in as an administrator to access this page.
            </p>
            <Button onClick={() => navigate('/auth')}>
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center mx-auto w-fit">Admin Dashboard</h1>

        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-4 mb-8 w-full md:w-auto">
          <TabsTrigger value="dashboard">📊 Dashboard</TabsTrigger>
          <TabsTrigger value="products">🛍️ Products</TabsTrigger>
          <TabsTrigger value="orders">📦 Orders</TabsTrigger>
          <TabsTrigger value="users">👥 Users</TabsTrigger>
        </TabsList>

          
          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoadingProducts ? <Skeleton className="h-8 w-12" /> : 
                      (products && Array.isArray(products) ? products.length : 0)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Active items in inventory</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoadingOrders ? <Skeleton className="h-8 w-12" /> : 
                      (orders && Array.isArray(orders) ? orders.length : 0)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Processed sales</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoadingUsers ? <Skeleton className="h-8 w-12" /> : 
                      (users && Array.isArray(users) ? users.length : 0)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Registered customers</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoadingOrders ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      orders && Array.isArray(orders) 
                        ? `${orders.reduce((total, order) => {
                            const orderTotal = order.total || parseFloat(order.total_price || '0') || 0;
                            return total + orderTotal;
                          }, 0)?.toLocaleString()} ETB` 
                        : '0 ETB'
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Total sales revenue</p>
                </CardContent>
              </Card>
            </div>
            
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Sales Overview</CardTitle>
                <CardDescription>Monthly sales performance</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartTooltip />
                    <Bar dataKey="sales" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingOrders ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, idx) => (
                      <Skeleton key={idx} className="h-12 w-full" />
                    ))}
                  </div>
                ) : orders && Array.isArray(orders) && orders.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order Code</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.slice(0, 5).map((order) => (
                        <TableRow key={order.order_code}>
                          <TableCell>#{order.order_code}</TableCell>
                          <TableCell>{order.guest_name || order.user || 'Anonymous'}</TableCell>
                          <TableCell>{(order.items?.length || 0)} items</TableCell>
                          <TableCell>
                            {(order.total || parseFloat(order.total_price || '0'))?.toLocaleString()} ETB
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              getStatusClass(order.status)
                            }`}>
                              {order.status || 'draft'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => openOrderDetails(order)}>
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    No orders found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Products Tab */}
          <TabsContent value="products">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Products</CardTitle>
                  <CardDescription>Manage your product inventory</CardDescription>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-[200px] md:w-[300px]"
                    />
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Product
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>Add New Product</DialogTitle>
                      </DialogHeader>
                      <AddProductForm />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingProducts ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, idx) => (
                      <Skeleton key={idx} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {filteredProducts.map((product) => (
                      <Card key={product.id} className="overflow-hidden flex flex-col">
                        <div className="aspect-video overflow-hidden bg-gray-100">
                          {product.image_url ? (
                            <img 
                              src={product.image_url} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="h-full flex items-center justify-center text-muted-foreground">
                              <Package size={48} />
                            </div>
                          )}
                        </div>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{product.name}</CardTitle>
                          <CardDescription className="line-clamp-2 h-10">
                            {product.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-0">
                          <div>
                            <p className="text-lg font-bold">{parseFloat(product.base_price)?.toLocaleString()} ETB</p>
                            
                            {/* Product Variants Count */}
                            {product.variants && product.variants.length > 0 && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {product.variants.length} variant{product.variants.length !== 1 ? 's' : ''}
                              </p>
                            )}
                          </div>
                        </CardContent>
                        <CardContent className="pt-0 mt-auto">
                          <div className="flex justify-between items-center mt-2">
                            <Button variant="outline" size="sm" onClick={() => openEditProduct(product)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-red-500 border-red-200">
                                  <Trash className="h-4 w-4 mr-2" />
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Product</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{product.name}"? 
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteProduct(product.id)} 
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {filteredProducts.length === 0 && !isLoadingProducts && (
                      <div className="col-span-full text-center py-10 text-muted-foreground">
                        {searchTerm ? 'No products match your search' : 'No products found'}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>All Orders</CardTitle>
                <CardDescription>View and manage customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingOrders ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, idx) => (
                      <Skeleton key={idx} className="h-16 w-full" />
                    ))}
                  </div>
                ) : orders && Array.isArray(orders) && orders.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order Code</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.order_code}>
                          <TableCell>#{order.order_code}</TableCell>
                          <TableCell>
                            {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell>{order.guest_name || order.user || 'Anonymous'}</TableCell>
                          <TableCell>{(order.items || []).length} items</TableCell>
                          <TableCell className="font-medium">
                            {(order.total || parseFloat(order.total_price || '0'))?.toLocaleString()} ETB
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              getStatusClass(order.status)
                            }`}>
                              {order.status || 'draft'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => openOrderDetails(order)}>
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    No orders found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Users</CardTitle>
                <CardDescription>Manage registered users</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingUsers ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, idx) => (
                      <Skeleton key={idx} className="h-12 w-full" />
                    ))}
                  </div>
                ) : users && Array.isArray(users) && users.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.id.substring(0, 8)}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            {user.is_active ? (
                              <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
                                Inactive
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    No users found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Order Details Dialog */}
      <Dialog open={isOrderDetailsOpen} onOpenChange={setIsOrderDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && <OrderDetails order={selectedOrder} />}
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <EditProductForm 
              product={editingProduct} 
              onClose={() => setIsEditDialogOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
