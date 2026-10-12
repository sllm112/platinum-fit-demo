// طبقة البيانات: محتوى الموقع وسجل النشاط (طلبات، اشتراكات، فواتير).
// في نسخة العرض الحفظ في متصفح الجهاز (localStorage). عند النشر تُستبدل
// دوال القراءة والحفظ هنا بنداءات لخادم وقاعدة بيانات، والباقي يبقى كما هو.
import { useSyncExternalStore } from 'react';
import * as defaults from './data/club.js';

const SITE_KEY = 'plt.site.v1';
const LOG_KEY = 'plt.log.v2';

const base = {
  club: defaults.club,
  hero: defaults.hero,
  theme: defaults.theme,
  plans: defaults.plans,
  features: defaults.features,
  programs: defaults.programs,
  classes: defaults.classes,
  gallery: defaults.gallery,
  referral: defaults.referral,
  reviews: defaults.reviews,
};
// days: عدد الزيارات لكل يوم بصيغة YYYY-MM-DD. demo: السجل مملوء ببيانات تجريبية.
const emptyLog = { leads: [], codes: [], subs: [], invoices: [], bookings: [], clicks: {}, visits: 0, days: {}, demo: false };

export const dayKey = (date) =>
  new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // التخزين غير متاح (وضع خاص مثلاً): التغيير يبقى للجلسة الحالية فقط.
  }
}

let saved = read(SITE_KEY, {});
let site = { ...base, ...saved };
let log = { ...emptyLog, ...read(LOG_KEY, {}) };

const listeners = new Set();
const emit = () => listeners.forEach((fn) => fn());
function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// تعديل من تبويب آخر (لوحة المالك مثلاً) ينعكس هنا مباشرة.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (![SITE_KEY, LOG_KEY].includes(event.key)) return;
    saved = read(SITE_KEY, {});
    site = { ...base, ...saved };
    log = { ...emptyLog, ...read(LOG_KEY, {}) };
    emit();
  });
}

/* ---------- محتوى الموقع ---------- */
export const getSite = () => site;
export const useSite = () => useSyncExternalStore(subscribe, getSite);

export function updateSite(section, value) {
  saved = { ...saved, [section]: value };
  site = { ...base, ...saved };
  write(SITE_KEY, saved);
  emit();
}
export function resetSite() {
  saved = {};
  site = { ...base };
  write(SITE_KEY, saved);
  emit();
}

/* ---------- سجل النشاط ---------- */
const getLog = () => log;
export const useLog = () => useSyncExternalStore(subscribe, getLog);

function setLog(next) {
  log = next;
  write(LOG_KEY, log);
  emit();
}
const stamp = () => new Date().toISOString();
const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export function addLead(lead) {
  setLog({ ...log, leads: [{ id: newId(), at: stamp(), done: false, ...lead }, ...log.leads] });
}
export function toggleLead(id) {
  setLog({ ...log, leads: log.leads.map((l) => (l.id === id ? { ...l, done: !l.done } : l)) });
}
export function removeLead(id) {
  setLog({ ...log, leads: log.leads.filter((l) => l.id !== id) });
}

export function addCode(phone, code) {
  if (log.codes.some((c) => c.code === code)) return;
  setLog({ ...log, codes: [{ code, phone, at: stamp(), uses: 0 }, ...log.codes] });
}
export function setCodeUses(code, uses) {
  setLog({
    ...log,
    codes: log.codes.map((c) => (c.code === code ? { ...c, uses: Math.max(0, uses) } : c)),
  });
}

export function trackPlanClick(planId) {
  setLog({ ...log, clicks: { ...log.clicks, [planId]: (log.clicks[planId] || 0) + 1 } });
}
// زيارة واحدة لكل جلسة تصفح.
export function trackVisit() {
  try {
    if (sessionStorage.getItem('plt.visited')) return;
    sessionStorage.setItem('plt.visited', '1');
  } catch {
    return;
  }
  const today = dayKey(new Date());
  setLog({
    ...log,
    visits: log.visits + 1,
    days: { ...log.days, [today]: (log.days[today] || 0) + 1 },
  });
}
export function clearLog() {
  setLog({ ...emptyLog });
}

/* ---------- الفواتير ----------
   الأسعار شاملة الضريبة، والفاتورة تفصل الصافي عن الضريبة.
   status: paid مدفوعة، due غير مدفوعة، void ملغاة. الرقم متسلسل ولا يُعاد استخدامه. */
export function invoiceTotals(invoice) {
  const total = invoice.items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const net = Math.round((total / (1 + defaults.VAT_RATE)) * 100) / 100;
  return { total, net, vat: Math.round((total - net) * 100) / 100 };
}
export const invoiceNo = (invoice) =>
  `INV-${new Date(invoice.at).getFullYear()}-${String(invoice.no).padStart(4, '0')}`;

function buildInvoice(list, data) {
  return { id: newId(), no: 1 + list.length, at: stamp(), status: 'paid', pay: 'club', subId: '', ...data };
}
function subInvoice(list, sub, at) {
  return buildInvoice(list, {
    at,
    subId: sub.id,
    name: sub.name,
    phone: sub.phone,
    pay: sub.pay,
    items: [{ name: `اشتراك ${sub.plan}`, qty: 1, price: Number(sub.price) || 0 }],
  });
}

// فاتورة يدوية من لوحة المالك (حجز ملعب، حصة تدريب، ...).
export function addInvoice(data) {
  const invoice = buildInvoice(log.invoices, data);
  setLog({ ...log, invoices: [invoice, ...log.invoices] });
  return invoice;
}
export function setInvoiceStatus(id, status) {
  setLog({ ...log, invoices: log.invoices.map((i) => (i.id === id ? { ...i, status } : i)) });
}

/* ---------- طلبات الاشتراك ---------- */
export function addSubscription(sub) {
  const no = 2001 + log.subs.length;
  setLog({ ...log, subs: [{ id: newId(), no, at: stamp(), status: 'new', ...sub }, ...log.subs] });
  return no;
}
// تفعيل الاشتراك يصدر فاتورته تلقائياً، وإلغاؤه يلغي الفاتورة.
export function setSubStatus(id, status) {
  const sub = log.subs.find((s) => s.id === id);
  if (!sub) return;
  let invoices = log.invoices;
  const existing = invoices.find((i) => i.subId === id);
  if (status === 'active') {
    invoices = existing
      ? invoices.map((i) => (i.subId === id ? { ...i, status: 'paid' } : i))
      : [subInvoice(invoices, sub, stamp()), ...invoices];
  } else if (status === 'cancelled' && existing) {
    invoices = invoices.map((i) => (i.subId === id ? { ...i, status: 'void' } : i));
  }
  setLog({ ...log, invoices, subs: log.subs.map((s) => (s.id === id ? { ...s, status } : s)) });
}
export function removeSub(id) {
  setLog({ ...log, subs: log.subs.filter((s) => s.id !== id) });
}

/* ---------- سجل الأعضاء ----------
   العضو هو صاحب اشتراك مفعّل. حالته تُحسب من تاريخ نهاية اشتراكه. */
const DAY_MS = 86400000;
export const SOON_DAYS = 14;
export function subEnd(sub) {
  const date = new Date(`${sub.start}T00:00:00`);
  date.setMonth(date.getMonth() + (sub.months || 0));
  date.setDate(date.getDate() + (sub.days || 0));
  return date;
}
export const daysLeft = (sub) => Math.ceil((subEnd(sub).getTime() - Date.now()) / DAY_MS);
// active ساري، soon قرب ينتهي، expired منتهي، frozen مجمّد.
export function memberState(sub) {
  if (sub.frozen) return 'frozen';
  const left = daysLeft(sub);
  if (left < 0) return 'expired';
  return left <= SOON_DAYS ? 'soon' : 'active';
}
export function toggleFreeze(id) {
  setLog({ ...log, subs: log.subs.map((s) => (s.id === id ? { ...s, frozen: !s.frozen } : s)) });
}
// التجديد: اشتراك جديد بنفس الباقة يبدأ من نهاية الحالي (أو من اليوم لو منتهي)، وتصدر فاتورته.
export function renewSub(id) {
  const old = log.subs.find((s) => s.id === id);
  if (!old) return;
  const plan = site.plans.find((p) => p.id === old.planId);
  const end = subEnd(old);
  const sub = {
    ...old,
    id: newId(),
    no: 2001 + log.subs.length,
    at: stamp(),
    status: 'active',
    frozen: false,
    renewalOf: old.id,
    plan: plan ? plan.title : old.plan,
    price: plan ? Number(plan.price) || 0 : old.price,
    months: plan ? plan.paid + (plan.gift || 0) : old.months,
    days: plan ? plan.giftDays || 0 : old.days,
    start: dayKey(end.getTime() > Date.now() ? end : new Date()),
    code: '',
    codeOk: false,
  };
  setLog({
    ...log,
    subs: [sub, ...log.subs.map((s) => (s.id === id ? { ...s, renewed: true } : s))],
    invoices: [subInvoice(log.invoices, sub, sub.at), ...log.invoices],
  });
}

/* ---------- حجوزات حصص اللياقة ---------- */
export const seatsTaken = (bookings, slotId, date) =>
  bookings.filter((b) => b.slotId === slotId && b.date === date).length;
// يرجع 'ok' أو سبب الرفض: full المقاعد اكتملت، dup الرقم مسجل في نفس الموعد.
export function addBooking(booking) {
  const slot = site.classes.find((c) => c.id === booking.slotId);
  if (!slot) return 'full';
  const same = log.bookings.filter((b) => b.slotId === booking.slotId && b.date === booking.date);
  if (same.some((b) => b.phone === booking.phone)) return 'dup';
  if (same.length >= slot.capacity) return 'full';
  setLog({
    ...log,
    bookings: [
      { id: newId(), at: stamp(), attended: false, slot: slot.title, time: slot.time, ...booking },
      ...log.bookings,
    ],
  });
  return 'ok';
}
export function toggleAttended(id) {
  setLog({ ...log, bookings: log.bookings.map((b) => (b.id === id ? { ...b, attended: !b.attended } : b)) });
}
export function removeBooking(id) {
  setLog({ ...log, bookings: log.bookings.filter((b) => b.id !== id) });
}

// يملأ السجل بنشاط تجريبي لآخر 28 يوماً حتى تظهر اللوحة كما ستكون بعد التشغيل.
// الأرقام والأسماء والفواتير مولّدة وليست بيانات حقيقية، واللوحة تعرض تنبيهاً بذلك.
export function seedDemo() {
  const { plans } = site;
  const DAY = 86400000;
  const now = Date.now();
  // لحظة داخل الأسبوع (week) موزعة بالتساوي على عدد العناصر.
  const moment = (week, index, count) =>
    new Date(now - (week * 7 + ((index + 0.5) * 7) / count) * DAY);

  let serial = 0;
  const demoPhone = () => `0500${String(100001 + serial++)}`;

  const days = {};
  let visits = 0;
  for (let ago = 27; ago >= 0; ago--) {
    const step = 27 - ago;
    const count = 16 + Math.round(step * 0.9) + (step % 7 > 4 ? 9 : 0);
    days[dayKey(new Date(now - ago * DAY))] = count;
    visits += count;
  }

  // عدد العناصر لكل أسبوع، من هذا الأسبوع إلى قبل ثلاثة أسابيع: نمو هادئ.
  const weekly = { subs: [6, 5, 4, 4], leads: [7, 6, 5, 4], extras: [3, 2, 2, 1] };
  const reasons = ['حصة تجريبية', 'اشتراك جديد', 'حجز ملعب الكورة', 'استفسار'];
  const extras = [
    { name: 'حجز ملعب الكورة، ساعة', price: 150 },
    { name: 'حصة تدريب شخصي', price: 120 },
    { name: 'حجز ملعب الكورة، ساعتين', price: 280 },
  ];
  const leads = [];
  const subs = [];
  // الفواتير تُجمع بترتيب زمني ثم تُرقّم، حتى يكون التسلسل مطابقاً للتاريخ.
  const drafts = [];

  for (let week = 3; week >= 0; week--) {
    for (let i = weekly.leads[week] - 1; i >= 0; i--) {
      const date = moment(week, i, weekly.leads[week]);
      leads.unshift({
        id: newId(),
        at: date.toISOString(),
        done: week > 0 || i > 2,
        name: `عميل تجريبي ${leads.length + 1}`,
        phone: demoPhone(),
        reason: reasons[(week + i) % reasons.length],
        note: '',
      });
    }
    for (let i = weekly.subs[week] - 1; plans.length && i >= 0; i--) {
      const date = moment(week, i, weekly.subs[week]);
      const plan = plans[(week + i) % plans.length];
      const sub = {
        id: newId(),
        no: 2001 + subs.length,
        at: date.toISOString(),
        status: week === 0 && i === 0 ? 'new' : week === 2 && i === 1 ? 'cancelled' : 'active',
        planId: plan.id,
        plan: plan.title,
        price: Number(plan.price) || 0,
        months: plan.paid,
        days: plan.giftDays || 0,
        start: dayKey(date),
        name: `عضو تجريبي ${subs.length + 1}`,
        phone: demoPhone(),
        code: '',
        codeOk: false,
        pay: i % 2 ? 'online' : 'club',
      };
      subs.unshift(sub);
      if (sub.status !== 'new') {
        drafts.push({ sub, at: sub.at, status: sub.status === 'cancelled' ? 'void' : 'paid' });
      }
    }
    for (let i = weekly.extras[week] - 1; i >= 0; i--) {
      const date = moment(week, i + 0.3, weekly.extras[week]);
      const extra = extras[(week + i) % extras.length];
      drafts.push({
        at: date.toISOString(),
        status: week === 0 && i === 0 ? 'due' : 'paid',
        name: `عميل تجريبي ${40 + drafts.length}`,
        phone: demoPhone(),
        pay: 'club',
        items: [{ name: extra.name, qty: 1, price: extra.price }],
      });
    }
  }

  // أعضاء قدامى حتى يظهر في سجل الأعضاء من قرب ينتهي ومن انتهى ومن هو مجمّد.
  // [قبل كم يوم اشترك، رقم الباقة]
  const veterans = [[300, 0], [150, 1], [200, 1], [100, 2], [97, 2], [58, 3], [64, 3], [45, 4], [70, 4]];
  veterans.forEach(([ago, planIndex], i) => {
    if (!plans.length) return;
    const plan = plans[planIndex % plans.length];
    const date = new Date(now - ago * DAY);
    const sub = {
      id: newId(),
      no: 1901 + i,
      at: date.toISOString(),
      status: 'active',
      frozen: i === 1,
      planId: plan.id,
      plan: plan.title,
      price: Number(plan.price) || 0,
      months: plan.paid,
      days: plan.giftDays || 0,
      start: dayKey(date),
      name: `عضو تجريبي ${60 + i}`,
      phone: demoPhone(),
      code: '',
      codeOk: false,
      pay: i % 2 ? 'online' : 'club',
    };
    subs.push(sub);
    drafts.push({ sub, at: sub.at, status: 'paid' });
  });

  // حجوزات حصص اليوم وبكرة.
  const bookings = [];
  [0, 1].forEach((offset) => {
    const date = dayKey(new Date(now + offset * DAY));
    site.classes.forEach((slot, s) => {
      const count = Math.min(slot.capacity, [6, 11, 17, 9][s % 4] - offset * 3);
      for (let i = 0; i < count; i++) {
        bookings.push({
          id: newId(),
          at: new Date(now - (i + 1) * 3600000).toISOString(),
          attended: false,
          slotId: slot.id,
          slot: slot.title,
          time: slot.time,
          date,
          name: `عضو تجريبي ${100 + bookings.length}`,
          phone: demoPhone(),
        });
      }
    });
  });

  drafts.sort((a, b) => new Date(a.at) - new Date(b.at));
  const invoices = [];
  drafts.forEach(({ sub, ...draft }) => {
    const invoice = sub
      ? { ...subInvoice(invoices, sub, draft.at), status: draft.status }
      : buildInvoice(invoices, draft);
    invoices.push(invoice);
  });
  invoices.reverse();

  const clicks = {};
  plans.forEach((plan, i) => {
    clicks[plan.id] = [41, 27, 19, 9, 14][i % 5];
  });
  setLog({ ...emptyLog, leads, subs, invoices, bookings, days, visits, clicks, demo: true });
}

// نسخة العرض: أول فتح على أي جهاز يحمّل البيانات التجريبية مرة واحدة،
// حتى تظهر اللوحة والفواتير مليانة بدون أي ضغطة. يُحذف هذا عند التشغيل الفعلي.
try {
  if (!localStorage.getItem('plt.seeded2')) {
    localStorage.setItem('plt.seeded2', '1');
    if (log.subs.length + log.invoices.length + log.leads.length === 0) seedDemo();
  }
} catch {
  // بدون تخزين: اللوحة تبدأ فاضية وزر التحميل اليدوي موجود.
}
