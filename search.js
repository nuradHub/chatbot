// search.js
import fetch from "node-fetch";
import * as cheerio from "cheerio";

/**
 * Fetch up-to-date web information using DuckDuckGo.
 * @param {string} query - The user's search query
 * @param {number} maxResults - Maximum number of snippets to fetch (default 3)
 * @returns {Promise<string|null>} - Combined web snippets or null if none found
 */
export async function fetchWebAnswer(query, maxResults = 3) {
  try {
    const url = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });

    const html = await res.text();
    const $ = cheerio.load(html);

    // Collect snippets
    const snippets = [];
    $(".result__snippet").each((i, el) => {
      if (i < maxResults) {
        let text = $(el).text().trim();
        if (text) {
          // Clean snippet
          text = text
            .replace(/\s+/g, " ")
            .replace(/\.\.\.$/, "")
            .replace(/\.{2,}/g, ".")
            .trim();
          snippets.push(text);
        }
      }
    });

    // Fallback: if no snippets, use link titles
    if (snippets.length === 0) {
      $(".result__a").each((i, el) => {
        if (i < maxResults) snippets.push($(el).text().trim());
      });
    }

    if (snippets.length === 0) return null;

    // Combine snippets into one string
    let combined = snippets.join(" ");
    if (!/[.!?]$/.test(combined)) combined += ".";
    return combined;

  } catch (err) {
    console.error("❌ Web search error:", err.message);
    return null;
  }
}
