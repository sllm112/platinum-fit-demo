// صفحات التعديل: الاشتراكات، بيانات النادي، المحتوى.
import { useState } from 'react';
import { updateSite, useSite } from '../store.js';
import { Confirm, Text, Toggle } from './ui.jsx';

const accents = [
  { name: 'أحمر الشعار', value: '#c8102e' },
  { name: 'عنابي', value: '#8a1026' },
  { name: 'بني', value: '#9a6a3c' },
  { name: 'رصاصي', value: '#9ea3aa' },
  { name: 'أخضر', value: '#1fb866' },
  { name: 'ذهبي', value: '#f5b400' },
  { name: 'أزرق', value: '#2f7bff' },
];

const splitList = (text) =>
  String(text)
    .split(/[،,]/)
    .map((s) => s.trim())
    .filter(Boolean);

export function PlansEditor() {
  const { plans } = useSite();
  const set = (i, patch) =>
    updateSite(
      'plans',
      plans.map((p, n) => (n === i ? { ...p, ...patch } : p)),
    );
  const add = () =>
    updateSite('plans', [
      ...plans,
      { id: `plan-${Date.now()}`, title: 'باقة جديدة', paid: 1, gift: 0, giftDays: 0, price: 0, was: 0, note: '', url: '' },
    ]);

  return (
    <>
      <div className="a-toolbar">
        <p className="a-muted">التعديل ينحفظ ويظهر في الموقع مباشرة.</p>
        <button type="button" className="btn btn-light" onClick={add}>
          أضف باقة
        </button>
      </div>

      {plans.map((p, i) => (
        <section className="a-card" key={p.id}>
          <div className="a-grid">
            <Text label="اسم الباقة" value={p.title} onChange={(v) => set(i, { title: v })} />
            <Text label="السعر شامل الضريبة (ريال)" type="number" value={p.price} onChange={(v) => set(i, { price: v })} ltr />
            <Text
              label="الشهور المدفوعة"
              type="number"
              value={p.paid}
              onChange={(v) => set(i, { paid: Math.max(1, v) })}
              ltr
            />
            <Text
              label="الأيام المجانية"
              type="number"
              value={p.giftDays}
              onChange={(v) => set(i, { giftDays: Math.max(0, v) })}
              ltr
            />
            <Text
              label="السعر قبل العرض (ريال)"
              type="number"
              value={p.was}
              onChange={(v) => set(i, { was: Math.max(0, v) })}
              hint="يظهر مشطوباً بجانب السعر. صفر يخفيه."
              ltr
            />
            <Text label="الشارة فوق الاسم" value={p.note} onChange={(v) => set(i, { note: v })} />
            <Text
              label="رابط الدفع أونلاين"
              value={p.url}
              onChange={(v) => set(i, { url: v })}
              hint="لو تركته فاضي يختفي خيار الدفع أونلاين لهذي الباقة."
              ltr
            />
          </div>
          <div className="a-row-actions">
            <Toggle label="باقة مميزة" checked={!!p.featured} onChange={(v) => set(i, { featured: v })} />
            <Confirm onConfirm={() => updateSite('plans', plans.filter((_, n) => n !== i))}>
              حذف الباقة
            </Confirm>
          </div>
        </section>
      ))}
    </>
  );
}

export function ClubEditor() {
  const { club, hero, theme, referral } = useSite();
  const setClub = (patch) => updateSite('club', { ...club, ...patch });

  return (
    <>
      <section className="a-card">
        <h2>معلومات التواصل</h2>
        <div className="a-grid">
          <Text label="اسم النادي" value={club.name} onChange={(v) => setClub({ name: v })} />
          <Text label="المدينة" value={club.city} onChange={(v) => setClub({ city: v })} />
          <Text label="العنوان" value={club.address} onChange={(v) => setClub({ address: v })} />
          <Text label="الدوام" value={club.hours} onChange={(v) => setClub({ hours: v })} />
          <Text
            label="رقم واتساب النادي"
            value={club.whatsapp}
            onChange={(v) => setClub({ whatsapp: v.replace(/[^\d]/g, '') })}
            hint="بالصيغة الدولية بدون +، مثال: 9665XXXXXXXX"
            ltr
          />
          <Text label="جوال النادي" value={club.phone} onChange={(v) => setClub({ phone: v })} ltr />
          <Text label="جوال السبا" value={club.spaPhone} onChange={(v) => setClub({ spaPhone: v })} ltr />
          <Text label="رابط خرائط قوقل" value={club.mapsUrl} onChange={(v) => setClub({ mapsUrl: v })} ltr />
          <Text
            label="حساب إنستقرام"
            value={club.instagram.handle}
            onChange={(v) => setClub({ instagram: { ...club.instagram, handle: v } })}
            ltr
          />
          <Text
            label="رابط إنستقرام"
            value={club.instagram.url}
            onChange={(v) => setClub({ instagram: { ...club.instagram, url: v } })}
            ltr
          />
        </div>
      </section>

      <section className="a-card">
        <h2>بيانات الفاتورة</h2>
        <div className="a-grid">
          <Text label="الاسم التجاري" value={club.legalName} onChange={(v) => setClub({ legalName: v })} />
          <Text label="السجل التجاري" value={club.cr} onChange={(v) => setClub({ cr: v })} ltr />
          <Text
            label="الرقم الضريبي"
            value={club.vat}
            onChange={(v) => setClub({ vat: v.replace(/[^\d]/g, '') })}
            hint="15 رقم. الموجود الآن رقم تجريبي."
            ltr
          />
        </div>
      </section>

      <section className="a-card">
        <h2>الواجهة الرئيسية</h2>
        <div className="a-grid">
          <Text
            label="العنوان، السطر الأول"
            value={hero.lineOne}
            onChange={(v) => updateSite('hero', { ...hero, lineOne: v })}
          />
          <Text
            label="العنوان، السطر الملون"
            value={hero.lineTwo}
            onChange={(v) => updateSite('hero', { ...hero, lineTwo: v })}
          />
        </div>
        <Text
          label="الوصف تحت العنوان"
          value={hero.lede}
          onChange={(v) => updateSite('hero', { ...hero, lede: v })}
          area
        />
      </section>

      <section className="a-card">
        <h2>خصم "جيب صاحبك"</h2>
        <Text
          label="قيمة الخصم كما تظهر للزوار"
          value={referral.discount}
          onChange={(v) => updateSite('referral', { ...referral, discount: v })}
          hint="مثال: 10% أو 50 ريال. الخصم للطرفين: صاحب الكود واللي جابه."
        />
      </section>

      <section className="a-card">
        <h2>لون الموقع</h2>
        <div className="a-swatches">
          {accents.map((a) => (
            <button
              type="button"
              key={a.value}
              className={theme.accent === a.value ? 'is-on' : ''}
              onClick={() => updateSite('theme', { ...theme, accent: a.value })}
            >
              <i style={{ background: a.value }} />
              {a.name}
            </button>
          ))}
          <label>
            <input
              type="color"
              value={theme.accent}
              onChange={(e) => updateSite('theme', { ...theme, accent: e.target.value })}
            />
            لون آخر
          </label>
        </div>
      </section>
    </>
  );
}

export function ContentEditor() {
  const { programs, reviews } = useSite();
  const [draft, setDraft] = useState({ name: '', text: '' });
  const setProgram = (i, patch) =>
    updateSite(
      'programs',
      programs.map((p, n) => (n === i ? { ...p, ...patch } : p)),
    );

  function addReview() {
    if (draft.name.trim().length < 2 || draft.text.trim().length < 5) return;
    updateSite('reviews', [...reviews, { name: draft.name.trim(), text: draft.text.trim() }]);
    setDraft({ name: '', text: '' });
  }

  return (
    <>
      <section className="a-card">
        <h2>المرافق</h2>
        {programs.map((p, i) => (
          <div className="a-block" key={p.id}>
            <Text label="اسم المرفق" value={p.title} onChange={(v) => setProgram(i, { title: v })} />
            <Text label="الوصف" value={p.text} onChange={(v) => setProgram(i, { text: v })} area />
            <Text
              label="النقاط (افصل بينها بفاصلة)"
              value={p.points.join('، ')}
              onChange={(v) => setProgram(i, { points: splitList(v) })}
            />
          </div>
        ))}
      </section>

      <section className="a-card">
        <h2>آراء الأعضاء</h2>
        <p className="a-muted">أضف هنا آراء حقيقية فقط، وبعد موافقة أصحابها.</p>
        {reviews.map((r, i) => (
          <div className="a-row" key={`${r.name}-${i}`}>
            <div className="a-row-main">
              <b>{r.name}</b>
            </div>
            <p className="a-note">{r.text}</p>
            <div className="a-row-actions">
              <Confirm onConfirm={() => updateSite('reviews', reviews.filter((_, n) => n !== i))}>
                حذف
              </Confirm>
            </div>
          </div>
        ))}
        <div className="a-block">
          <Text label="اسم العضو" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} />
          <Text label="رأيه" value={draft.text} onChange={(v) => setDraft({ ...draft, text: v })} area />
          <button type="button" className="btn btn-ghost" onClick={addReview}>
            أضف الرأي
          </button>
        </div>
      </section>
    </>
  );
}
