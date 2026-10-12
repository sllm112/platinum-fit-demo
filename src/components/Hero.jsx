import { useEffect, useState } from 'react';
import { useSite } from '../store.js';
import { useClubClock } from '../lib.js';

const SLIDE_MS = 6000;

// واجهة بعرض الشاشة كاملة: خلفية تتنقل بين مرافق النادي، والعنوان فوق تعتيم ثابت يضمن وضوحه.
export default function Hero() {
  const { club, hero, programs } = useSite();
  const clock = useClubClock();
  const [index, setIndex] = useState(0);
  const count = programs.length;

  // التنقل التلقائي يعيد العدّ بعد كل تغيير، ويتوقف لمن يفضّل تقليل الحركة.
  useEffect(() => {
    if (count < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const id = setTimeout(() => setIndex((i) => (i + 1) % count), SLIDE_MS);
    return () => clearTimeout(id);
  }, [index, count]);

  const ticker = [club.hours, ...programs.map((p) => p.title), club.city];

  return (
    <section className="hero" id="top">
      <div className="hero-stage">
        <div className="hero-layers" aria-hidden="true">
          {programs.map((p, i) => (
            <div key={p.id} className={i === index ? 'hero-layer is-on' : 'hero-layer'}>
              {i === 0 ? (
                <video src="media/hero.mp4" poster="media/hero-poster.jpg" autoPlay muted loop playsInline />
              ) : (
                <img src={p.image} alt="" loading="lazy" />
              )}
            </div>
          ))}
        </div>
        <div className="hero-scrim" aria-hidden="true" />

        <div className="hero-body">
          <p className="status">
            <i aria-hidden="true" />
            مفتوح الآن · <span className="num">{clock.time}</span> {clock.part}
          </p>
          <h1>
            <span>{hero.lineOne}</span> <span>{hero.lineTwo}</span>
          </h1>
          <p className="hero-lede">{hero.lede}</p>
          <div className="actions">
            <a className="btn btn-light" href="#plans">
              اشترك الآن
            </a>
            <a className="btn btn-ghost" href="#contact">
              احجز حصة تجريبية
            </a>
          </div>
        </div>

        <div className="hero-switch" role="group" aria-label="مرافق النادي">
          {programs.map((p, i) => (
            <button
              type="button"
              key={p.id}
              className={i === index ? 'is-on' : ''}
              aria-pressed={i === index}
              onClick={() => setIndex(i)}
            >
              <b className="num">{String(i + 1).padStart(2, '0')}</b>
              <span>{p.title}</span>
              <i style={{ animationDuration: `${SLIDE_MS}ms` }} />
            </button>
          ))}
        </div>
      </div>

      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          {[0, 1, 2, 3].map((copy) => (
            <p key={copy}>
              {ticker.map((word) => (
                <span key={word}>{word}</span>
              ))}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
