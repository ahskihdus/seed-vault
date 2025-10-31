export function tagWords(text, tagMap) {
  if (!text || typeof text !== "string") {
    throw new Error("Invalid text input");
  }

  if (!tagMap || typeof tagMap !== "object") {
    throw new Error("Invalid tag map");
  }

  // Split the text into words and add tags where applicable
  return text
    .split(/\s+/)
    .map((word) => {
      const clean = word.replace(/[.,!?]/g, ""); // remove punctuation
      const tag = tagMap[clean];
      return tag ? `${word} [${tag}]` : word;
    })
    .join(" ");
}

/**
 * Count total number of tagged words
 * ----------------------------------
 * Used to verify tagging accuracy and display statistics.
 */
export function countTags(taggedText) {
  const matches = taggedText.match(/\[.*?\]/g);
  return matches ? matches.length : 0;
}

/**
 * Example UI Integration (Optional)
 * ---------------------------------
 * This can connect to seed.html for live demo testing.
 */
export function highlightTags(text, tagMap) {
  if (!text || typeof text !== "string") {
    throw new Error("Invalid text input");
  }

  return text
    .split(/\s+/)
    .map((word) => {
      const clean = word.replace(/[.,!?]/g, "");
      const tag = tagMap[clean];
      return tag
        ? `<span class="highlight">${word}</span><span class="label">[${tag}]</span>`
        : word;
    })
    .join(" ");
}
