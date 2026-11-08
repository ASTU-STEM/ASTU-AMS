import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop ensures that whenever the route pathname or search parameters change,
 * the window scroll position is immediately reset to the top (0, 0),
 * preventing users from landing at the bottom/footer of the target page.
 * If a hash anchor is explicitly requested (e.g., #community), it smoothly scrolls to that element.
 */
export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    // If a hash anchor exists (e.g. #faq, #testimonials), attempt scrolling to that section
    if (hash) {
      const targetId = hash.replace("#", "");
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }

    // Default: Reset window scroll instantly to the top (0, 0)
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant" as ScrollBehavior,
    });
  }, [pathname, search, hash]);

  return null;
}
