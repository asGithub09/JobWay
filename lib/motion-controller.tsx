"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function MotionController() {
  useEffect(() => {
    const landingPage = document.querySelector<HTMLElement>(
      '[data-motion-page="landing"]',
    );

    if (!landingPage) {
      return;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    if (reducedMotion.matches) {
      return;
    }

    const lenis = new Lenis({
      autoRaf: false,
      duration: 1.05,
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 0.9,
      touchMultiplier: 1,
      easing: (t: number) => 1 - Math.pow(1 - t, 4),
    });

    /*
     * ------------------------------------------------------------
     * LENIS ? SCROLLTRIGGER
     * ------------------------------------------------------------
     */

    const handleLenisScroll = () => {
      ScrollTrigger.update();
    };

    lenis.on("scroll", handleLenisScroll);

    /*
     * ------------------------------------------------------------
     * GSAP TICKER ? LENIS
     *
     * GSAP ticker uses seconds.
     * Lenis RAF expects milliseconds.
     * ------------------------------------------------------------
     */

    const updateLenis = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateLenis);

    /*
     * Keep GSAP and Lenis timing deterministic.
     */
    gsap.ticker.lagSmoothing(0);

    /*
     * ------------------------------------------------------------
     * LANDING PAGE MOTION SCOPE
     * ------------------------------------------------------------
     *
     * Every selector is deliberately scoped to the landing page.
     * Dashboard / educator / admin / exam interfaces are untouched.
     */

    const getElements = (selector: string): HTMLElement[] =>
      Array.from(
        landingPage.querySelectorAll<HTMLElement>(selector),
      );

    const advertisementListeners: EventListener[] = [];

    const context = gsap.context(() => {
      /*
       * ----------------------------------------------------------
       * PREMIUM REVEAL
       * ----------------------------------------------------------
       */

      getElements('[data-motion="reveal"]').forEach((element) => {
        gsap.fromTo(
          element,
          {
            opacity: 0,
            y: 42,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.95,
            ease: "power3.out",
            scrollTrigger: {
              trigger: element,
              start: "top 88%",
              once: true,
            },
          },
        );
      });

      /*
       * ----------------------------------------------------------
       * STAGGERED CONTENT
       * ----------------------------------------------------------
       */

      getElements('[data-motion="stagger"]').forEach((container) => {
        const children = Array.from(
          container.querySelectorAll<HTMLElement>(
            "[data-motion-item]",
          ),
        );

        if (!children.length) {
          return;
        }

        gsap.fromTo(
          children,
          {
            opacity: 0,
            y: 30,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: {
              trigger: container,
              start: "top 82%",
              once: true,
            },
          },
        );
      });

      /*
       * ----------------------------------------------------------
       * IMAGE DEPTH
       * ----------------------------------------------------------
       */

      getElements('[data-motion="image"]').forEach((element) => {
        const speed = Number(
          element.dataset.motionSpeed || "0.08",
        );

        gsap.fromTo(
          element,
          {
            scale: 1.06,
            yPercent: speed * -100,
          },
          {
            scale: 1,
            yPercent: speed * 100,
            ease: "none",
            scrollTrigger: {
              trigger: element,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.8,
            },
          },
        );
      });

      /*
       * ----------------------------------------------------------
       * SUBTLE PARALLAX
       * ----------------------------------------------------------
       */

      getElements('[data-motion="parallax"]').forEach((element) => {
        const speed = Number(
          element.dataset.motionSpeed || "0.08",
        );

        gsap.fromTo(
          element,
          {
            yPercent: speed * -100,
          },
          {
            yPercent: speed * 100,
            ease: "none",
            scrollTrigger: {
              trigger: element,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.8,
            },
          },
        );
      });

      /*
       * ----------------------------------------------------------
       * KINETIC TYPOGRAPHY
       * ----------------------------------------------------------
       */

      getElements('[data-motion="kinetic"]').forEach((element) => {
        gsap.fromTo(
          element,
          {
            opacity: 0,
            yPercent: 24,
            letterSpacing: "0.01em",
          },
          {
            opacity: 1,
            yPercent: 0,
            letterSpacing: "0em",
            ease: "power3.out",
            scrollTrigger: {
              trigger: element,
              start: "top 88%",
              end: "top 55%",
              scrub: 0.65,
            },
          },
        );
      });

      /*
       * ----------------------------------------------------------
       * PREMIUM SHOWCASE
       * ----------------------------------------------------------
       *
       * A restrained cinematic depth treatment for feature
       * showcases such as AI / Tech programs.
       *
       * The container remains in normal document flow.
       * Only its direct motion items receive transforms.
       */

      getElements('[data-motion="showcase"]').forEach((container) => {
        const items = Array.from(
          container.querySelectorAll<HTMLElement>(
            "[data-motion-showcase-item]",
          ),
        );

        if (!items.length) {
          return;
        }

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: container,
            start: "top 82%",
            end: "bottom 22%",
            scrub: 0.75,
          },
        });

        timeline.fromTo(
          items,
          {
            opacity: 0.72,
            y: 34,
            scale: 0.965,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.45,
            stagger: 0.08,
            ease: "power2.out",
          },
        );

        if (items.length >= 3) {
          timeline.to(
            items[0],
            {
              y: -10,
              xPercent: -1.5,
              ease: "none",
              duration: 0.5,
            },
            "<",
          );

          timeline.to(
            items[1],
            {
              y: -22,
              scale: 1.018,
              ease: "none",
              duration: 0.5,
            },
            "<",
          );

          timeline.to(
            items[2],
            {
              y: -6,
              xPercent: 1.5,
              ease: "none",
              duration: 0.5,
            },
            "<",
          );
        }
      });
      /*
       * ----------------------------------------------------------
       * LANDING ADVERTISEMENT
       * ----------------------------------------------------------
       * The advertisement component owns data/form state.
       * MotionController owns the cinematic entrance animation.
       */

      getElements('[data-motion="landing-ad"]').forEach((ad) => {
        const card = ad.querySelector<HTMLElement>(
          "[data-motion-ad-card]",
        );
        const rocket = ad.querySelector<HTMLElement>(
          "[data-motion-ad-rocket]",
        );
        const blast = ad.querySelector<HTMLElement>(
          "[data-motion-ad-blast]",
        );
        const backdrop = ad.querySelector<HTMLElement>(
          "[data-motion-ad-backdrop]",
        );

        if (!card || !rocket || !blast || !backdrop) {
          return;
        }

        const playAdvertisementEntrance = () => {
          if (ad.dataset.adVisible !== "true") {
            return;
          }

          gsap.killTweensOf([rocket, blast, card, backdrop]);

          gsap.set(rocket, {
            x: -120,
            y: 0,
            opacity: 0,
            scale: 0.8,
          });

          gsap.set(blast, {
            scale: 0.2,
            opacity: 0,
          });

          gsap.set(card, {
            y: 34,
            scale: 0.96,
            opacity: 0,
          });

          gsap.set(backdrop, {
            opacity: 0,
          });

          const timeline = gsap.timeline();

          timeline.to(rocket, {
            x: 165,
            opacity: 1,
            scale: 1,
            duration: 0.52,
            ease: "power3.in",
          });

          timeline.to(
            rocket,
            {
              x: 220,
              opacity: 0,
              scale: 1.08,
              duration: 0.16,
              ease: "power2.in",
            },
            ">-0.04",
          );

          timeline.to(
            blast,
            {
              scale: 4.5,
              opacity: 0.7,
              duration: 0.22,
              ease: "power2.out",
            },
            "<",
          );

          timeline.to(
            blast,
            {
              scale: 8,
              opacity: 0,
              duration: 0.28,
              ease: "power2.out",
            },
            ">-0.05",
          );

          timeline.to(
            backdrop,
            {
              opacity: 1,
              duration: 0.22,
              ease: "power2.out",
            },
            "<-0.16",
          );

          timeline.to(
            card,
            {
              y: 0,
              scale: 1,
              opacity: 1,
              duration: 0.62,
              ease: "power3.out",
            },
            ">-0.12",
          );
        };

        const handleAdvertisementReady = () => {
          requestAnimationFrame(playAdvertisementEntrance);
        };

        window.addEventListener(
          "jobway:landing-ad-ready",
          handleAdvertisementReady,
        );

        advertisementListeners.push(handleAdvertisementReady);

        if (ad.dataset.adVisible === "true") {
          requestAnimationFrame(playAdvertisementEntrance);
        }

        gsap.set([rocket, blast, card, backdrop], {
          willChange: "transform, opacity",
        });

        ad.dataset.motionInitialized = "true";


      });


      getElements('[data-motion="scale"]').forEach((element) => {
        gsap.fromTo(
          element,
          {
            scale: 0.965,
            opacity: 0.7,
          },
          {
            scale: 1,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: element,
              start: "top 90%",
              end: "top 48%",
              scrub: 0.7,
            },
          },
        );
      });

      /*
       * ----------------------------------------------------------
       * PINNED SHOWCASE
       * ----------------------------------------------------------
       *
       * Only elements explicitly marked with data-motion="pin"
       * are pinned. Nothing is pinned automatically.
       */

      getElements('[data-motion="pin"]').forEach((element) => {
        const section =
          element.closest<HTMLElement>(
            "[data-motion-pin-section]",
          ) ??
          element.parentElement ??
          element;

        const distance =
          section.dataset.motionPinDistance || "+=80%";

        gsap.to(element, {
          y: -18,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: distance,
            scrub: 0.8,
            pin: element,
            pinSpacing: true,
          },
        });
      });

      ScrollTrigger.refresh();
    }, landingPage);

    /*
     * Refresh after responsive layout changes.
     */
    const handleResize = () => {
      ScrollTrigger.refresh();
    };

    window.addEventListener("resize", handleResize);

    /*
     * ------------------------------------------------------------
     * CLEANUP
     * ------------------------------------------------------------
     */

    return () => {
      window.removeEventListener("resize", handleResize);

      advertisementListeners.forEach((handler) => {
        window.removeEventListener("jobway:landing-ad-ready", handler);
      });

      lenis.off("scroll", handleLenisScroll);
      gsap.ticker.remove(updateLenis);

      context.revert();

      lenis.destroy();
    };
  }, []);

  return null;
}










