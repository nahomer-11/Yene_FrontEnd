
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productService, Product, ProductVariant } from '@/api/yene_api';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from '@/components/ui/card';
import { Input } from "@/components/ui/input";
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Minus, Plus, ShoppingCart, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => id ? productService.getProductById(id) : Promise.reject('No product ID provided'),
    enabled: !!id,
  });

  // Process color and size options when product data loads
  useEffect(() => {
    if (product && product.variants.length > 0) {
      // Get the first variant
      const firstVariant = product.variants[0];
      
      // Set the first variant ID
      setSelectedVariantId(firstVariant.id);
      
      // Get first color
      const colors = firstVariant.color.split(',').map(c => c.trim());
      if (colors.length > 0) {
        setSelectedColor(colors[0]);
      }
      
      // Get first size
      const sizes = firstVariant.size.split(',').map(s => s.trim());
      if (sizes.length > 0) {
        setSelectedSize(sizes[0]);
      }
    }
  }, [product]);

  // Calculate total price based on base price, variant's extra price, and quantity
  useEffect(() => {
    if (product) {
      const basePrice = parseFloat(product.base_price);
      const extraPrice = selectedVariantId 
        ? parseFloat(product.variants.find(v => v.id === selectedVariantId)?.extra_price || '0') 
        : 0;
      
      setTotalPrice((basePrice + extraPrice) * quantity);
    }
  }, [product, selectedVariantId, quantity]);

  const handleAddToCart = () => {
    if (!selectedVariantId || !product) {
      toast.error('Please select options first');
      return;
    }
    
    try {
      // Get existing cart from localStorage
      const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
      
      // Check if this variant is already in cart
      const existingItemIndex = cartItems.findIndex(
        (item: any) => item.productVariantId === selectedVariantId
      );
      
      if (existingItemIndex !== -1) {
        // Update quantity if already in cart
        cartItems[existingItemIndex].quantity += quantity;
      } else {
        // Add new item to cart
        const newItem = {
          id: Date.now().toString(),
          productId: product.id,
          productVariantId: selectedVariantId,
          name: product.name,
          price: totalPrice / quantity, // Store unit price
          quantity: quantity,
          selectedColor: selectedColor,
          selectedSize: selectedSize,
          image: product.image_url || '/placeholder.svg'
        };
        cartItems.push(newItem);
      }
      
      localStorage.setItem('cart', JSON.stringify(cartItems));
      
      toast.success('Added to cart!');
      navigate('/cart');
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add item to cart");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-4 px-3 max-w-screen-xl">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Skeleton className="h-[300px] w-full rounded-xl" />
            <div className="mt-2 flex gap-1 overflow-x-auto pb-2">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-12 w-12 flex-shrink-0 rounded-md" />
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto py-4 px-3 max-w-screen-xl">
        <div className="text-center py-6">
          <p className="text-red-500 mb-4">Error loading product details.</p>
          <Button onClick={() => navigate(-1)}>Back</Button>
        </div>
      </div>
    );
  }

  // Extract colors and sizes from the variants
  const allColors: string[] = [];
  const allSizes: string[] = [];

  product.variants.forEach(variant => {
    // Split colors by comma and trim whitespace
    const colors = variant.color.split(',').map(c => c.trim());
    colors.forEach(color => {
      if (!allColors.includes(color)) {
        allColors.push(color);
      }
    });

    // Split sizes by comma and trim whitespace
    const sizes = variant.size.split(',').map(s => s.trim());
    sizes.forEach(size => {
      if (!allSizes.includes(size)) {
        allSizes.push(size);
      }
    });
  });

  const colorMap: Record<string, string> = {
    'Brown': '#8B4513',
    'black': '#000000',
    'purple': '#800080',
    // Add more color mappings as needed
  };

  return (
    <div className="container mx-auto py-4 px-3 sm:px-4 max-w-screen-xl">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-3 p-1 h-auto sm:p-2 sm:h-10">
        <ChevronLeft className="h-4 w-4 mr-1" /> <span className="text-sm">Back</span>
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        <div className="space-y-3">
          {/* Main Product Image */}
          <div className="aspect-square overflow-hidden rounded-lg border bg-background">
            <img
              src={product.image_url || '/placeholder.svg'}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
        
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">{product.name}</h1>
          <p className="text-lg sm:text-xl font-semibold mb-2">{totalPrice.toLocaleString()} ETB</p>
          
          <div className="prose prose-sm sm:prose mb-3 max-w-none">
            <p>{product.description}</p>
          </div>
          
          <Card className="mb-4">
            <CardContent className="p-3 sm:p-4 space-y-4">
              {/* Color Selection - Mobile Friendly */}
              {allColors.length > 0 && (
                <div>
                  <Label className="text-sm font-medium mb-1 block">Color</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {allColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={cn(
                          "px-3 py-1.5 text-sm rounded-full border transition-colors flex items-center gap-1.5",
                          selectedColor === color 
                            ? "bg-primary/10 border-primary text-primary font-medium" 
                            : "border-gray-200 hover:bg-accent/50"
                        )}
                        onClick={() => setSelectedColor(color)}
                      >
                        {colorMap[color] && (
                          <span 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: colorMap[color] }}
                          />
                        )}
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Size Selection - Mobile Friendly */}
              {allSizes.length > 0 && (
                <div>
                  <Label className="text-sm font-medium mb-1 block">Size</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {allSizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        className={cn(
                          "flex h-8 min-w-[2rem] items-center justify-center px-2 rounded-md border text-sm",
                          selectedSize === size
                            ? "bg-primary/10 border-primary text-primary font-medium"
                            : "border-gray-200 hover:bg-accent/50"
                        )}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Quantity Selection - Mobile Friendly */}
              <div>
                <Label className="text-sm font-medium mb-1 block">Quantity</Label>
                <div className="flex items-center mt-1">
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  <Input 
                    type="number"
                    min={1}
                    value={quantity} 
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-14 mx-2 text-center h-8 px-1"
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Price Summary - Mobile Friendly */}
              <div className="pt-3 border-t text-sm">
                <div className="flex justify-between">
                  <span>Base Price:</span>
                  <span>{parseFloat(product.base_price).toLocaleString()} ETB</span>
                </div>
                {quantity > 1 && (
                  <div className="flex justify-between">
                    <span>Quantity:</span>
                    <span>× {quantity}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                  <span>Total:</span>
                  <span>{totalPrice.toLocaleString()} ETB</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Button 
            className="w-full py-2 h-auto text-sm sm:text-base sm:h-10"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="mr-1.5 h-4 w-4" /> Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
