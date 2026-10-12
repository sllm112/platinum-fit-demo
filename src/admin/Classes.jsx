// حصص اللياقة: حجوزات كل يوم، وتعديل المواعيد.
import { useState } from 'react';
import { dayKey, removeBooking, seatsTaken, toggleAttended, updateSite, useLog, useSite } from '../store.js';
import { dayLabel, time12 } from '../lib.js';
import { Confirm, Pills, Text, Toggle } from './ui.jsx';

const DAY = 86400000;
function nextDays(count) {
  return Array.from({ length: count }, (_, offset) => {
    const date = new Date(Date.now() + offset * DAY);
    return { id: dayKey(date), label: dayLabel(offset, date) };
  });
}

export function Bookings() {
  const { classes } = useSite();
  const { bookings } = useLog();
  const days = nextDays(7);
  const [day, setDay] = useState(days[0].id);

  return (
    <>
      <div className="a-toolbar">
        <Pills label="اليوم" options={days} value={day} onChange={setDay} />
      </div>

      {classes.map((slot) => {
        const list = bookings.filter((b) => b.slotId === slot.id && b.date === day);
        const taken = seatsTaken(bookings, slot.id, day);
        return (
          <section className="a-card" key={slot.id}>
            <div className="a-toolbar">
              <h2>
                {slot.title} · <span className="num">{time12(slot.time)}</span>
              </h2>
              <p>
                <b className="num">
                  {taken} / {slot.capacity}
                </b>{' '}
                <span className="a-muted">مقعد محجوز</span>
              </p>
            </div>
            <div className="a-meter c-meter">
              <div>
                <i style={{ width: `${Math.min(100, (taken / Math.max(slot.capacity, 1)) * 100)}%` }} />
              </div>
            </div>
            {list.length === 0 ? (
              <p className="a-muted">ما أحد سجل في هذا الموعد.</p>
            ) : (
              <ul className="a-list">
                {list.map((b) => (
                  <li key={b.id}>
                    <b>{b.name}</b>
                    <a className="num" href={`tel:${b.phone}`}>
                      {b.phone}
                    </a>
                    <Toggle label="حضر" checked={b.attended} onChange={() => toggleAttended(b.id)} />
                    <Confirm onConfirm={() => removeBooking(b.id)}>إلغاء الحجز</Confirm>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </>
  );
}

export function ClassesEditor() {
  const { classes } = useSite();
  const set = (i, patch) =>
    updateSite(
      'classes',
      classes.map((c, n) => (n === i ? { ...c, ...patch } : c)),
    );
  const add = () =>
    updateSite('classes', [
      ...classes,
      { id: `class-${Date.now()}`, title: 'موعد جديد', time: '21:30', minutes: 60, capacity: 20 },
    ]);

  return (
    <>
      <div className="a-toolbar">
        <p className="a-muted">الوقت والمقاعد اللي تحطها هنا تظهر في الموقع مباشرة.</p>
        <button type="button" className="btn btn-light" onClick={add}>
          أضف موعد
        </button>
      </div>

      {classes.map((c, i) => (
        <section className="a-card" key={c.id}>
          <div className="a-grid">
            <Text label="اسم الموعد" value={c.title} onChange={(v) => set(i, { title: v })} />
            <Text label="الوقت" type="time" value={c.time} onChange={(v) => set(i, { time: v })} ltr />
            <Text
              label="المدة (دقيقة)"
              type="number"
              value={c.minutes}
              onChange={(v) => set(i, { minutes: Math.max(10, v) })}
              ltr
            />
            <Text
              label="عدد المقاعد"
              type="number"
              value={c.capacity}
              onChange={(v) => set(i, { capacity: Math.max(1, v) })}
              ltr
            />
          </div>
          <div className="a-row-actions">
            <Confirm onConfirm={() => updateSite('classes', classes.filter((_, n) => n !== i))}>
              حذف الموعد
            </Confirm>
          </div>
        </section>
      ))}
    </>
  );
}
