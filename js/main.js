document.addEventListener("DOMContentLoaded", function () {
  gsap.registerPlugin(ScrollTrigger);

  // --- SETUP LOCOMOTIVE SCROLL & SCROLLTRIGGER PROXY (Centralized) ---
  const locoScroll = new LocomotiveScroll({
    el: document.querySelector(".smooth-scroll"),
    smooth: true,
    lerp: 0.08,
  });

  locoScroll.on("scroll", ScrollTrigger.update);

  ScrollTrigger.scrollerProxy(".smooth-scroll", {
    scrollTop(value) {
      return arguments.length
        ? locoScroll.scrollTo(value, 0, 0)
        : locoScroll.scroll.instance.scroll.y;
    },
    getBoundingClientRect() {
      return {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      };
    },
    pinType: document.querySelector(".smooth-scroll").style.transform
      ? "transform"
      : "fixed",
  });

  // Refresh ScrollTrigger when Locomotive Scroll updates
  ScrollTrigger.addEventListener("refresh", () => locoScroll.update());
  // Initial refresh to ensure everything is calculated after content loads
  ScrollTrigger.refresh();

  // --- Animate "Who Am I?" text ---
  const aboutHeading = document.querySelector(".about h1");
  if (aboutHeading) {
    const splitAboutHeading = new SplitText(aboutHeading, { type: "words" });

    gsap.from(splitAboutHeading.words, {
      opacity: 0.2,
      stagger: 0.05,
      ease: "power1.inOut",
      scrollTrigger: {
        trigger: aboutHeading,
        scroller: ".smooth-scroll",
        start: "top 80%",
        end: "bottom center",
        scrub: true,
        // markers: true,
      },
    });
  }

  // --- Block Animation Logic (for the single top blocks container) ---
  const blockRowsForCreation = document.querySelectorAll(".block-row");
  blockRowsForCreation.forEach((row) => {
    for (let i = 0; i < 16; i++) {
      const block = document.createElement("div");
      block.className = "block";
      row.appendChild(block);
    }
  });

  const blockContainers = document.querySelectorAll(".blocks-container");
  blockContainers.forEach((container) => {
    const rows = container.querySelectorAll(".block-row");
    const numRows = rows.length;
    const isTopContainer = container.classList.contains("top");

    rows.forEach((row, rowIndex) => {
      let blocks = Array.from(row.querySelectorAll(".block"));

      gsap.to(blocks, {
        opacity: 0,
        stagger: {
          each: 0.05,
          from: "random",
        },
        scrollTrigger: {
          trigger: container,
          scroller: ".smooth-scroll",
          // markers: true,
          scrub: true,
          start: "top bottom",
          end: "bottom center",
        },
      });
    });
  });

  // --- About Content Section Animations ---
  const contentRows = document.querySelectorAll(".content-row");

  contentRows.forEach((row) => {
    const imageWrapper = row.querySelector(".content-image-wrapper");
    const textWrapper = row.querySelector(".content-text-wrapper");
    const textHeading = textWrapper.querySelector("h2");
    const textParagraph = textWrapper.querySelector("p");

    // --- Animation for Image (Opacity + Blur + Scale) ---
    gsap.to(imageWrapper, {
      opacity: 1,
      filter: "blur(0px)",
      scale: 1,
      ease: "power1.out",
      scrollTrigger: {
        trigger: row,
        scroller: ".smooth-scroll",
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        // markers: true,
        onUpdate: (self) => {
          let progress = self.progress;
          let clarityStart = 0.2;
          let clarityEnd = 0.8;
          let currentOpacity, currentBlur, currentScale;

          if (progress < clarityStart) {
            currentOpacity = gsap.utils.mapRange(
              0,
              clarityStart,
              0,
              1,
              progress
            );
            currentBlur = gsap.utils.mapRange(0, clarityStart, 20, 0, progress);
            currentScale = gsap.utils.mapRange(
              0,
              clarityStart,
              0.9,
              1,
              progress
            );
          } else if (progress > clarityEnd) {
            currentOpacity = gsap.utils.mapRange(clarityEnd, 1, 1, 0, progress);
            currentBlur = gsap.utils.mapRange(clarityEnd, 1, 0, 20, progress);
            currentScale = gsap.utils.mapRange(clarityEnd, 1, 1, 0.9, progress);
          } else {
            currentOpacity = 1;
            currentBlur = 0;
            currentScale = 1;
          }

          gsap.set(imageWrapper, {
            opacity: currentOpacity,
            filter: `blur(${currentBlur}px)`,
            scale: currentScale,
          });
        },
      },
    });

    // --- Animation for Text (Opacity Word by Word Stagger - NO BLUR) ---
    const splitHeading = new SplitText(textHeading, { type: "words" });
    const splitParagraph = new SplitText(textParagraph, { type: "words" });
    const allTextWords = [...splitHeading.words, ...splitParagraph.words];

    gsap.fromTo(
      allTextWords,
      {
        // FROM state
        opacity: 0,
        filter: "blur(20px)",
      },
      {
        // TO state
        opacity: 1,
        filter: "blur(0px)",
        ease: "power1.out",
        stagger: {
          each: 0.008,
          from: "random",
        },
        scrollTrigger: {
          trigger: row,
          scroller: ".smooth-scroll",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
          // markers: true, // Keep commented for production
          onUpdate: (self) => {
            let progress = self.progress;
            let clarityStart = 0.2;
            let clarityEnd = 0.8;
            let currentOpacity, currentBlur;

            if (progress < clarityStart) {
              currentOpacity = gsap.utils.mapRange(
                0,
                clarityStart,
                0,
                1,
                progress
              );
              currentBlur = gsap.utils.mapRange(
                0,
                clarityStart,
                20,
                0,
                progress
              );
            } else if (progress > clarityEnd) {
              currentOpacity = gsap.utils.mapRange(
                clarityEnd,
                1,
                1,
                0,
                progress
              );
              currentBlur = gsap.utils.mapRange(clarityEnd, 1, 0, 20, progress);
            } else {
              currentOpacity = 1;
              currentBlur = 0;
            }

            gsap.set(allTextWords, {
              opacity: currentOpacity,
              filter: `blur(${currentBlur}px)`,
            });
          },
        },
      }
    );
  });

  // --- Call hero animation initialization ---
  if (typeof initializeHeroAnimation === "function") {
    initializeHeroAnimation();
  }
});
