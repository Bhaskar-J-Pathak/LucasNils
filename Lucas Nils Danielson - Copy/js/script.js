// Page Animation with GSAP

gsap.from(".nav-container", {
  duration: 2,      
  opacity: 0,        
  y: -60,            
  ease: "power3.inOut",
  delay: 0.5         
});

// Animation for hero section elements
gsap.from(".hero > *", {
  duration: 1,       
  opacity: 0,        
  y: 60,             
  ease: "power3.inOut",
  delay: 1,          
  stagger: 0.1       
});

// Animation for blob elements
gsap.from(".blob", {
  duration: 2,       
  scale: 0,          
  ease: "power3.inOut",
  delay: 1.5,        
  stagger: 0.3       
});

// Animation for background gradient
gsap.from(".bg-gradient", {
  duration: 1,       
  scale: 0,          
  ease: "power3.inOut",
  delay: 2           
});

