export function merchantKey(description) {
  return description
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\b\d+\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
export const merchantRules = [
  {
    words: ['grocery', 'coffee', 'restaurant', 'swiggy', 'zomato', 'cafe', 'market'],
    category: 'Food & dining',
  },
  { words: ['uber', 'ola', 'metro', 'petrol', 'train'], category: 'Transport' },
  { words: ['netflix', 'spotify', 'cinema', 'movie'], category: 'Entertainment' },
  { words: ['electricity', 'internet', 'rent', 'phone'], category: 'Bills & utilities' },
  { words: ['pharmacy', 'doctor', 'hospital'], category: 'Health' },
  { words: ['amazon', 'clothes', 'store'], category: 'Shopping' },
];
