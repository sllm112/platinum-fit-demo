import { Tabs } from '@base-ui/react/tabs';
import { useSite } from '../store.js';
import Reveal from './Reveal.jsx';

export default function Programs() {
  const { programs } = useSite();

  return (
    <section className="section programs on-light" id="programs">
      <Reveal className="section-head">
        <p className="eyebrow">المرافق</p>
        <h2>أربع ساحات، واشتراك واحد.</h2>
      </Reveal>

      <Reveal>
        <Tabs.Root defaultValue={programs[0]?.id} className="tabs">
          <Tabs.List className="tabs-list" aria-label="مرافق النادي">
            {programs.map((p) => (
              <Tabs.Tab key={p.id} value={p.id} className="tab">
                {p.title}
              </Tabs.Tab>
            ))}
          </Tabs.List>

          {programs.map((p) => (
            <Tabs.Panel key={p.id} value={p.id} className="program">
              <div className="program-photo">
                <img src={p.image} alt="" loading="lazy" style={{ objectPosition: p.focus }} />
              </div>
              <div className="program-copy">
                <h3>{p.title}</h3>
                <p className="lede">{p.text}</p>
                <ul className="ticks">
                  {p.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
                <a className="btn btn-ghost" href="#contact">
                  {p.cta || 'احجز حصة تجريبية'}
                </a>
              </div>
            </Tabs.Panel>
          ))}
        </Tabs.Root>
      </Reveal>
    </section>
  );
}
