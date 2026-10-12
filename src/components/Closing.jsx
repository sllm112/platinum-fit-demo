import { useEffect, useState } from 'react';
import { nav } from '../data/club.js';
import { useSite } from '../store.js';
import { whatsappLink } from '../lib.js';
import Reveal from './Reveal.jsx';

// شريط ثابت أسفل شاشة الجوال: الاشتراك وواتساب دايم تحت الإبهام.
function MobileBar() {
  const { club } = useSite();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className={`mobile-bar ${show ? 'is-on' : ''}`}>
      <a className="btn btn-light" href="#plans">
        اشترك الآن
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
  );
}

export default function Closing() {
  const { club } = useSite();

  return (
    <>
      <section className="closing">
        <Reveal className="closing-inner">
          <h2>الباب مفتوح 24 ساعة. الباقي عليك.</h2>
          <div className="actions">
            <a className="btn btn-dark" href="#plans">
              اشترك الآن
            </a>
            <a className="btn btn-outline" href="#contact">
              احجز حصة تجريبية
            </a>
          </div>
        </Reveal>
      </section>

      <footer className="footer">
        <div className="footer-top">
          <img src="logo.png" alt={club.nameLatin} loading="lazy" />
          <nav aria-label="روابط التذييل">
            {nav.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="footer-bottom">
          <p>
            نادي {club.name} الرياضي · {club.address} · {club.hours}
            <br />
            نموذج تجريبي للعرض، وليس الموقع الرسمي للنادي بعد.
          </p>
          <p>
            <a href={club.instagram.url} target="_blank" rel="noopener">
              إنستقرام
            </a>
            <a href={club.mapsUrl} target="_blank" rel="noopener">
              الخرائط
            </a>
            <a href="#/admin">لوحة المالك</a>
          </p>
        </div>
      </footer>

      <MobileBar />
    </>
  );
}
