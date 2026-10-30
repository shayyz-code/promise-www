import { expect, test } from 'bun:test'
import { business } from '@promise-www/content'
import { serializeJsonLd, storeJsonLd, websiteJsonLd } from './structured-data'

const siteUrl = 'https://promisemm.com/'

test('describes the shop as a schema.org OfficeEquipmentStore', () => {
  const data = storeJsonLd(business, siteUrl)
  expect(data['@type']).toBe('OfficeEquipmentStore')
  expect(data.logo).toBe('https://promisemm.com/apple-touch-icon.png')
  expect(data.address.addressLocality).toBe('Magway')
  expect(data.openingHoursSpecification[0]).toMatchObject({ opens: '08:00', closes: '17:00' })
})

test('gives one primary phone and lists every number as a contact point', () => {
  const data = storeJsonLd(business, siteUrl)
  expect(data.telephone).toBe('+959965072801')
  expect(data.contactPoint.map((point) => point.telephone)).toEqual([
    '+959965072801',
    '+9595072801',
    '+959957626698',
  ])
})

test('refuses a store without a phone number', () => {
  expect(() => storeJsonLd({ ...business, phones: [] }, siteUrl)).toThrow('phone number')
})

test('names the site and links it to the store', () => {
  const data = websiteJsonLd(business, siteUrl)
  expect(data['@type']).toBe('WebSite')
  expect(data.name).toBe(business.name)
  expect(data.alternateName).toContain(business.domain)
  expect(data.publisher['@id']).toBe(storeJsonLd(business, siteUrl)['@id'])
})

test('escapes `<` so the JSON cannot break out of its script tag', () => {
  expect(serializeJsonLd({ text: '</script>' })).toBe('{"text":"\\u003c/script>"}')
})
