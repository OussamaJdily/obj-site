// Company details used across the whole site. Change them here once.
export const BRAND = {
  name: 'OBJ',
  word: 'OBJ', // big wordmark; the last letter gets the green dot
  mark: 'O', // letter in the floating header pill
  city: 'Casablanca',
  country: 'MA',
  timezone: 'Africa/Casablanca',
  phone: '+212 5 22 00 00 00',
  phoneHref: '+212522000000',
  email: 'contact@obj.ma',
  address: ['OBJ Studio', 'Boulevard d’Anfa', '20000 Casablanca, Morocco'],
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://obj.ma',
  year: 2027,
  socials: [
    ['in', 'LinkedIn', 'https://www.linkedin.com/'],
    ['ig', 'Instagram', 'https://www.instagram.com/'],
  ] as const,
};
