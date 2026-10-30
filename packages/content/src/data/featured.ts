import type { FeaturedItem } from '../schemas/catalog'

export const featuredItems = [
  {
    id: 'gel-pens',
    order: 1,
    title: { en: 'Gel pens', my: 'ဂျယ်ဘောပင်' },
    description: {
      en: 'Smooth, bright and quick-drying',
      my: 'ချောမွေ့၊ အရောင်တောက်ပြီး မြန်မြန်ခြောက်',
    },
  },
  {
    id: 'pastel-highlighters',
    order: 2,
    title: { en: 'Pastel highlighters', my: 'အရောင်နုနု ဟိုက်လိုက်တာ' },
    description: {
      en: 'Soft colours for study notes',
      my: 'စာမှတ်စုများအတွက် အရောင်နုနုလေးများ',
    },
  },
  {
    id: 'washi-tape',
    order: 3,
    title: { en: 'Washi tape', my: 'ဝါရှီတိပ်' },
    description: {
      en: 'For journals, planners and gifts',
      my: 'ဂျာနယ်၊ ပလန်နာနှင့် လက်ဆောင်များအတွက်',
    },
  },
  {
    id: 'sticker-sheets',
    order: 4,
    title: { en: 'Sticker sheets', my: 'စတစ်ကာ စာရွက်များ' },
    description: {
      en: 'Decorate notebooks, laptops and pencil cases',
      my: 'မှတ်စုစာအုပ်၊ လက်ပ်တော့နှင့် ခဲတံဘူးများကို အလှဆင်ရန်',
    },
  },
  {
    id: 'dot-grid-journals',
    order: 5,
    title: { en: 'Dot-grid journals', my: 'အစက်ကွက် ဂျာနယ်များ' },
    description: {
      en: 'For bullet journals and sketches',
      my: 'Bullet journal ရေးဖို့နှင့် ပုံကြမ်းဆွဲဖို့',
    },
  },
  {
    id: 'desk-organisers',
    order: 6,
    title: { en: 'Desk organisers', my: 'စားပွဲပေါ်သုံး စီစဉ်ထားစရာများ' },
    description: {
      en: 'Pen cups, trays and drawers',
      my: 'ဘောပင်ထည့်ခွက်၊ ဗန်းနှင့် အံဆွဲငယ်များ',
    },
  },
] satisfies FeaturedItem[]
