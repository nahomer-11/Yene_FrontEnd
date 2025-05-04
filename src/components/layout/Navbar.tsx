
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
  <div className="container flex h-16 items-center justify-between">
  <Link to="/" className="flex items-center space-x-2">
  <span className="text-2xl font-bold">Yene Closet</span>
</Link>


    {/* Text goes here, with animation */}
    <div className="text-lg text-yellow-500 font-semibold flex items-center space-x-1 mr-4 animate-pulse-glow">
  <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 💸 50% ቅድመ ክፋያ ከፈለዉ</span> 
  <span>🚚 በ10 ቀናት ውስጥ እናደርሳለን.</span>
</div>



    <div className="flex items-center space-x-4">
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
