import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-background border-t mt-auto">
      <div className="container max-w-6xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h3 className="font-bold text-md mb-2">YENE-CLOSET</h3>
            <p className="text-muted-foreground text-xs">
              Your closet, your style — YENE CLOSET.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-sm mb-2">Quick Links</h3>
            <ul className="space-y-1">
              <li>
                <Link to="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Products
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-sm mb-2">Contact</h3>
            <address className="text-xs text-muted-foreground not-italic">
              <p>Addis Ababa, Ethiopia -- Email: info@yene.com --- +251941936413</p>
            </address>
          </div>
        </div>
        
        <div className="border-t mt-4 pt-4 text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} YENE. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
