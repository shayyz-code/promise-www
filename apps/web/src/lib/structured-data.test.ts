import { expect, test } from 'bun:test'
import { business } from '@promise-www/content'
import { serializeJsonLd, storeJsonLd } from './structured-data'

test('describes the shop as a schema.org Store', () => {
  const data = storeJsonLd(business, 'https://promisemm.com/')
  expect(data['@type']).toBe('Store')
  expect(data.address.addressLocality).toBe('Magway')
  expect(data.telephone[0]).toBe('+959965072801')
  expect(data.openingHoursSpecification[0]).toMatchObject({ opens: '08:00', closes: '17:00' })
})

test('escapes `<` so the JSON cannot break out of its script tag', () => {
  expect(serializeJsonLd({ text: '</script>' })).toBe('{"text":"\\u003c/script>"}')
})
