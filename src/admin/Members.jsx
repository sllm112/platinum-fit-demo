// سجل الأعضاء: كل صاحب اشتراك مفعّل، وحالته محسوبة من تاريخ نهاية اشتراكه.
import { useState } from 'react';
import { daysLeft, memberState, renewSub, SOON_DAYS, subEnd, toggleFreeze, useLog, useSite } from '../store.js';
import { Empty, money, Pills, Text, Toggle } from './ui.jsx';

const states = [
  { id: 'soon', label: 'قرب ينتهي' },
  { id: 'expired', label: 'منتهي' },
  { id: 'active', label: 'ساري' },
  { id: 'frozen', label: 'مجمّد' },
];
const stateLabel = Object.fromEntries(states.map((s) => [s.id, s.label]));
const order = { soon: 0, expired: 1, active: 2, frozen: 3 };
const longDate = (date) => date.toLocaleDateString('ar-SA-u-nu-latn-ca-gregory', { dateStyle: 'long' });

function daysText(n) {
  if (n === 1) return 'يوم';
  if (n === 2) return 'يومين';
  return n <= 10 ? `${n} أيام` : `${n} يوم`;
}
function leftText(sub) {
  const left = daysLeft(sub);
  if (left < 0) return `انتهى قبل ${daysText(-left)}`;
  if (left === 0) return 'ينتهي اليوم';
  return `باقي ${daysText(left)}`;
}

export default function Members() {
  const { subs } = useLog();
  const { club } = useSite();
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  // الاشتراك اللي تجدد يختفي من السجل ويحل محله الجديد.
  const members = subs
    .filter((s) => s.status === 'active' && !s.renewed)
    .map((s) => ({ ...s, state: memberState(s), left: daysLeft(s) }))
    .sort((a, b) => order[a.state] - order[b.state] || a.left - b.left);
  const count = (state) => members.filter((m) => m.state === state).length;
  const wanted = query.trim();
  const shown = members.filter(
    (m) => (filter === 'all' || m.state === filter) && (!wanted || m.name.includes(wanted) || m.phone.includes(wanted)),
  );

  const reminder = (m) => {
    const text =
      m.state === 'expired'
        ? `هلا ${m.name}، اشتراكك في نادي ${club.name} انتهى. نجدده لك؟`
        : `هلا ${m.name}، اشتراكك في نادي ${club.name} ينتهي ${longDate(subEnd(m))}. تبي نجدده لك؟`;
    return `https://wa.me/966${m.phone.slice(1)}?text=${encodeURIComponent(text)}`;
  };

  if (members.length === 0) {
    return <Empty>ما فيه أعضاء إلى الآن. أي اشتراك تفعّله يدخل صاحبه هنا تلقائياً.</Empty>;
  }

  return (
    <>
      <div className="kpis m-kpis">
        <div className="kpi">
          <p className="kpi-label">كل الأعضاء</p>
          <p className="kpi-value num">{members.length}</p>
        </div>
        {states.map((s) => (
          <div className={`kpi m-kpi is-${s.id}`} key={s.id}>
            <p className="kpi-label">{s.label}</p>
            <p className="kpi-value num">{count(s.id)}</p>
          </div>
        ))}
      </div>

      <p className="a-muted">
        "قرب ينتهي" يعني باقي له {daysText(SOON_DAYS)} أو أقل. ذولا أهم ناس تتواصل معهم قبل ما يروحون.
      </p>

      <div className="a-toolbar">
        <Pills
          label="تصفية الأعضاء"
          options={[{ id: 'all', label: 'الكل' }, ...states]}
          value={filter}
          onChange={setFilter}
        />
        <div className="m-search">
          <Text label="بحث بالاسم أو الجوال" value={query} onChange={setQuery} />
        </div>
      </div>

      {shown.length === 0 ? (
        <Empty>ما فيه أعضاء بهذي التصفية.</Empty>
      ) : (
        <ul className="a-rows">
          {shown.map((m) => (
            <li key={m.id} className="a-row">
              <div className="a-row-main">
                <b>{m.name}</b>
                <a className="num" href={`tel:${m.phone}`}>
                  {m.phone}
                </a>
                <span className={`a-tag m-tag is-${m.state}`}>{stateLabel[m.state]}</span>
                <span className="a-muted">{m.plan}</span>
              </div>
              <p>
                {m.left < 0 ? 'انتهى' : 'ينتهي'} <b>{longDate(subEnd(m))}</b>
                <span className="a-muted"> ({leftText(m)})</span>
                <span className="a-muted">
                  {' '}
                  · دفع <span className="num">{money(m.price)}</span> ريال
                </span>
              </p>
              <div className="a-row-actions">
                <button type="button" className="btn btn-light btn-small" onClick={() => renewSub(m.id)}>
                  جدّد نفس الباقة
                </button>
                {m.state !== 'active' && m.state !== 'frozen' && (
                  <a className="a-link" href={reminder(m)} target="_blank" rel="noopener">
                    ذكّره واتساب
                  </a>
                )}
                <Toggle label="مجمّد" checked={Boolean(m.frozen)} onChange={() => toggleFreeze(m.id)} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
