import { useEffect, useState } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { nav } from '../data/club.js';
import { useSite } from '../store.js';

export default function Header() {
  const { club } = useSite();
  const [stuck, setStuck] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`bar ${stuck ? 'is-stuck' : ''}`}>
      <a className="bar-logo" href="#top" aria-label={`نادي ${club.name}، أعلى الصفحة`}>
        <img src="logo.png" alt={club.nameLatin} />
      </a>

      <nav className="bar-nav" aria-label="التنقل الرئيسي">
        {nav.map((item) => (
          <a key={item.href} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>

      <div className="bar-actions">
        <a className="btn btn-light btn-small" href="#plans">
          اشترك
        </a>

        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger className="menu-btn" aria-label="القائمة">
            <span />
            <span />
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Backdrop className="sheet-backdrop" />
            <Dialog.Popup className="sheet">
              <div className="sheet-head">
                <Dialog.Title className="sheet-title">القائمة</Dialog.Title>
                <Dialog.Close className="link-btn">إغلاق</Dialog.Close>
              </div>
              <nav className="sheet-nav" aria-label="قائمة الجوال">
                {nav.map((item) => (
                  <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
                    {item.label}
                  </a>
                ))}
              </nav>
              <p className="sheet-foot">
                {club.hours} · {club.city}
              </p>
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

    </header>
  );
}
