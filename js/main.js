// Initialize Lenis smooth scroll with fallback
let lenis;

try {
    lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true
    });
    
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    
    // GSAP ScrollTrigger integration
    lenis.on('scroll', ScrollTrigger.update);
    
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    
    console.log('Lenis initialized successfully');
} catch (error) {
    console.warn('Lenis failed to load, using fallback smooth scroll');
    // Fallback to CSS smooth scroll
    document.documentElement.style.scrollBehavior = 'smooth';
}

gsap.ticker.lagSmoothing(0);

// Custom Cursor with Background Detection
const cursor = document.querySelector('.cursor');
let mouseX = 0;
let mouseY = 0;

// Function to detect background color at cursor position
function detectBackgroundColor(x, y) {
    // Get the element at the cursor position
    const element = document.elementFromPoint(x, y);
    if (!element) return 'light';
    
    // Check for specific dark sections first (most reliable)
    const darkSections = ['.about', '.work', '.nav-overlay', '.preloader', '.footer'];
    for (const selector of darkSections) {
        if (element.closest(selector)) {
            return 'dark';
        }
    }
    
    // Check for light sections
    const lightSections = ['.hero', '.timeline', '.cta'];
    for (const selector of lightSections) {
        if (element.closest(selector)) {
            return 'light';
        }
    }
    
    // Check if element has dark background
    const computedStyle = window.getComputedStyle(element);
    const backgroundColor = computedStyle.backgroundColor;
    
    // Check for dark backgrounds
    if (backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'transparent') {
        const rgb = backgroundColor.match(/\d+/g);
        if (rgb && rgb.length >= 3) {
            const brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;
            if (brightness < 128) return 'dark';
        }
    }
    
    // Check parent elements for background color
    let parent = element.parentElement;
    while (parent && parent !== document.body) {
        const parentStyle = window.getComputedStyle(parent);
        const parentBg = parentStyle.backgroundColor;
        
        if (parentBg && parentBg !== 'rgba(0, 0, 0, 0)' && parentBg !== 'transparent') {
            const rgb = parentBg.match(/\d+/g);
            if (rgb && rgb.length >= 3) {
                const brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;
                if (brightness < 128) return 'dark';
            }
        }
        parent = parent.parentElement;
    }
    
    // Default to light
    return 'light';
}

// Function to update cursor appearance based on background
function updateCursorAppearance(x, y) {
    const backgroundType = detectBackgroundColor(x, y);
    
    // Remove existing background classes
    cursor.classList.remove('light-bg', 'dark-bg');
    
    // Add appropriate class
    if (backgroundType === 'dark') {
        cursor.classList.add('dark-bg');
    } else {
        cursor.classList.add('light-bg');
    }
}

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Update cursor appearance based on background
    updateCursorAppearance(mouseX, mouseY);
});

gsap.to(cursor, {
    duration: 0.08,
    repeat: -1,
    ease: "none",
    onRepeat: () => {
        gsap.set(cursor, {
            left: mouseX,
            top: mouseY
        });
    }
});

// Cursor hover effects
const hoverElements = document.querySelectorAll('a, button, [data-hover]');
hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
});

// Update cursor when scrolling (in case background changes)
window.addEventListener('scroll', () => {
    updateCursorAppearance(mouseX, mouseY);
});

// Hide cursor when mouse leaves the page
document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
});

// Show cursor when mouse enters the page
document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
});

// Initialize cursor appearance on page load
document.addEventListener('DOMContentLoaded', () => {
    updateCursorAppearance(mouseX, mouseY);
    // Initialize preloader after DOM is ready
    initPreloader();
});

// Preloader Animation with Teleporting Counter
function initPreloader() {
    const preloader = document.querySelector('.preloader');
    const preloaderText = document.querySelector('.preloader-text');
    const preloaderLine = document.querySelector('.preloader-line');
    const preloaderCounter = document.querySelector('.preloader-counter');
    const preloaderTop = document.querySelector('.preloader-top');
    const preloaderBottom = document.querySelector('.preloader-bottom');

    // Check if preloader elements exist
    if (!preloader || !preloaderText || !preloaderLine || !preloaderCounter || !preloaderTop || !preloaderBottom) {
        console.warn('Preloader elements not found, skipping preloader animation');
        initHeroAnimations();
        return;
    }

    // Check if GSAP is available
    if (typeof gsap === 'undefined') {
        console.warn('GSAP not loaded, using fallback preloader');
        // Simple fallback: hide preloader after 3 seconds
        setTimeout(() => {
            preloader.style.display = 'none';
            initHeroAnimations();
        }, 3000);
        return;
    }

    // Counter animation from 0 to 99 with teleporting effect
    let currentCount = 0;
    const targetCount = 99;
    const counterSteps = 5; // Reduced to 5 teleportation points
    const stepDuration = 400; // Longer duration for each teleport (ms)

    gsap.timeline()
        .to(preloaderText, {
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out'
        })
        .to(preloaderLine, {
            width: '300px',
            duration: 1.2,
            ease: 'power2.out'
        }, '-=0.4')
        .to(preloaderCounter, {
            opacity: 1,
            duration: 0.6,
            ease: 'power2.out'
        }, '-=0.6');

    // Start counter teleportation after initial elements appear
    setTimeout(() => {
        let stepIndex = 0;
        
        const teleportCounter = () => {
            if (stepIndex >= counterSteps) {
                // Final exit animation with clip-path block reveal
                gsap.timeline({ delay: 0.5 })
                    .to([preloaderText, preloaderLine, preloaderCounter], {
                        opacity: 0,
                        duration: 0.6,
                        ease: 'power2.in'
                    })
                    .to(preloaderTop, {
                        clipPath: 'inset(0 0 100% 0)',
                        duration: 1.2,
                        ease: 'power4.inOut'
                    })
                    .to(preloaderBottom, {
                        clipPath: 'inset(100% 0 0 0)',
                        duration: 1.2,
                        ease: 'power4.inOut',
                        onComplete: () => {
                            preloader.style.display = 'none';
                            initHeroAnimations();
                        }
                    }, '<'); // '<' means start at the same time as previous animation
                return;
            }
            
            // Calculate the number for this step with bigger jumps
            const targetNumbers = [0, 24, 47, 73, 99]; // Predefined progression
            currentCount = targetNumbers[stepIndex];
            
            // Calculate position along the bottom (left to right)
            const progress = stepIndex / (counterSteps - 1);
            const leftPosition = 3 + (progress * 85); // From 3% to 88%
            
            // Teleport effect: fade out, move, fade in
            gsap.timeline()
                .to(preloaderCounter, {
                    opacity: 0,
                    scale: 0.8,
                    duration: 0.2,
                    ease: 'power2.in'
                })
                .call(() => {
                    preloaderCounter.textContent = currentCount.toString().padStart(2, '0');
                    gsap.set(preloaderCounter, {
                        left: `${leftPosition}%`
                    });
                })
                .to(preloaderCounter, {
                    opacity: 1,
                    scale: 1,
                    duration: 0.2,
                    ease: 'power2.out'
                });
            
            stepIndex++;
            setTimeout(teleportCounter, stepDuration * 1.5); // Wait between teleports
        };
        
        teleportCounter();
    }, 1500); // Start counter after 1.5 seconds
}

// Timeline Section Animations
function initTimelineAnimations() {
    const timelineHeadingWords = document.querySelectorAll('.timeline-heading .word');
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    ScrollTrigger.create({
        trigger: '.timeline',
        start: 'top 80%',
        end: 'bottom 20%',
        onEnter: () => {
            // Animate heading
            gsap.to(timelineHeadingWords, {
                y: 0,
                duration: 1,
                stagger: 0.2,
                ease: 'power4.out'
            });
            
            // Animate timeline items with staggered entrance
            timelineItems.forEach((item, index) => {
                const year = item.querySelector('.year');
                const title = item.querySelector('.title');
                const description = item.querySelector('.description p');
                const image = item.querySelector('.image-placeholder');
                
                // Create timeline for each item
                const itemTimeline = gsap.timeline({
                    delay: 0.5 + (index * 0.3)
                });
                
                // Animate image first
                itemTimeline.fromTo(image, {
                    opacity: 0,
                    scale: 0.8,
                    y: 50
                }, {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    duration: 1,
                    ease: 'power4.out'
                });
                
                // Then animate text elements
                itemTimeline.to([year, title, description], {
                    y: 0,
                    duration: 1.2,
                    stagger: 0.15,
                    ease: 'power4.out'
                }, '-=0.5');
            });
        },
        onLeave: () => {
            gsap.set([timelineHeadingWords], { y: '100%' });
            timelineItems.forEach(item => {
                const elements = item.querySelectorAll('.year, .title, .description p');
                const image = item.querySelector('.image-placeholder');
                gsap.set(elements, { y: '100%' });
                gsap.set(image, { opacity: 0, scale: 0.8, y: 50 });
            });
        },
        onEnterBack: () => {
            gsap.to(timelineHeadingWords, {
                y: 0,
                duration: 1,
                stagger: 0.2,
                ease: 'power4.out'
            });
            
            timelineItems.forEach((item, index) => {
                const year = item.querySelector('.year');
                const title = item.querySelector('.title');
                const description = item.querySelector('.description p');
                const image = item.querySelector('.image-placeholder');
                
                const itemTimeline = gsap.timeline({
                    delay: 0.3 + (index * 0.2)
                });
                
                itemTimeline.to(image, {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    duration: 1,
                    ease: 'power4.out'
                });
                
                itemTimeline.to([year, title, description], {
                    y: 0,
                    duration: 1.2,
                    stagger: 0.15,
                    ease: 'power4.out'
                }, '-=0.5');
            });
        },
        onLeaveBack: () => {
            gsap.set([timelineHeadingWords], { y: '100%' });
            timelineItems.forEach(item => {
                const elements = item.querySelectorAll('.year, .title, .description p');
                const image = item.querySelector('.image-placeholder');
                gsap.set(elements, { y: '100%' });
                gsap.set(image, { opacity: 0, scale: 0.8, y: 50 });
            });
        }
    });
}

// Gallery Section Animations
function initGalleryAnimations() {
    const galleryHeadingWords = document.querySelectorAll('.gallery-heading .word');
    const bentoItems = document.querySelectorAll('.bento-item');
    
    ScrollTrigger.create({
        trigger: '.gallery',
        start: 'top 80%',
        end: 'bottom 20%',
        onEnter: () => {
            // Animate heading
            gsap.to(galleryHeadingWords, {
                y: 0,
                duration: 1,
                stagger: 0.2,
                ease: 'power4.out'
            });
            
            // Animate bento items with staggered entrance
            gsap.to(bentoItems, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 1.2,
                stagger: 0.1,
                ease: 'power4.out',
                delay: 0.5
            });
        },
        onLeave: () => {
            gsap.set([galleryHeadingWords], { y: '100%' });
            gsap.set(bentoItems, { 
                opacity: 0, 
                y: '50px', 
                scale: 0.9 
            });
        },
        onEnterBack: () => {
            gsap.to(galleryHeadingWords, {
                y: 0,
                duration: 1,
                stagger: 0.2,
                ease: 'power4.out'
            });
            
            gsap.to(bentoItems, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 1.2,
                stagger: 0.1,
                ease: 'power4.out',
                delay: 0.3
            });
        },
        onLeaveBack: () => {
            gsap.set([galleryHeadingWords], { y: '100%' });
            gsap.set(bentoItems, { 
                opacity: 0, 
                y: '50px', 
                scale: 0.9 
            });
        }
    });
}

// Gallery Media Interactions
function initGalleryInteractions() {
    const bentoItems = document.querySelectorAll('.bento-item');
    
    bentoItems.forEach(item => {
        const mediaContainer = item.querySelector('.media-container');
        const video = item.querySelector('video');
        
        if (video) {
            // Pause video on hover out
            mediaContainer.addEventListener('mouseenter', () => {
                video.play();
            });
            
            mediaContainer.addEventListener('mouseleave', () => {
                video.pause();
            });
        }
        
        // Add click interaction for fullscreen (optional)
        mediaContainer.addEventListener('click', () => {
            if (video) {
                if (video.requestFullscreen) {
                    video.requestFullscreen();
                }
            }
        });
    });
}

// Text Reveal Animations for About Section
function initAboutAnimations() {
    const aboutHeadingWords = document.querySelectorAll('.about-heading .word');
    const aboutTextP = document.querySelector('.about-text p');
    const videoContainer = document.querySelector('.video-container');
    
    // Create ScrollTrigger for About section text reveals
    ScrollTrigger.create({
        trigger: '.about',
        start: 'top 80%',
        end: 'bottom 20%',
        onEnter: () => {
            // Animate heading words
            gsap.to(aboutHeadingWords, {
                y: 0,
                duration: 1,
                stagger: 0.2,
                ease: 'power4.out'
            });
            
            // Animate paragraph
            gsap.to(aboutTextP, {
                y: 0,
                duration: 1.2,
                ease: 'power4.out',
                delay: 0.4
            });
            
            // Animate video container
            gsap.to(videoContainer, {
                y: 0,
                duration: 1.4,
                ease: 'power4.out',
                delay: 0.8
            });
        },
        onLeave: () => {
            // Reset animations when leaving viewport (going down)
            gsap.set([aboutHeadingWords, aboutTextP, videoContainer], {
                y: '100%'
            });
        },
        onEnterBack: () => {
            // Re-animate when scrolling back up
            gsap.to(aboutHeadingWords, {
                y: 0,
                duration: 1,
                stagger: 0.2,
                ease: 'power4.out'
            });
            
            gsap.to(aboutTextP, {
                y: 0,
                duration: 1.2,
                ease: 'power4.out',
                delay: 0.4
            });
            
            gsap.to(videoContainer, {
                y: 0,
                duration: 1.4,
                ease: 'power4.out',
                delay: 0.8
            });
        },
        onLeaveBack: () => {
            // Reset animations when leaving viewport (going up)
            gsap.set([aboutHeadingWords, aboutTextP, videoContainer], {
                y: '100%'
            });
        }
    });
}

// CTA Section Animations
function initCTAAnimations() {
    const ctaHeadingWords = document.querySelectorAll('.cta-heading .word');
    const ctaText = document.querySelector('.cta-text');
    const statItems = document.querySelectorAll('.stat-item');
    const ctaButtons = document.querySelectorAll('.cta-button');
    const ctaDecoration = document.querySelector('.cta-decoration');
    
    ScrollTrigger.create({
        trigger: '.cta',
        start: 'top 80%',
        end: 'bottom 20%',
        onEnter: () => {
            // Animate heading
            gsap.to(ctaHeadingWords, {
                y: 0,
                duration: 1,
                stagger: 0.15,
                ease: 'power4.out'
            });
            
            // Animate text
            gsap.to(ctaText, {
                opacity: 1,
                y: 0,
                duration: 1.2,
                ease: 'power4.out',
                delay: 0.4
            });
            
            // Animate stats
            gsap.to(statItems, {
                opacity: 1,
                y: 0,
                duration: 1,
                stagger: 0.1,
                ease: 'power4.out',
                delay: 0.6
            });
            
            // Animate buttons
            gsap.to(ctaButtons, {
                opacity: 1,
                y: 0,
                duration: 1,
                stagger: 0.1,
                ease: 'power4.out',
                delay: 0.8
            });
            
            // Animate decoration
            gsap.to(ctaDecoration, {
                opacity: 1,
                scale: 1,
                duration: 1.2,
                ease: 'power4.out',
                delay: 1
            });
        },
        onLeave: () => {
            gsap.set([ctaHeadingWords], { y: '100%' });
            gsap.set([ctaText, statItems, ctaButtons], { 
                opacity: 0, 
                y: '30px' 
            });
            gsap.set(ctaDecoration, { 
                opacity: 0, 
                scale: 0.8 
            });
        },
        onEnterBack: () => {
            gsap.to(ctaHeadingWords, {
                y: 0,
                duration: 1,
                stagger: 0.15,
                ease: 'power4.out'
            });
            
            gsap.to(ctaText, {
                opacity: 1,
                y: 0,
                duration: 1.2,
                ease: 'power4.out',
                delay: 0.4
            });
            
            gsap.to(statItems, {
                opacity: 1,
                y: 0,
                duration: 1,
                stagger: 0.1,
                ease: 'power4.out',
                delay: 0.6
            });
            
            gsap.to(ctaButtons, {
                opacity: 1,
                y: 0,
                duration: 1,
                stagger: 0.1,
                ease: 'power4.out',
                delay: 0.8
            });
            
            gsap.to(ctaDecoration, {
                opacity: 1,
                scale: 1,
                duration: 1.2,
                ease: 'power4.out',
                delay: 1
            });
        },
        onLeaveBack: () => {
            gsap.set([ctaHeadingWords], { y: '100%' });
            gsap.set([ctaText, statItems, ctaButtons], { 
                opacity: 0, 
                y: '30px' 
            });
            gsap.set(ctaDecoration, { 
                opacity: 0, 
                scale: 0.8 
            });
        }
    });
}

// Services Section Animations
function initServicesAnimations() {
    const servicesHeadingWords = document.querySelectorAll('.services-heading .word');
    const serviceTiles = document.querySelectorAll('.service-tile');

    if (!servicesHeadingWords.length || !serviceTiles.length) return;

    ScrollTrigger.create({
        trigger: '.services',
        start: 'top 80%',
        end: 'bottom 20%',
        onEnter: () => {
            gsap.to(servicesHeadingWords, {
                y: 0,
                duration: 1,
                stagger: 0.15,
                ease: 'power4.out'
            });

            gsap.fromTo(serviceTiles, {
                opacity: 0,
                y: 40,
                scale: 0.98
            }, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 1.1,
                stagger: 0.12,
                ease: 'power4.out',
                delay: 0.2
            });
        },
        onLeave: () => {
            gsap.set(servicesHeadingWords, { y: '100%' });
            gsap.set(serviceTiles, { opacity: 0, y: 40, scale: 0.98 });
        },
        onEnterBack: () => {
            gsap.to(servicesHeadingWords, {
                y: 0,
                duration: 1,
                stagger: 0.15,
                ease: 'power4.out'
            });
            gsap.to(serviceTiles, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 1.1,
                stagger: 0.1,
                ease: 'power4.out'
            });
        },
        onLeaveBack: () => {
            gsap.set(servicesHeadingWords, { y: '100%' });
            gsap.set(serviceTiles, { opacity: 0, y: 40, scale: 0.98 });
        }
    });
}

// Filler Content Animations
function initFillerAnimations() {
    const fillerHeadingWords = document.querySelectorAll('.filler-heading .word');
    const fillerDescription = document.querySelector('.filler-description');
    const statItems = document.querySelectorAll('.stat-item');

    if (!fillerHeadingWords.length) return;

    ScrollTrigger.create({
        trigger: '.filler-content',
        start: 'top 80%',
        end: 'bottom 20%',
        onEnter: () => {
            gsap.to(fillerHeadingWords, {
                y: 0,
                duration: 1,
                stagger: 0.15,
                ease: 'power4.out'
            });

            gsap.fromTo(fillerDescription, {
                opacity: 0,
                y: 30
            }, {
                opacity: 1,
                y: 0,
                duration: 1.2,
                ease: 'power4.out',
                delay: 0.3
            });

            gsap.fromTo(statItems, {
                opacity: 0,
                y: 40,
                scale: 0.9
            }, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 1,
                stagger: 0.2,
                ease: 'power4.out',
                delay: 0.5
            });
        },
        onLeave: () => {
            gsap.set(fillerHeadingWords, { y: '100%' });
            gsap.set(fillerDescription, { opacity: 0, y: 30 });
            gsap.set(statItems, { opacity: 0, y: 40, scale: 0.9 });
        },
        onEnterBack: () => {
            gsap.to(fillerHeadingWords, {
                y: 0,
                duration: 1,
                stagger: 0.15,
                ease: 'power4.out'
            });
            gsap.to(fillerDescription, {
                opacity: 1,
                y: 0,
                duration: 1.2,
                ease: 'power4.out'
            });
            gsap.to(statItems, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 1,
                stagger: 0.1,
                ease: 'power4.out'
            });
        },
        onLeaveBack: () => {
            gsap.set(fillerHeadingWords, { y: '100%' });
            gsap.set(fillerDescription, { opacity: 0, y: 30 });
            gsap.set(statItems, { opacity: 0, y: 40, scale: 0.9 });
        }
    });
}

// Killer CTA Animations
function initKillerCTAAnimations() {
    const ctaHeadingWords = document.querySelectorAll('.cta-heading .word');
    const ctaSubtitle = document.querySelector('.cta-subtitle');
    const ctaButtons = document.querySelectorAll('.cta-btn');
    const magicCircle = document.querySelector('.magic-circle');

    if (!ctaHeadingWords.length) return;

    ScrollTrigger.create({
        trigger: '.killer-cta',
        start: 'top 80%',
        end: 'bottom 20%',
        onEnter: () => {
            gsap.to(ctaHeadingWords, {
                y: 0,
                duration: 1.2,
                stagger: 0.2,
                ease: 'power4.out'
            });

            gsap.fromTo(ctaSubtitle, {
                opacity: 0,
                y: 40
            }, {
                opacity: 1,
                y: 0,
                duration: 1.4,
                ease: 'power4.out',
                delay: 0.4
            });

            gsap.fromTo(ctaButtons, {
                opacity: 0,
                y: 50,
                scale: 0.9
            }, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 1.2,
                stagger: 0.15,
                ease: 'power4.out',
                delay: 0.6
            });

            gsap.fromTo(magicCircle, {
                opacity: 0,
                scale: 0.8,
                rotation: -180
            }, {
                opacity: 1,
                scale: 1,
                rotation: 0,
                duration: 2,
                ease: 'power4.out',
                delay: 0.8
            });
        },
        onLeave: () => {
            gsap.set(ctaHeadingWords, { y: '100%' });
            gsap.set(ctaSubtitle, { opacity: 0, y: 40 });
            gsap.set(ctaButtons, { opacity: 0, y: 50, scale: 0.9 });
            gsap.set(magicCircle, { opacity: 0, scale: 0.8, rotation: -180 });
        },
        onEnterBack: () => {
            gsap.to(ctaHeadingWords, {
                y: 0,
                duration: 1.2,
                stagger: 0.2,
                ease: 'power4.out'
            });
            gsap.to(ctaSubtitle, {
                opacity: 1,
                y: 0,
                duration: 1.4,
                ease: 'power4.out'
            });
            gsap.to(ctaButtons, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 1.2,
                stagger: 0.1,
                ease: 'power4.out'
            });
            gsap.to(magicCircle, {
                opacity: 1,
                scale: 1,
                rotation: 0,
                duration: 2,
                ease: 'power4.out'
            });
        },
        onLeaveBack: () => {
            gsap.set(ctaHeadingWords, { y: '100%' });
            gsap.set(ctaSubtitle, { opacity: 0, y: 40 });
            gsap.set(ctaButtons, { opacity: 0, y: 50, scale: 0.9 });
            gsap.set(magicCircle, { opacity: 0, scale: 0.8, rotation: -180 });
        }
    });
}



// Contact Form Handling
function initContactForm() {
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const name = formData.get('name');
            const email = formData.get('email');
            const event = formData.get('event');
            const message = formData.get('message');
            
            // Simple validation
            if (!name || !email || !event || !message) {
                alert('Please fill in all fields.');
                return;
            }
            
            // Simulate form submission
            const submitButton = this.querySelector('.form-submit');
            const originalText = submitButton.textContent;
            
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                submitButton.textContent = 'Message Sent!';
                
                setTimeout(() => {
                    submitButton.textContent = originalText;
                    submitButton.disabled = false;
                    this.reset();
                }, 2000);
            }, 1500);
            
            console.log('Form submitted:', { name, email, event, message });
        });
    }
}

// Initialize Hero animations after preloader
function initHeroAnimations() {
    const heroWords = document.querySelectorAll('.hero-title .word');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    const heroCta = document.querySelector('.hero-cta');
    
    gsap.timeline({ delay: 0.5 })
        .to(heroWords, {
            y: 0,
            duration: 1.2,
            stagger: 0.2,
            ease: 'power4.out'
        })
        .to(heroSubtitle, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out'
        }, '-=0.6')
        .to(heroCta, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out'
        }, '-=0.4')
        .call(() => {
            // Initialize all section animations after Hero is complete
            initAboutAnimations();
            initTimelineAnimations();
            initServicesAnimations();
            initFillerAnimations();
            initGalleryAnimations();
            initGalleryInteractions();
            initKillerCTAAnimations();
            initContactForm();
        });
}

// Navigation
const navToggle = document.querySelector('.nav-toggle');
const navOverlay = document.querySelector('.nav-overlay');
const navLinks = document.querySelectorAll('.nav-menu a');
const socialLinks = document.querySelectorAll('.social-menu a');
const allNavLinks = [...navLinks, ...socialLinks];

navToggle.addEventListener('click', () => {
    navOverlay.classList.toggle('active');
    navToggle.classList.toggle('active');
    
    if (navOverlay.classList.contains('active')) {
        gsap.to(navLinks, {
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power3.out',
            delay: 0.2
        });
        gsap.to(socialLinks, {
            y: 0,
            duration: 0.6,
            stagger: 0.05,
            ease: 'power3.out',
            delay: 0.4
        });
    } else {
        gsap.to(allNavLinks, {
            y: '100%',
            duration: 0.4,
            stagger: 0.03,
            ease: 'power3.in'
        });
    }
});

// Close nav on link click
allNavLinks.forEach(link => {
    link.addEventListener('click', () => {
        navOverlay.classList.remove('active');
        navToggle.classList.remove('active');
        gsap.to(allNavLinks, {
            y: '100%',
            duration: 0.4,
            stagger: 0.03,
            ease: 'power3.in'
        });
    });
});

// Smooth scroll for anchor links with fallback
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            if (lenis) {
                lenis.scrollTo(target, { duration: 1.5 });
            } else {
                target.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Performance optimization: Debounce resize events
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        ScrollTrigger.refresh();
    }, 250);
});