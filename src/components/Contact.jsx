import { useState } from 'react';
import { Field } from '@base-ui/react/field';
import { Form } from '@base-ui/react/form';
import { Radio } from '@base-ui/react/radio';
import { RadioGroup } from '@base-ui/react/radio-group';
import { addLead, useSite } from '../store.js';
import { phoneError, validPhone, whatsappLink } from '../lib.js';
import Reveal from './Reveal.jsx';

const reasons = ['حصة تجريبية', 'اشتراك جديد', 'حجز ملعب الكورة', 'استفسار'];

export default function Contact() {
  const { club } = useSite();
  const [sent, setSent] = useState(null);

  function onSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get('name') || '').trim();
    const phone = validPhone(data.get('phone'));
    if (name.length < 2 || !phone) return;

    const reason = String(data.get('reason'));
    const note = String(data.get('note') || '').trim();
    addLead({ name, phone, reason, note });

    const lines = [
      `السلام عليكم، أنا ${name}.`,
      `أبي: ${reason}.`,
      `جوالي: ${phone}`,
      note && `ملاحظة: ${note}`,
    ].filter(Boolean);
    setSent({ name: name.split(' ')[0], link: whatsappLink(lines.join('\n')) });
  }

  return (
    <section className="section contact on-light is-tint" id="contact">
      <div className="contact-grid">
        <Reveal className="contact-info">
          <p className="eyebrow">تواصل</p>
          <h2>تعال جرّب، أو اسألنا.</h2>
          <dl className="info">
            <div>
              <dt>العنوان</dt>
              <dd>{club.address}</dd>
            </div>
            <div>
              <dt>الدوام</dt>
              <dd>{club.hours}</dd>
            </div>
            <div>
              <dt>الجوال</dt>
              <dd>
                <a className="num" href={`tel:${club.phone}`}>
                  {club.phone}
                </a>
              </dd>
            </div>
            {club.spaPhone && (
              <div>
                <dt>السبا</dt>
                <dd>
                  <a className="num" href={`tel:${club.spaPhone}`}>
                    {club.spaPhone}
                  </a>
                </dd>
              </div>
            )}
            <div>
              <dt>إنستقرام</dt>
              <dd>
                <a className="num" href={club.instagram.url} target="_blank" rel="noopener">
                  {club.instagram.handle}
                </a>
              </dd>
            </div>
          </dl>
          <div className="actions">
            <a className="btn btn-light" href={club.mapsUrl} target="_blank" rel="noopener">
              افتح الموقع في الخرائط
            </a>
            <a
              className="btn btn-ghost"
              href={whatsappLink(`السلام عليكم، عندي استفسار عن نادي ${club.name}.`)}
              target="_blank"
              rel="noopener"
            >
              واتساب
            </a>
          </div>
        </Reveal>

        <Reveal className="contact-form" delay={120}>
          {sent ? (
            <div className="sent" role="status">
              <h3>وصلنا طلبك يا {sent.name}.</h3>
              <p className="lede">نتواصل معك قريب. ولو تبي رد أسرع، أرسل لنا نفس الطلب واتساب.</p>
              <div className="actions">
                <a className="btn btn-light" href={sent.link} target="_blank" rel="noopener">
                  أرسلها واتساب
                </a>
                <button type="button" className="btn btn-ghost" onClick={() => setSent(null)}>
                  طلب جديد
                </button>
              </div>
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
                  اكتب اسمك عشان نعرف نناديك.
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

              <Field.Root name="reason">
                <Field.Label className="label" id="reason-label">
                  وش تبي؟
                </Field.Label>
                <RadioGroup
                  name="reason"
                  defaultValue={reasons[0]}
                  className="choices"
                  aria-labelledby="reason-label"
                >
                  {reasons.map((reason) => (
                    <label key={reason} className="choice">
                      <Radio.Root value={reason} className="choice-radio" />
                      <span>{reason}</span>
                    </label>
                  ))}
                </RadioGroup>
              </Field.Root>

              <Field.Root name="note">
                <Field.Label className="label">ملاحظة (اختياري)</Field.Label>
                <Field.Control className="input is-area" render={<textarea rows={3} />} />
              </Field.Root>

              <button type="submit" className="btn btn-light">
                أرسل الطلب
              </button>
            </Form>
          )}
        </Reveal>
      </div>
    </section>
  );
}
