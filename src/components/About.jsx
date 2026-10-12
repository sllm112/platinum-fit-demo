import { useSite } from '../store.js';
import { useClubClock } from '../lib.js';
import Reveal from './Reveal.jsx';

export default function About() {
  const { features } = useSite();
  const clock = useClubClock();

  return (
    <section className="section about on-light is-tint" id="about">
      <div className="about-grid">
        <Reveal className="about-photo">
          <img src="media/about.jpg" alt="صالة الحديد في النادي" loading="lazy" />
        </Reveal>

        <Reveal className="about-copy" delay={120}>
          <p className="eyebrow">النادي</p>
          <h2>نادي واحد، وكل رياضتك فيه.</h2>
          <p className="lede">
            بلاتينيوم فيت بوابتك نحو القوة والتغيير. ارفع حديد، اسبح، العب كورة مع ربعك، أو اجرِ
            على المضمار. كلها تحت سقف واحد، وفي أي ساعة تناسبك.
          </p>
        </Reveal>
      </div>

      <ul className="features">
        {features.map((f, i) => (
          <Reveal as="li" key={f.title} delay={i * 80}>
            <h3>{f.title}</h3>
            <p>{f.text}</p>
          </Reveal>
        ))}
      </ul>

      <Reveal className="day">
        <div className="day-hours" aria-hidden="true">
          {Array.from({ length: 24 }, (_, h) => (
            <i key={h} className={h === clock.hour ? 'is-now' : ''} />
          ))}
        </div>
        <p className="day-line">
          الساعة الآن في الرس{' '}
          <b>
            <span className="num">{clock.time}</span> {clock.part}
          </b>
          ، والنادي فاتح.
        </p>
      </Reveal>
    </section>
  );
}
