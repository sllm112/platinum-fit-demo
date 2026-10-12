import { useState } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { Field } from '@base-ui/react/field';
import { Form } from '@base-ui/react/form';
import { Toast } from '@base-ui/react/toast';
import { addCode, trackPlanClick, useSite } from '../store.js';
import { giftLabel, monthsLabel, perMonth, phoneError, planMonths, referralCode, validPhone, whatsappLink } from '../lib.js';
import Reveal from './Reveal.jsx';

function Plan({ plan, delay }) {
  const gift = giftLabel(plan);
  return (
    <Reveal as="article" className={plan.featured ? 'plan is-featured' : 'plan'} delay={delay}>
      {plan.note && <p className="plan-note">{plan.note}</p>}
      <h3>{plan.title}</h3>

      <div
        className="plan-bar"
        role="img"
        aria-label={gift ? `${monthsLabel(plan.paid)} مدفوعة و${gift}` : `${monthsLabel(plan.paid)} مدفوعة`}
      >
        {Array.from({ length: plan.paid }, (_, i) => (
          <i key={i} className="is-paid" />
        ))}
        {gift && <i className="is-gift" style={{ flex: Math.max(planMonths(plan) - plan.paid, 0.5) }} />}
      </div>
      <p className="plan-legend">
        <span>{gift ? `${monthsLabel(plan.paid)} تدفعها` : "بدون التزام طويل"}</span>
        {gift && <span>{gift}</span>}
      </p>

      <p className="plan-price">
        <span className="num">{Number(plan.price).toLocaleString('en')}</span> ريال
        {plan.was > plan.price && (
          <s className="plan-was">
            <span className="num">{Number(plan.was).toLocaleString('en')}</span>
          </s>
        )}
      </p>
      <p className="plan-per">
        يعني الشهر بـ <span className="num">{perMonth(plan)}</span> ريال، شامل الضريبة
      </p>

      <a
        className={plan.featured ? 'btn btn-light' : 'btn btn-ghost'}
        href={`#/subscribe/${plan.id}`}
        onClick={() => trackPlanClick(plan.id)}
      >
        اشترك الآن
      </a>
    </Reveal>
  );
}

function ReferralDialog() {
  const { club } = useSite();
  const [code, setCode] = useState('');
  const toast = Toast.useToastManager();

  const share = whatsappLink(
    `تعال تمرّن معي في نادي ${club.name}. عطِ الاستقبال كودي ${code} وقت اشتراكك وتاخذ خصم.\n${club.mapsUrl}`,
  );

  function onSubmit(event) {
    event.preventDefault();
    const digits = validPhone(new FormData(event.currentTarget).get('phone'));
    if (!digits) return;
    const next = referralCode(digits);
    addCode(digits, next);
    setCode(next);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      toast.add({ title: 'انتسخ الكود', description: code });
    } catch {
      toast.add({ title: 'ما قدرنا ننسخ', description: 'انسخ الكود يدوياً من الشاشة.' });
    }
  }

  return (
    <Dialog.Root onOpenChange={(open) => !open && setCode('')}>
      <Dialog.Trigger className="btn btn-light">طلّع كودي</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="modal-backdrop" />
        <Dialog.Popup className="modal on-light">
          <Dialog.Title className="modal-title">جيب صاحبك</Dialog.Title>
          <Dialog.Description className="modal-text">
            اكتب رقم جوالك المسجل في النادي ونطلع لك كودك. الخصم لك ولصاحبك.
          </Dialog.Description>

          {code ? (
            <div className="ticket">
              <p className="ticket-label">كودك</p>
              <p className="ticket-code num">{code}</p>
              <div className="actions">
                <button type="button" className="btn btn-light" onClick={copy}>
                  انسخ الكود
                </button>
                <a className="btn btn-ghost" href={share} target="_blank" rel="noopener">
                  أرسله واتساب
                </a>
              </div>
            </div>
          ) : (
            <Form className="form" onSubmit={onSubmit}>
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
              <button type="submit" className="btn btn-light">
                طلّع كودي
              </button>
            </Form>
          )}

          <Dialog.Close className="link-btn modal-close">إغلاق</Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default function Plans() {
  const { plans, referral } = useSite();

  return (
    <section className="section plans on-light" id="plans">
      <Reveal className="section-head">
        <p className="eyebrow">الاشتراكات</p>
        <h2>اختر مدتك، والسعر سعر العرض.</h2>
        <p className="lede">تقدر تقسّم أي اشتراك على 4 دفعات عبر تمارا، بدون رسوم تأخير.</p>
      </Reveal>

      <div className="plan-grid">
        {plans.map((plan, i) => (
          <Plan key={plan.id} plan={plan} delay={i * 100} />
        ))}
      </div>

      <Reveal className="referral">
        <div>
          <h3>
            جيب صاحبك، والخصم لكم اثنينكم
            {referral.discount ? ` (${referral.discount})` : ''}.
          </h3>
          <ol>
            {referral.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
        <ReferralDialog />
      </Reveal>
    </section>
  );
}
