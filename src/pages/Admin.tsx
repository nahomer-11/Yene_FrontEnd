
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
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
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

// Admin Sidebar Component
const AdminSidebar = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) => {
  const menuItems = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: ShoppingBag,
      description: 'Overview & Analytics'
    },
    {
      id: 'products',
      title: 'Products',
      icon: Package,
      description: 'Manage Inventory'
    },
    {
      id: 'orders',
      title: 'Orders',
      icon: ShoppingBag,
      description: 'Customer Orders'
    },
    {
      id: 'users',
      title: 'Users',
      icon: Users,
      description: 'User Management'
    }
  ];

  return (
    <Sidebar variant="sidebar" className="border-r bg-gradient-to-b from-slate-50 to-white">
      <SidebarHeader className="border-b border-border/50 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <ShoppingBag className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Admin Panel
            </h2>
            <p className="text-xs text-muted-foreground">Management Dashboard</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeTab === item.id}
                    onClick={() => setActiveTab(item.id)}
                    className="group relative px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 data-[active=true]:bg-gradient-to-r data-[active=true]:from-blue-100 data-[active=true]:to-purple-100 data-[active=true]:border data-[active=true]:border-blue-200"
                  >
                    <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-blue-600 group-data-[active=true]:text-blue-600 transition-colors" />
                    <div className="flex flex-col">
                      <span className="font-medium text-sm group-data-[active=true]:text-blue-900">{item.title}</span>
                      <span className="text-xs text-muted-foreground group-data-[active=true]:text-blue-700">{item.description}</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
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
        return 'bg-green-50 text-green-700 border-green-200';
      case 'processing':
      case 'shipped':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'delivered':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Authentication check
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="text-center p-8 max-w-md w-full shadow-xl border-0 bg-white/80 backdrop-blur">
          <CardContent className="pt-6 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mb-6">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Authentication Required
            </h2>
            <p className="text-muted-foreground mb-6 text-center">
              You need to be logged in as an administrator to access this page.
            </p>
            <Button 
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              Login to Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-blue-50/50 to-purple-50/50">
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <SidebarInset className="flex-1">
          {/* Modern Header */}
          <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="hover:bg-blue-50 transition-colors" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {activeTab === 'dashboard' && 'Dashboard Overview'}
                    {activeTab === 'products' && 'Product Management'}
                    {activeTab === 'orders' && 'Order Management'}
                    {activeTab === 'users' && 'User Management'}
                  </h1>
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse"></div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {activeTab === 'dashboard' && 'Monitor your business performance'}
                  {activeTab === 'products' && 'Manage your product catalog'}
                  {activeTab === 'orders' && 'Process customer orders'}
                  {activeTab === 'users' && 'Manage registered users'}
                </p>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6">
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100/50 hover:shadow-lg transition-all duration-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-blue-700">Total Products</CardTitle>
                      <div className="p-2 bg-blue-600 rounded-lg">
                        <ShoppingBag className="h-4 w-4 text-white" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-900">
                        {isLoadingProducts ? <Skeleton className="h-8 w-12" /> : 
                          (products && Array.isArray(products) ? products.length : 0)}
                      </div>
                      <p className="text-xs text-blue-600 mt-1">Active items in inventory</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100/50 hover:shadow-lg transition-all duration-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-green-700">Total Orders</CardTitle>
                      <div className="p-2 bg-green-600 rounded-lg">
                        <Package className="h-4 w-4 text-white" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-900">
                        {isLoadingOrders ? <Skeleton className="h-8 w-12" /> : 
                          (orders && Array.isArray(orders) ? orders.length : 0)}
                      </div>
                      <p className="text-xs text-green-600 mt-1">Processed sales</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-purple-100/50 hover:shadow-lg transition-all duration-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-purple-700">Active Users</CardTitle>
                      <div className="p-2 bg-purple-600 rounded-lg">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-900">
                        {isLoadingUsers ? <Skeleton className="h-8 w-12" /> : 
                          (users && Array.isArray(users) ? users.length : 0)}
                      </div>
                      <p className="text-xs text-purple-600 mt-1">Registered customers</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-0 shadow-md bg-gradient-to-br from-orange-50 to-orange-100/50 hover:shadow-lg transition-all duration-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-orange-700">Monthly Revenue</CardTitle>
                      <div className="p-2 bg-orange-600 rounded-lg">
                        <ShoppingBag className="h-4 w-4 text-white" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-900">
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
                      <p className="text-xs text-orange-600 mt-1">Total sales revenue</p>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Sales Chart */}
                <Card className="border-0 shadow-md bg-white/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                      Sales Overview
                    </CardTitle>
                    <CardDescription>Monthly sales performance trends</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <RechartTooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                            border: 'none', 
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }} 
                        />
                        <Bar 
                          dataKey="sales" 
                          fill="url(#gradient)" 
                          radius={[4, 4, 0, 0]}
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3B82F6" />
                            <stop offset="100%" stopColor="#8B5CF6" />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                {/* Recent Orders */}
                <Card className="border-0 shadow-md bg-white/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"></div>
                      Recent Orders
                    </CardTitle>
                    <CardDescription>Latest customer orders and transactions</CardDescription>
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
                          <TableRow className="hover:bg-transparent border-b">
                            <TableHead className="font-semibold">Order Code</TableHead>
                            <TableHead className="font-semibold">Customer</TableHead>
                            <TableHead className="font-semibold">Items</TableHead>
                            <TableHead className="font-semibold">Total</TableHead>
                            <TableHead className="font-semibold">Status</TableHead>
                            <TableHead className="font-semibold">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders.slice(0, 5).map((order) => (
                            <TableRow key={order.order_code} className="hover:bg-blue-50/50 transition-colors">
                              <TableCell className="font-mono text-sm">#{order.order_code}</TableCell>
                              <TableCell className="font-medium">{order.guest_name || order.user || 'Anonymous'}</TableCell>
                              <TableCell>{(order.items?.length || 0)} items</TableCell>
                              <TableCell className="font-semibold">
                                {(order.total || parseFloat(order.total_price || '0'))?.toLocaleString()} ETB
                              </TableCell>
                              <TableCell>
                                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium border ${
                                  getStatusClass(order.status)
                                }`}>
                                  {order.status || 'draft'}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => openOrderDetails(order)}
                                  className="hover:bg-blue-100 hover:text-blue-700 transition-colors"
                                >
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium mb-2">No orders found</p>
                        <p className="text-sm">Orders will appear here once customers make purchases</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
                <CardHeader className="flex flex-row items-center justify-between border-b bg-gradient-to-r from-blue-50 to-purple-50">
                  <div>
                    <CardTitle className="text-xl">Products</CardTitle>
                    <CardDescription>Manage your product inventory and catalog</CardDescription>
                  </div>
                  <div className="flex gap-4 items-center">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 w-[200px] md:w-[300px] bg-white/80 backdrop-blur border-0 shadow-md"
                      />
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md">
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
                <CardContent className="p-6">
                  {isLoadingProducts ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[...Array(6)].map((_, idx) => (
                        <div key={idx} className="space-y-3">
                          <Skeleton className="h-48 w-full rounded-lg" />
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredProducts.map((product) => (
                        <Card key={product.id} className="overflow-hidden flex flex-col border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white group">
                          <div className="aspect-video overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 relative">
                            {product.image_url ? (
                              <img 
                                src={product.image_url} 
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="h-full flex items-center justify-center text-muted-foreground">
                                <Package size={48} className="opacity-50" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
                            <CardDescription className="line-clamp-2 h-10">
                              {product.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pb-0 flex-1 flex flex-col">
                            <div className="flex-1">
                              <p className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                {parseFloat(product.base_price)?.toLocaleString()} ETB
                              </p>
                              {product.variants && product.variants.length > 0 && (
                                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                                  <div className="w-1 h-1 rounded-full bg-blue-500"></div>
                                  {product.variants.length} variant{product.variants.length !== 1 ? 's' : ''}
                                </p>
                              )}
                            </div>
                            <div className="flex justify-between items-center mt-4 pt-4 border-t">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => openEditProduct(product)}
                                className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors"
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-colors"
                                  >
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
                        <div className="col-span-full text-center py-16">
                          <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                          <h3 className="text-lg font-medium mb-2">
                            {searchTerm ? 'No products match your search' : 'No products found'}
                          </h3>
                          <p className="text-muted-foreground mb-6">
                            {searchTerm ? 'Try adjusting your search terms' : 'Start by adding your first product to the catalog'}
                          </p>
                          {!searchTerm && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Your First Product
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                  <DialogTitle>Add New Product</DialogTitle>
                                </DialogHeader>
                                <AddProductForm />
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
                <CardHeader className="border-b bg-gradient-to-r from-green-50 to-emerald-50">
                  <CardTitle className="text-xl">All Orders</CardTitle>
                  <CardDescription>View and manage customer orders and transactions</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {isLoadingOrders ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, idx) => (
                        <Skeleton key={idx} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : orders && Array.isArray(orders) && orders.length > 0 ? (
                    <div className="rounded-lg border overflow-hidden">
                      <Table>
                        <TableHeader className="bg-gray-50/50">
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="font-semibold">Order Code</TableHead>
                            <TableHead className="font-semibold">Date</TableHead>
                            <TableHead className="font-semibold">Customer</TableHead>
                            <TableHead className="font-semibold">Items</TableHead>
                            <TableHead className="font-semibold">Total</TableHead>
                            <TableHead className="font-semibold">Status</TableHead>
                            <TableHead className="font-semibold">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders.map((order) => (
                            <TableRow key={order.order_code} className="hover:bg-green-50/50 transition-colors">
                              <TableCell className="font-mono text-sm">#{order.order_code}</TableCell>
                              <TableCell>
                                {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                              </TableCell>
                              <TableCell className="font-medium">{order.guest_name || order.user || 'Anonymous'}</TableCell>
                              <TableCell>{(order.items || []).length} items</TableCell>
                              <TableCell className="font-semibold">
                                {(order.total || parseFloat(order.total_price || '0'))?.toLocaleString()} ETB
                              </TableCell>
                              <TableCell>
                                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium border ${
                                  getStatusClass(order.status)
                                }`}>
                                  {order.status || 'draft'}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => openOrderDetails(order)}
                                  className="hover:bg-green-100 hover:text-green-700 transition-colors"
                                >
                                  View Details
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <h3 className="text-lg font-medium mb-2">No orders found</h3>
                      <p className="text-muted-foreground">Orders will appear here once customers make purchases</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
                <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50">
                  <CardTitle className="text-xl">Users</CardTitle>
                  <CardDescription>Manage registered users and their accounts</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {isLoadingUsers ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, idx) => (
                        <Skeleton key={idx} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : users && Array.isArray(users) && users.length > 0 ? (
                    <div className="rounded-lg border overflow-hidden">
                      <Table>
                        <TableHeader className="bg-gray-50/50">
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="font-semibold">ID</TableHead>
                            <TableHead className="font-semibold">Email</TableHead>
                            <TableHead className="font-semibold">Status</TableHead>
                            <TableHead className="font-semibold">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((user) => (
                            <TableRow key={user.id} className="hover:bg-purple-50/50 transition-colors">
                              <TableCell className="font-mono text-sm">{user.id.substring(0, 8)}</TableCell>
                              <TableCell className="font-medium">{user.email}</TableCell>
                              <TableCell>
                                {user.is_active ? (
                                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 border border-green-200">
                                    Active
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 border border-red-200">
                                    Inactive
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="hover:bg-purple-100 hover:text-purple-700 transition-colors"
                                >
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <h3 className="text-lg font-medium mb-2">No users found</h3>
                      <p className="text-muted-foreground">Registered users will appear here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </SidebarInset>
      </div>
      
      {/* Order Details Dialog */}
      <Dialog open={isOrderDetailsOpen} onOpenChange={setIsOrderDetailsOpen}>
        <DialogContent className="sm:max-w-[600px] border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Order Details
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && <OrderDetails order={selectedOrder} />}
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Edit Product
            </DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <EditProductForm 
              product={editingProduct} 
              onClose={() => setIsEditDialogOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default Admin;
