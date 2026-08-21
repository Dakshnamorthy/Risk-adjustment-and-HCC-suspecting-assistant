import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Menu, X } from 'lucide-react';

const Header = ({ user, toggleMobileMenu }) => {
  const [searchValue, setSearchValue] = useState('');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchValue.trim() !== '') {
      navigate(`/member-360?id=${searchValue.trim()}`);
      setSearchValue('');
      setIsMobileSearchOpen(false);
    }
  };

  return (
    <header className="flex items-center justify-between px-4 md:px-8 py-4 bg-surface md:py-6 border-b border-surface-border sticky top-0 z-30">
      
      {/* Expandable Mobile Search Overlay */}
      {isMobileSearchOpen ? (
        <div className="flex items-center w-full gap-2 sm:hidden animate-slide-in">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-content-muted" />
            </div>
            <input
              type="text"
              value={searchValue}
              autoFocus
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleSearch}
              className="block w-full pl-10 pr-4 py-2 bg-surface-background rounded-lg text-sm text-content-main placeholder-content-muted focus:outline-none focus:ring-2 focus:ring-brand-blue border border-surface-border"
              placeholder="Search Member ID..."
            />
          </div>
          <button 
            onClick={() => setIsMobileSearchOpen(false)}
            className="p-2 text-content-muted hover:text-content-main rounded-lg"
          >
            <X size={20} />
          </button>
        </div>
      ) : (
        <>
          {/* Left side - Menu toggle and Search */}
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={toggleMobileMenu}
              className="p-2 -ml-2 text-content-muted hover:text-content-main hover:bg-surface-background rounded-lg md:hidden"
            >
              <Menu size={24} />
            </button>

            <div className="relative w-full max-w-md hidden sm:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-content-muted" />
              </div>
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={handleSearch}
                className="block w-full pl-10 pr-4 py-2.5 bg-surface-background rounded-lg text-sm text-content-main placeholder-content-muted focus:outline-none focus:ring-2 focus:ring-brand-blue border border-transparent focus:border-transparent transition-all duration-200"
                placeholder="Search Member ID (e.g. MBR-001) and press Enter..."
              />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3 md:space-x-5">
            <div className="flex items-center sm:hidden">
              <button 
                onClick={() => setIsMobileSearchOpen(true)}
                className="p-2 text-content-muted hover:text-content-main hover:bg-surface-background rounded-lg"
              >
                <Search size={20} />
              </button>
            </div>

            <div className="flex items-center space-x-3 pl-3 md:pl-5 border-l border-surface-border">
              <div className="w-9 h-9 bg-brand-navy/5 rounded-full overflow-hidden flex items-center justify-center text-brand-blue font-semibold border border-brand-blue/10 uppercase">
                {(user?.username || user?.name) ? (user.username || user.name).substring(0, 2) : 'US'}
              </div>
              <div className="text-sm hidden md:block">
                <p className="font-semibold text-content-main leading-tight capitalize">{user?.username || user?.name || 'User'}</p>
                <p className="text-xs text-content-muted capitalize">{user?.role || 'Reviewer'}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;
