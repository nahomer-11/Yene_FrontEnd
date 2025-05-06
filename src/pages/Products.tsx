
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
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useIsMobile } from "@/hooks/use-mobile";

// Updated product categories with your requested values
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
  "Bags",
  "Vest",
  "Sweaters",
  "Shirts",
  "Sunglasses",
  "Jalabiya",
  "Active Wear",
  "Premium Wallets & Card Holders",
  "Watches",
  "Other"
];

// Gender categories
const genderCategories = ["Men", "Women", "Unisex"];

const Products = () => {
  const isMobile = useIsMobile();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategorySection, setActiveCategorySection] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(8); // Show more products per page

  // Fetch products from API - make sure data loads correctly
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const data = await productService.getAllProducts();
        console.log("Fetched products:", data);
        
        if (!data || data.length === 0) {
          throw new Error('No products returned from API');
        }
        
        setProducts(data);
        setFilteredProducts(data); // Initialize with all products
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

  // Extract all unique colors from the products - process comma-separated colors
  const processColors = (products: Product[]) => {
    const colorSet = new Set<string>();
    
    products.forEach(product => {
      if (product.variants) {
        product.variants.forEach(variant => {
          if (variant.color) {
            // Split comma-separated colors and trim whitespace
            const colors = variant.color.split(',').map(c => c.trim());
            colors.forEach(color => colorSet.add(color));
          }
        });
      }
    });
    
    return Array.from(colorSet);
  };
  
  const colors = processColors(products);

  // Filter products when selections change
  useEffect(() => {
    if (products.length === 0) return; // Don't filter if no products
    
    console.log("Filtering products. Total products:", products.length);
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
    
    if (selectedColors.length > 0 && result.some(p => p.variants && p.variants.length > 0)) {
      result = result.filter(product => {
        // If product has no variants, keep it when filtering by color
        if (!product.variants || product.variants.length === 0) return true;
        
        return product.variants.some(variant => {
          if (!variant.color) return false;
          
          // Split comma-separated colors and check if any match
          const variantColors = variant.color.split(',').map(c => c.trim());
          return selectedColors.some(selectedColor => 
            variantColors.includes(selectedColor)
          );
        });
      });
    }
    
    if (selectedGenders.length > 0) {
      result = result.filter(product => 
        selectedGenders.some(gender => 
          product.name.toLowerCase().includes(gender.toLowerCase()) || 
          product.description.toLowerCase().includes(gender.toLowerCase())
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
    
    console.log("Filtered products:", result.length);
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

  const toggleCategorySection = (category: string) => {
    setActiveCategorySection(prev => prev === category ? null : category);
    
    // If the category is getting selected, add it to filters
    if (activeCategorySection !== category) {
      setSelectedCategories(prev => 
        prev.includes(category) ? prev : [...prev, category]
      );
    }
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
    setPriceRange([0, 10000]);
    toast.success('All filters cleared');
  };

  // Add to cart function that correctly handles variants with comma-separated color and size values
  const handleAddToCart = (product: Product) => {
    try {
      // Get existing cart items from localStorage
      const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
      
      // Parse variant colors and sizes
      const defaultVariant = product.variants && product.variants[0] ? product.variants[0] : undefined;
      
      // Default color and size (handle comma-separated values)
      let defaultColor = '';
      let defaultSize = '';
      
      if (defaultVariant) {
        // Take first color from comma-separated list
        defaultColor = defaultVariant.color.split(',')[0].trim();
        // Take first size from comma-separated list
        defaultSize = defaultVariant.size.split(',')[0].trim();
      }
      
      const variantImage = defaultVariant && defaultVariant.images && defaultVariant.images[0] ? defaultVariant.images[0].image_url : '';
      
      const newItem = {
        id: Date.now().toString(),
        productId: product.id,
        name: product.name,
        price: parseFloat(product.base_price) + (defaultVariant ? parseFloat(defaultVariant.extra_price || '0') : 0),
        quantity: 1,
        selectedColor: defaultColor,
        selectedSize: defaultSize,
        image: product.image_url || variantImage
      };
      
      // Add to cart
      cartItems.push(newItem);
      localStorage.setItem('cart', JSON.stringify(cartItems));
      
      toast.success(`Added to cart`, {
        description: `${product.name} added to your cart`,
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart");
    }
  };

  // Helper function to map color names to CSS colors - add more colors as needed
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
      "Gray": "#6B7280",
      "Orange": "#F97316",
      "Pink": "#EC4899",
      "Cream": "#FEFCE8",
      "Beige": "#E5E7EB",
      "Gold": "#EAB308",
      "Silver": "#94A3B8",
      "Maroon": "#7F1D1D",
      "Olive": "#4D7C0F",
      "Teal": "#0D9488"
    };
    
    return colorMap[color] || "#888888";
  };
  
  // Get current products for pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  
  // Make sure we don't exceed array bounds
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
                <SheetContent side="left" className="w-full xs:w-[300px] sm:w-[400px] overflow-y-auto">
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
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {productCategories.map(category => (
                          <div key={category} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`mobile-category-${category}`} 
                              checked={selectedCategories.includes(category)}
                              onCheckedChange={() => toggleCategory(category)}
                            />
                            <Label htmlFor={`mobile-category-${category}`} className="text-sm capitalize">
                              {category}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mobile Gender Filter */}
                    <div className="space-y-4">
                      <h3 className="font-medium">Gender</h3>
                      <div className="space-y-2">
                        {genderCategories.map(gender => (
                          <div key={gender} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`mobile-gender-${gender}`} 
                              checked={selectedGenders.includes(gender)}
                              onCheckedChange={() => toggleGender(gender)}
                            />
                            <Label htmlFor={`mobile-gender-${gender}`} className="text-sm capitalize">
                              {gender}
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
                                color.toLowerCase() === 'white' ? 'border-gray-200' : ''
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
        
        {/* Category Scrollable Section */}
        <div className="mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex gap-2 min-w-max">
            {productCategories.slice(0, 10).map(category => (
              <button
                key={`category-section-${category}`}
                onClick={() => toggleCategorySection(category)}
                className={`px-4 py-2 text-sm rounded-full whitespace-nowrap transition-colors ${
                  activeCategorySection === category || selectedCategories.includes(category)
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary hover:bg-secondary/80'
                }`}
              >
                {category}
              </button>
            ))}
            {productCategories.length > 10 && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-full whitespace-nowrap">
                    More +
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[50vh]">
                  <div className="pt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {productCategories.map(category => (
                      <div key={`bottom-sheet-${category}`} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`bottom-sheet-category-${category}`} 
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => toggleCategory(category)}
                        />
                        <Label htmlFor={`bottom-sheet-category-${category}`} className="capitalize">
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
        
        {/* Active filters */}
        {(selectedCategories.length > 0 || selectedColors.length > 0 || selectedGenders.length > 0) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedCategories.map(category => (
              <div key={`filter-${category}`} className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-xs sm:text-sm">
                {category}
                <button onClick={() => toggleCategory(category)}>
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {selectedColors.map(color => (
              <div key={`filter-${color}`} className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-xs sm:text-sm">
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
            {selectedGenders.map(gender => (
              <div key={`filter-${gender}`} className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-xs sm:text-sm">
                {gender}
                <button onClick={() => toggleGender(gender)}>
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {(selectedCategories.length > 0 || selectedColors.length > 0 || selectedGenders.length > 0) && (
              <button 
                onClick={clearFilters}
                className="text-xs sm:text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 px-2 py-1"
              >
                Clear all
              </button>
            )}
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
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
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
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
                  
                  {/* Gender Filter */}
                  <div className="space-y-3 border-t pt-3">
                    <h3 className="font-medium">Gender</h3>
                    <div className="space-y-2">
                      {genderCategories.map(gender => (
                        <div key={gender} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`gender-${gender}`} 
                            checked={selectedGenders.includes(gender)}
                            onCheckedChange={() => toggleGender(gender)}
                          />
                          <Label htmlFor={`gender-${gender}`} className="capitalize">
                            {gender}
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
                              color.toLowerCase() === 'white' ? 'border-gray-200' : ''
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
          <div className={`grid gap-4 sm:gap-6 ${isFiltersVisible ? 'lg:col-span-4' : 'lg:col-span-5'} grid-cols-2 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`}>
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
                  onClick={() => window.location.reload()}
                  variant="outline" 
                  className="mt-4"
                >
                  Try again
                </Button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-full text-center py-8 sm:py-12">
                <h3 className="text-lg sm:text-xl font-semibold">No products found</h3>
                <p className="text-sm sm:text-base text-muted-foreground mt-2">Try changing your search or filter criteria</p>
                <Button 
                  onClick={clearFilters}
                  variant="outline" 
                  className="mt-4"
                >
                  Clear all filters
                </Button>
              </div>
            ) : (
              // Products list
              currentProducts.map(product => {
                // Handle products with or without variants
                const hasVariants = product.variants && product.variants.length > 0;
                
                // Process variant colors for display (if any)
                const variantColors = hasVariants ? 
                  product.variants
                    .filter(v => v.color)
                    .flatMap(v => v.color.split(',').map(c => c.trim()))
                    .filter((value, index, self) => self.indexOf(value) === index)
                  : [];
                
                return (
                  <Card key={product.id} className="overflow-hidden group h-full flex flex-col relative">
                    <Link to={`/products/${product.id}`} className="flex-grow flex flex-col cursor-pointer">
                      <div className="aspect-square overflow-hidden relative group-hover:opacity-90 transition-opacity">
                        <img 
                          src={product.image_url || '/placeholder.svg'} 
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder.svg';
                          }}
                        />
                      </div>
                      
                      <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            {hasVariants && product.variants[0].size && (
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                {product.variants[0].size.split(',').slice(0, 2).join(', ')}
                                {product.variants[0].size.split(',').length > 2 ? '...' : ''}
                              </p>
                            )}
                            <CardTitle className="text-sm sm:text-base md:text-lg mt-0.5 sm:mt-1">{product.name}</CardTitle>
                          </div>
                          <p className="text-xs sm:text-sm font-bold">{parseFloat(product.base_price).toLocaleString()} ETB</p>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="p-3 sm:p-4 pt-0 flex-grow">
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                        {variantColors.length > 0 && (
                          <div className="mt-2 sm:mt-3 flex flex-wrap items-center gap-1">
                            {variantColors.slice(0, 3).map((colorName, idx) => (
                              <span 
                                key={`${product.id}-${colorName}-${idx}`}
                                className={`block w-2 h-2 sm:w-3 sm:h-3 rounded-full border ${
                                  colorName.toLowerCase() === 'white' ? 'border-gray-300' : ''
                                }`}
                                style={{ backgroundColor: getColorValue(colorName) }}
                                title={colorName}
                              />
                            ))}
                            {variantColors.length > 3 && (
                              <span className="text-[10px] sm:text-xs text-muted-foreground">
                                +{variantColors.length - 3}
                              </span>
                            )}
                          </div>
                        )}
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
                );
              })
            )}
          </div>
        </div>
        
        {/* Pagination */}
        {filteredProducts.length > 0 && (
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
