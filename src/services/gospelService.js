
/**
 * Service to fetch and parse the Gospel of the Day from Evangelizo RSS
 */

const RSS_URL = '/api/evangelizo/rss/v2/evangelizo_rss-sp.xml';

export const fetchDailyGospel = async () => {
    try {
        const response = await fetch(RSS_URL);

        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status}`);
        }

        const xmlText = await response.text();
        return parseRSS(xmlText);
    } catch (error) {
        console.error('Error fetching Gospel:', error);
        throw error;
    }
};

const parseRSS = (xmlText) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");

    const items = Array.from(xmlDoc.querySelectorAll("item"));

    // Find the item with category 'EVANGELIUM'
    const gospelItem = items.find(item => {
        const category = item.querySelector("category")?.textContent;
        return category === 'EVANGELIUM';
    });

    if (!gospelItem) {
        throw new Error("No gospel item found in RSS feed");
    }

    const fullTitle = gospelItem.querySelector("title")?.textContent || "";
    const description = gospelItem.querySelector("description")?.textContent || "";

    // Extract citation from title (Format: "Day, Date : Citation")
    // Example: "Viernes, 21 De Noviembre : Evangelio según San Lucas 19,45-48."
    let citation = "";
    let dateStr = "";

    if (fullTitle.includes(":")) {
        const parts = fullTitle.split(":");
        dateStr = parts[0].trim();
        citation = parts[1].trim();
    } else {
        citation = fullTitle;
    }

    // Try to parse start verse from citation
    // Regex to find pattern like "Chapter,Verse" or "Chapter:Verse"
    // Looks for the last occurrence of numbers separated by punctuation
    let currentVerse = 1;
    let hasVerseNumbers = false;

    // Match patterns like "19,45-48" or "19:45-48" or "1, 1-18"
    // We look for the number immediately following the last comma or colon that isn't part of the chapter
    // A simple heuristic: look for the last number sequence before a hyphen or end of string

    const verseMatch = citation.match(/(\d+)[,:]\s*(\d+)(?:[-\u2013](\d+))?/);
    if (verseMatch) {
        // verseMatch[2] should be the start verse
        currentVerse = parseInt(verseMatch[2], 10);
        hasVerseNumbers = true;
    }

    // Clean up description
    // Split by newlines to get potential verses
    const lines = description.split('\n').filter(line => line.trim());

    let formattedContent = "";

    if (hasVerseNumbers && lines.length > 0) {
        // Join lines with verse numbers
        formattedContent = lines.map((line, index) => {
            const verseNum = currentVerse + index;
            return `<sup style="font-size: 0.7em; font-weight: bold; color: #b45309; margin-right: 4px;">${verseNum}</sup>${line}`;
        }).join(' '); // Join with space instead of newlines
    } else {
        // Fallback if we can't parse verses: just join as a paragraph
        formattedContent = lines.join(' ');
    }

    // Wrap in a single paragraph for continuous reading
    formattedContent = `<p>${formattedContent}</p>`;

    return {
        title: "Evangelio del Día",
        citation,
        date: new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        content: formattedContent
    };
};
