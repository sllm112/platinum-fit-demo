// عناصر صغيرة مشتركة بين صفحات لوحة المالك.
import { useEffect, useState } from 'react';
import { Field } from '@base-ui/react/field';
import { Switch } from '@base-ui/react/switch';

export const money = (n) => Number(n || 0).toLocaleString('en');

export const when = (iso) =>
  new Date(iso).toLocaleString('ar-SA-u-nu-latn-ca-gregory', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

export const waLink = (phone) => `https://wa.me/966${String(phone).slice(1)}`;

export function Text({ label, value, onChange, ltr, area, type = 'text', hint, placeholder }) {
  return (
    <Field.Root className="a-field">
      <Field.Label className="label">{label}</Field.Label>
      <Field.Control
        className={`input ${ltr ? 'is-ltr' : ''} ${area ? 'is-area' : ''}`}
        type={type}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
        render={area ? <textarea rows={3} /> : undefined}
      />
      {hint && <Field.Description className="a-hint">{hint}</Field.Description>}
    </Field.Root>
  );
}

export function Toggle({ label, checked, onChange }) {
  return (
    <label className="a-toggle">
      <Switch.Root className="switch" checked={checked} onCheckedChange={onChange}>
        <Switch.Thumb className="switch-thumb" />
      </Switch.Root>
      <span>{label}</span>
    </label>
  );
}

// اختيار واحد من عدة خيارات على شكل كبسولات.
export function Pills({ label, options, value, onChange }) {
  return (
    <div className="a-pills" role="radiogroup" aria-label={label}>
      {options.map((option) => (
        <button
          type="button"
          key={option.id}
          role="radio"
          aria-checked={value === option.id}
          className={value === option.id ? 'is-on' : ''}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

// زر الحذف يطلب ضغطة ثانية خلال ثلاث ثوانٍ.
export function Confirm({ children, onConfirm }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return undefined;
    const id = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(id);
  }, [armed]);
  return (
    <button
      type="button"
      className="a-danger"
      onClick={() => {
        if (armed) onConfirm();
        setArmed(!armed);
      }}
    >
      {armed ? 'اضغط مرة ثانية للتأكيد' : children}
    </button>
  );
}

export function Empty({ children }) {
  return <p className="a-empty">{children}</p>;
}
