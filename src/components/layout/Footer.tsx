import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-background border-t mt-auto">
      <div className="container max-w-6xl mx-auto px-4 py-3">
        {/* Bottom Text */}
        <div className="border-t mt-4 pt-2 text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} YENE. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
