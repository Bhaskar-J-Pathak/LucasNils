const tl = gsap.timeline({ paused: true });
let path = document.querySelector("path");
let spanBefore = CSSRulePlugin.getRule("#hamburger .line-2");

gsap.set(spanBefore, { background: "#000" });
gsap.set(".menu", { visibility: "hidden" });

document.getElementById("toggle-btn").addEventListener("click", () => {
  const hamburger = document.getElementById("hamburger");
  hamburger.classList.toggle("active");
  tl.reversed(!tl.reversed());
});

const start = "M0 0 H100 V0 H0 Z";
const end = "M0 0 H100 V100 C75 70 25 70 0 100 Z";

const power2 = "power2.inout";
const power4 = "power4.inOut";

tl.to("#hamburger", 1.25, {
  marginTop: "-5px",
  x: -40,
  y: 40,
  ease: power2
});
tl.to(
  "#hamburger .line",
  1,
  {
    background: "#fff",
    ease: power2
  },
  "<"
);
tl.to(
  spanBefore,
  1,
  {
    background: "#fff",
    ease: power2
  },
  "<"
);
tl.to(
  ".btn .btn-outline",
  1.25,
  {
    x: -40,
    y: 40,
    width: "140px",
    height: "140px",
    border: "1px solid #e2e2dc",
    ease: power2
  },
  "<"
);
tl.to(
  path,
  0.8,
  {
    attr: {
      d: start
    },
    ease: power2
  },
  "<"
).to(
  path,
  0.8,
  {
    attr: { d: end },
    ease: power2
  },
  "-=0.5"
);

tl.to(
  ".menu",
  0.5,
  {
    visibility: "visible"
  },
  "-=0.5"
);

tl.to(
  ".menu-item>a",
  0.5,
  {
    top: 0,
    ease: power4,
    stagger: {
      amount: 0.5
    }
  },
  "-=1"
).reverse();
