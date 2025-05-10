import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { productService, Product } from '@/api/yene_api';
import { Footer } from '@/components/layout/Footer';
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Product categories
const productCategories = [
  "T-shirt",
  "Jacket",
  "Hoodie",
  "Leather Shoe",
  "Sneakers",
  "Track Suit",
  "Suites",
  "Shorts",
  "Bundle",
  "Trousers",
  "Bags"
];

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(8);
  
  // Create a fetchProducts function that can be reused
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Fetching products from API...');
      const data = await productService.getAllProducts();
      console.log('Products received:', data);
      
      if (data && Array.isArray(data)) {
        setProducts(data);
        setFilteredProducts(data); // Set all products without filtering
        setError(null);
        console.log('Products state updated with', data.length, 'products');
      } else {
        throw new Error('Invalid data format received');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
      toast.error('Failed to load products');
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch products from API on component mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  
  // Apply category filters only (no variant filtering)
  useEffect(() => {
    if (!products || products.length === 0) return;
    
    // Only apply category filter when categories are selected
    if (selectedCategories.length > 0) {
      const filtered = products.filter(product => 
        selectedCategories.some(cat => 
          product.name.toLowerCase().includes(cat.toLowerCase()) || 
          (product.description && product.description.toLowerCase().includes(cat.toLowerCase()))
        )
      );
      setFilteredProducts(filtered);
      
      // Reset to first page when filters change
      setCurrentPage(1);
    } else {
      // If no categories selected, show all products
      setFilteredProducts(products);
    }
  }, [products, selectedCategories]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setFilteredProducts(products);
    toast.success('All filters cleared');
  };

  // Helper function to map color names to CSS colors with error handling
  const getColorValue = (color: string) => {
    if (!color) return "#888888";
    
    const colorMap: Record<string, string> = {
      "Black": "#000000",
      "White": "#FFFFFF", 
      "Red": "#DC2626",
      "Blue": "#2563EB",
      "Green": "#16A34A",
      "Yellow": "#FBBF24",
      "Purple": "#7C3AED",
      "Brown": "#92400E",
      "Navy": "#1E3A8A",
      "Gray": "#6B7280"
    };
    
    const normalizedColor = color.charAt(0).toUpperCase() + color.slice(1).toLowerCase();
    return colorMap[normalizedColor] || colorMap[color] || "#888888";
  };

  const handleAddToCart = (product: Product) => {
    try {
      // Get existing cart items from localStorage
      let cartItems = [];
      try {
        const savedCart = localStorage.getItem('cart');
        cartItems = savedCart ? JSON.parse(savedCart) : [];
        if (!Array.isArray(cartItems)) cartItems = [];
      } catch (e) {
        console.error('Error parsing cart from localStorage:', e);
        cartItems = [];
      }
      
      // Safely access variant data - handle products without variants
      const defaultVariant = product.variants && product.variants.length > 0 ? product.variants[0] : undefined;
      const variantImage = defaultVariant && 
                          defaultVariant.images && 
                          defaultVariant.images.length > 0 ? 
                          defaultVariant.images[0].image_url : '';
      
      const extraPrice = defaultVariant && defaultVariant.extra_price ? 
                         parseFloat(defaultVariant.extra_price) : 0;
                         
      const basePrice = product.base_price ? parseFloat(product.base_price) : 0;
      
      // Check if the product already exists in the cart
      const existingItemIndex = cartItems.findIndex((item: any) => 
        item.productId === product.id && 
        item.selectedColor === (defaultVariant ? defaultVariant.color : '') &&
        item.selectedSize === (defaultVariant ? defaultVariant.size : '')
      );
      
      if (existingItemIndex !== -1) {
        // Increase quantity if product already in cart
        cartItems[existingItemIndex].quantity += 1;
        localStorage.setItem('cart', JSON.stringify(cartItems));
        toast.success(`Updated quantity in cart`, {
          description: `${product.name} quantity increased`,
        });
      } else {
        // Add new item
        const newItem = {
          id: Date.now().toString(),
          productId: product.id,
          name: product.name,
          price: !isNaN(basePrice + extraPrice) ? basePrice + extraPrice : basePrice,
          quantity: 1,
          selectedColor: defaultVariant ? defaultVariant.color || '' : '',
          selectedSize: defaultVariant ? defaultVariant.size || '' : '',
          image: product.image_url || variantImage
        };
        
        cartItems.push(newItem);
        localStorage.setItem('cart', JSON.stringify(cartItems));
        
        toast.success(`Added to cart`, {
          description: `${product.name} added to your cart`,
        });
      }
      
      // Dispatch custom event to update cart count in navbar
      window.dispatchEvent(new Event('cartUpdated'));
      
    } catch (err) {
      console.error('Error adding item to cart:', err);
      toast.error('Could not add item to cart');
    }
  };
  
  // Get current products for pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  
  // Generate page numbers array for pagination
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }
  
  // Change page handler
  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      // Scroll to top when changing page
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <div className="container max-w-7xl mx-auto px-4 py-4 sm:py-6 flex-grow">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Products</h1>
          
          <Button
            variant="outline"
            onClick={() => setIsFiltersVisible(!isFiltersVisible)}
            className="flex items-center gap-1"
          >
            <Filter className="h-4 w-4 mr-1" />
            Filters
          </Button>
        </div>
        
        {/* Category filters */}
        {isFiltersVisible && (
          <div className="mb-6 p-4 border rounded-lg bg-background shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-medium">Product Categories</h2>
              {selectedCategories.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear all
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {productCategories.map(category => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`category-${category}`} 
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={() => toggleCategory(category)}
                  />
                  <Label htmlFor={`category-${category}`} className="text-sm">
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Active filters display */}
        {selectedCategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="text-sm text-muted-foreground">
              Filters: 
            </div>
            {selectedCategories.map(category => (
              <div key={`filter-${category}`} 
                className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full text-xs"
              >
                {category}
              </div>
            ))}
          </div>
        )}
        
        <div className="grid grid-cols-2 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {isLoading ? (
            // Loading skeleton
            Array(8).fill(0).map((_, index) => (
              <Card key={`skeleton-${index}`} className="overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200"></div>
                <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2 mb-1 sm:mb-2"></div>
                  <div className="h-4 sm:h-6 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 pt-0">
                  <div className="h-2 sm:h-3 bg-gray-100 rounded w-full mb-1 sm:mb-2"></div>
                  <div className="h-2 sm:h-3 bg-gray-100 rounded w-2/3"></div>
                </CardContent>
                <CardFooter className="p-3 sm:p-4 pt-0">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gray-200 rounded"></div>
                </CardFooter>
              </Card>
            ))
          ) : error ? (
            <div className="col-span-full text-center py-8 sm:py-12">
              <h3 className="text-lg sm:text-xl font-semibold">Error loading products</h3>
              <p className="text-muted-foreground mt-2">{error}</p>
              <Button 
                onClick={() => fetchProducts()}
                variant="outline" 
                className="mt-4"
              >
                Try again
              </Button>
            </div>
          ) : currentProducts.length > 0 ? (
            currentProducts.map(product => (
              <Card key={product.id} className="overflow-hidden group h-full flex flex-col relative">
                <Link to={`/products/${product.id}`} className="flex-grow flex flex-col cursor-pointer">
                  <div className="aspect-square overflow-hidden relative group-hover:opacity-90 transition-opacity">
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  
                  <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {/* Safe display of size - show "Standard" for products without variants */}
                          {product.variants && product.variants[0] ? product.variants[0].size : 'Standard'}
                        </p>
                        <CardTitle className="text-sm sm:text-base md:text-lg mt-0.5 sm:mt-1">{product.name}</CardTitle>
                      </div>
                      <p className="text-xs sm:text-sm font-bold">{parseFloat(product.base_price).toLocaleString()} ETB</p>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-3 sm:p-4 pt-0 flex-grow">
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{product.description || 'No description available'}</p>
                    <div className="mt-2 sm:mt-3 flex items-center gap-1">
                      {/* Only show color dots if product has variants with colors */}
                      {product.variants && product.variants.length > 0 ? (
                        <>
                          {product.variants.slice(0, 4).map((variant) => (
                            <span 
                              key={`${product.id}-${variant.color}`}
                              className={`block w-2 h-2 sm:w-3 sm:h-3 rounded-full border ${variant.color === 'White' ? 'border-gray-300' : ''}`}
                              style={{ backgroundColor: getColorValue(variant.color || '') }}
                              title={variant.color}
                            />
                          ))}
                          {product.variants.length > 4 && (
                            <span className="text-[10px] sm:text-xs text-muted-foreground">+{product.variants.length - 4}</span>
                          )}
                        </>
                      ) : (
                        <span className="text-[10px] sm:text-xs text-muted-foreground">No variants</span>
                      )}
                    </div>
                  </CardContent>
                </Link>

                <CardFooter className="p-3 sm:p-4 pt-0 flex gap-2">
                  <Button
                    onClick={() => handleAddToCart(product)}
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 sm:h-10 sm:w-10"
                  >
                    <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-8 sm:py-12">
              <h3 className="text-lg sm:text-xl font-semibold">No products found</h3>
              <p className="text-sm sm:text-base text-muted-foreground mt-2">Try changing your filter criteria</p>
              <Button 
                onClick={clearFilters}
                variant="outline" 
                className="mt-4"
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
        
        {/* Pagination */}
        {filteredProducts.length > productsPerPage && (
          <div className="mt-6 sm:mt-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => paginate(currentPage - 1)}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {pageNumbers.map(number => {
                  // Show first page, current page, last page and one page before and after current
                  if (
                    number === 1 ||
                    number === totalPages ||
                    (number >= currentPage - 1 && number <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={number}>
                        <PaginationLink
                          isActive={currentPage === number}
                          onClick={() => paginate(number)}
                          className="cursor-pointer"
                        >
                          {number}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                  
                  return null;
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => paginate(currentPage + 1)}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Products;
