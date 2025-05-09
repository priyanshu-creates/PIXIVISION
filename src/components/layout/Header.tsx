import Link from 'next/link';
import { Eye } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold" style={{ color: 'hsl(var(--secondary))' }}>
          <Eye className="h-8 w-8" style={{ color: 'hsl(var(--primary))' }}/>
          <span>PIXIVISION</span>
        </Link>
      </div>
    </header>
  );
};

export default Header;
