import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { Button } from '@/components/ui/button';
import { ShoppingCart, User, Menu, X } from 'lucide-react';

export const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItemCount(cart.length);

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
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="text-xl font-bold">
          Yene Closet
        </Link>

        {/* Hamburger Menu Icon (Mobile) */}
        <button 
          className="md:hidden p-2 focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-4">
          <Link to="/products">
            <Button variant="ghost" className="text-sm md:text-base">Products</Button>
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
              <Button className="text-sm md:text-base">Login</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-4 space-y-3 bg-background border-t">
          <div className="flex flex-col gap-2">
            <Link to="/products" onClick={() => setMenuOpen(false)}>
              <Button variant="ghost" className="w-full text-left">Products</Button>
            </Link>
            <Link to="/cart" onClick={() => setMenuOpen(false)}>
              <Button variant="ghost" className="w-full text-left">Cart</Button>
            </Link>
            {isLoggedIn ? (
              <Link to="/account" onClick={() => setMenuOpen(false)}>
                <Button variant="ghost" className="w-full text-left">Account</Button>
              </Link>
            ) : (
              <Link to="/auth" onClick={() => setMenuOpen(false)}>
                <Button variant="ghost" className="w-full text-left">Login</Button>
              </Link>
            )}
          </div>
          <div className="mt-2">
            <ThemeToggle />
          </div>
        </div>
      )}

<div className="bg-muted text-xs md:text-sm font-semibold text-center py-2 px-4 flex flex-wrap justify-center gap-1 animate-text-pulse">
  <span className="break-words whitespace-normal">
    💸 <span className="hidden sm:inline">50% ቅድመ ክፋያ ከፈለዉ</span>
    <span className="inline sm:hidden">በ 50% ቅድመ ክፋያ</span>
  </span>
  <span className="break-words whitespace-normal">
    🚚 <span className="hidden sm:inline">በ10 ቀናት ውስጥ እናደርሳለን.</span>
    <span className="inline sm:hidden">በ10 ቀናት እናደርሳለን</span>
  </span>
</div>



    </nav>
  );
};
