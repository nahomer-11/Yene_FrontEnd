
import { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Award, ShieldCheck, Truck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { productService, FeaturedCategory } from '@/api/yene_api';

const Index = () => {
  const [featuredCategories, setFeaturedCategories] = useState<FeaturedCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
        {/* Hero Section */}
        <section className="relative h-[600px] overflow-hidden">
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1549298916-b41d501d3772"
              alt="Hero" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>
          
          <div className="relative container mx-auto h-full flex items-center px-6">
            <div className="max-w-2xl space-y-6">
              <h1 className="text-3xl md:text-5xl font-bold text-white whitespace-nowrap">
                Your closet, your style — YENE CLOSET.
              </h1>

              <p className="text-xl text-white/90 max-w-xl">
                Curated fashion made to elevate your style — comfort meets confidence at Yene Closet.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/products">
                  <Button size="lg" className="text-lg px-8 bg-primary hover:bg-primary/90">
                    Shop Now
                  </Button>
                </Link>
                <Link to="/products">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 border transition-colors 
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

        {/* Featured Categories */}
        <section className="py-20 px-6">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Featured Categories
            </h2>
            
            {loading && (
              <div className="flex justify-center items-center py-12">
                <p className="text-lg text-muted-foreground">Loading featured categories...</p>
              </div>
            )}
            
            {error && (
              <div className="flex justify-center items-center py-12">
                <p className="text-lg text-destructive">{error}</p>
              </div>
            )}
            
            {!loading && !error && featuredCategories.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {featuredCategories.map((category) => (
                  <Link to={`/products?category=${category.title.toLowerCase()}`} key={category.id}>
                    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300">
                      <div className="aspect-[4/3] overflow-hidden">
                        <img 
                          src={category.image}
                          alt={category.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <CardContent className="p-6">
                        <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
                        <p className="text-muted-foreground">{category.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
            
            {!loading && !error && featuredCategories.length === 0 && (
              <div className="flex justify-center items-center py-12">
                <p className="text-lg text-muted-foreground">No featured categories available</p>
              </div>
            )}
            
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-muted/50 py-20 px-6">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                <Card key={feature.title} className="text-center hover:shadow-lg transition-all">
                  <CardContent className="pt-6">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden">
                      <img 
                        src={feature.icon}
                        alt={feature.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>        
      </main>

      {/* Footer */}
      <footer className="bg-card border-t py-12 px-6 md:px-12 lg:px-24">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div className="space-y-4 md:max-w-xs">
              <h3 className="text-xl font-bold">Yene Closet</h3>
              <p className="text-muted-foreground">
                Premium footwear for every occasion. Step into comfort and style with Ermo Shoes.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="text-muted-foreground hover:text-foreground">Home</Link></li>
                <li><Link to="/products" className="text-muted-foreground hover:text-foreground">Products</Link></li>
                <li><Link to="/login" className="text-muted-foreground hover:text-foreground">Account</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Categories</h4>
              <ul className="space-y-2">
                <li><Link to="/products?category=running" className="text-muted-foreground hover:text-foreground">Running</Link></li>
                <li><Link to="/products?category=walking" className="text-muted-foreground hover:text-foreground">Walking</Link></li>
                <li><Link to="/products?category=sport" className="text-muted-foreground hover:text-foreground">Sport</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>Addis Ababa, Ethiopia</li>
                <li>ermaxyne@gmail.com</li>
                <li>+251 941936413</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>© {new Date().getFullYear()} Yene closet. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;