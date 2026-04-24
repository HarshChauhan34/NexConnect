import { useEffect } from "react";

const upsertMeta = (selector, attrs) => {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }

  Object.entries(attrs).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
};

function Seo({
  title = "NexConnect | Real-time Team Collaboration",
  description = "Secure real-time chat, events, products, and dashboards in one modern workspace.",
  image = "/favicon.svg",
}) {
  useEffect(() => {
    document.title = title;
    upsertMeta("meta[name='description']", { name: "description", content: description });
    upsertMeta("meta[property='og:title']", { property: "og:title", content: title });
    upsertMeta("meta[property='og:description']", {
      property: "og:description",
      content: description,
    });
    upsertMeta("meta[property='og:image']", { property: "og:image", content: image });
    upsertMeta("meta[name='twitter:card']", { name: "twitter:card", content: "summary_large_image" });
  }, [title, description, image]);

  return null;
}

export default Seo;

