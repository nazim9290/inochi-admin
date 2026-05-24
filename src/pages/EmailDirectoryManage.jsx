/**
 * EN: Email Directory — the address book of partner / known schools the admin
 *     emails outreach to. Two parts:
 *       1. Groups: create / rename / delete mailing groups (e.g. "Tokyo
 *          schools"). Each shows a live member count.
 *       2. Contacts: add / edit / delete a school (name, contact person,
 *          email, city, group membership). A bulk-paste box imports many
 *          rows at once. Sending happens on the separate "Send Email" page.
 * BN: Email Directory — admin যেসব পরিচিত/partner স্কুলে outreach মেইল পাঠায়
 *     তাদের ঠিকানা-বই। দুই অংশ:
 *       ১. Group: mailing group তৈরি/নাম পরিবর্তন/মুছে ফেলা (যেমন "Tokyo
 *          schools")। প্রতিটায় live member সংখ্যা দেখায়।
 *       ২. Contact: স্কুল add/edit/delete (নাম, যোগাযোগ ব্যক্তি, email, শহর,
 *          group)। Bulk-paste box দিয়ে একসাথে অনেক row import। মেইল পাঠানো
 *          আলাদা "Send Email" পেজে।
 */

import { useEffect, useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';
import { confirmDialog } from '../components/ConfirmDialog';

const inputClass =
  'w-full rounded-md border border-brand-tealLight/60 bg-white px-3 py-2.5 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-teal/40 focus:border-brand-teal';
const labelClass = 'mb-1 block text-xs font-bold uppercase tracking-wider text-brand-navy';

const emptyContact = {
  id: null,
  schoolName: '',
  contactName: '',
  email: '',
  city: '',
  country: '',
  groups: [],
  notes: '',
  active: true,
};

const isEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e || '').trim());

export default function EmailDirectoryManage() {
  // EN: axiosInterceptor() is itself a hook (uses useAuth + useNavigate), so it
  //     must be called at the top level every render — NEVER inside useMemo.
  // BN: axiosInterceptor() নিজেই hook (useAuth + useNavigate ব্যবহার করে), তাই
  //     প্রতি render-এ top level-এ কল করতে হয় — useMemo-র ভেতরে কখনো নয়।
  const api = axiosInterceptor();
  const [groups, setGroups] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null); // { ok, text }

  // Contact editor
  const [form, setForm] = useState(emptyContact);
  const [saving, setSaving] = useState(false);

  // Group editor
  const [newGroup, setNewGroup] = useState('');

  // Bulk import
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkGroup, setBulkGroup] = useState('');
  const [bulkBusy, setBulkBusy] = useState(false);

  // Import from existing in-system lists (subscribers / contacts)
  const [importPreview, setImportPreview] = useState({ subscribers: 0, contacts: 0 });
  const [importGroup, setImportGroup] = useState('');
  const [importBusy, setImportBusy] = useState(null); // 'subscribers' | 'contacts' | null

  // Filter
  const [filterGroup, setFilterGroup] = useState('');
  const [search, setSearch] = useState('');

  const flash = (ok, text) => {
    setMsg({ ok, text });
    setTimeout(() => setMsg(null), 4000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const [g, c, p] = await Promise.all([
        api.get('/email-groups'),
        api.get('/school-contacts'),
        api.get('/email-outreach/import-preview').catch(() => ({ data: { subscribers: 0, contacts: 0 } })),
      ]);
      setGroups(g.data?.groups || []);
      setContacts(c.data?.contacts || []);
      setImportPreview(p.data || { subscribers: 0, contacts: 0 });
    } catch (err) {
      flash(false, err.response?.data?.error || 'লোড করা যায়নি');
    } finally {
      setLoading(false);
    }
  };

  // EN: One-click import of an existing in-system list into the directory.
  // BN: সিস্টেমের পুরোনো লিস্ট এক ক্লিকে directory-তে import।
  const runImport = async (source) => {
    setImportBusy(source);
    try {
      const res = await api.post('/email-outreach/import', { source, group: importGroup || undefined });
      flash(true, `${res.data.created} টি যোগ হয়েছে, ${res.data.skipped} টি বাদ (আগে থেকেই আছে)`);
      load();
    } catch (err) {
      flash(false, err.response?.data?.error || 'Import করা যায়নি');
    } finally {
      setImportBusy(null);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ----------------------------- Groups ----------------------------- */
  const addGroup = async () => {
    const name = newGroup.trim();
    if (!name) return;
    try {
      await api.post('/email-groups', { name });
      setNewGroup('');
      flash(true, `গ্রুপ "${name}" যোগ হয়েছে`);
      load();
    } catch (err) {
      flash(false, err.response?.data?.error || 'গ্রুপ যোগ করা যায়নি');
    }
  };

  const renameGroup = async (group) => {
    const name = window.prompt('নতুন নাম দিন:', group.name);
    if (!name || name.trim() === group.name) return;
    try {
      await api.put(`/email-groups/${group.id}`, { name: name.trim() });
      flash(true, 'গ্রুপের নাম বদলানো হয়েছে');
      load();
    } catch (err) {
      flash(false, err.response?.data?.error || 'নাম বদলানো যায়নি');
    }
  };

  const deleteGroup = async (group) => {
    const ok = await confirmDialog({
      title: 'গ্রুপ মুছবেন?',
      message: `"${group.name}" গ্রুপটি মুছে ফেলা হবে। স্কুলগুলো থাকবে, শুধু এই গ্রুপ-ট্যাগ সরে যাবে।`,
      confirmText: 'হ্যাঁ, মুছুন',
    });
    if (!ok) return;
    try {
      await api.delete(`/email-groups/${group.id}`);
      flash(true, 'গ্রুপ মুছে ফেলা হয়েছে');
      if (filterGroup === group.name) setFilterGroup('');
      load();
    } catch (err) {
      flash(false, err.response?.data?.error || 'মুছে ফেলা যায়নি');
    }
  };

  /* ---------------------------- Contacts ---------------------------- */
  const toggleFormGroup = (name) => {
    setForm((f) => ({
      ...f,
      groups: f.groups.includes(name) ? f.groups.filter((g) => g !== name) : [...f.groups, name],
    }));
  };

  const editContact = (c) => {
    setForm({
      id: c.id,
      schoolName: c.schoolName || '',
      contactName: c.contactName || '',
      email: c.email || '',
      city: c.city || '',
      country: c.country || '',
      groups: Array.isArray(c.groups) ? c.groups : [],
      notes: c.notes || '',
      active: c.active !== false,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => setForm(emptyContact);

  const saveContact = async () => {
    if (!form.schoolName.trim()) return flash(false, 'স্কুলের নাম দিন');
    if (!isEmail(form.email)) return flash(false, 'সঠিক email দিন');
    setSaving(true);
    try {
      if (form.id) {
        await api.put(`/school-contacts/${form.id}`, form);
        flash(true, 'আপডেট হয়েছে');
      } else {
        await api.post('/school-contacts', form);
        flash(true, 'স্কুল যোগ হয়েছে');
      }
      resetForm();
      load();
    } catch (err) {
      flash(false, err.response?.data?.error || 'সেভ করা যায়নি');
    } finally {
      setSaving(false);
    }
  };

  const deleteContact = async (c) => {
    const ok = await confirmDialog({
      title: 'স্কুল মুছবেন?',
      message: `"${c.schoolName}" (${c.email}) directory থেকে মুছে ফেলা হবে।`,
      confirmText: 'হ্যাঁ, মুছুন',
    });
    if (!ok) return;
    try {
      await api.delete(`/school-contacts/${c.id}`);
      flash(true, 'মুছে ফেলা হয়েছে');
      load();
    } catch (err) {
      flash(false, err.response?.data?.error || 'মুছে ফেলা যায়নি');
    }
  };

  const toggleActive = async (c) => {
    try {
      await api.put(`/school-contacts/${c.id}`, { active: !c.active });
      load();
    } catch (err) {
      flash(false, err.response?.data?.error || 'বদলানো যায়নি');
    }
  };

  /* --------------------------- Bulk import -------------------------- */
  // EN: Each line → "email, School Name, Contact Name, City". Only email is
  //     required; the rest are optional and comma-separated.
  // BN: প্রতি লাইন → "email, School Name, Contact Name, City"। শুধু email
  //     আবশ্যক; বাকিগুলো optional, কমা দিয়ে আলাদা।
  const parseBulk = (text) =>
    text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [email, schoolName, contactName, city] = line.split(',').map((s) => (s || '').trim());
        return {
          email,
          schoolName: schoolName || (email ? email.split('@')[1] || email : ''),
          contactName: contactName || '',
          city: city || '',
          groups: bulkGroup ? [bulkGroup] : [],
        };
      })
      .filter((r) => isEmail(r.email));

  const runBulk = async () => {
    const parsed = parseBulk(bulkText);
    if (parsed.length === 0) return flash(false, 'কোনো বৈধ email পাওয়া যায়নি');
    setBulkBusy(true);
    try {
      const res = await api.post('/school-contacts/bulk', { contacts: parsed });
      flash(true, `${res.data.created} টি যোগ হয়েছে, ${res.data.skipped} টি বাদ (ডুপ্লিকেট/ভুল)`);
      setBulkText('');
      setBulkOpen(false);
      load();
    } catch (err) {
      flash(false, err.response?.data?.error || 'Import করা যায়নি');
    } finally {
      setBulkBusy(false);
    }
  };

  /* ----------------------------- Render ----------------------------- */
  const filtered = contacts.filter((c) => {
    if (filterGroup && !(Array.isArray(c.groups) && c.groups.includes(filterGroup))) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        (c.schoolName || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.contactName || '').toLowerCase().includes(q) ||
        (c.city || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-5 max-w-6xl pb-24">
      <div>
        <h1 className="text-2xl font-extrabold text-brand-navy">Email Directory</h1>
        <p className="mt-1 text-sm text-brand-slate">
          পরিচিত স্কুলগুলোর ইমেইল ঠিকানা এখানে রাখুন ও গ্রুপে ভাগ করুন। মেইল পাঠানো হবে{' '}
          <strong>“Send Email”</strong> পেজ থেকে।
        </p>
      </div>

      {msg && (
        <div className={`rounded-lg border px-4 py-2.5 text-sm ${msg.ok ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-red-300 bg-red-50 text-red-800'}`}>
          {msg.ok ? '✓ ' : '✗ '}{msg.text}
        </div>
      )}

      {/* Groups */}
      <section className="rounded-xl border border-brand-tealLight/40 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wide text-brand-navy">গ্রুপ (Groups)</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {groups.length === 0 && <p className="text-sm text-brand-slate/70">এখনো কোনো গ্রুপ নেই।</p>}
          {groups.map((g) => (
            <span key={g.id} className="inline-flex items-center gap-1.5 rounded-full border border-brand-tealLight/60 bg-brand-tealLight/10 px-3 py-1 text-xs text-brand-navy">
              <strong>{g.name}</strong>
              <span className="text-brand-slate/70">({g.memberCount})</span>
              <button type="button" onClick={() => renameGroup(g)} title="নাম বদলান" className="ml-1 text-brand-teal hover:text-brand-navy">✎</button>
              <button type="button" onClick={() => deleteGroup(g)} title="মুছুন" className="text-red-500 hover:text-red-700">✕</button>
            </span>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            value={newGroup}
            onChange={(e) => setNewGroup(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addGroup()}
            placeholder="নতুন গ্রুপের নাম (যেমন: Tokyo schools)"
            className={inputClass + ' max-w-xs'}
          />
          <button type="button" onClick={addGroup} className="rounded-md bg-brand-teal px-4 py-2 text-sm font-bold text-white hover:bg-brand-navy">
            + গ্রুপ
          </button>
        </div>
      </section>

      {/* Import from existing in-system lists */}
      <section className="rounded-xl border border-brand-tealLight/40 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wide text-brand-navy">পুরোনো লিস্ট থেকে যোগ করুন</h2>
        <p className="mt-1 text-sm text-brand-slate">
          সাইটে আগে থেকে থাকা ইমেইল এক ক্লিকে এই directory-তে আনুন। (ইতিমধ্যে যোগ করা ঠিকানা বাদ পড়বে।)
        </p>
        <div className="mt-3 flex items-center gap-2">
          <label className="text-xs font-semibold text-brand-slate">যোগ করার সময় গ্রুপ:</label>
          <select value={importGroup} onChange={(e) => setImportGroup(e.target.value)} className="rounded-md border border-brand-tealLight/60 bg-white px-2 py-1.5 text-xs">
            <option value="">কোনো গ্রুপ ছাড়া</option>
            {groups.map((g) => <option key={g.id} value={g.name}>{g.name}</option>)}
          </select>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-lg border border-brand-tealLight/40 bg-brand-tealLight/5 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-brand-navy">নিউজলেটার Subscriber</p>
              <p className="text-xs text-brand-slate">{importPreview.subscribers} টি নতুন (confirmed)</p>
            </div>
            <button
              type="button"
              onClick={() => runImport('subscribers')}
              disabled={importBusy !== null || importPreview.subscribers === 0}
              className="rounded-md bg-brand-teal px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-navy disabled:opacity-40"
            >
              {importBusy === 'subscribers' ? 'হচ্ছে…' : 'যোগ করুন'}
            </button>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-brand-tealLight/40 bg-brand-tealLight/5 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-brand-navy">যোগাযোগ ফর্মের Lead</p>
              <p className="text-xs text-brand-slate">{importPreview.contacts} টি নতুন</p>
            </div>
            <button
              type="button"
              onClick={() => runImport('contacts')}
              disabled={importBusy !== null || importPreview.contacts === 0}
              className="rounded-md bg-brand-teal px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-navy disabled:opacity-40"
            >
              {importBusy === 'contacts' ? 'হচ্ছে…' : 'যোগ করুন'}
            </button>
          </div>
        </div>
      </section>

      {/* Contact editor */}
      <section className="rounded-xl border border-brand-tealLight/40 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-brand-navy">
            {form.id ? 'স্কুল এডিট করুন' : 'নতুন স্কুল যোগ করুন'}
          </h2>
          <button type="button" onClick={() => setBulkOpen((v) => !v)} className="rounded-md border border-brand-navy px-3 py-1.5 text-xs font-semibold text-brand-navy hover:bg-brand-tealLight/10">
            ⇪ একসাথে অনেক (Bulk)
          </button>
        </div>

        {bulkOpen && (
          <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-xs text-blue-900">
              প্রতি লাইনে একটি করে: <code className="bg-white px-1">email, স্কুলের নাম, যোগাযোগ ব্যক্তি, শহর</code> — শুধু email আবশ্যক, বাকিগুলো ঐচ্ছিক।
            </p>
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              rows={6}
              placeholder={'info@akamonkai.ac.jp, Akamonkai, Tanaka-san, Tokyo\nadmissions@jcli.jp, JCLI, , Saitama'}
              className={inputClass + ' mt-2 font-mono text-xs'}
            />
            <div className="mt-2 flex items-center gap-2">
              <select value={bulkGroup} onChange={(e) => setBulkGroup(e.target.value)} className={inputClass + ' max-w-xs'}>
                <option value="">কোনো গ্রুপ ছাড়া</option>
                {groups.map((g) => <option key={g.id} value={g.name}>{g.name}</option>)}
              </select>
              <button type="button" onClick={runBulk} disabled={bulkBusy} className="rounded-md bg-brand-teal px-4 py-2 text-sm font-bold text-white hover:bg-brand-navy disabled:opacity-50">
                {bulkBusy ? 'Import হচ্ছে…' : 'Import'}
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass}>স্কুলের নাম *</label>
            <input value={form.schoolName} onChange={(e) => setForm({ ...form, schoolName: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Email *</label>
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>যোগাযোগ ব্যক্তি (ঐচ্ছিক)</label>
            <input value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>শহর (ঐচ্ছিক)</label>
            <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputClass} />
          </div>
        </div>

        <div className="mt-3">
          <label className={labelClass}>গ্রুপ (একাধিক হতে পারে)</label>
          <div className="flex flex-wrap gap-2">
            {groups.length === 0 && <p className="text-xs text-brand-slate/60">আগে উপরে গ্রুপ তৈরি করুন।</p>}
            {groups.map((g) => (
              <label key={g.id} className={`cursor-pointer rounded-full border px-3 py-1 text-xs ${form.groups.includes(g.name) ? 'border-brand-teal bg-brand-teal text-white' : 'border-brand-tealLight/60 bg-white text-brand-navy'}`}>
                <input type="checkbox" className="hidden" checked={form.groups.includes(g.name)} onChange={() => toggleFormGroup(g.name)} />
                {g.name}
              </label>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-brand-navy">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
            Active (মেইল পাবে)
          </label>
        </div>

        <div className="mt-4 flex gap-2">
          <button type="button" onClick={saveContact} disabled={saving} className="rounded-md bg-brand-teal px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-navy disabled:opacity-50">
            {saving ? 'সেভ হচ্ছে…' : form.id ? 'আপডেট করুন' : '+ যোগ করুন'}
          </button>
          {form.id && (
            <button type="button" onClick={resetForm} className="rounded-md border border-brand-navy px-4 py-2.5 text-sm font-semibold text-brand-navy hover:bg-brand-tealLight/10">
              বাতিল
            </button>
          )}
        </div>
      </section>

      {/* Contacts table */}
      <section className="rounded-xl border border-brand-tealLight/40 bg-white shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-tealLight/40 px-5 py-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-brand-navy">
            স্কুল তালিকা ({filtered.length})
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <select value={filterGroup} onChange={(e) => setFilterGroup(e.target.value)} className="rounded-md border border-brand-tealLight/60 bg-white px-2 py-1.5 text-xs">
              <option value="">সব গ্রুপ</option>
              {groups.map((g) => <option key={g.id} value={g.name}>{g.name} ({g.memberCount})</option>)}
            </select>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="খুঁজুন…" className="rounded-md border border-brand-tealLight/60 bg-white px-2 py-1.5 text-xs" />
          </div>
        </div>

        {loading ? (
          <p className="p-5 text-sm text-brand-slate">লোড হচ্ছে…</p>
        ) : filtered.length === 0 ? (
          <p className="p-5 text-sm text-brand-slate/70">কোনো স্কুল নেই। উপরে যোগ করুন বা Bulk import করুন।</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-brand-tealLight/10 text-xs uppercase text-brand-slate">
                <tr>
                  <th className="px-4 py-2">স্কুল</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">যোগাযোগ</th>
                  <th className="px-4 py-2">গ্রুপ</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-t border-brand-tealLight/30 hover:bg-brand-tealLight/5">
                    <td className="px-4 py-2 font-medium text-brand-navy">
                      {c.schoolName}
                      {c.city ? <span className="ml-1 text-xs text-brand-slate/60">· {c.city}</span> : null}
                    </td>
                    <td className="px-4 py-2 text-brand-slate">{c.email}</td>
                    <td className="px-4 py-2 text-brand-slate">{c.contactName || '—'}</td>
                    <td className="px-4 py-2">
                      <div className="flex flex-wrap gap-1">
                        {(c.groups || []).map((g) => (
                          <span key={g} className="rounded bg-brand-tealLight/20 px-1.5 py-0.5 text-[10px] text-brand-navy">{g}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <button type="button" onClick={() => toggleActive(c)} className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${c.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-500'}`}>
                        {c.active ? 'Active' : 'Off'}
                      </button>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button type="button" onClick={() => editContact(c)} className="mr-2 text-brand-teal hover:text-brand-navy">এডিট</button>
                      <button type="button" onClick={() => deleteContact(c)} className="text-red-500 hover:text-red-700">মুছুন</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
