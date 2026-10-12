import { useEffect, useState } from 'react';
import { DirectionProvider } from '@base-ui/react/direction-provider';
import { Toast } from '@base-ui/react/toast';
import { trackVisit, useSite } from './store.js';
import { readableOn } from './lib.js';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import About from './components/About.jsx';
import Programs from './components/Programs.jsx';
import Gallery from './components/Gallery.jsx';
import Plans from './components/Plans.jsx';
import Reviews from './components/Reviews.jsx';
import Contact from './components/Contact.jsx';
import Closing from './components/Closing.jsx';
import Subscribe from './components/Subscribe.jsx';
import Admin from './admin/Admin.jsx';

function Toasts() {
  const { toasts } = Toast.useToastManager();
  return (
    <Toast.Portal>
      <Toast.Viewport className="toasts">
        {toasts.map((toast) => (
          <Toast.Root key={toast.id} toast={toast} className="toast">
            <Toast.Title className="toast-title" />
            <Toast.Description className="toast-text" />
          </Toast.Root>
        ))}
      </Toast.Viewport>
    </Toast.Portal>
  );
}

function currentRoute() {
  const { hash } = window.location;
  if (hash.startsWith('#/admin')) return 'admin';
  if (hash.startsWith('#/subscribe')) return 'subscribe';
  return 'site';
}

// لون قريب من الرمادي: الأزرار الأساسية تحتاج معالجة مختلفة على الخلفية الفاتحة.
function isGrey(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
  if (!m) return false;
  const n = parseInt(m[1], 16);
  const channels = [n >> 16, (n >> 8) & 255, n & 255];
  const max = Math.max(...channels);
  return max === 0 || (max - Math.min(...channels)) / max < 0.12;
}

function Site() {
  useEffect(trackVisit, []);
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Plans />
        <About />
        <Programs />
        <Gallery />
        <Reviews />
        <Contact />
      </main>
      <Closing />
    </>
  );
}

export default function App() {
  const { theme } = useSite();
  const [route, setRoute] = useState(currentRoute);

  useEffect(() => {
    const onHash = () => setRoute(currentRoute());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // عند الرجوع من صفحة داخلية إلى قسم في الموقع، ننزل للقسم بعد ما ينرسم.
  useEffect(() => {
    if (route !== 'site') {
      window.scrollTo(0, 0);
      return;
    }
    const target = document.getElementById(window.location.hash.slice(1));
    if (target) target.scrollIntoView();
  }, [route]);

  // اللون المميز يأتي من إعدادات المالك.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--on-accent', readableOn(theme.accent));
    root.toggleAttribute('data-mono', isGrey(theme.accent));
  }, [theme.accent]);

  return (
    <DirectionProvider direction="rtl">
      <Toast.Provider timeout={3000}>
        {route === 'admin' && <Admin />}
        {route === 'subscribe' && <Subscribe />}
        {route === 'site' && <Site />}
        <Toasts />
      </Toast.Provider>
    </DirectionProvider>
  );
}
