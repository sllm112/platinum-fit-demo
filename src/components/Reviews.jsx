import { useSite } from '../store.js';
import Reveal from './Reveal.jsx';

export default function Reviews() {
  const { club, reviews } = useSite();

  return (
    <section className="section reviews on-light" id="reviews">
      <Reveal className="section-head">
        <p className="eyebrow">آراء الأعضاء</p>
        <h2>الكلام لأعضاء النادي.</h2>
      </Reveal>

      {reviews.length > 0 ? (
        <ul className="quotes">
          {reviews.map((r, i) => (
            <Reveal as="li" key={`${r.name}-${i}`} delay={i * 100}>
              <blockquote>{r.text}</blockquote>
              <cite>{r.name}</cite>
            </Reveal>
          ))}
        </ul>
      ) : (
        <Reveal className="reviews-empty">
          <p className="lede">
            ما نكتب آراء من عندنا. تقييمات أعضائنا موجودة على خرائط قوقل، ورأيك يهمنا.
          </p>
          <div className="actions">
            <a className="btn btn-light" href={club.mapsUrl} target="_blank" rel="noopener">
              اقرأ التقييمات على قوقل
            </a>
            <a className="btn btn-ghost" href={club.mapsUrl} target="_blank" rel="noopener">
              اكتب رأيك
            </a>
          </div>
        </Reveal>
      )}
    </section>
  );
}
