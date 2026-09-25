import { useEffect, useRef } from "react";
import { useApp } from "../state/useApp";
import UnifiedMenu from "./UnifiedMenu";
import "./GlobalHeader.css";

export default function GlobalHeader() {
  const { activeLocation, isMenuOpen, closeMenu, toggleMenu } = useApp();
  const menuRef = useRef(null);

  // Close the menu on Escape or on a click/tap outside it
  useEffect(() => {
    if (!isMenuOpen) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") closeMenu();
    }

    function handlePointerDown(event) {
      if (!menuRef.current?.contains(event.target)) closeMenu();
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [closeMenu, isMenuOpen]);

  return (
    <header className="global-header">
      <div className="global-header-inner">
        <div className="brand-lockup" aria-label="Fish On">
          <span className="brand-mark" aria-hidden="true">FO</span>
          <span>Fish On</span>
        </div>
        <div className="header-actions" ref={menuRef}>
          <div className="active-location-badge" aria-label={`Active location: ${activeLocation.name}`}>
            <span className="location-pulse" aria-hidden="true" />
            <span>{activeLocation.name}</span>
          </div>
          <button
            className="menu-trigger"
            type="button"
            aria-expanded={isMenuOpen}
            aria-controls="global-navigation"
            onClick={toggleMenu}
          >
            <span className="menu-trigger-icon" aria-hidden="true"><i /><i /><i /></span>
            <span className="menu-trigger-label">Menu</span>
          </button>
          {isMenuOpen && <UnifiedMenu />}
        </div>
      </div>
    </header>
  );
}
