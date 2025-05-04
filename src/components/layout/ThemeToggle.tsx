import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent SSR hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full opacity-0" />
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="w-10 h-10 rounded-full relative items-center justify-center flex"
      title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {/* Use opacity instead of scale/rotate to avoid the button becoming visually empty */}
      <Sun
        className={`h-5 w-5 transition-opacity duration-300 absolute ${
          theme === 'dark' ? 'opacity-0' : 'opacity-100'
        }`}
      />
      <Moon
        className={`h-5 w-5 transition-opacity duration-300 absolute ${
          theme === 'light' ? 'opacity-0' : 'opacity-100'
        }`}
      />
      <span className="sr-only">
        {theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      </span>
    </Button>
  );
};
