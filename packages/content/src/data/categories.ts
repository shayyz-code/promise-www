import type { Category } from '../schemas/catalog'

export const categories = [
  {
    id: 'paper',
    order: 1,
    audience: 'office',
    title: { en: 'Paper', my: 'စက္ကူ' },
    description: {
      en: 'Copy paper by the ream and the box, card, and coloured paper in A4 and A3.',
      my: 'A4 နှင့် A3 အရွယ် မိတ္တူစက္ကူ (အထုပ်လိုက်၊ သေတ္တာလိုက်)၊ ကတ်ထူစက္ကူနှင့် ရောင်စုံစက္ကူ။',
    },
  },
  {
    id: 'files-folders',
    order: 2,
    audience: 'office',
    title: { en: 'Files & folders', my: 'ဖိုင်နှင့် ဖိုင်တွဲများ' },
    description: {
      en: 'Box files, clear folders, binders and envelopes.',
      my: 'ဘောက်စ်ဖိုင်၊ ဖိုင်အကြည်၊ ဘိုင်ဒါနှင့် စာအိတ်များ။',
    },
  },
  {
    id: 'office-essentials',
    order: 3,
    audience: 'office',
    title: { en: 'Office essentials', my: 'ရုံးသုံး မရှိမဖြစ်ပစ္စည်းများ' },
    description: {
      en: 'Staplers, tape, calculators and desk organisers.',
      my: 'စတက်ပလာ၊ တိပ်၊ ဂဏန်းတွက်စက်နှင့် စားပွဲပေါ်သုံး စီစဉ်ထားစရာများ။',
    },
  },
  {
    id: 'pens-pencils',
    order: 4,
    audience: 'office',
    title: { en: 'Pens & pencils', my: 'ဘောပင်နှင့် ခဲတံများ' },
    description: {
      en: 'Ballpoints, gel pens, pencils, markers and highlighters.',
      my: 'ဘောပင်၊ ဂျယ်ဘောပင်၊ ခဲတံ၊ မာကာနှင့် ဟိုက်လိုက်တာများ။',
    },
  },
  {
    id: 'notebooks-journals',
    order: 5,
    audience: 'desk',
    title: { en: 'Notebooks & journals', my: 'မှတ်စုစာအုပ်နှင့် ဂျာနယ်များ' },
    description: {
      en: 'Exercise books, notebooks, dot-grid journals and sticky notes.',
      my: 'လေ့ကျင့်ခန်းစာအုပ်၊ မှတ်စုစာအုပ်၊ အစက်ကွက် ဂျာနယ်နှင့် စတစ်ကီနုတ်များ။',
    },
  },
  {
    id: 'journaling-craft',
    order: 6,
    audience: 'desk',
    title: { en: 'Journaling & craft', my: 'ဂျာနယ်နှင့် လက်မှုပစ္စည်း' },
    description: {
      en: 'Washi tape, stickers, pastel highlighters, colour pencils and craft supplies.',
      my: 'ဝါရှီတိပ်၊ စတစ်ကာ၊ အရောင်နုနု ဟိုက်လိုက်တာ၊ ရောင်စုံခဲတံနှင့် လက်မှုပစ္စည်းများ။',
    },
  },
] satisfies Category[]
