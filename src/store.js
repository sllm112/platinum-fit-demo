// طبقة البيانات: محتوى الموقع وسجل النشاط (طلبات، اشتراكات، فواتير).
// في نسخة العرض الحفظ في متصفح الجهاز (localStorage). عند النشر تُستبدل
// دوال القراءة والحفظ هنا بنداءات لخادم وقاعدة بيانات، والباقي يبقى كما هو.
import { useSyncExternalStore } from 'react';
import * as defaults from './data/club.js';

const SITE_KEY = 'plt.site.v1';
const LOG_KEY = 'plt.log.v1';

const base = {
  club: defaults.club,
  hero: defaults.hero,
  theme: defaults.theme,
  plans: defaults.plans,
  features: defaults.features,
  programs: defaults.programs,
  gallery: defaults.gallery,
  referral: defaults.referral,
  reviews: defaults.reviews,
};
// days: عدد الزيارات لكل يوم بصيغة YYYY-MM-DD. demo: السجل مملوء ببيانات تجريبية.
const emptyLog = { leads: [], codes: [], subs: [], invoices: [], clicks: {}, visits: 0, days: {}, demo: false };

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

// يملأ السجل بنشاط تجريبي لآخر 28 يوماً حتى تظهر اللوحة كما ستكون بعد التشغيل.
// الأرقام والأسماء والفواتير مولّدة وليست بيانات حقيقية، واللوحة تعرض تنبيهاً بذلك.
export function seedDemo() {
  const { plans } = site;
  const DAY = 86400000;
  const now = Date.now();
  // لحظة داخل الأسبوع (week) موزعة بالتساوي على عدد العناصر.
  const moment = (week, index, count) =>
    new Date(now - (week * 7 + ((index + 0.5) * 7) / count) * DAY);

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
        phone: '0500000000',
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
        name: `عميل تجريبي ${subs.length + 1}`,
        phone: '0500000000',
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
        phone: '0500000000',
        pay: 'club',
        items: [{ name: extra.name, qty: 1, price: extra.price }],
      });
    }
  }

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
  setLog({ ...emptyLog, leads, subs, invoices, days, visits, clicks, demo: true });
}

// نسخة العرض: أول فتح على أي جهاز يحمّل البيانات التجريبية مرة واحدة،
// حتى تظهر اللوحة والفواتير مليانة بدون أي ضغطة. يُحذف هذا عند التشغيل الفعلي.
try {
  if (!localStorage.getItem('plt.seeded')) {
    localStorage.setItem('plt.seeded', '1');
    if (log.subs.length + log.invoices.length + log.leads.length === 0) seedDemo();
  }
} catch {
  // بدون تخزين: اللوحة تبدأ فاضية وزر التحميل اليدوي موجود.
}
