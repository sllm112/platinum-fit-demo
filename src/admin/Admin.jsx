import { useEffect, useState } from 'react';
import { Tabs } from '@base-ui/react/tabs';
import { clearLog, resetSite, useLog, useSite } from '../store.js';
import { Confirm } from './ui.jsx';
import Overview from './Overview.jsx';
import { Codes, Leads, Subs } from './Lists.jsx';
import Invoices from './Invoices.jsx';
import { ClubEditor, ContentEditor, PlansEditor } from './Editors.jsx';

const groups = [
  {
    label: 'المتابعة',
    items: [
      { id: 'overview', label: 'نظرة عامة', view: Overview },
      { id: 'subs', label: 'طلبات الاشتراك', view: Subs },
      { id: 'invoices', label: 'الفواتير', view: Invoices },
      { id: 'leads', label: 'طلبات التواصل', view: Leads },
      { id: 'codes', label: 'أكواد الإحالة', view: Codes },
    ],
  },
  {
    label: 'التعديل',
    items: [
      { id: 'plans', label: 'الاشتراكات', view: PlansEditor },
      { id: 'club', label: 'بيانات النادي', view: ClubEditor },
      { id: 'content', label: 'المحتوى', view: ContentEditor },
    ],
  },
];
const sections = groups.flatMap((g) => g.items);

export default function Admin() {
  const { club } = useSite();
  const { leads, invoices, subs } = useLog();
  // الرابط #/admin/invoices يفتح القسم مباشرة.
  const [tab, setTab] = useState(() => {
    const wanted = window.location.hash.split('/')[2];
    return sections.some((s) => s.id === wanted) ? wanted : 'overview';
  });
  const badges = {
    subs: subs.filter((s) => s.status === 'new').length,
    invoices: invoices.filter((i) => i.status === 'due').length,
    leads: leads.filter((l) => !l.done).length,
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [tab]);

  return (
    <Tabs.Root className="admin on-light is-tint" value={tab} onValueChange={setTab} orientation="vertical">
      <aside className="a-side">
        <a className="a-brand" href="#top" aria-label={`نادي ${club.name}، عرض الموقع`}>
          <img src="logo.png" alt={club.nameLatin} />
        </a>

        <Tabs.List className="a-nav" aria-label="أقسام لوحة المالك">
          {groups.map((group) => (
            <div className="a-nav-group" key={group.label} role="presentation">
              <p className="a-nav-label" role="presentation">
                {group.label}
              </p>
              {group.items.map((s) => (
                <Tabs.Tab key={s.id} value={s.id} className="a-nav-item">
                  {s.label}
                  {badges[s.id] > 0 && <b className="a-badge num">{badges[s.id]}</b>}
                </Tabs.Tab>
              ))}
            </div>
          ))}
        </Tabs.List>

        <a className="a-side-link" href="#top">
          عرض الموقع
        </a>
      </aside>

      <main className="a-main">
        <header className="a-top">
          <div>
            <p className="a-muted">لوحة المالك · نادي {club.name}</p>
            <h1>{sections.find((s) => s.id === tab)?.label}</h1>
          </div>
        </header>

        <p className="a-banner">
          نسخة عرض: التعديلات والطلبات محفوظة على هذا الجهاز فقط. عند النشر تنتقل لقاعدة بيانات ويصير
          الدخول بحساب المالك.
        </p>

        {sections.map((s) => (
          <Tabs.Panel key={s.id} value={s.id} className="a-panel">
            <s.view go={setTab} />
          </Tabs.Panel>
        ))}

        <footer className="a-foot">
          <p className="a-muted">كل تعديل ينحفظ تلقائياً ويظهر في الموقع مباشرة.</p>
          <div className="a-row-actions">
            <Confirm onConfirm={resetSite}>استرجع المحتوى الأصلي</Confirm>
            <Confirm onConfirm={clearLog}>امسح سجل النشاط</Confirm>
          </div>
        </footer>
      </main>
    </Tabs.Root>
  );
}
