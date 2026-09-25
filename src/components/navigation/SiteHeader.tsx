"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { SystemThemeButton, ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/Button";

function HeaderNavigation({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const hoverOpened = useRef(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  }, []);

  const closeMenu = useCallback(
    (restoreFocus = false) => {
      cancelClose();
      hoverOpened.current = false;
      setOpen(false);
      if (restoreFocus) trigger.current?.focus();
    },
    [cancelClose],
  );

  useEffect(() => cancelClose, [cancelClose]);

  useEffect(() => {
    if (!open) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu(true);
      }
    }

    function handleOutside(event: Event) {
      if (
        event.target instanceof Node &&
        !header.current?.contains(event.target)
      )
        closeMenu();
    }

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("pointerdown", handleOutside);
    document.addEventListener("focusin", handleOutside);
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("pointerdown", handleOutside);
      document.removeEventListener("focusin", handleOutside);
    };
  }, [open, closeMenu]);

  function navigate() {
    closeMenu();
    document.getElementById("main-content")?.focus();
  }

  return (
    <header
      ref={header}
      className="site-header"
      onPointerEnter={cancelClose}
      onPointerLeave={() => {
        if (hoverOpened.current) {
          cancelClose();
          closeTimer.current = setTimeout(() => {
            if (!header.current?.contains(document.activeElement)) closeMenu();
          }, 350);
        }
      }}
    >
      <div
        className="menu-hover-zone"
        aria-hidden="true"
        onPointerEnter={(event) => {
          if (
            !open &&
            event.pointerType === "mouse" &&
            window.matchMedia("(hover: hover) and (pointer: fine)").matches
          ) {
            hoverOpened.current = true;
            setOpen(true);
          }
        }}
      />
      <div className="site-header__bar layout-container">
        <Link
          href="/"
          className="site-brand"
          aria-label="Mehdi Bouchard — accueil"
          onNavigate={navigate}
        >
          Mehdi
        </Link>
        <div className="site-header__actions">
          <ThemeToggle />
          <Button
            ref={trigger}
            variant="text"
            className="menu-trigger"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => {
              cancelClose();
              if (open && !hoverOpened.current) closeMenu();
              else {
                hoverOpened.current = false;
                setOpen(true);
              }
            }}
          >
            {open ? "Fermer" : "Menu"}
            <span className="menu-symbol" aria-hidden="true">
              {open ? "−" : "+"}
            </span>
          </Button>
        </div>
      </div>
      <div
        id="site-menu"
        className="menu-panel"
        hidden={!open}
        data-lenis-prevent
      >
        <div className="layout-container menu-panel__content">
          <nav aria-label="Navigation principale">
            {(
              [
                { href: "/#hero", label: "Accueil" },
                { href: "/#statement", label: "Intention" },
                { href: "/#selected-work", label: "Sélection" },
                { href: "/#about", label: "À propos" },
                { href: "/projects", label: "Projets" },
              ] as const
            ).map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={pathname === item.href ? "page" : undefined}
                onClick={() => closeMenu()}
                onNavigate={item.href.includes("#") ? undefined : navigate}
              >
                <span className="eyebrow" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {item.label}
                <span aria-hidden="true">↗</span>
              </Link>
            ))}
          </nav>
          <div className="menu-panel__preferences">
            <p className="eyebrow">Apparence</p>
            <SystemThemeButton />
          </div>
        </div>
      </div>
    </header>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  return <HeaderNavigation key={pathname} pathname={pathname} />;
}
