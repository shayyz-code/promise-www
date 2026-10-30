import type { Business } from '../schemas/business'

export const business = {
  name: 'Promise Paper & Stationery',
  domain: 'promisemm.com',
  email: 'hi@promisemm.com',
  address: {
    street: 'No 88, Bo Bala Street',
    area: 'Aung Saytanar B',
    city: 'Magway',
    postalCode: '04016',
    country: 'Myanmar (Burma)',
    countryCode: 'MM',
  },
  phones: [
    { number: '09965072801', viber: true },
    { number: '095072801', viber: true },
    { number: '09957626698', viber: true },
  ],
  telegram: {
    shop: 'promisemmdotcom',
    bot: 'promisemmbot',
  },
  discordInvite: 'NhfFd8ZX8',
  mapUrl: 'https://maps.app.goo.gl/PSKScHszoEyGHuUP8',
  geo: { latitude: 20.1409046, longitude: 94.9478098 },
  hours: {
    days: { en: 'Monday to Friday', my: 'တနင်္လာ မှ သောကြာ' },
    time: { en: '8:00 AM – 5:00 PM', my: 'နံနက် 8:00 – ညနေ 5:00' },
    schedule: [
      {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '17:00',
      },
    ],
  },
} satisfies Business
