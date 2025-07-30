gsap.registerPlugin(ScrollTrigger);

// --- 1. SETUP LOCOMOTIVE SCROLL & SCROLLTRIGGER PROXY ---
// This should only be done once.
const locoScroll = new LocomotiveScroll({
    el: document.querySelector(".smooth-scroll"),
    smooth: true,
    lerp: 0.08
});

locoScroll.on("scroll", ScrollTrigger.update);

ScrollTrigger.scrollerProxy(".smooth-scroll", {
    scrollTop(value) {
        return arguments.length ? locoScroll.scrollTo(value, 0, 0) : locoScroll.scroll.instance.scroll.y;
    },
    getBoundingClientRect() {
        return {
            top: 0,
            left: 0,
            width: window.innerWidth,
            height: window.innerHeight
        };
    },
    pinType: document.querySelector(".smooth-scroll").style.transform ? "transform" : "fixed"
});


// --- UTILITY FUNCTIONS ---
const vw = (coef) => window.innerWidth * (coef / 100);
const vh = (coef) => window.innerHeight * (coef / 100);

// Utility to split text into characters for animation (kept for potential future use)
function splitTextIntoChars(selector) {
    const element = document.querySelector(selector);
    if (!element) return null;

    const text = element.textContent.trim();
    element.innerHTML = text
        .split("")
        .map(char => `<span class="char"><span class="char-inner">${char === ' ' ? '&nbsp;' : char}</span></span>`)
        .join("");
    return element.querySelectorAll(".char-inner");
}


// --- 2. HERO SECTION ANIMATION ---
function initializeHeroAnimation() {
    const heroScrollerTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: ".hero-scroller", // Still using the 250vh container for the main hero animation
            scroller: ".smooth-scroll",
            pin: true,
            start: "top top",
            end: "bottom top",
            scrub: true,
            // markers: true, // Uncomment for debugging
        },
    });

    heroScrollerTimeline.to([".hero-header.h-1", ".hero-header.h-3"], {
        scale: 2,
        y: vh(150),
        xPercent: -150
    }, "heroScroll")
    .to(".hero-header.h-2", {
        scale: 2,
        y: vh(150),
        xPercent: 150
    }, "heroScroll")
    .to(".image-wrapper", {
        scaleY: 2.5
    }, "heroScroll")
    .to("#heroImage .image", {
        scaleX: 2.5,
        xPercent: 50
    }, "heroScroll");


    // Animation for the "copy" section text
    const copySectionTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: ".hero .section.copy", // Trigger when the copy section comes into view
            scroller: ".smooth-scroll",
            start: "top 70%", // Adjust this as needed. Starts when top of copy section is 70% from top of viewport.
            end: "bottom center", // Animation completes when bottom of copy section hits center of viewport. Adjust for longer/shorter reveal.
            scrub: true, // Make the animation scrubbed (scroll-driven and reversible)
            // markers: true, // Uncomment for debugging
        },
    });

    // Animate the tagline
    const taglineElement = document.querySelector(".tagline");
    if (taglineElement) {
        const taglineSplit = new SplitText(taglineElement, { type: "words" }); // Changed type to "words"
        copySectionTimeline.from(taglineSplit.words, { // Animate words
            opacity: 0.3, // Start from 0.4 opacity
            stagger: 0.03, // Stagger each word
            ease: "power1.inOut", // Smooth ease
        }, 0); // Start at the beginning of this timeline
    }

    // Animate the hero-content (paragraph)
    const heroContentElement = document.querySelector(".hero-content");
    if (heroContentElement) {
        const heroContentSplit = new SplitText(heroContentElement, { type: "words" }); // Changed type to "words"
        copySectionTimeline.from(heroContentSplit.words, { // Animate words
            opacity: 0.3, // Start from 0.4 opacity
            stagger: 0.02, // Stagger each word (slightly faster for paragraph)
            ease: "power1.inOut", // Smooth ease
        }, 0.2); // Start 0.2 seconds after the tagline animation begins (within this timeline)
    }
}


// --- 4. INITIALIZE ALL ANIMATIONS & REFRESH SCROLLTRIGGER ---
// Wait for the window to load to ensure all elements are available.
window.addEventListener('load', () => {
    initializeHeroAnimation();
    
    // This is crucial! It tells ScrollTrigger to re-calculate all positions
    // after Locomotive Scroll has been initialized.
    ScrollTrigger.addEventListener("refresh", () => locoScroll.update());
    ScrollTrigger.refresh();
});