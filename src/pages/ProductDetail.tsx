import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productService, Product, ProductVariant } from '@/api/yene_api';
import { Button } from '@/components/ui/button';
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
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [parsedColors, setParsedColors] = useState<string[]>([]);
  const [parsedSizes, setParsedSizes] = useState<string[]>([]);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => id ? productService.getProductById(id) : Promise.reject('No product ID provided'),
    enabled: !!id,
  });

  // Parse comma-separated colors and sizes when product data loads
  useEffect(() => {
    if (product && product.variants.length > 0) {
      // Parse all colors from all variants
      const allColorsFromVariants: string[] = [];
      product.variants.forEach(variant => {
        const variantColors = variant.color.split(',').map(c => c.trim());
        allColorsFromVariants.push(...variantColors);
      });
      
      // Get unique colors
      const uniqueColors = Array.from(new Set(allColorsFromVariants));
      setParsedColors(uniqueColors);
      
      // Parse all sizes from all variants
      const allSizesFromVariants: string[] = [];
      product.variants.forEach(variant => {
        const variantSizes = variant.size.split(',').map(s => s.trim());
        allSizesFromVariants.push(...variantSizes);
      });
      
      // Get unique sizes
      const uniqueSizes = Array.from(new Set(allSizesFromVariants));
      setParsedSizes(uniqueSizes);
      
      // Set default selected color
      if (uniqueColors.length > 0 && !selectedColor) {
        setSelectedColor(uniqueColors[0]);
        // Set available sizes for this color
        updateAvailableSizes(uniqueColors[0]);
      }

      // Set default variant if no variant is selected
      if (!selectedVariantId) {
        setSelectedVariantId(product.variants[0].id);
      }
    }
  }, [product, selectedColor]);

  // Update available sizes when color changes
  const updateAvailableSizes = (color: string) => {
    if (!product) return;
    
    const sizes: string[] = [];
    product.variants.forEach(variant => {
      const variantColors = variant.color.split(',').map(c => c.trim());
      if (variantColors.includes(color)) {
        const variantSizes = variant.size.split(',').map(s => s.trim());
        sizes.push(...variantSizes);
      }
    });
    
    setAvailableSizes(Array.from(new Set(sizes)));
    
    // Select first available size if current size is not available
    if (sizes.length > 0) {
      if (!selectedSize || !sizes.includes(selectedSize)) {
        setSelectedSize(sizes[0]);
      }
    } else {
      setSelectedSize(null);
    }
  };

  // Update variant ID when color or size changes
  useEffect(() => {
    if (!product || !selectedColor) return;
    
    // Find variant that matches selected color and size
    let foundVariant = false;
    for (const variant of product.variants) {
      const variantColors = variant.color.split(',').map(c => c.trim());
      const variantSizes = variant.size.split(',').map(s => s.trim());
      
      if (variantColors.includes(selectedColor) && 
          (!selectedSize || variantSizes.includes(selectedSize))) {
        setSelectedVariantId(variant.id);
        foundVariant = true;
        break;
      }
    }
    
    // If no exact match, just use the variant that matches the color
    if (!foundVariant && product.variants.length > 0) {
      for (const variant of product.variants) {
        const variantColors = variant.color.split(',').map(c => c.trim());
        if (variantColors.includes(selectedColor)) {
          setSelectedVariantId(variant.id);
          break;
        }
      }
    }
  }, [selectedColor, selectedSize, product]);

  // Find the currently selected variant
  const selectedVariant = product?.variants.find(
    (variant: ProductVariant) => variant.id === selectedVariantId
  );

  // Calculate total price based on base price and variant's extra price
  const calculateTotalPrice = () => {
    if (!product) return 0;
    
    let price = parseFloat(product.base_price);
    
    if (selectedVariant) {
      price += parseFloat(selectedVariant.extra_price || '0');
    }
    
    return price * quantity;
  };

  // Update total price whenever quantity or selected variant changes
  useEffect(() => {
    setTotalPrice(calculateTotalPrice());
  }, [quantity, selectedVariantId, product]);

  const handleAddToCart = () => {
    if (!product) return;
    
    try {
      // Get existing cart from localStorage
      const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
      
      // For products with variants, require selection
      if (product.variants.length > 0 && !selectedVariantId) {
        toast.error('Please select color and size options');
        return;
      }
      
      // Check if this variant is already in cart
      const existingItemIndex = cartItems.findIndex(
        (item: any) => {
          if (selectedVariantId) {
            return item.productVariantId === selectedVariantId;
          } else {
            return item.productId === product.id;
          }
        }
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
          price: calculateTotalPrice() / quantity, // Store unit price
          quantity: quantity,
          selectedColor: selectedColor || '',
          selectedSize: selectedSize || '',
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

  return (
    <div className="container mx-auto py-4 px-3 sm:px-4 max-w-screen-xl">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-3 p-1 h-auto sm:p-2 sm:h-10">
        <ChevronLeft className="h-4 w-4 mr-1" /> <span className="text-sm">Back</span>
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        <div className="space-y-3">
          {/* Main Product Image */}
          <div className="aspect-square overflow-hidden rounded-lg border bg-background">
            {selectedVariant && selectedVariant.images && selectedVariant.images.length > 0 ? (
              <img
                src={selectedVariant.images[currentImageIndex]?.image_url || '/placeholder.svg'}
                alt={`${product.name} - ${selectedColor} ${selectedSize}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <img
                src={product.image_url || '/placeholder.svg'}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            )}
          </div>
          
          {/* Image Thumbnails - Mobile Friendly Scroll */}
          {selectedVariant && selectedVariant.images && selectedVariant.images.length > 1 && (
            <div className="overflow-x-auto pb-2">
              <div className="flex gap-2">
                {selectedVariant.images.map((image, index) => (
                  <div 
                    key={index}
                    className={cn(
                      "flex-shrink-0 w-14 h-14 rounded-md overflow-hidden cursor-pointer border",
                      currentImageIndex === index ? "border-primary ring-1 ring-primary" : "border-muted"
                    )}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img
                      src={image.image_url || '/placeholder.svg'}
                      alt={`${product.name} - View ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
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
              {parsedColors.length > 0 && (
                <div>
                  <Label className="text-sm font-medium mb-1 block">Color</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {parsedColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={cn(
                          "px-3 py-1.5 text-sm rounded-full border transition-colors",
                          selectedColor === color 
                            ? "bg-primary/10 border-primary text-primary font-medium" 
                            : "border-gray-200 hover:bg-accent/50"
                        )}
                        onClick={() => {
                          setSelectedColor(color);
                          updateAvailableSizes(color);
                          setCurrentImageIndex(0); // Reset image index when color changes
                        }}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Size Selection - Mobile Friendly */}
              {availableSizes.length > 0 && (
                <div>
                  <Label className="text-sm font-medium mb-1 block">Size</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {availableSizes.map((size) => (
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
                {selectedVariant && parseFloat(selectedVariant.extra_price) > 0 && (
                  <div className="flex justify-between">
                    <span>Extra for {selectedColor} / {selectedSize}:</span>
                    <span>{parseFloat(selectedVariant.extra_price).toLocaleString()} ETB</span>
                  </div>
                )}
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
