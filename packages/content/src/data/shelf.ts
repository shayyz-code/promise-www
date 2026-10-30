import type { ShelfItem } from '../schemas/catalog'

export const shelfItems = [
  {
    id: 'gel-pens',
    order: 1,
    icon: 'pen',
    accent: 'pink',
    name: { en: 'Gel pens', my: 'ဂျယ်ဘောပင်' },
    description: {
      en: 'Smooth, bright and quick-drying, in every colour you’ll want.',
      my: 'ရေးရတာ ချောမွေ့ပြီး အရောင်တောက်တယ်၊ မင်လည်း မြန်မြန်ခြောက်တယ်။ ကြိုက်တဲ့အရောင် ရွေးလို့ရပါတယ်။',
    },
    ask: { en: 'Ask about gel pens', my: 'ဂျယ်ဘောပင် အကြောင်း မေးရန်' },
  },
  {
    id: 'pastel-highlighters',
    order: 2,
    icon: 'highlighter',
    accent: 'blue',
    name: { en: 'Pastel highlighters', my: 'ပေါ့စတယ်ရောင် ဟိုက်လိုက်တာ' },
    description: {
      en: 'Soft colours that make study notes easier on the eyes.',
      my: 'အရောင်နုနုလေးတွေမို့ စာကျက်မှတ်စုတွေကို မျက်စိမညောင်းဘဲ ဖတ်နိုင်ပါတယ်။',
    },
    ask: { en: 'Ask about highlighters', my: 'ဟိုက်လိုက်တာ အကြောင်း မေးရန်' },
  },
  {
    id: 'washi-tape',
    order: 3,
    icon: 'tape',
    accent: 'yellow',
    name: { en: 'Washi tape', my: 'ဝါရှီတိပ်' },
    description: {
      en: 'For journals, planners, gift wrap and phone cases.',
      my: 'ဂျာနယ်၊ ပလန်နာ၊ လက်ဆောင်ထုပ် နဲ့ ဖုန်းကာဗာတွေကို အလှဆင်ဖို့။',
    },
    ask: { en: 'Ask about washi tape', my: 'ဝါရှီတိပ် အကြောင်း မေးရန်' },
  },
  {
    id: 'sticker-sheets',
    order: 4,
    icon: 'sticker',
    accent: 'green',
    name: { en: 'Sticker sheets', my: 'စတစ်ကာ ချပ်များ' },
    description: {
      en: 'Decorate notebooks, laptops, bottles and cases.',
      my: 'မှတ်စုစာအုပ်၊ လက်ပ်တော့၊ ရေဘူး နဲ့ ဖုန်းကာဗာတွေကို အလှဆင်လိုက်ပါ။',
    },
    ask: { en: 'Ask about stickers', my: 'စတစ်ကာ အကြောင်း မေးရန်' },
  },
  {
    id: 'dot-grid-journals',
    order: 5,
    icon: 'journal',
    accent: 'orange',
    name: { en: 'Dot-grid journals', my: 'အစက်ကွက် ဂျာနယ်စာအုပ်' },
    description: {
      en: 'For bullet journals, sketches, lists and plans.',
      my: 'Bullet journal၊ ပုံကြမ်း၊ စာရင်း နဲ့ အစီအစဉ်တွေ ရေးဖို့။',
    },
    ask: { en: 'Ask about journals', my: 'ဂျာနယ်စာအုပ် အကြောင်း မေးရန်' },
  },
  {
    id: 'desk-organisers',
    order: 6,
    icon: 'organiser',
    accent: 'pink',
    name: { en: 'Desk organisers', my: 'စားပွဲတင် ပစ္စည်းထည့်စရာ' },
    description: {
      en: 'Pen cups, trays and little drawers to keep it all tidy.',
      my: 'ဘောပင်ထည့်ခွက်၊ ဗန်း နဲ့ အံဆွဲလေးတွေနဲ့ အားလုံးကို သပ်သပ်ရပ်ရပ် ထားလိုက်ပါ။',
    },
    ask: { en: 'Ask about organisers', my: 'ပစ္စည်းထည့်စရာ အကြောင်း မေးရန်' },
  },
] satisfies ShelfItem[]
