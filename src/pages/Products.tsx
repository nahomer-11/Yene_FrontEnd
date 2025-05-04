
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Filter, 
  ChevronDown,
  ShoppingCart,
  X
} from 'lucide-react';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger, 
  SheetClose 
} from "@/components/ui/sheet";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { toast } from 'sonner';
import { productService, Product } from '@/api/yene_api';
import { Footer } from '@/components/layout/Footer';

// Updated product categories
const productCategories = [
  "Sneakers", 
  "Running", 
  "Boots", 
  "Formal", 
  "Casual", 
  "Sandals"
];

// Gender categories
const genderCategories = ["Men", "Women", "Unisex"];

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(9);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const data = await productService.getAllProducts();
        setProducts(data);
        setFilteredProducts(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products');
        toast.error('Failed to load products');
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Extract all unique colors from the products
  const colors = [...new Set(products.flatMap(product => 
    product.variants ? product.variants.flatMap(variant => variant.color) : []
  ))];

  // Filter products when selections change
  useEffect(() => {
    let result = [...products];
    
    if (searchQuery) {
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedCategories.length > 0) {
      result = result.filter(product => 
        selectedCategories.some(cat => 
          product.name.toLowerCase().includes(cat.toLowerCase()) || 
          product.description.toLowerCase().includes(cat.toLowerCase())
        )
      );
    }
    
    if (selectedColors.length > 0) {
      result = result.filter(product => 
        product.variants && product.variants.some(variant => 
          selectedColors.includes(variant.color)
        )
      );
    }

    // Filter by price range
    result = result.filter(
      product => {
        const totalPrice = parseFloat(product.base_price) || 0;
        return totalPrice >= priceRange[0] && totalPrice <= priceRange[1];
      }
    );
    
    setFilteredProducts(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [products, selectedCategories, selectedColors, selectedGenders, searchQuery, priceRange]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color)
        ? prev.filter(c => c !== color)
        : [...prev, color]
    );
  };

  const toggleGender = (gender: string) => {
    setSelectedGenders(prev => 
      prev.includes(gender)
        ? prev.filter(g => g !== gender)
        : [...prev, gender]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedColors([]);
    setSelectedGenders([]);
    setSearchQuery('');
    setPriceRange([0, 5000]);
    toast.success('All filters cleared');
  };

  const handleAddToCart = (product: Product) => {
    // Get existing cart items from localStorage
    const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Create a new item with default selections
    const defaultVariant = product.variants && product.variants[0] ? product.variants[0] : undefined;
    const variantImage = defaultVariant && defaultVariant.images && defaultVariant.images[0] ? defaultVariant.images[0].image_url : '';
    
    const newItem = {
      id: Date.now().toString(),
      productId: product.id,
      name: product.name,
      price: parseFloat(product.base_price) + (defaultVariant ? parseFloat(defaultVariant.extra_price || '0') : 0),
      quantity: 1,
      selectedColor: defaultVariant ? defaultVariant.color : '',
      selectedSize: defaultVariant ? defaultVariant.size : '',
      image: product.image_url || variantImage
    };
    
    // Add to cart
    cartItems.push(newItem);
    localStorage.setItem('cart', JSON.stringify(cartItems));
    
    toast.success(`Added to cart`, {
      description: `${product.name} added to your cart`,
    });
  };

  // Calculate the price range of all products
  const allPrices = products.map(p => parseFloat(p.base_price) || 0);
  const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0;
  const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : 5000;

  // Helper function to map color names to CSS colors
  const getColorValue = (color: string) => {
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
    
    return colorMap[color] || "#888888";
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
      <div className="container max-w-6xl mx-auto px-4 py-6 flex-grow">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
            
            {/* Mobile filter button */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="h-10 w-10">
                    <Filter className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
                  <div className="py-4 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium flex items-center">
                        <Filter className="h-4 w-4 mr-2" />
                        Filters
                      </h3>
                      <Button variant="ghost" size="sm" onClick={clearFilters}>
                        Clear all
                      </Button>
                    </div>
                    
                    {/* Mobile Category Filter */}
                    <div className="space-y-4">
                      <h3 className="font-medium">Category</h3>
                      <div className="space-y-2">
                        {productCategories.map(category => (
                          <div key={category} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`mobile-category-${category}`} 
                              checked={selectedCategories.includes(category)}
                              onCheckedChange={() => toggleCategory(category)}
                            />
                            <Label htmlFor={`mobile-category-${category}`} className="capitalize">
                              {category}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Mobile Color Filter */}
                    <div className="space-y-4">
                      <h3 className="font-medium">Colors</h3>
                      <div className="flex flex-wrap gap-2">
                        {colors.map(color => (
                          <button
                            key={`mobile-color-${color}`}
                            onClick={() => toggleColor(color)}
                            className={`group flex flex-col items-center gap-1 p-1 ${
                              selectedColors.includes(color) 
                                ? 'ring-2 ring-primary ring-offset-1' 
                                : ''
                            } rounded-md transition-all`}
                          >
                            <span 
                              style={{ backgroundColor: getColorValue(color) }} 
                              className={`w-6 h-6 rounded-full border ${
                                color === 'White' ? 'border-gray-200' : ''
                              }`}
                            />
                            <span className="text-xs">{color}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Mobile Actions */}
                    <div className="pt-4 border-t">
                      <SheetClose asChild>
                        <Button className="w-full">Apply Filters</Button>
                      </SheetClose>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            
            {/* Desktop filter toggle */}
            <Button
              variant="outline"
              onClick={() => setIsFiltersVisible(!isFiltersVisible)}
              className="hidden md:flex items-center gap-1"
            >
              <Filter className="h-4 w-4 mr-1" />
              Filters
              <ChevronDown className={`h-4 w-4 transition-transform ${isFiltersVisible ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </div>
        
        {/* Active filters */}
        {(selectedCategories.length > 0 || selectedColors.length > 0) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedCategories.map(category => (
              <div key={`filter-${category}`} className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-sm">
                {category}
                <button onClick={() => toggleCategory(category)}>
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {selectedColors.map(color => (
              <div key={`filter-${color}`} className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-sm">
                <span 
                  className="w-2 h-2 rounded-full mr-1" 
                  style={{ backgroundColor: getColorValue(color) }}
                ></span>
                {color}
                <button onClick={() => toggleColor(color)}>
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {(selectedCategories.length > 0 || selectedColors.length > 0) && (
              <button 
                onClick={clearFilters}
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 px-2 py-1"
              >
                Clear all
              </button>
            )}
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Desktop Filters Sidebar */}
          {isFiltersVisible && (
            <div className="hidden md:block lg:col-span-1">
              <div className="space-y-6 sticky top-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Filters</h3>
                    <Button variant="ghost" size="sm" onClick={clearFilters}>Clear all</Button>
                  </div>
                  
                  {/* Category Filter */}
                  <div className="space-y-3 border-t pt-3">
                    <h3 className="font-medium">Category</h3>
                    <div className="space-y-2">
                      {productCategories.map(category => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`category-${category}`} 
                            checked={selectedCategories.includes(category)}
                            onCheckedChange={() => toggleCategory(category)}
                          />
                          <Label htmlFor={`category-${category}`} className="capitalize">
                            {category}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Color Filter */}
                  <div className="space-y-3 border-t pt-3">
                    <h3 className="font-medium">Colors</h3>
                    <div className="flex flex-wrap gap-2">
                      {colors.map(color => (
                        <button
                          key={`color-${color}`}
                          onClick={() => toggleColor(color)}
                          className={`group flex flex-col items-center gap-1 p-1 ${
                            selectedColors.includes(color) 
                              ? 'ring-2 ring-primary ring-offset-1' 
                              : ''
                          } rounded-md transition-all`}
                          title={color}
                        >
                          <span 
                            style={{ backgroundColor: getColorValue(color) }} 
                            className={`w-6 h-6 rounded-full border ${
                              color === 'White' ? 'border-gray-200' : ''
                            }`}
                          />
                          <span className="text-xs">{color}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Products Grid */}
          <div className={`grid gap-6 ${isFiltersVisible ? 'lg:col-span-3' : 'lg:col-span-4'} grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`}>
            {isLoading ? (
              // Loading skeleton
              Array(6).fill(0).map((_, index) => (
                <Card key={`skeleton-${index}`} className="overflow-hidden animate-pulse">
                  <div className="aspect-square bg-gray-200"></div>
                  <CardHeader className="p-4 pb-2">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="h-3 bg-gray-100 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-100 rounded w-2/3"></div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <div className="h-10 w-10 bg-gray-200 rounded"></div>
                  </CardFooter>
                </Card>
              ))
            ) : error ? (
              <div className="col-span-full text-center py-12">
                <h3 className="text-xl font-semibold">Error loading products</h3>
                <p className="text-muted-foreground mt-2">{error}</p>
                <Button 
                  onClick={() => window.location.reload()}
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
                      {/* Product status would go here if we had stock info */}
                    </div>
                    
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {product.variants && product.variants[0] ? product.variants[0].size : 'All Sizes'}
                          </p>
                          <CardTitle className="text-lg mt-1">{product.name}</CardTitle>
                        </div>
                        <p className="font-bold">{parseFloat(product.base_price).toLocaleString()} ETB</p>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-4 pt-0 flex-grow">
                      <p className="text-muted-foreground text-sm line-clamp-2">{product.description}</p>
                      <div className="mt-3 flex items-center gap-1">
                        {product.variants && product.variants.slice(0, 4).map((variant) => (
                          <span 
                            key={`${product.id}-${variant.color}`}
                            className={`block w-3 h-3 rounded-full border ${variant.color === 'White' ? 'border-gray-300' : ''}`}
                            style={{ backgroundColor: getColorValue(variant.color) }}
                            title={variant.color}
                          />
                        ))}
                        {product.variants && product.variants.length > 4 && (
                          <span className="text-xs text-muted-foreground">+{product.variants.length - 4}</span>
                        )}
                      </div>
                    </CardContent>
                  </Link>

                  <CardFooter className="p-4 pt-0 flex gap-2">
                    <Button
                      onClick={() => handleAddToCart(product)}
                      variant="outline"
                      size="icon"
                      className="h-10 w-10"
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <h3 className="text-xl font-semibold">No products found</h3>
                <p className="text-muted-foreground mt-2">Try changing your search or filter criteria</p>
                <Button 
                  onClick={clearFilters}
                  variant="outline" 
                  className="mt-4"
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {/* Pagination */}
        {filteredProducts.length > 0 && (
          <div className="mt-8">
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
                  
                  // Show ellipsis for skipped pages
                  if (number === 2 && currentPage > 3) {
                    return <PaginationEllipsis key="ellipsis-1" />;
                  }
                  
                  if (number === totalPages - 1 && currentPage < totalPages - 2) {
                    return <PaginationEllipsis key="ellipsis-2" />;
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
