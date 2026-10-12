import { useState } from 'react';
import { clearLog, dayKey, invoiceTotals, seedDemo, useLog, useSite } from '../store.js';
import { money, Pills, when } from './ui.jsx';

const periods = [
  { id: 7, label: 'آخر 7 أيام' },
  { id: 30, label: 'آخر 30 يوم' },
];
const DAY = 86400000;

// مجموع قيمة العناصر الواقعة بين (from) و(to) يوماً مضت.
function sumBetween(items, value, from, to) {
  const now = Date.now();
  return items.reduce((sum, item) => {
    const age = (now - new Date(item.at).getTime()) / DAY;
    return age >= to && age < from ? sum + value(item) : sum;
  }, 0);
}
function visitsBetween(days, from, to) {
  let sum = 0;
  for (let ago = Math.ceil(to); ago < from; ago++) {
    const date = new Date(Date.now() - ago * DAY);
    sum += days[dayKey(date)] || 0;
  }
  return sum;
}

// معدل النمو مقارنة بالفترة السابقة. null يعني ما فيه فترة سابقة نقارن بها.
function growth(current, previous) {
  if (!previous) return null;
  return Math.round(((current - previous) / previous) * 100);
}

function Kpi({ label, value, unit, current, previous, period }) {
  const rate = growth(current, previous);
  let trend = 'flat';
  if (rate > 0) trend = 'up';
  if (rate < 0) trend = 'down';

  return (
    <div className="kpi">
      <p className="kpi-label">{label}</p>
      <p className="kpi-value">
        <span className="num">{value}</span>
        {unit && <small>{unit}</small>}
      </p>
      {rate === null ? (
        <p className="kpi-trend is-flat">{current > 0 ? 'جديد، ما فيه فترة سابقة للمقارنة' : 'ما فيه نشاط بعد'}</p>
      ) : (
        <p className={`kpi-trend is-${trend}`}>
          <b>
            <span aria-hidden="true">{trend === 'up' ? '▲' : trend === 'down' ? '▼' : '●'}</span>{' '}
            <span className="num">{Math.abs(rate)}%</span>{' '}
            {trend === 'up' ? 'نمو' : trend === 'down' ? 'تراجع' : 'ثابت'}
          </b>{' '}
          عن {period === 7 ? 'الـ7 أيام' : 'الـ30 يوم'} السابقة
        </p>
      )}
    </div>
  );
}

// الدخل اليومي لآخر 14 يوماً: مجموع الفواتير المدفوعة.
function IncomeChart({ paid }) {
  const [active, setActive] = useState(null);
  const series = [];
  for (let ago = 13; ago >= 0; ago--) {
    const date = new Date(Date.now() - ago * DAY);
    const key = dayKey(date);
    const total = paid
      .filter((i) => dayKey(new Date(i.at)) === key)
      .reduce((sum, i) => sum + invoiceTotals(i).total, 0);
    series.push({
      key,
      total,
      label: date.toLocaleDateString('ar-SA-u-nu-latn-ca-gregory', { day: 'numeric', month: 'short' }),
    });
  }
  const max = Math.max(1, ...series.map((d) => d.total));
  const sum = series.reduce((total, d) => total + d.total, 0);
  const shown = active === null ? null : series[active];

  return (
    <section className="a-card">
      <div className="chart-head">
        <div>
          <h2>الدخل اليومي، آخر 14 يوم</h2>
          <p className="a-muted">مجموع الفواتير المدفوعة، بالريال شامل الضريبة.</p>
        </div>
        <p className="chart-readout" aria-live="polite">
          {shown ? (
            <>
              {shown.label}: <b className="num">{money(shown.total)}</b> ريال
            </>
          ) : (
            <>
              المجموع: <b className="num">{money(sum)}</b> ريال
            </>
          )}
        </p>
      </div>

      <div className="chart" role="img" aria-label={`الدخل اليومي لآخر 14 يوم، المجموع ${money(sum)} ريال`}>
        <span className="chart-max num">{money(max)}</span>
        <div className="chart-bars" onMouseLeave={() => setActive(null)}>
          {series.map((d, i) => (
            <button
              type="button"
              key={d.key}
              className={active === i ? 'is-on' : ''}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              aria-label={`${d.label}: ${money(d.total)} ريال`}
            >
              <i style={{ height: `${(d.total / max) * 100}%` }} />
            </button>
          ))}
        </div>
        <div className="chart-axis">
          <span>{series[0].label}</span>
          <span>{series[7].label}</span>
          <span>اليوم</span>
        </div>
      </div>
    </section>
  );
}

export default function Overview({ go }) {
  const { plans } = useSite();
  const log = useLog();
  const [period, setPeriod] = useState(7);

  const subs = log.subs.filter((s) => s.status !== 'cancelled');
  const paid = log.invoices.filter((i) => i.status === 'paid');
  const stat = (items, value) => ({
    current: sumBetween(items, value, period, 0),
    previous: sumBetween(items, value, period * 2, period),
  });

  const subsCount = stat(subs, () => 1);
  const income = stat(paid, (i) => invoiceTotals(i).total);
  const issued = stat(log.invoices, () => 1);
  const leads = stat(log.leads, () => 1);
  const visits = {
    current: visitsBetween(log.days, period, 0),
    previous: visitsBetween(log.days, period * 2, period),
  };

  const todo = [
    { id: 'subs', label: 'اشتراك ينتظر التفعيل', count: log.subs.filter((s) => s.status === 'new').length },
    { id: 'invoices', label: 'فاتورة غير مدفوعة', count: log.invoices.filter((i) => i.status === 'due').length },
    { id: 'leads', label: 'طلب تواصل بدون رد', count: log.leads.filter((l) => !l.done).length },
  ].filter((t) => t.count > 0);

  const clicks = plans.map((p) => ({ ...p, count: log.clicks[p.id] || 0 }));
  const most = Math.max(1, ...clicks.map((c) => c.count));
  const hasActivity = log.subs.length > 0 || log.invoices.length > 0 || log.leads.length > 0;

  return (
    <>
      {log.demo && (
        <p className="a-banner is-demo">
          الأرقام المعروضة بيانات تجريبية لتوضيح شكل اللوحة، وليست نشاطاً حقيقياً.{' '}
          <button type="button" className="a-link" onClick={clearLog}>
            امسحها
          </button>
        </p>
      )}
      {!hasActivity && (
        <div className="a-empty">
          <p>ما فيه طلبات مسجلة بعد. تبي تشوف اللوحة وهي مليانة؟</p>
          <button type="button" className="btn btn-light" onClick={seedDemo}>
            حمّل بيانات تجريبية
          </button>
        </div>
      )}

      <div className="a-toolbar">
        <Pills label="الفترة" options={periods} value={period} onChange={setPeriod} />
      </div>

      <div className="kpis">
        <Kpi
          label="الدخل المحصّل"
          value={money(income.current)}
          unit="ريال"
          period={period}
          {...income}
        />
        <Kpi
          label="اشتراكات جديدة"
          value={subsCount.current}
          period={period}
          {...subsCount}
        />
        <Kpi label="فواتير صادرة" value={issued.current} period={period} {...issued} />
        <Kpi label="طلبات التواصل" value={leads.current} period={period} {...leads} />
        <Kpi label="زيارات الموقع" value={money(visits.current)} period={period} {...visits} />
      </div>

      <IncomeChart paid={paid} />

      <div className="a-two">
        <section className="a-card">
          <h2>يحتاج منك إجراء</h2>
          {todo.length === 0 ? (
            <p className="a-muted">ما فيه شيء معلّق. كل الطلبات متابَعة.</p>
          ) : (
            <ul className="todo">
              {todo.map((t) => (
                <li key={t.id}>
                  <b className="num">{t.count}</b>
                  <span>{t.label}</span>
                  <button type="button" className="a-link" onClick={() => go(t.id)}>
                    افتحها
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="a-card">
          <h2>أي باقة تنضغط أكثر؟</h2>
          {clicks.map((c) => (
            <div className="a-meter" key={c.id}>
              <span>{c.title}</span>
              <div>
                <i style={{ width: `${(c.count / most) * 100}%` }} />
              </div>
              <b className="num">{c.count}</b>
            </div>
          ))}
        </section>
      </div>

      {log.subs.length > 0 && (
        <section className="a-card">
          <h2>آخر الاشتراكات</h2>
          <ul className="a-list">
            {log.subs.slice(0, 4).map((s) => (
              <li key={s.id}>
                <b>{s.name}</b>
                <span>{s.plan}</span>
                <span className="num">{money(s.price)} ريال</span>
                <span className="a-muted">{when(s.at)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
