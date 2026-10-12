import { useState } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { useSite } from '../store.js';
import Reveal from './Reveal.jsx';

export default function Gallery() {
  const { gallery } = useSite();
  const [index, setIndex] = useState(null);
  const open = index !== null;
  const shot = open ? gallery[index] : null;
  const step = (by) => setIndex((i) => (i + by + gallery.length) % gallery.length);

  return (
    <section className="section gallery on-light" id="gallery">
      <Reveal className="section-head">
        <p className="eyebrow">الصور</p>
        <h2>شوف المكان قبل ما تجي.</h2>
      </Reveal>

      <div className="shots">
        {gallery.map((g, i) => (
          <Reveal as="figure" key={g.src} className="shot" delay={(i % 3) * 80}>
            <button type="button" onClick={() => setIndex(i)} aria-label={`تكبير صورة: ${g.alt}`}>
              <img src={g.src} alt={g.alt} loading="lazy" />
            </button>
            <figcaption>{g.alt}</figcaption>
          </Reveal>
        ))}
      </div>

      <Dialog.Root open={open} onOpenChange={(next) => !next && setIndex(null)}>
        <Dialog.Portal>
          <Dialog.Backdrop className="lightbox-backdrop" />
          <Dialog.Popup
            className="lightbox"
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') step(1);
              if (e.key === 'ArrowRight') step(-1);
            }}
          >
            {shot && (
              <>
                <img src={shot.src} alt={shot.alt} />
                <div className="lightbox-bar">
                  <Dialog.Title className="lightbox-title">
                    {shot.alt}
                    <span className="num">
                      {index + 1} / {gallery.length}
                    </span>
                  </Dialog.Title>
                  <div className="lightbox-nav">
                    <button type="button" className="link-btn" onClick={() => step(-1)}>
                      السابقة
                    </button>
                    <button type="button" className="link-btn" onClick={() => step(1)}>
                      التالية
                    </button>
                    <Dialog.Close className="link-btn">إغلاق</Dialog.Close>
                  </div>
                </div>
              </>
            )}
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
}
