import { useEffect, useRef, useState } from 'react';
import { getSite } from './store.js';

export function validPhone(value) {
  const digits = String(value || '').replace(/[^\d]/g, '');
  return /^05\d{8}$/.test(digits) ? digits : null;
}

export const phoneError = 'الرقم لازم يبدأ بـ 05 ويكون 10 أرقام.';

export function whatsappLink(text) {
  const { whatsapp } = getSite().club;
  const base = whatsapp ? `https://wa.me/${whatsapp}` : 'https://wa.me/';
  return `${base}?text=${encodeURIComponent(text)}`;
}

// كود ثابت لكل رقم جوال: نفس الرقم يعطي نفس الكود دائماً.
export function referralCode(digits) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let hash = 2166136261;
  for (let i = 0; i < digits.length; i++) {
    hash ^= digits.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += alphabet[hash % alphabet.length];
    hash = Math.floor(hash / alphabet.length);
  }
  return `${getSite().referral.prefix}-${code}`;
}

export function monthsLabel(n) {
  if (n === 1) return 'شهر';
  if (n === 2) return 'شهرين';
  return n <= 10 ? `${n} شهور` : `${n} شهر`;
}

// وصف الهدية في الباقة: أيام مجانية أو شهور هدية.
export function giftLabel(plan) {
  if (plan.giftDays) return `${plan.giftDays} يوم مجاني`;
  if (plan.gift) return `${monthsLabel(plan.gift)} هدية`;
  return '';
}
// مدة الباقة كاملة بالشهور (الأيام المجانية محسوبة كجزء من شهر).
export const planMonths = (plan) => plan.paid + (plan.gift || 0) + (plan.giftDays || 0) / 30;
export const perMonth = (plan) => Math.round(plan.price / Math.max(planMonths(plan), 1));

// أسود أو أبيض، أيهما أوضح فوق اللون المعطى.
export function readableOn(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
  if (!m) return '#111112';
  const n = parseInt(m[1], 16);
  const lin = (c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const lum = 0.2126 * lin(n >> 16) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
  return lum > 0.4 ? '#111112' : '#ffffff';
}

function dayPart(h) {
  if (h < 4) return 'آخر الليل';
  if (h < 6) return 'الفجر';
  if (h < 12) return 'الصبح';
  if (h < 15) return 'الظهر';
  if (h < 18) return 'العصر';
  if (h < 20) return 'المغرب';
  return 'الليل';
}

function readClock() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: getSite().club.timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date());
  const hour = Number(parts.find((p) => p.type === 'hour').value) % 24;
  const minute = parts.find((p) => p.type === 'minute').value;
  return { hour, time: `${hour % 12 || 12}:${minute}`, part: dayPart(hour) };
}

// الساعة الحالية بتوقيت النادي، تتحدث كل نصف دقيقة.
export function useClubClock() {
  const [clock, setClock] = useState(readClock);
  useEffect(() => {
    const id = setInterval(() => setClock(readClock()), 30000);
    return () => clearInterval(id);
  }, []);
  return clock;
}

// يضيف is-in على العنصر أول ما يدخل الشاشة.
export function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (!('IntersectionObserver' in window)) {
      el.classList.add('is-in');
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-in');
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}
