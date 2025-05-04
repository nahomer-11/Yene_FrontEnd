
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productService, Product, ProductVariant } from '@/api/yene_api';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from '@/components/ui/card';
import { Input } from "@/components/ui/input";
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Minus, Plus, ShoppingCart, ChevronLeft } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => id ? productService.getProductById(id) : Promise.reject('No product ID provided'),
    enabled: !!id,
  });

  // Set default variant when product data loads
  useEffect(() => {
    if (product && product.variants.length > 0 && !selectedVariantId) {
      setSelectedVariantId(product.variants[0].id);
    }
  }, [product, selectedVariantId]);

  // Find the currently selected variant
  const selectedVariant = product?.variants.find(
    (variant: ProductVariant) => variant.id === selectedVariantId
  );

  // Calculate total price based on base price and variant's extra price
  const calculateTotalPrice = () => {
    if (!product) return 0;
    
    let totalPrice = parseFloat(product.base_price);
    
    if (selectedVariant) {
      totalPrice += parseFloat(selectedVariant.extra_price || '0');
    }
    
    return totalPrice;
  };

  const handleAddToCart = () => {
    if (!selectedVariantId) {
      toast.error('Please select a variant');
      return;
    }
    
    if (!product) return;
    
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
        // Add new item to cart - Note the updated key productVariantId
        const newItem = {
          id: Date.now().toString(),
          productId: product.id,
          productVariantId: selectedVariantId, // This is the key field we need for the API
          name: product.name,
          price: calculateTotalPrice(),
          quantity: quantity,
          selectedColor: selectedVariant ? selectedVariant.color : '',
          selectedSize: selectedVariant ? selectedVariant.size : '',
          image: selectedVariant?.images?.[0]?.image_url || product.image_url || '/placeholder.svg'
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

  // ... keep existing code (handleBack function and loading/error states)

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-screen-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Skeleton className="h-[400px] w-full rounded-xl" />
            <div className="mt-4 flex gap-2">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-16 w-16 rounded-md" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-screen-xl">
        <div className="text-center py-10">
          <p className="text-red-500 mb-4">Error loading product details.</p>
          <Button onClick={() => navigate(-1)}>Back</Button>
        </div>
      </div>
    );
  }

  // ... keep existing code (variant options and UI rendering)
  // Group variants by color and size for selection
  const colorOptions = Array.from(new Set(product.variants.map(v => v.color)));
  const sizeOptions = Array.from(new Set(product.variants.map(v => v.size)));
  
  // Find selected color based on selected variant
  const selectedColor = selectedVariant?.color || colorOptions[0];

  // Filter variants by selected color to show appropriate sizes
  const availableSizesForColor = product.variants
    .filter(v => v.color === selectedColor)
    .map(v => v.size);
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-screen-xl">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
        <ChevronLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* ... keep existing code (image display section) */}
        <div className="space-y-4">
          {/* Main Product Image */}
          <div className="aspect-square overflow-hidden rounded-lg border bg-background">
            {selectedVariant && selectedVariant.images && selectedVariant.images.length > 0 ? (
              <img
                src={selectedVariant.images[currentImageIndex]?.image_url || '/placeholder.svg'}
                alt={`${product.name} - ${selectedVariant.color} ${selectedVariant.size}`}
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
          
          {/* Image Carousel/Thumbnails */}
          {selectedVariant && selectedVariant.images && selectedVariant.images.length > 1 && (
            <Carousel className="w-full max-w-xs mx-auto">
              <CarouselContent>
                {selectedVariant.images.map((image, index) => (
                  <CarouselItem key={index} className="basis-1/4 pl-1">
                    <div 
                      className={`aspect-square rounded-md overflow-hidden cursor-pointer border ${
                        currentImageIndex === index ? 'border-primary ring-2 ring-primary' : 'border-muted'
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      <img
                        src={image.image_url || '/placeholder.svg'}
                        alt={`${product.name} - View ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-0" />
              <CarouselNext className="right-0" />
            </Carousel>
          )}
        </div>
        
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-xl font-semibold mb-4">{calculateTotalPrice().toLocaleString()} ETB</p>
          
          <div className="prose mb-6">
            <p>{product.description}</p>
          </div>
          
          <Card className="mb-6">
            <CardContent className="p-6 space-y-6">
              {/* Color Selection */}
              {colorOptions.length > 0 && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">Color</Label>
                  <RadioGroup 
                    value={selectedColor} 
                    onValueChange={(color) => {
                      // When color changes, find first variant of this color and select it
                      const firstVariantOfColor = product.variants.find(v => v.color === color);
                      if (firstVariantOfColor) {
                        setSelectedVariantId(firstVariantOfColor.id);
                        setCurrentImageIndex(0); // Reset image index when color changes
                      }
                    }}
                    className="flex flex-wrap gap-2 mt-2"
                  >
                    {colorOptions.map((color) => (
                      <div key={color} className="flex items-center">
                        <RadioGroupItem
                          value={color}
                          id={`color-${color}`}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={`color-${color}`}
                          className="flex items-center gap-2 rounded-md border px-4 py-2 cursor-pointer 
                            peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:font-medium
                            hover:bg-accent transition-colors"
                        >
                          {color}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}
              
              {/* Size Selection */}
              {sizeOptions.length > 0 && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">Size</Label>
                  <RadioGroup 
                    value={selectedVariant?.size || ''} 
                    onValueChange={(size) => {
                      // Find variant with current color and this size
                      const variantToSelect = product.variants.find(
                        v => v.color === selectedColor && v.size === size
                      );
                      if (variantToSelect) {
                        setSelectedVariantId(variantToSelect.id);
                      }
                    }}
                    className="flex flex-wrap gap-2 mt-2"
                  >
                    {sizeOptions
                      .filter(size => availableSizesForColor.includes(size))
                      .map((size) => (
                        <div key={size} className="flex items-center">
                          <RadioGroupItem
                            value={size}
                            id={`size-${size}`}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={`size-${size}`}
                            className="flex h-10 w-14 items-center justify-center rounded-md border 
                              peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5
                              hover:bg-accent cursor-pointer"
                          >
                            {size}
                          </Label>
                        </div>
                      ))}
                  </RadioGroup>
                </div>
              )}
              
              {/* Quantity Selection */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Quantity</Label>
                <div className="flex items-center mt-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input 
                    type="number"
                    min={1}
                    value={quantity} 
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 mx-2 text-center"
                  />
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Price Summary */}
              <div className="pt-4 border-t">
                <div className="flex justify-between">
                  <span>Base Price:</span>
                  <span>{parseFloat(product.base_price).toLocaleString()} ETB</span>
                </div>
                {selectedVariant && parseFloat(selectedVariant.extra_price) > 0 && (
                  <div className="flex justify-between">
                    <span>Extra for {selectedVariant.color} / {selectedVariant.size}:</span>
                    <span>{parseFloat(selectedVariant.extra_price).toLocaleString()} ETB</span>
                  </div>
                )}
                <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                  <span>Total:</span>
                  <span>{calculateTotalPrice().toLocaleString()} ETB</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Button 
            size="lg" 
            className="w-full"
            onClick={handleAddToCart}
            disabled={!selectedVariantId}
          >
            <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
