import { useState } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { Field } from '@base-ui/react/field';
import { Form } from '@base-ui/react/form';
import { addBooking, dayKey, seatsTaken, useLog, useSite } from '../store.js';
import { dayLabel, phoneError, time12, validPhone } from '../lib.js';
import Reveal from './Reveal.jsx';

const DAY = 86400000;

// هل فات وقت الموعد اليوم؟ بتوقيت النادي.
function passedToday(time, timeZone) {
  const now = new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', hour12: false })
    .format(new Date())
    .replace(/^24/, '00');
  return now >= time;
}

export default function Classes() {
  const { classes, club } = useSite();
  const { bookings } = useLog();
  const days = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(Date.now() + offset * DAY);
    return { id: dayKey(date), label: dayLabel(offset, date), offset };
  });
  const [day, setDay] = useState(days[0].id);
  const [slotId, setSlotId] = useState(null);
  const [result, setResult] = useState(null);

  const today = day === days[0].id;
  const slot = classes.find((c) => c.id === slotId);
  const dayName = days.find((d) => d.id === day)?.label;

  function onSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get('name') || '').trim();
    const phone = validPhone(data.get('phone'));
    if (name.length < 2 || !phone) return;
    setResult(addBooking({ slotId, date: day, name, phone }));
  }
  function close() {
    setSlotId(null);
    setResult(null);
  }

  if (classes.length === 0) return null;

  return (
    <section className="section classes on-light is-tint" id="classes">
      <Reveal className="section-head">
        <p className="eyebrow">مواعيد برامج اللياقة</p>
        <h2>أربع مواعيد كل يوم. اختر وقتك وسجّل.</h2>
        <p className="lede">المقاعد محدودة، والتسجيل ياخذ نص دقيقة.</p>
      </Reveal>

      <div className="day-pills" role="radiogroup" aria-label="اليوم">
        {days.map((d) => (
          <button
            type="button"
            key={d.id}
            role="radio"
            aria-checked={day === d.id}
            className={day === d.id ? 'is-on' : ''}
            onClick={() => setDay(d.id)}
          >
            {d.label}
          </button>
        ))}
      </div>

      <ul className="slots">
        {classes.map((c, i) => {
          const left = c.capacity - seatsTaken(bookings, c.id, day);
          const passed = today && passedToday(c.time, club.timeZone);
          const closed = passed || left <= 0;
          return (
            <Reveal as="li" key={c.id} className="slot" delay={i * 80}>
              <h3>{c.title}</h3>
              <p className="slot-time num">{time12(c.time)}</p>
              <p className="slot-meta">
                <span className="num">{c.minutes}</span> دقيقة ·{' '}
                {left > 0 ? (
                  <>
                    باقي <span className="num">{left}</span> من <span className="num">{c.capacity}</span> مقعد
                  </>
                ) : (
                  'المقاعد اكتملت'
                )}
              </p>
              <button
                type="button"
                className="btn btn-light"
                disabled={closed}
                onClick={() => setSlotId(c.id)}
              >
                {passed ? 'فات موعد اليوم' : left <= 0 ? 'اكتمل' : 'سجّل'}
              </button>
            </Reveal>
          );
        })}
      </ul>

      <Dialog.Root open={Boolean(slot)} onOpenChange={(open) => !open && close()}>
        <Dialog.Portal>
          <Dialog.Backdrop className="modal-backdrop" />
          <Dialog.Popup className="modal on-light">
            {slot && (
              <>
                <Dialog.Title className="modal-title">{slot.title}</Dialog.Title>
                <Dialog.Description className="modal-text">
                  {dayName}، الساعة <span className="num">{time12(slot.time)}</span>
                </Dialog.Description>

                {result === 'ok' ? (
                  <div className="sent" role="status">
                    <h3>تم تسجيلك.</h3>
                    <p className="lede">تعال قبل الموعد بعشر دقايق، ومكانك محجوز.</p>
                  </div>
                ) : (
                  <Form className="form" onSubmit={onSubmit}>
                    <Field.Root
                      name="name"
                      validate={(v) => (!v || String(v).trim().length > 1 ? null : 'الاسم قصير، اكتبه كامل.')}
                    >
                      <Field.Label className="label">الاسم</Field.Label>
                      <Field.Control className="input" autoComplete="name" required />
                      <Field.Error className="error" match="valueMissing">
                        اكتب اسمك.
                      </Field.Error>
                      <Field.Error className="error" match="customError" />
                    </Field.Root>

                    <Field.Root name="phone" validate={(v) => (!v || validPhone(v) ? null : phoneError)}>
                      <Field.Label className="label">رقم الجوال</Field.Label>
                      <Field.Control
                        className="input is-ltr"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        placeholder="05XXXXXXXX"
                        required
                      />
                      <Field.Error className="error" match="valueMissing">
                        اكتب رقم جوالك.
                      </Field.Error>
                      <Field.Error className="error" match="customError" />
                    </Field.Root>

                    {result === 'dup' && (
                      <p className="error" role="alert">
                        هذا الرقم مسجل في نفس الموعد من قبل.
                      </p>
                    )}
                    {result === 'full' && (
                      <p className="error" role="alert">
                        المقاعد اكتملت قبل شوي. جرب موعد ثاني.
                      </p>
                    )}

                    <button type="submit" className="btn btn-light">
                      أكّد التسجيل
                    </button>
                  </Form>
                )}

                <Dialog.Close className="link-btn modal-close">إغلاق</Dialog.Close>
              </>
            )}
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
}
