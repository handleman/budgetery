/**
 * Keyword → MaterialCommunityIcons glyph map for budget rows (redesign P0).
 * Items carry no category field, so glyphs derive from label substrings
 * (case-insensitive, first match wins). Unknown labels get a neutral tag.
 */
const RULES: Array<[RegExp, string]> = [
  [/coffee|tea|cocoa/, 'coffee'],
  [/grocer|food|market|shop|cart/, 'cart'],
  [/gas|fuel|petrol|diesel/, 'gas-station'],
  [/transport|car|taxi|bus|uber|tram|metro/, 'car'],
  [/rent|home|house|flat|mortgage/, 'home'],
  [/salar|wage|paycheck|pay\b/, 'cash'],
  [/saving|piggy/, 'piggy-bank'],
  [/premium|bonus|star|reward|cashback/, 'star'],
  [/subscri|recurr|membership|netflix|spotify/, 'sync'],
  [/utilit|electr|water|internet|phone/, 'lightbulb'],
  [/\$|money|zp|tax|fine|fee/, 'currency-usd'],
  [/wallet|purse/, 'wallet'],
];

export const ITEM_GLYPH_FALLBACK = 'tag';

export function glyphForLabel(label: string): string {
  const text = (label ?? '').toLowerCase();
  for (const [pattern, glyph] of RULES) {
    if (pattern.test(text)) return glyph;
  }
  return ITEM_GLYPH_FALLBACK;
}
