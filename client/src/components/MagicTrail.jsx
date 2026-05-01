import { useEffect, useRef } from "react";

export default function MagicTrail() {
  const containerRef = useRef(null);
  const dots = useRef([]);
  const mouse = useRef({ x: -100, y: -100 });
  const trail = useRef({ x: -100, y: -100 });
  const rafId = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const spawnDot = () => {
      if (!container) return;

      const dot = document.createElement("div");
      dot.className = "magic-dot";
      dot.style.left = `${trail.current.x}px`;
      dot.style.top = `${trail.current.y}px`;

      const size = Math.random() * 4 + 2;

      dot.style.width = `${size}px`;
      dot.style.height = `${size}px`;
      dot.style.background = `var(--theme-primary)`;
      dot.style.boxShadow = `0 0 15px var(--theme-primary), 0 0 30px var(--theme-accent)`;
      dot.style.opacity = "0.8";

      container.appendChild(dot);
      dots.current.push(dot);

      dot.addEventListener("animationend", () => {
        dot.remove();
        dots.current = dots.current.filter((d) => d !== dot);
      });
    };

    let last = 0;
    const animate = (time) => {
      trail.current.x += (mouse.current.x - trail.current.x) * 0.15;
      trail.current.y += (mouse.current.y - trail.current.y) * 0.15;

      if (time - last > 15) {
        spawnDot();
        last = time;
      }

      rafId.current = requestAnimationFrame(animate);
    };

    rafId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafId.current);
      dots.current.forEach((d) => d.remove());
      dots.current = [];
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="magic-trail pointer-events-none fixed inset-0 z-[9999]"
    />
  );
}
