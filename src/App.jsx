import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, ShieldCheck, Cpu, Compass, Settings, CircleDot } from 'lucide-react';
import { heroFrameLoader, detailFrameLoader } from './utils/frameLoader';
import ScrollCanvas from './components/ScrollCanvas';
import FadeIn from './components/FadeIn';

// Helper function to calculate precise opacity transitions for scroll-driven text overlays
const getScrollOpacity = (progress, start, peakStart, peakEnd, end) => {
  if (progress < start || progress > end) return 0;
  if (progress >= peakStart && progress <= peakEnd) return 1;
  if (progress < peakStart) {
    return (progress - start) / (peakStart - start);
  } else {
    return (end - progress) / (end - peakEnd);
  }
};

// Specifications corresponding to Sequence 1 (images1 - The watch as a premium object)
const hudSpecs1 = [
  { limit: 0.25, stage: '01 / FRONTAL ANGLE', title: 'SPEEDMASTER CALIBRE 3861', stats: ['42MM CASE', 'CO-AXIAL ESCAPEMENT'] },
  { limit: 0.50, stage: '02 / PROFILE REFLECTION', title: 'STEEL ARCHITECTURE', stats: ['316L HOUSING', 'TWISTED LUGS'] },
  { limit: 0.75, stage: '03 / TACHYMETER PROFILE', title: 'DON OVER NINETY', stats: ['ANODIZED RING', 'MATTE BEZEL'] },
  { limit: 1.00, stage: '04 / CRYSTAL REFRACT', title: 'SAPPHIRE DOME', stats: ['DOUBLE AR COATING', 'HEIRLOOM QUALITY'] }
];

// Specifications corresponding to Sequence 2 (images2 - The watch as a precision machine)
const hudSpecs2 = [
  { limit: 0.25, stage: '05 / CHRONOGRAPH GEARS', title: 'INTERLOCKING TRAIN', stats: ['50 HR RESERVE', '3Hz FREQUENCY'] },
  { limit: 0.50, stage: '06 / ESCAPEMENT WHEEL', title: 'CO-AXIAL FRICTIONLESS', stats: ['SILICON HAIRSPRING', 'NON-MAGNETIC'] },
  { limit: 0.75, stage: '07 / BALANCE BRIDGE', title: 'CHRONOMETRIC BALANCE', stats: ['SHOCK ABSORBER', 'REGULATED MASS'] },
  { limit: 1.00, stage: '08 / CALIBRE ASSEMBLY', title: 'CO-AXIAL CALIBRE 3861', stats: ['26 JEWELS', 'MANUAL WINDING'] }
];

export default function App() {
  // We only track scrolledPastHero in state as it only triggers a render ONCE when crossing the boundary
  const [scrolledPastHero, setScrolledPastHero] = useState(false);

  // Scroll container references
  const heroContainerRef = useRef(null);
  const detailContainerRef = useRef(null);

  // Overlay DOM element references (to mutate styles directly and bypass React rendering overhead)
  const heroTextOverlayRef = useRef(null);
  const scrollCueRef = useRef(null);
  const detailOverlay1Ref = useRef(null);
  const detailOverlay2Ref = useRef(null);
  const detailOverlay3Ref = useRef(null);
  const detailOverlay4Ref = useRef(null);

  // Preload both sequences in the background on mount (non-blocking)
  useEffect(() => {
    heroFrameLoader.start();
    detailFrameLoader.start();
  }, []);

  // Track window scroll coordinates and mutate styles directly
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;

      // Track Hero Scroll
      if (heroContainerRef.current) {
        const rect = heroContainerRef.current.getBoundingClientRect();
        
        // Update header background only at boundary crosses to avoid paint stutter
        const past = rect.bottom <= windowHeight * 0.2;
        setScrolledPastHero(prev => {
          if (prev !== past) return past;
          return prev;
        });

        const scrolled = -rect.top;
        const totalScrollableHeight = rect.height - windowHeight;
        const progress = totalScrollableHeight > 0 
          ? Math.min(1, Math.max(0, scrolled / totalScrollableHeight)) 
          : 0;

        // Directly update DOM styles to achieve smooth 60fps performance
        if (heroTextOverlayRef.current) {
          const opacity = getScrollOpacity(progress, 0.0, 0.02, 0.15, 0.20);
          heroTextOverlayRef.current.style.opacity = opacity;
          heroTextOverlayRef.current.style.transform = `translateY(${40 * (1 - opacity)}px)`;
          heroTextOverlayRef.current.style.pointerEvents = opacity > 0.1 ? 'auto' : 'none';
        }

        if (scrollCueRef.current) {
          scrollCueRef.current.style.opacity = Math.max(0, 1 - progress * 5);
        }
      }

      // Track Detail Scroll
      if (detailContainerRef.current) {
        const rect = detailContainerRef.current.getBoundingClientRect();
        const scrolled = -rect.top;
        const totalScrollableHeight = rect.height - windowHeight;
        const progress = totalScrollableHeight > 0 
          ? Math.min(1, Math.max(0, scrolled / totalScrollableHeight)) 
          : 0;

        // Directly mutate styling of individual overlays
        if (detailOverlay1Ref.current) {
          const opacity = getScrollOpacity(progress, 0.02, 0.05, 0.17, 0.22);
          detailOverlay1Ref.current.style.opacity = opacity;
          detailOverlay1Ref.current.style.transform = `translateY(${40 * (1 - opacity)}px)`;
          detailOverlay1Ref.current.style.pointerEvents = opacity > 0.1 ? 'auto' : 'none';
        }

        if (detailOverlay2Ref.current) {
          const opacity = getScrollOpacity(progress, 0.27, 0.30, 0.42, 0.47);
          detailOverlay2Ref.current.style.opacity = opacity;
          detailOverlay2Ref.current.style.transform = `translateY(${40 * (1 - opacity)}px)`;
          detailOverlay2Ref.current.style.pointerEvents = opacity > 0.1 ? 'auto' : 'none';
        }

        if (detailOverlay3Ref.current) {
          const opacity = getScrollOpacity(progress, 0.52, 0.55, 0.67, 0.72);
          detailOverlay3Ref.current.style.opacity = opacity;
          detailOverlay3Ref.current.style.transform = `translateY(${40 * (1 - opacity)}px)`;
          detailOverlay3Ref.current.style.pointerEvents = opacity > 0.1 ? 'auto' : 'none';
        }

        if (detailOverlay4Ref.current) {
          const opacity = getScrollOpacity(progress, 0.77, 0.80, 0.92, 0.97);
          detailOverlay4Ref.current.style.opacity = opacity;
          detailOverlay4Ref.current.style.transform = `translateY(${40 * (1 - opacity)}px)`;
          detailOverlay4Ref.current.style.pointerEvents = opacity > 0.1 ? 'auto' : 'none';
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initialize positioning on load
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="app-root">
      {/* Ambient background accent glows (cool blues) */}
      <div className="ambient-glow" style={{ top: '15%', left: '20%', transform: 'translate(-50%, -50%)' }} />
      <div className="ambient-glow" style={{ top: '55%', right: '10%', transform: 'translate(50%, -50%)' }} />

      {/* Navigation with backdrop glass blur */}
      <nav className={scrolledPastHero ? 'nav-bar nav-bar--scrolled' : 'nav-bar'}>
        <a href="#" className="nav-logo">OMEGA</a>
        <div className="nav-links">
          <a href="#heritage" className="nav-link">Heritage</a>
          <a href="#transition" className="nav-link">Craftsmanship</a>
          <a href="#movement" className="nav-link">Calibre</a>
          <a href="#specs" className="nav-link">Specifications</a>
          <a href="#inquire" className="nav-link">Inquire</a>
        </div>
        <a href="#inquire" className="btn btn--ghost nav-cta-btn">
          Inquire
        </a>
      </nav>

      {/* SECTION 1: STICKY HERO FRAME SEQUENCE (images1 - The Watch as a Premium Object) */}
      <div ref={heroContainerRef} id="heritage" className="hero-scroll-container">
        <div className="sticky-viewport">
          <ScrollCanvas 
            loader={heroFrameLoader}
            startFrame={1} 
            endFrame={300} 
            containerRef={heroContainerRef} 
            scrollMode="sticky"
            hudSpecs={hudSpecs1}
          />
          <div className="hero-gradient-overlay" />
          
          {/* Minimal Elegant Overlay Text: OMEGA title, heading and short paragraph */}
          {/* Managed directly by DOM style mutations in handleScroll */}
          <div 
            ref={heroTextOverlayRef}
            className="hero-text-overlay"
            style={{ 
              opacity: 0, 
              transform: 'translateY(40px)',
              pointerEvents: 'none'
            }}
          >
            <span className="hero-label">OMEGA</span>
            <h1 className="hero-title">PRECISION IN MOTION</h1>
            <p className="hero-desc">
              The Speedmaster Professional. An enduring instrument of Swiss engineering, designed with mathematical balance and built to navigate the boundaries of human limits.
            </p>
            <div className="hero-cta">
              <a href="#transition" className="btn btn--ghost">
                Explore Calibre
              </a>
            </div>
          </div>

          {/* Scroll Down Cue (Fades out when scrolled deeply) */}
          <div 
            ref={scrollCueRef}
            className="scroll-cue"
            style={{ opacity: 1, pointerEvents: 'none' }}
          >
            <span className="scroll-cue-text">Scroll to reveal</span>
            <div className="scroll-cue-line" />
          </div>
        </div>
      </div>

      {/* SECTION 2: EDITORIAL TRANSITION TO MOVEMENT */}
      <section id="transition" className="transition-section">
        <div className="container">
          <div className="transition-grid">
            <FadeIn className="transition-image-col">
              {/* Still profile image showing watch caseback edge from Sequence 1 */}
              <img src="/images1/ezgif-frame-300.png" alt="Omega Speedmaster Caseback" />
            </FadeIn>

            <FadeIn className="transition-text-col" delay={200}>
              <div className="glass-panel">
                <span className="hero-label">Part II / Mechanical Anatomy</span>
                <h2 className="transition-heading">CHRONOMETRIC ARCHITECTURE</h2>
                <p className="transition-subtitle">
                  Behind the polished steel housing lies the silent engine of the Speedmaster. We expose the dial to examine the Co-Axial escapement and the calibration of space and time.
                </p>
                <a href="#movement" className="btn btn--ghost btn--small">
                  View Internals <ArrowRight className="btn-arrow" />
                </a>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* SECTION 3: INTERACTIVE DETAIL SEQUENCE (images2 - The Watch as a Precision Machine) */}
      <div ref={detailContainerRef} id="movement" className="hero-scroll-container">
        <div className="sticky-viewport">
          <ScrollCanvas 
            loader={detailFrameLoader}
            startFrame={1} 
            endFrame={300} 
            containerRef={detailContainerRef} 
            scrollMode="sticky"
            hudSpecs={hudSpecs2}
          />
          <div className="hero-gradient-overlay" />
          
          {/* Detail Overlay 1: Chronograph Gears (0.05 to 0.20) */}
          <div 
            ref={detailOverlay1Ref}
            className="hero-text-overlay"
            style={{ 
              opacity: 0,
              transform: 'translateY(40px)',
              pointerEvents: 'none'
            }}
          >
            <span className="hero-label">Chronograph Gears</span>
            <h2 className="hero-title" style={{ fontSize: '3.75rem' }}>THE WHEEL TRAIN</h2>
            <p className="hero-desc">
              A micro-engineered network of gears transfers mechanical power from the mainspring barrel to the escapement wheel with mathematical consistency.
            </p>
          </div>

          {/* Detail Overlay 2: Co-Axial Escapement (0.30 to 0.45) */}
          <div 
            ref={detailOverlay2Ref}
            className="hero-text-overlay"
            style={{ 
              opacity: 0,
              transform: 'translateY(40px)',
              pointerEvents: 'none'
            }}
          >
            <span className="hero-label">Escapement</span>
            <h2 className="hero-title" style={{ fontSize: '3.75rem' }}>FRICTIONLESS KINETICS</h2>
            <p className="hero-desc">
              Unlike the sliding contact of a Swiss lever, the Co-Axial escapement transmits energy using direct radial impulses. This reduces mechanical friction and rate decay over time.
            </p>
          </div>

          {/* Detail Overlay 3: Anti-Magnetism (0.55 to 0.70) */}
          <div 
            ref={detailOverlay3Ref}
            className="hero-text-overlay"
            style={{ 
              opacity: 0,
              transform: 'translateY(40px)',
              pointerEvents: 'none'
            }}
          >
            <span className="hero-label">Anti-Magnetism</span>
            <h2 className="hero-title" style={{ fontSize: '3.75rem' }}>15,000 GAUSS SHIELD</h2>
            <p className="hero-desc">
              Utilizing a silicon hairspring and non-magnetic materials for the pivots, the calibre maintains precise oscillation inside high-intensity magnetic fields.
            </p>
          </div>

          {/* Detail Overlay 4: Metas Standards (0.80 to 0.95) */}
          <div 
            ref={detailOverlay4Ref}
            className="hero-text-overlay"
            style={{ 
              opacity: 0,
              transform: 'translateY(40px)',
              pointerEvents: 'none'
            }}
          >
            <span className="hero-label">Metrology</span>
            <h2 className="hero-title" style={{ fontSize: '3.75rem' }}>METAS STANDARDS</h2>
            <p className="hero-desc">
              Subjected to 8 rigorous checks over 10 days, each movement is validated for power reserve, water resistance, and precision variance across multiple physical planes.
            </p>
            <div className="hero-cta">
              <a href="#specs" className="btn btn--blue">
                Technical Specifications
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: FEATURE / SPECIFICATION STORYTELLING */}
      <section id="specs" className="specs-section">
        <div className="container">
          <div className="specs-grid">
            {/* Column 1 - Case details (images1 front still) */}
            <div className="specs-column">
              <FadeIn className="specs-image-wrapper">
                <img src="/images1/ezgif-frame-001.png" alt="Omega Speedmaster Face" />
              </FadeIn>
              
              <FadeIn className="specs-text-wrapper" delay={150}>
                <h3 className="specs-category-title">01 / EXTERIOR GEOMETRY</h3>
                
                <div className="spec-card glass-panel">
                  <div className="spec-card__item">
                    <h4>Asymmetrical Steel Housing</h4>
                    <p>Brushed and polished 316L stainless steel case, measuring 42mm in diameter. Includes twisted lugs and integrated crown/pusher shields.</p>
                  </div>
                  <div className="spec-card__item">
                    <h4>Anodized Bezel Scale</h4>
                    <p>Matte black tachymeter bezel ring presenting the historical vintage 'Dot Over Ninety' alignment, highly sought by collectors.</p>
                  </div>
                </div>
              </FadeIn>
            </div>

            {/* Column 2 - Movement details (images2 still) */}
            <div className="specs-column">
              <FadeIn className="specs-image-wrapper">
                <img src="/images2/ezgif-frame-150.png" alt="Omega Calibre 3861 Internals" />
              </FadeIn>
              
              <FadeIn className="specs-text-wrapper" delay={150}>
                <h3 className="specs-category-title">02 / CALIBRE ANATOMY</h3>
                
                <div className="spec-card glass-panel">
                  <div className="spec-card__item">
                    <h4>Co-Axial Calibre 3861</h4>
                    <p>Manual-winding chronograph movement featuring rhodium plating and Geneva wave finishing. Offers a reserve power of 50 hours.</p>
                  </div>
                  <div className="spec-card__item">
                    <h4>Silicon Balance Spring</h4>
                    <p>Free-sprung hairspring crafted from pure silicon, neutralizing magnetism to provide absolute chronometric precision.</p>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: FINAL PRODUCT CLOSE */}
      <section id="inquire" className="showcase-section">
        <div className="container">
          <div className="showcase-content">
            <span className="showcase-tag">The Chronograph</span>
            <h2 className="showcase-title">THE SPEEDMASTER STANDARD</h2>
            <p className="showcase-desc">
              An heirloom of mechanical exploration and Swiss perfection. Calibrated for the absolute limit.
            </p>
            
            <FadeIn className="showcase-visual">
              {/* High-quality final watch profile */}
              <img src="/images1/ezgif-frame-001.png" alt="Omega Speedmaster Finished Object" />
            </FadeIn>
            
            <FadeIn delay={150}>
              <a href="mailto:inquire@omega.com?subject=Omega Speedmaster Inquiry" className="btn btn--blue">
                Inquire About Timepiece
              </a>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-content">
          <h4 className="footer-logo">OMEGA</h4>
          <p className="footer-tagline">The Speedmaster Chronograph Collection</p>
          
          <div className="footer-links">
            <a href="#" className="footer-link">Chronographs</a>
            <a href="#" className="footer-link">Heritage</a>
            <a href="#" className="footer-link">METAS Certification</a>
            <a href="#" className="footer-link">Locate Boutique</a>
          </div>
          
          <p className="footer-copy">
            © 2026 OMEGA. All rights reserved. This site is built as a luxury product presentation.
          </p>
        </div>
      </footer>
    </div>
  );
}
