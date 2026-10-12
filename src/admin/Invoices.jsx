// الفواتير: تصدر تلقائياً عند تفعيل الاشتراك، أو يدوياً من هنا.
import { useState } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import qrcode from 'qrcode-generator';
import { addInvoice, invoiceNo, invoiceTotals, setInvoiceStatus, useLog, useSite } from '../store.js';
import { validPhone } from '../lib.js';
import { Empty, money, Pills, Text, Toggle, when } from './ui.jsx';

const statuses = [
  { id: 'paid', label: 'مدفوعة' },
  { id: 'due', label: 'غير مدفوعة' },
  { id: 'void', label: 'ملغاة' },
];
const filters = [{ id: 'all', label: 'الكل' }, ...statuses];
const statusLabel = Object.fromEntries(statuses.map((s) => [s.id, s.label]));
const sar = (n) => Number(n).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// رمز QR بصيغة هيئة الزكاة للفاتورة المبسطة: خمسة حقول TLV ثم Base64.
// (اسم البائع، الرقم الضريبي، وقت الإصدار، الإجمالي، الضريبة)
function zatcaQr(club, invoice, totals) {
  const encoder = new TextEncoder();
  const fields = [club.legalName, club.vat, invoice.at, totals.total.toFixed(2), totals.vat.toFixed(2)];
  const bytes = [];
  fields.forEach((value, i) => {
    const data = encoder.encode(String(value));
    bytes.push(i + 1, data.length, ...data);
  });
  const qr = qrcode(0, 'M');
  qr.addData(btoa(String.fromCharCode(...bytes)));
  qr.make();
  return qr.createDataURL(4, 0);
}

function Sheet({ invoice }) {
  const { club } = useSite();
  const totals = invoiceTotals(invoice);

  return (
    <article className="inv-sheet">
      <header className="inv-head">
        <img src="logo.png" alt={club.nameLatin} />
        <div>
          <h2>فاتورة ضريبية مبسطة</h2>
          <p className="num">{invoiceNo(invoice)}</p>
        </div>
      </header>

      <p className="inv-demo">فاتورة تجريبية لعرض الآلية، غير صالحة ضريبياً.</p>
      {invoice.status === 'void' && <p className="inv-void">ملغاة</p>}

      <dl className="inv-meta">
        <div>
          <dt>البائع</dt>
          <dd>{club.legalName}</dd>
          <dd>{club.address}</dd>
          <dd>
            السجل التجاري: <span className="num">{club.cr}</span>
          </dd>
          <dd>
            الرقم الضريبي: <span className="num">{club.vat}</span>
          </dd>
        </div>
        <div>
          <dt>العميل</dt>
          <dd>{invoice.name}</dd>
          <dd className="num">{invoice.phone}</dd>
          <dt>التاريخ</dt>
          <dd>{when(invoice.at)}</dd>
          <dt>الحالة</dt>
          <dd>
            {statusLabel[invoice.status]}
            {invoice.status === 'paid' && (invoice.pay === 'online' ? '، أونلاين' : '، في النادي')}
          </dd>
        </div>
      </dl>

      <table className="inv-table">
        <thead>
          <tr>
            <th>البيان</th>
            <th>الكمية</th>
            <th>السعر شامل الضريبة</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item) => (
            <tr key={item.name}>
              <td>{item.name}</td>
              <td className="num">{item.qty}</td>
              <td className="num">{sar(item.qty * item.price)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="inv-foot">
        <img className="inv-qr" src={zatcaQr(club, invoice, totals)} alt="رمز QR للفاتورة" />
        <dl className="inv-totals">
          <div>
            <dt>الإجمالي بدون الضريبة</dt>
            <dd className="num">{sar(totals.net)}</dd>
          </div>
          <div>
            <dt>ضريبة القيمة المضافة 15%</dt>
            <dd className="num">{sar(totals.vat)}</dd>
          </div>
          <div className="is-total">
            <dt>الإجمالي (ريال)</dt>
            <dd className="num">{sar(totals.total)}</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}

function NewInvoice() {
  const [open, setOpen] = useState(false);
  const blank = { name: '', phone: '', item: '', price: 0, paid: true };
  const [draft, setDraft] = useState(blank);
  const set = (patch) => setDraft({ ...draft, ...patch });
  const phone = validPhone(draft.phone);
  const ready = draft.name.trim().length > 1 && phone && draft.item.trim().length > 1 && draft.price > 0;

  function save() {
    if (!ready) return;
    addInvoice({
      name: draft.name.trim(),
      phone,
      status: draft.paid ? 'paid' : 'due',
      items: [{ name: draft.item.trim(), qty: 1, price: draft.price }],
    });
    setDraft(blank);
    setOpen(false);
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className="btn btn-light">فاتورة جديدة</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="modal-backdrop" />
        <Dialog.Popup className="modal a-modal on-light">
          <Dialog.Title className="modal-title">فاتورة جديدة</Dialog.Title>
          <div className="a-grid">
            <Text label="اسم العميل" value={draft.name} onChange={(v) => set({ name: v })} />
            <Text
              label="رقم الجوال"
              value={draft.phone}
              onChange={(v) => set({ phone: v })}
              placeholder="05XXXXXXXX"
              ltr
            />
            <Text
              label="البيان"
              value={draft.item}
              onChange={(v) => set({ item: v })}
              placeholder="مثال: حجز ملعب الكورة، ساعة"
            />
            <Text
              label="المبلغ شامل الضريبة (ريال)"
              type="number"
              value={draft.price}
              onChange={(v) => set({ price: v })}
              ltr
            />
          </div>
          <div className="a-row-actions a-modal-actions">
            <Toggle label="مدفوعة" checked={draft.paid} onChange={(v) => set({ paid: v })} />
            <button type="button" className="btn btn-light" onClick={save} disabled={!ready}>
              أصدر الفاتورة
            </button>
          </div>
          <Dialog.Close className="link-btn modal-close">إغلاق</Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default function Invoices() {
  const { invoices } = useLog();
  const [filter, setFilter] = useState('all');
  const [openId, setOpenId] = useState(null);
  const shown = invoices.filter((i) => filter === 'all' || i.status === filter);
  const opened = invoices.find((i) => i.id === openId);

  const month = new Date().toISOString().slice(0, 7);
  const sum = (list) => list.reduce((acc, i) => acc + invoiceTotals(i).total, 0);
  const paidThisMonth = invoices.filter((i) => i.status === 'paid' && i.at.slice(0, 7) === month);
  const due = invoices.filter((i) => i.status === 'due');
  const vat = paidThisMonth.reduce((acc, i) => acc + invoiceTotals(i).vat, 0);

  return (
    <>
      <div className="kpis inv-kpis">
        <div className="kpi">
          <p className="kpi-label">مدفوع هذا الشهر</p>
          <p className="kpi-value">
            <span className="num">{money(sum(paidThisMonth))}</span>
            <small>ريال</small>
          </p>
          <p className="kpi-trend">
            <span className="num">{paidThisMonth.length}</span> فاتورة
          </p>
        </div>
        <div className="kpi">
          <p className="kpi-label">منها ضريبة القيمة المضافة</p>
          <p className="kpi-value">
            <span className="num">{sar(vat)}</span>
            <small>ريال</small>
          </p>
          <p className="kpi-trend">هذا المبلغ اللي يدخل في إقرارك الضريبي</p>
        </div>
        <div className="kpi">
          <p className="kpi-label">غير مدفوعة</p>
          <p className="kpi-value">
            <span className="num">{money(sum(due))}</span>
            <small>ريال</small>
          </p>
          <p className="kpi-trend">
            <span className="num">{due.length}</span> فاتورة تنتظر التحصيل
          </p>
        </div>
      </div>

      <section className="a-card">
        <h2>كيف تشتغل الفواتير؟</h2>
        <ol className="inv-steps">
          <li>العضو يشترك من الموقع، ويوصلك الطلب في "طلبات الاشتراك".</li>
          <li>أول ما تفعّل الاشتراك تصدر فاتورته تلقائياً برقم متسلسل، والضريبة مفصولة عن السعر.</li>
          <li>لو ألغيت الاشتراك تتحول فاتورته إلى ملغاة، والرقم ما ينعاد استخدامه.</li>
          <li>أي بيع ثاني (حجز ملعب، حصة تدريب) تصدر له فاتورة يدوية من زر "فاتورة جديدة".</li>
        </ol>
      </section>

      <div className="a-toolbar">
        <Pills label="تصفية الفواتير" options={filters} value={filter} onChange={setFilter} />
        <NewInvoice />
      </div>

      {shown.length === 0 ? (
        <Empty>
          {invoices.length === 0
            ? 'ما فيه فواتير إلى الآن. فعّل اشتراك أو حمّل البيانات التجريبية من "نظرة عامة".'
            : 'ما فيه فواتير بهذي الحالة.'}
        </Empty>
      ) : (
        <ul className="a-rows">
          {shown.map((i) => {
            const totals = invoiceTotals(i);
            return (
              <li key={i.id} className={i.status === 'void' ? 'a-row is-done' : 'a-row'}>
                <div className="a-row-main">
                  <b className="num">{invoiceNo(i)}</b>
                  <b>{i.name}</b>
                  <span className={`a-tag inv-tag is-${i.status}`}>{statusLabel[i.status]}</span>
                  {i.subId && <span className="a-tag">تلقائية من اشتراك</span>}
                  <span className="a-muted">{when(i.at)}</span>
                </div>
                <p className="a-note">{i.items.map((item) => item.name).join('، ')}</p>
                <p>
                  الإجمالي: <b className="num">{sar(totals.total)}</b> ريال
                  <span className="a-muted">
                    {' '}
                    (صافي <span className="num">{sar(totals.net)}</span> + ضريبة{' '}
                    <span className="num">{sar(totals.vat)}</span>)
                  </span>
                </p>
                <div className="a-row-actions">
                  <Pills
                    label={`حالة الفاتورة ${invoiceNo(i)}`}
                    options={statuses}
                    value={i.status}
                    onChange={(status) => setInvoiceStatus(i.id, status)}
                  />
                  <button type="button" className="a-link" onClick={() => setOpenId(i.id)}>
                    اعرض الفاتورة
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog.Root open={Boolean(opened)} onOpenChange={(next) => !next && setOpenId(null)}>
        <Dialog.Portal>
          <Dialog.Backdrop className="modal-backdrop" />
          <Dialog.Popup className="modal inv-modal on-light">
            <Dialog.Title className="sr-only">{opened ? `الفاتورة ${invoiceNo(opened)}` : 'فاتورة'}</Dialog.Title>
            {opened && <Sheet invoice={opened} />}
            <div className="a-row-actions inv-actions">
              <button type="button" className="btn btn-light" onClick={() => window.print()}>
                اطبع أو احفظ PDF
              </button>
              <Dialog.Close className="link-btn">إغلاق</Dialog.Close>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
