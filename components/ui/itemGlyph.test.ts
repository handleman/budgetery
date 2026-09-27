import { glyphForLabel, ITEM_GLYPH_FALLBACK } from './itemGlyph';

describe('glyphForLabel', () => {
    it.each([
        ['Morning coffee', 'coffee'],
        ['Groceries', 'cart'],
        ['gas', 'gas-station'],
        ['Transport', 'car'],
        ['Rent', 'home'],
        ['Salary', 'cash'],
        ['savings', 'piggy-bank'],
        ['Premium', 'star'],
        ['subscriptions', 'sync'],
        ['Internet', 'lightbulb'],
        ['ZP', 'currency-usd'],
    ])('maps %p to %p', (label, glyph) => {
        expect(glyphForLabel(label)).toBe(glyph);
    });

    it('is case-insensitive and falls back to tag', () => {
        expect(glyphForLabel('COFFEE')).toBe('coffee');
        expect(glyphForLabel('???')).toBe(ITEM_GLYPH_FALLBACK);
        expect(glyphForLabel('')).toBe(ITEM_GLYPH_FALLBACK);
    });
});
