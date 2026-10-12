// صفحات المتابعة: طلبات الاشتراك، طلبات التواصل، أكواد الإحالة.
import { useState } from 'react';
import {
  invoiceNo,
  removeLead,
  removeSub,
  setCodeUses,
  setSubStatus,
  toggleLead,
  useLog,
  useSite,
} from '../store.js';
import { Confirm, Empty, money, Pills, Text, Toggle, waLink, when } from './ui.jsx';

const subStatuses = [
  { id: 'new', label: 'جديد' },
  { id: 'active', label: 'مفعّل' },
  { id: 'cancelled', label: 'ملغي' },
];

function Contact({ name, phone }) {
  return (
    <>
      <b>{name}</b>
      <a className="num" href={`tel:${phone}`}>
        {phone}
      </a>
    </>
  );
}

export function Subs() {
  const { subs, invoices } = useLog();
  const invoiceOf = (id) => invoices.find((i) => i.subId === id);
  if (subs.length === 0) return <Empty>ما فيه طلبات اشتراك إلى الآن.</Empty>;

  return (
    <ul className="a-rows">
      {subs.map((s) => (
        <li key={s.id} className={s.status === 'cancelled' ? 'a-row is-done' : 'a-row'}>
          <div className="a-row-main">
            <b className="num">#{s.no}</b>
            <Contact name={s.name} phone={s.phone} />
            <span className="a-tag">{s.pay === 'online' ? 'دفع أونلاين' : 'دفع في النادي'}</span>
            <span className="a-muted">{when(s.at)}</span>
          </div>
          <p className="a-note">
            {s.plan}، <span className="num">{money(s.price)}</span> ريال، يبدأ{' '}
            <span className="num">{s.start}</span>
          </p>
          {s.code && (
            <p className={s.codeOk ? 'a-ok' : 'a-bad'}>
              كود الإحالة: <span className="num">{s.code}</span>{' '}
              {s.codeOk ? '(صحيح، طبّق الخصم للطرفين)' : '(غير موجود في السجل)'}
            </p>
          )}
          <p className="a-muted">
            {invoiceOf(s.id) ? (
              <>
                الفاتورة: <span className="num">{invoiceNo(invoiceOf(s.id))}</span>
                {invoiceOf(s.id).status === 'void' && ' (ملغاة)'}
              </>
            ) : (
              'الفاتورة تصدر تلقائياً أول ما تفعّل الاشتراك.'
            )}
          </p>
          <div className="a-row-actions">
            <Pills
              label={`حالة الاشتراك ${s.no}`}
              options={subStatuses}
              value={s.status}
              onChange={(status) => setSubStatus(s.id, status)}
            />
            <a className="a-link" href={waLink(s.phone)} target="_blank" rel="noopener">
              راسله واتساب
            </a>
            <Confirm onConfirm={() => removeSub(s.id)}>حذف</Confirm>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function Leads() {
  const { leads } = useLog();
  if (leads.length === 0) return <Empty>ما فيه طلبات تواصل إلى الآن.</Empty>;

  return (
    <ul className="a-rows">
      {leads.map((l) => (
        <li key={l.id} className={l.done ? 'a-row is-done' : 'a-row'}>
          <div className="a-row-main">
            <Contact name={l.name} phone={l.phone} />
            <span className="a-tag">{l.reason}</span>
            <span className="a-muted">{when(l.at)}</span>
          </div>
          {l.note && <p className="a-note">{l.note}</p>}
          <div className="a-row-actions">
            <a className="a-link" href={waLink(l.phone)} target="_blank" rel="noopener">
              راسله واتساب
            </a>
            <Toggle label="تم التواصل" checked={l.done} onChange={() => toggleLead(l.id)} />
            <Confirm onConfirm={() => removeLead(l.id)}>حذف</Confirm>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function Codes() {
  const { codes } = useLog();
  const { referral } = useSite();
  const [query, setQuery] = useState('');
  const wanted = query.trim().toUpperCase();
  const match = wanted ? codes.find((c) => c.code === wanted) : null;

  return (
    <>
      <section className="a-card">
        <h2>تحقق من كود</h2>
        <p className="a-muted">الموظف يكتب الكود اللي جابه العميل الجديد قبل ما يطبق الخصم.</p>
        <Text label="الكود" value={query} onChange={setQuery} ltr placeholder={`${referral.prefix}-XXXX`} />
        {wanted && (
          <p className={match ? 'a-ok' : 'a-bad'} role="status">
            {match
              ? `كود صحيح، صاحبه ${match.phone}. طبّق الخصم${referral.discount ? ` (${referral.discount})` : ''} للطرفين ثم زد عدد الاستخدام.`
              : 'الكود غير موجود.'}
          </p>
        )}
      </section>

      {codes.length === 0 ? (
        <Empty>ما أحد طلّع كود إلى الآن.</Empty>
      ) : (
        <ul className="a-rows">
          {codes.map((c) => (
            <li key={c.code} className="a-row">
              <div className="a-row-main">
                <b className="num">{c.code}</b>
                <span className="num">{c.phone}</span>
                <span className="a-muted">{when(c.at)}</span>
              </div>
              <div className="a-row-actions">
                <span>اشتراكات عن طريقه</span>
                <div className="a-stepper">
                  <button type="button" onClick={() => setCodeUses(c.code, c.uses - 1)} aria-label="نقص">
                    −
                  </button>
                  <b className="num">{c.uses}</b>
                  <button type="button" onClick={() => setCodeUses(c.code, c.uses + 1)} aria-label="زيادة">
                    +
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
