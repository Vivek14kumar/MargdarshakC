import { useEffect, useState } from "react";

export default function AnimatedCounter({ value, duration = 1200 }) {
  const numericValue = parseFloat(value); // "3.2"
  const suffix = value.replace(numericValue, ""); // "L+"
  const target = numericValue;

  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = null;

    function animate(timestamp) {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const current = progress * target;
      setCount(current.toFixed(1));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }, [target, duration]);

  return (
    <span>
      {count}
      {suffix}
    </span>
  );
}
