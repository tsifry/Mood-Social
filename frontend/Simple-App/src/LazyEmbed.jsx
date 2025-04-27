import { useState, useEffect, useRef } from "react";

export default function LazyEmbed({ type, url }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target); 
          }
        });
      },
      { threshold: 0.9 } 
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  if (!isVisible) {
    return (
      <div
        ref={ref}
        style={{
          backgroundColor: "#eee",
          width: "100%",
          height: type === "spotify" ? "240px" : "152px",
        }}
      >
        {/* Placeholder */}
      </div>
    );
  }

  return (
    <div ref={ref}>
      {type === "spotify" ? (
        <iframe
          style={{ borderRadius: "12px" }}
          src={`${url}?utm_source=generator&theme=0`}
          width="100%"
          height="240"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          loading="lazy"
        ></iframe>
      ) : (
        <iframe
          width="100%"
          height="152"
          scrolling="no"
          frameBorder="no"
          allow="autoplay"
          src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(
            url
          )}&color=%23000000&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false`}
        ></iframe>
      )}
    </div>
  );
}
