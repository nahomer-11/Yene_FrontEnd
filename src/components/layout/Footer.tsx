
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-background border-t mt-auto">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-3">YENE</h3>
            <p className="text-muted-foreground text-sm">
              Quality shoes for any occasion. Find your perfect fit with us.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Contact</h3>
            <address className="text-sm text-muted-foreground not-italic">
              <p>123 Main Street</p>
              <p>Addis Ababa, Ethiopia</p>
              <p className="mt-2">Email: info@yene.com</p>
              <p>Phone: +251 912 345 678</p>
            </address>
          </div>
        </div>
        
        <div className="border-t mt-6 pt-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} YENE. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
