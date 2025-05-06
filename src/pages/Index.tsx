
import { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { Input } from '@/components/ui/input';
import { productService, FeaturedCategory } from '@/api/yene_api';

const Index = () => {
  const [featuredCategories, setFeaturedCategories] = useState<FeaturedCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchFeaturedCategories = async () => {
      try {
        setLoading(true);
        const categories = await productService.getFeaturedCategories();
        setFeaturedCategories(categories);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch featured categories:", err);
        setError("Failed to load featured categories");
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedCategories();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section - Optimized for mobile */}
        <section className="relative h-[400px] md:h-[600px] overflow-hidden">
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1549298916-b41d501d3772"
              alt="Hero" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>
          
          <div className="relative container mx-auto h-full flex items-center px-4 sm:px-6">
            <div className="w-full max-w-2xl space-y-4 md:space-y-6">
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white">
                Your closet, your style — YENE CLOSET.
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-xl">
                Curated fashion made to elevate your style — comfort meets confidence at Yene Closet.
              </p>
              <div className="flex flex-wrap gap-3 md:gap-4">
                <Link to="/products">
                  <Button size={isMobile ? "default" : "lg"} className="text-sm md:text-lg px-4 md:px-8 bg-primary hover:bg-primary/90">
                    Shop Now
                  </Button>
                </Link>
                <Link to="/products">
                  <Button
                    size={isMobile ? "default" : "lg"}
                    variant="outline"
                    className="text-sm md:text-lg px-4 md:px-8 border transition-colors 
                              text-white border-white hover:bg-white/10 
                              dark:text-white dark:border-white 
                              text-black border-black hover:bg-black/10"
                  >
                    View Collections
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Categories - Mobile optimized grid */}
        <section className="py-10 md:py-20 px-4 sm:px-6">
          <div className="container mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">
              Featured Categories
            </h2>
            
            {loading && (
              <div className="flex justify-center items-center py-8 md:py-12">
                <p className="text-base md:text-lg text-muted-foreground">Loading featured categories...</p>
              </div>
            )}
            
            {error && (
              <div className="flex justify-center items-center py-8 md:py-12">
                <p className="text-base md:text-lg text-destructive">{error}</p>
              </div>
            )}
            
            {!loading && !error && featuredCategories.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
                {featuredCategories.map((category) => (
                  <Link to={`/products?category=${category.title.toLowerCase()}`} key={category.id}>
                    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
                      <div className="aspect-[3/2] overflow-hidden">
                        <img 
                          src={category.image}
                          alt={category.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <CardContent className="p-4 md:p-6">
                        <h3 className="text-lg md:text-xl font-semibold mb-1 md:mb-2">{category.title}</h3>
                        <p className="text-sm md:text-base text-muted-foreground">{category.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
            
            {!loading && !error && featuredCategories.length === 0 && (
              <div className="flex justify-center items-center py-8 md:py-12">
                <p className="text-base md:text-lg text-muted-foreground">No featured categories available</p>
              </div>
            )}
            
          </div>
        </section>

        {/* Features Section - Mobile optimized */}
        <section className="bg-muted/50 py-10 md:py-20 px-4 sm:px-6">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
              {[
                {
                  title: "💃 Stylish Design",
                  description: "Modern looks made for every vibe.",
                  icon: "https://images.unsplash.com/photo-1560769629-975ec94e6a86"
                },
                {
                  title: "👟 Perfect Fit",
                  description: "From head to toe — fit that feels right.",
                  icon: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28"
                },
                {
                  title: "✨ Affordable Fashion",
                  description: "Style that doesn't break the bank.",
                  icon: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2"
                }
              ].map((feature) => (
                <Card key={feature.title} className="text-center hover:shadow-lg transition-all h-full">
                  <CardContent className="p-4 md:p-6 md:pt-6">
                    <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 md:mb-4 rounded-full overflow-hidden">
                      <img 
                        src={feature.icon}
                        alt={feature.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-lg md:text-xl font-semibold mb-1 md:mb-2">{feature.title}</h3>
                    <p className="text-sm md:text-base text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>        
      </main>

      {/* Footer - Mobile Optimized */}
<footer className="bg-card border-t py-2 md:py-4 px-4 sm:px-6 md:px-8 lg:px-12">
  <div className="border-t mt-2 md:mt-4 pt-2 md:pt-4 text-center text-xs md:text-xs text-muted-foreground">
    <p>© {new Date().getFullYear()} Yene Closet. All rights reserved.</p>
  </div>
</footer>
    </div>
  );
};

export default Index;
