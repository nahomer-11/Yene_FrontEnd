
import { Link } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { Button } from '@/components/ui/button';
import { ShoppingCart, User } from 'lucide-react';
import { useEffect, useState } from 'react';

export const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    
    // Get cart item count
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItemCount(cart.length);
    
    // Update cart count when localStorage changes
    const handleStorageChange = () => {
      const updatedCart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartItemCount(updatedCart.length);
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  return (
<nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
  <div className="container flex flex-col md:flex-row md:items-center md:justify-between gap-2 py-2">
    
    {/* Left: Logo */}
    <div className="flex items-center justify-between w-full md:w-auto">
      <Link to="/" className="flex items-center space-x-2">
        <span className="text-2xl font-bold">Yene Closet</span>
      </Link>
    </div>

    {/* Center: Announcement */}
    <div className="text-base text-yellow-500 font-semibold flex flex-wrap items-center justify-center text-center animate-pulse-glow px-2">
      <span className="whitespace-normal break-words mr-2">💸 50% ቅድመ ክፋያ ከፈለዉ</span>
      <span className="whitespace-normal break-words">🚚 በ10 ቀናት ውስጥ እናደርሳለን.</span>
    </div>

    {/* Right: Actions */}
    <div className="flex items-center justify-end space-x-4 w-full md:w-auto">
      <Link to="/products">
        <Button variant="ghost" className="text-lg">Products</Button>
      </Link>

      <Link to="/cart" className="relative">
        <Button variant="ghost" size="icon">
          <ShoppingCart className="h-5 w-5" />
          {cartItemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {cartItemCount}
            </span>
          )}
        </Button>
      </Link>

      <ThemeToggle />

      {isLoggedIn ? (
        <Link to="/account">
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </Link>
      ) : (
        <Link to="/auth">
          <Button>Login</Button>
        </Link>
      )}
    </div>

  </div>
</nav>

  );
};
