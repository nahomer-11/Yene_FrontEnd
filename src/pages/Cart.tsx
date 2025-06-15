
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Trash2, Plus, Minus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { orderService, ProductVariant } from '@/api/yene_api';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  selectedColor: string;
  selectedSize: string;
  image: string;
  productVariantId: string;
}

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestCity, setGuestCity] = useState('');
  const [guestAddress, setGuestAddress] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = () => {
      setIsLoading(true);
      try {
        const storedCart = localStorage.getItem('cart');
        const parsed = storedCart ? JSON.parse(storedCart) : [];
        // Ensure we always have an array
        setCartItems(Array.isArray(parsed) ? parsed : []);
      } catch (error) {
        console.error("Error fetching cart:", error);
        toast.error("Failed to load cart");
        setCartItems([]); // fallback to empty array
      } finally {
        setIsLoading(false);
      }
    };

    fetchCart();
  }, []);

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    // Ensure cartItems is an array before mapping
    if (!Array.isArray(cartItems)) {
      console.error("cartItems is not an array");
      return;
    }
    
    const updatedCart = cartItems.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    toast.success("Cart updated");
  };

  const removeItem = (id: string) => {
    // Ensure cartItems is an array before filtering
    if (!Array.isArray(cartItems)) {
      console.error("cartItems is not an array");
      return;
    }
    
    const updatedCart = cartItems.filter(item => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    toast.success("Item removed from cart");
  };

  const handleSubmitOrder = async () => {
    if (!guestName || !guestPhone || !guestCity || !guestAddress) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsSubmitting(true);

  try {
    // Always send variant IDs - even if it's the default variant
    const orderItems = cartItems.map(item => ({
      product: item.productVariantId, // Always use variant ID
      quantity: item.quantity,
    }));

    const orderData = {
      delivery_eta_days: 10,
      customer_note: customerNote || "50% advance payment",
      guest_name: guestName,
      guest_phone: guestPhone,
      guest_city: guestCity,
      guest_address: guestAddress,
      items: orderItems,
    };

    await orderService.createOrder(orderData);

      localStorage.setItem('cart', JSON.stringify([]));
      setCartItems([]);
      toast.success("Order submitted successfully");
      setIsDialogOpen(false);
      navigate('/');
    } catch (error) {
      console.error("Error submitting order:", error);
      toast.error("Failed to submit order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTotal = () => {
    // Ensure cartItems is an array before reducing
    if (!Array.isArray(cartItems)) {
      return 0;
    }
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Safe check for cart items length
  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
        
        {safeCartItems.length === 0 && !isLoading ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Browse our products and add something you like!</p>
            <Button asChild>
              <Link to="/">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {safeCartItems.map(item => (
                <div 
                  key={item.id} 
                  className="flex flex-col md:flex-row items-center bg-card rounded-lg p-4 gap-4"
                >
                  <div className="w-24 h-24 bg-muted rounded-md overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 space-y-2 w-full">
                    <h3 className="font-semibold">{item.name}</h3>
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      <span>Size: {item.selectedSize}</span>
                      <span>•</span>
                      <span className="flex items-center">
                        Color: {item.selectedColor}
                        <span 
                          className="w-3 h-3 rounded-full ml-1" 
                          style={{ backgroundColor: item.selectedColor }}
                        ></span>
                      </span>
                      <span>•</span>
                      <span>Variant ID: {item.productVariantId}</span>
                    </div>
                    <div className="flex justify-between items-center w-full">
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus size={16} />
                        </Button>
                        <span>{item.quantity}</span>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus size={16} />
                        </Button>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold">
                          {(item.price * item.quantity).toLocaleString()} ETB
                        </span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeItem(item.id)}
                          className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <div className="bg-card rounded-lg p-6 shadow-sm">
                    <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{calculateTotal().toLocaleString()} ETB</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span>{calculateTotal().toLocaleString()} ETB</span>
                      </div>
                      
                      <div className="pt-4 border-t">
                        <Button 
                          className="w-full mt-6" 
                          size="lg"
                        >
                        👉👉👉  እዘዝ / Order 👈👈👈
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Complete Your Order</DialogTitle>
                    <DialogDescription>
                      💸 50% ቅድመ ክፋያ ከፈለዉ
                      🚚 በ10 ቀናት ውስጥ እናደርሳለን
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <label htmlFor="senderName" className="text-sm font-medium">
                        Name / ስም
                      </label>
                      <Input
                        id="senderName"
                        type="text"
                        placeholder="👤 ስም"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="senderPhone" className="text-sm font-medium">
                        Phone / ስልክ
                      </label>
                      <Input
                        id="senderPhone"
                        type="tel"
                        placeholder="📞 ስልክ"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="senderCity" className="text-sm font-medium">
                        City / ከተማ
                      </label>
                      <Input
                        id="senderCity"
                        type="text"
                        placeholder="🏙️ ከተማ"
                        value={guestCity}
                        onChange={(e) => setGuestCity(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="senderAddress" className="text-sm font-medium">
                        Address / አድራሻ
                      </label>
                      <Input
                        id="senderAddress"
                        type="text"
                        placeholder="🏡 አድራሻ"
                        value={guestAddress}
                        onChange={(e) => setGuestAddress(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="customerNote" className="text-sm font-medium">
                        Note (Optional)
                      </label>
                      <Input
                        id="customerNote"
                        type="text"
                        placeholder="Any special instructions"
                        value={customerNote}
                        onChange={(e) => setCustomerNote(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleSubmitOrder} disabled={isSubmitting}>
                      {isSubmitting ? 'Processing...' : 'እዘዝ / Order'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;

