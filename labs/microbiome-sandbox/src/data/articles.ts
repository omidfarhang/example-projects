export const ARTICLES = {
  allergies: {
    title: "How Probiotics Help with Allergies",
    url: "https://omid.dev/2024/09/10/how-probiotics-help-with-allergies/",
  },
  lifestage: {
    title: "Probiotics Through the Ages",
    url: "https://omid.dev/2024/09/10/probiotics-through-the-ages/",
  },
  candidiasis: {
    title: "How Probiotics Help with Candidiasis",
    url: "https://omid.dev/2024/09/10/how-probiotics-help-with-candidiasis/",
  },
  lifecycle: {
    title: "Unlocking Prebiotics, Probiotics, and Postbiotics",
    url: "https://omid.dev/2024/09/10/prebiotics-probiotics-postbiotics/",
  },
  gutBrain: {
    title: "Probiotics Through the Ages — Gut-Brain & Mental Well-being",
    url: "https://omid.dev/2024/09/10/probiotics-through-the-ages/",
  },
} as const;

export type ArticleKey = keyof typeof ARTICLES;
