import { expect, test } from 'bun:test'
import {
  discordHref,
  mailtoHref,
  telegramHref,
  telHref,
  toInternational,
  viberHref,
} from './contact'

test('converts local Myanmar numbers to international format', () => {
  expect(toInternational('09965072801')).toBe('+959965072801')
  expect(toInternational('095072801')).toBe('+9595072801')
})

test('builds the exact links used in the design', () => {
  expect(telHref('09965072801')).toBe('tel:09965072801')
  expect(viberHref('09965072801')).toBe('viber://chat?number=%2B959965072801')
  expect(viberHref('095072801')).toBe('viber://chat?number=%2B9595072801')
  expect(viberHref('09957626698')).toBe('viber://chat?number=%2B959957626698')
  expect(telegramHref('promisemmbot')).toBe('https://t.me/promisemmbot')
  expect(discordHref('NhfFd8ZX8')).toBe('https://discord.gg/NhfFd8ZX8')
  expect(mailtoHref('hi@promisemm.com')).toBe('mailto:hi@promisemm.com')
})
