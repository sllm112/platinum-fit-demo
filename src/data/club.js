// كل بيانات النادي في مكان واحد. عدّل هنا وينعكس التغيير على الموقع كله.
// أي شيء عليه تعليق "تجريبي" يحتاج تأكيد من صاحب النادي قبل النشر.

export const club = {
  name: 'بلاتينيوم فيت',
  nameLatin: 'PLATINUM FIT',
  city: 'الرس، القصيم',
  address: 'طريق الملك فهد، الرس 58839',
  hours: 'مفتوح 24 ساعة',
  timeZone: 'Asia/Riyadh',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=%D8%A8%D9%84%D8%A7%D8%AA%D9%8A%D9%86%D9%8A%D9%88%D9%85+%D9%81%D9%8A%D8%AA+Platinum+Fit+%D8%A7%D9%84%D8%B1%D8%B3',
  instagram: { handle: '@platinum.fiit', url: 'https://www.instagram.com/platinum.fiit/' },
  // من حساب النادي في إنستقرام.
  phone: '0594387275',
  spaPhone: '0594389637',
  // رقم واتساب النادي بالصيغة الدولية بدون + (مثال: 9665XXXXXXXX).
  // فارغ الآن: زر واتساب يفتح التطبيق ويترك للزائر اختيار جهة الإرسال.
  whatsapp: '',
  // بيانات الفاتورة. السجل التجاري من متجر النادي الحالي.
  legalName: 'نادي بلاتينيوم فيت',
  cr: '1132010681',
  // تجريبي: الرقم الضريبي الحقيقي يضيفه المالك.
  vat: '300000000000003',
};

// الباقات وأسعارها مأخوذة من متجر النادي الحالي على سلة.
// paid: الشهور المدفوعة. giftDays: الأيام المجانية. was: السعر قبل العرض.
export const plans = [
  {
    id: 'y12',
    title: '12 شهر + 30 يوم مجاني',
    paid: 12,
    gift: 0,
    giftDays: 30,
    price: 1188,
    was: 4790,
    note: 'أقل سعر للشهر',
    featured: true,
    url: 'https://platinum.althawab.sa/اشتراك-12-شهر-30-يوم-مجاني/p1170024131',
  },
  {
    id: 'm6',
    title: '6 شهور + 30 يوم مجاني',
    paid: 6,
    gift: 0,
    giftDays: 30,
    price: 888,
    was: 2870,
    note: '',
    url: 'https://platinum.althawab.sa/اشتراك-6-اشهر-30-يوم-مجاني/p1108773846',
  },
  {
    id: 'm3',
    title: '3 شهور + 15 يوم مجاني',
    paid: 3,
    gift: 0,
    giftDays: 15,
    price: 548,
    was: 1980,
    note: '',
    url: 'https://platinum.althawab.sa/اشتراك-3-اشهر-15-يوم-مجاني/p1250873561',
  },
  {
    id: 'm2',
    title: 'شهرين',
    paid: 2,
    gift: 0,
    giftDays: 0,
    price: 530,
    was: 1100,
    note: '',
    url: 'https://platinum.althawab.sa/اشتراك-شهرين/p267519816',
  },
  {
    id: 'm1',
    title: 'شهر',
    paid: 1,
    gift: 0,
    giftDays: 0,
    price: 400,
    was: 1100,
    note: 'مناسب لو تبي تجرب أول',
    url: 'https://platinum.althawab.sa/اشتراك-شهر/p1711323704',
  },
];

export const features = [
  { title: '24 ساعة', text: 'ما عندنا وقت إقفال. تعال متى ما ناسبك.' },
  { title: 'مسبح', text: 'اسبح بعد التمرين أو خلّه تمرينك كله.' },
  { title: 'ملعب كورة', text: 'اجمع ربعك واحجز الملعب من الموقع.' },
  { title: 'مضمار جري', text: 'اجرِ على مضمار مخصص بدل السير.' },
];

// تجريبي: وصف المرافق ونقاطها تحتاج تأكيد من النادي.
export const programs = [
  {
    id: 'strength',
    title: 'صالة الحديد',
    image: 'media/strength.jpg',
    focus: '50% 74%',
    text: 'أوزان حرة وأجهزة مقاومة تغطي كل عضلة، لمن يبني حجم أو يرفع أرقامه.',
    points: ['أوزان حرة وبارات', 'أجهزة مقاومة', 'أجهزة كارديو'],
    cta: 'احجز حصة تجريبية',
  },
  {
    id: 'pool',
    title: 'المسبح',
    image: 'media/pool.jpg',
    text: 'مسبح داخل النادي لتمارين السباحة والاستشفاء بعد التمرين.',
    points: ['مسارات سباحة', 'سباحة حرة', 'استشفاء بعد التمرين'],
    cta: 'اسأل عن المسبح',
  },
  {
    id: 'pitch',
    title: 'ملعب الكورة',
    image: 'media/pitch.jpg',
    text: 'ملعب كورة داخل النادي لك ولربعك. احجز وقتك من الموقع وتعالوا جاهزين.',
    points: ['حجز بالساعة', 'لك ولفريقك', 'الحجز من الموقع'],
    cta: 'احجز الملعب',
  },
  {
    id: 'track',
    title: 'مضمار الجري',
    image: 'media/track.jpg',
    text: 'مضمار مخصص للجري والمشي، لمن يحب يرفع لياقته خارج الأجهزة.',
    points: ['مسارات مرقمة', 'جري ومشي', 'تمارين سرعة وتحمل'],
    cta: 'احجز حصة تجريبية',
  },
];

// تجريبي: صور من Pexels (ترخيص مجاني) إلى أن تتوفر صور النادي الحقيقية.
export const gallery = [
  { src: 'media/g-floor.jpg', alt: 'صالة الحديد' },
  { src: 'media/g-pool.jpg', alt: 'المسبح' },
  { src: 'media/pitch.jpg', alt: 'ملعب الكورة' },
  { src: 'media/g-track.jpg', alt: 'مضمار الجري' },
  { src: 'media/g-free.jpg', alt: 'منطقة الأوزان الحرة' },
  { src: 'media/g-bike.jpg', alt: 'أجهزة الكارديو' },
];

// تجريبي: مواعيد حصص اللياقة وأوقاتها وعدد المقاعد يحددها النادي من لوحة المالك.
// time بصيغة 24 ساعة.
export const classes = [
  { id: 'dhuhr', title: 'موعد الظهر', time: '12:30', minutes: 60, capacity: 20 },
  { id: 'asr', title: 'موعد العصر', time: '16:00', minutes: 60, capacity: 20 },
  { id: 'maghrib', title: 'موعد المغرب', time: '18:15', minutes: 60, capacity: 20 },
  { id: 'isha', title: 'موعد العشاء', time: '20:00', minutes: 60, capacity: 20 },
];

// نظام "جيب صاحبك": الخصم للطرفين، صاحب الكود واللي جابه.
export const referral = {
  prefix: 'PLT',
  // قيمة الخصم كما تظهر للزوار (مثال: 10%). فارغة إلى أن يحددها النادي.
  discount: '',
  steps: [
    'اكتب رقم جوالك وخذ كودك.',
    'صاحبك يعطي الكود للاستقبال وقت اشتراكه وياخذ خصمه.',
    'وأنت ينزل لك خصم على تجديدك الجاي.',
  ],
};

// العبارة من متجر النادي الحالي.
export const hero = {
  lineOne: 'بوابتك نحو',
  lineTwo: 'القوة والتغيير.',
  lede: 'نادي بلاتينيوم فيت في الرس. صالة حديد، مسبح، ملعب كورة ومضمار جري، وباب ما يقفل.',
};

// اللون المميز للأزرار والشارات، من أحمر شعار النادي.
export const theme = { accent: '#c8102e' };

// نسبة ضريبة القيمة المضافة. الأسعار المعروضة شاملة الضريبة (تجريبي: يؤكدها النادي).
export const VAT_RATE = 0.15;

// لا نختلق تقييمات. تُضاف آراء حقيقية هنا بعد موافقة أصحابها:
// { name: 'الاسم', text: 'نص الرأي' }
export const reviews = [];

export const nav = [
  { href: '#plans', label: 'الاشتراكات' },
  { href: '#about', label: 'النادي' },
  { href: '#programs', label: 'المرافق' },
  { href: '#classes', label: 'المواعيد' },
  { href: '#gallery', label: 'الصور' },
  { href: '#contact', label: 'تواصل' },
];
