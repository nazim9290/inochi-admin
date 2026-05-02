/**
 * EN: Free auto-translate helper using MyMemory's public API. Splits the input
 *     HTML into text segments (preserving tags), translates each segment, then
 *     reassembles the HTML so structure (<p>, <h2>, <a>, <img>) survives. No
 *     API key needed; daily quota ~5000 words anonymous (more if email is set).
 *     Quality is "draft" — admin should review before saving.
 * BN: MyMemory-র free public API দিয়ে auto-translate helper। Input HTML-কে
 *     text segment-এ ভাগ করে (tag অক্ষত রেখে), প্রত্যেক segment translate করে,
 *     তারপর HTML আবার join করে — তাই structure (<p>, <h2>, <a>, <img>) ঠিক
 *     থাকে। API key লাগে না; daily quota ~5000 word anonymous।
 *     Quality "draft" — save-এর আগে admin review করবে।
 */

const ENDPOINT = 'https://api.mymemory.translated.net/get';

// EN: Translate one chunk of plain text. Returns original on failure so the
//     overall HTML never breaks because of a single bad request.
// BN: এক চাঙ্ক plain text translate করে। Fail হলে original ফেরত — একটা
//     খারাপ request যাতে পুরো HTML না ভাঙে।
const translateChunk = async (text, langPair) => {
  if (!text.trim()) return text;
  const url = `${ENDPOINT}?q=${encodeURIComponent(text)}&langpair=${langPair}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const translated = data?.responseData?.translatedText;
    if (translated && data.responseStatus === 200) return translated;
    return text;
  } catch (err) {
    console.error('Translate chunk error:', err);
    return text;
  }
};

// EN: Walk the parsed HTML, translating only text nodes. Tags, attributes,
//     and inline formatting are preserved unchanged.
// BN: Parsed HTML traverse করে, শুধু text node translate করে। Tag, attribute,
//     inline formatting অপরিবর্তিত থাকে।
const translateNode = async (node, langPair) => {
  if (node.nodeType === 3) {
    const original = node.nodeValue;
    if (original && original.trim()) {
      node.nodeValue = await translateChunk(original, langPair);
    }
    return;
  }
  if (node.nodeType === 1) {
    // EN: Skip <code>, <pre>, <script> contents — they shouldn't be translated.
    // BN: <code>, <pre>, <script>-এর ভিতরের content translate করব না।
    const tag = node.tagName.toLowerCase();
    if (tag === 'code' || tag === 'pre' || tag === 'script') return;
    for (const child of Array.from(node.childNodes)) {
      // eslint-disable-next-line no-await-in-loop
      await translateNode(child, langPair);
    }
  }
};

// EN: Public entry point. `direction` is 'bn-to-en' or 'en-to-bn'.
// BN: Public entry point। `direction` হল 'bn-to-en' অথবা 'en-to-bn'।
export const translateHtml = async (html, direction) => {
  if (!html || !html.trim()) return '';
  const langPair = direction === 'bn-to-en' ? 'bn|en' : 'en|bn';
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
  const root = doc.body.firstChild;
  if (!root) return html;
  await translateNode(root, langPair);
  return root.innerHTML;
};
