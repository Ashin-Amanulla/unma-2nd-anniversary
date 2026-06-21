import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Bars3Icon, XMarkIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

/** Parent label for Events + News & Updates + Webinars. Alternatives: "Stay Updated", "News & Events", "Explore". */
const DISCOVER_GROUP_LABEL = "What's On";

const discoverChildren = [
  { to: "/events", label: "Events" },
  { to: "/news-updates", label: "News & Updates" },
  { to: "/webinars", label: "Webinars" },
];

const Header = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [discoverOpen, setDiscoverOpen] = useState(false);
  const [mobileDiscoverOpen, setMobileDiscoverOpen] = useState(false);
  const discoverRef = useRef(null);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);


  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close menu when clicking a link
  const closeMenu = () => {
    setIsMenuOpen(false);
    setMobileDiscoverOpen(false);
  };

  const isDiscoverChildActive = discoverChildren.some(
    (item) =>
      location.pathname === item.to ||
      (item.to !== "/" && location.pathname.startsWith(`${item.to}/`))
  );

  useEffect(() => {
    setDiscoverOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!discoverOpen) return;
    const handlePointerDown = (e) => {
      if (discoverRef.current && !discoverRef.current.contains(e.target)) {
        setDiscoverOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") setDiscoverOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [discoverOpen]);

  // Navigation items (top-level only; discover group rendered separately)
  const navItems = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/fifa", label: "FIFA ⚽" },
    { to: "/gallery", label: "Gallery" },
    { to: "/careers", label: "Careers" },
    { to: "/contact", label: "Contact" },
  ];

  const NavItem = ({ to, label }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-2 my-1 rounded-lg transition-all duration-200 relative text-sm ${
          isActive
            ? "text-primary font-medium"
            : "text-gray-600 hover:text-primary hover:bg-gray-50"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {label}
          {isActive && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded"></span>
          )}
        </>
      )}
    </NavLink>
  );

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white shadow-md py-2"
          : "bg-white py-3 border-b border-gray-200"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo - Left */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img
                src="/logo.png"
                alt="UNMA"
                className="h-10 w-auto"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://media.licdn.com/dms/image/v2/C4E0BAQHBiErpz5o1lQ/company-logo_200_200/company-logo_200_200/0/1631331050086?e=2147483647&v=beta&t=4nyvBmOtfitoTakRa43Jj5aP37obR-FqNF80JBm2VQk";
                }}
              />
            </Link>
          </div>

          {/* Desktop Navigation - Center */}
          <nav className="hidden lg:flex items-center justify-center flex-1">
            <div className="flex items-center space-x-1">
              {navItems.slice(0, 2).map((item) => (
                <NavItem key={item.to} to={item.to} label={item.label} />
              ))}

              <div className="relative" ref={discoverRef}>
                <button
                  type="button"
                  onClick={() => setDiscoverOpen((o) => !o)}
                  aria-expanded={discoverOpen}
                  aria-haspopup="true"
                  className={`px-3 py-2 my-1 rounded-lg transition-all duration-200 relative text-sm inline-flex items-center gap-1 ${
                    isDiscoverChildActive || discoverOpen
                      ? "text-primary font-medium"
                      : "text-gray-600 hover:text-primary hover:bg-gray-50"
                  }`}
                >
                  {DISCOVER_GROUP_LABEL}
                  <ChevronDownIcon
                    className={`w-4 h-4 shrink-0 transition-transform ${discoverOpen ? "rotate-180" : ""}`}
                    aria-hidden
                  />
                  {isDiscoverChildActive && !discoverOpen && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded" />
                  )}
                </button>
                {discoverOpen && (
                  <div
                    className="absolute top-full left-0 mt-1 py-1 min-w-[13rem] bg-white rounded-lg shadow-lg border border-gray-100 z-[60]"
                    role="menu"
                  >
                    {discoverChildren.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        role="menuitem"
                        onClick={() => setDiscoverOpen(false)}
                        className={({ isActive }) =>
                          `block px-4 py-2.5 text-sm rounded-md mx-1 ${
                            isActive
                              ? "text-primary font-medium bg-blue-50"
                              : "text-gray-700 hover:bg-gray-50 hover:text-primary"
                          }`
                        }
                      >
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>

              {navItems.slice(2).map((item) => (
                <NavItem key={item.to} to={item.to} label={item.label} />
              ))}
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 lg:hidden"
          >
            <span className="sr-only">Open main menu</span>
            {isMenuOpen ? (
              <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
            ) : (
              <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden">
          <div className="px-4 py-2 space-y-1 bg-white shadow-lg border-t border-gray-100">
            {navItems.slice(0, 2).map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-md text-base ${
                    isActive
                      ? "text-primary font-medium bg-blue-50"
                      : "text-gray-600 hover:bg-gray-50 hover:text-primary"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}

            <div className="border-t border-gray-100 pt-1 mt-1">
              <button
                type="button"
                onClick={() => setMobileDiscoverOpen((o) => !o)}
                aria-expanded={mobileDiscoverOpen}
                className={`flex w-full items-center justify-between px-4 py-2 rounded-md text-base ${
                  isDiscoverChildActive
                    ? "text-primary font-medium bg-blue-50"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {DISCOVER_GROUP_LABEL}
                <ChevronDownIcon
                  className={`w-5 h-5 shrink-0 transition-transform ${mobileDiscoverOpen ? "rotate-180" : ""}`}
                  aria-hidden
                />
              </button>
              {mobileDiscoverOpen && (
                <div className="mt-1 ml-2 pl-3 border-l-2 border-primary/30 space-y-0.5">
                  {discoverChildren.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={closeMenu}
                      className={({ isActive }) =>
                        `block px-4 py-2 rounded-md text-base ${
                          isActive
                            ? "text-primary font-medium bg-blue-50"
                            : "text-gray-600 hover:bg-gray-50 hover:text-primary"
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>

            {navItems.slice(2).map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-md text-base ${
                    isActive
                      ? "text-primary font-medium bg-blue-50"
                      : "text-gray-600 hover:bg-gray-50 hover:text-primary"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

const FloatingCreditButton = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const fullHeight = document.body.offsetHeight;

      // Hide button when 100px or less from bottom
      if (scrollY + windowHeight >= fullHeight - 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-6 right-6 z-40 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <a
        href="https://xyvin.com"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full px-4 py-2 shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105 text-sm font-medium"
        title="Visit Xyvin - Web Development Company"
      >
        <span className="flex items-center space-x-2">
          <span>Supported</span>
          <span className="font-semibold">by Xyvin</span>
        </span>
      </a>
    </div>
  );
};

// Export both components
export { FloatingCreditButton };
export default Header;
