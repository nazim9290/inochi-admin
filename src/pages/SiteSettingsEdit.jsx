import { useEffect, useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';
import BilingualField from '../components/BilingualField';
import ImageUploadField from '../components/ImageUploadField';
import MapEmbedField from '../components/MapEmbedField';

// EN: Shared input/label classes — kept consistent so all fields look the same.
// BN: Shared input/label class — সব field-এর look একরকম রাখতে।
const labelClass = 'mb-2 block text-sm font-semibold text-brand-navy';
const inputClass =
  'w-full rounded-md border border-brand-tealLight/60 bg-white px-3 py-2.5 text-sm text-brand-navy placeholder:text-brand-slate/50 focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/40';
const sectionClass = 'bg-white rounded-xl border border-brand-tealLight/40 shadow-sm p-6 md:p-7';
const sectionHead =
  'text-lg font-bold text-brand-navy mb-1';
const sectionSub = 'text-xs text-brand-slate mb-5 pb-4 border-b border-brand-tealLight/30';

// EN: Generic single-line text input. `type` defaults to 'text' but accepts
//     'number' / 'email' / etc; `step|min|max` flow through for numeric.
// BN: সাধারণ single-line text input। `type` default 'text', তবে 'number' /
//     'email' ইত্যাদি accept করে; numeric-এর জন্য `step|min|max` pass-through।
const SinglePlain = ({
  label,
  name,
  value,
  onChange,
  placeholder = '',
  type = 'text',
  step,
  min,
  max,
}) => (
  <label className="block">
    <span className={labelClass}>{label}</span>
    <input
      type={type}
      name={name}
      value={value ?? ''}
      onChange={onChange}
      placeholder={placeholder}
      step={step}
      min={min}
      max={max}
      className={inputClass}
    />
  </label>
);

const SiteSettingsEdit = () => {
  const api = axiosInterceptor();
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api
      .get('/site-settings')
      .then((res) => setData(res.data?.settings || {}))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (e) => setData({ ...data, [e.target.name]: e.target.value });

  const onBadgeChange = (idx, key, value) => {
    const badges = Array.isArray(data.heroBadges) ? [...data.heroBadges] : [];
    badges[idx] = { ...badges[idx], [key]: value };
    setData({ ...data, heroBadges: badges });
  };

  const addBadge = () => {
    const badges = Array.isArray(data.heroBadges) ? [...data.heroBadges] : [];
    badges.push({ value: '', label: '', labelEn: '' });
    setData({ ...data, heroBadges: badges });
  };

  const removeBadge = (idx) => {
    const badges = Array.isArray(data.heroBadges) ? [...data.heroBadges] : [];
    badges.splice(idx, 1);
    setData({ ...data, heroBadges: badges });
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const { data: res } = await api.put('/site-settings', data);
      setData(res.settings || data);
      setMsg('✓ Saved successfully');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setMsg('✗ Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-brand-slate p-6">Loading site settings…</p>;
  }

  return (
    <form onSubmit={submit} className="space-y-6 max-w-6xl pb-24">
      {/* EN: Page header — non-sticky; the floating save button at the bottom-right
              is what stays visible while scrolling. */}
      {/* BN: Page header — sticky না; নিচে-ডানে floating save button scroll-এর সময়
              দেখা যায়। */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-navy">Site Settings</h1>
          <p className="mt-1 text-sm text-brand-slate">
            Hero, stats, contact info — সাইটের সব setting এখানে। Bangla + English পাশাপাশি edit করুন।
          </p>
        </div>
      </div>

      {/* EN: Floating save button — fixed bottom-right, always reachable. */}
      {/* BN: Floating save button — সবসময় নিচে-ডানে fixed, scroll-এর সময়ও পৌঁছানো যায়। */}
      <div className="fixed bottom-6 right-6 z-30 flex items-center gap-3">
        {msg && (
          <span
            className={`rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-md ${
              msg.startsWith('✓') ? 'text-brand-teal' : 'text-red-600'
            }`}
          >
            {msg}
          </span>
        )}
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-brand-teal px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-brand-navy hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      <div className={sectionClass}>
        <h2 className={sectionHead}>Hero Section</h2>
        <p className={sectionSub}>হোম পেজের সবচেয়ে উপরের অংশ — title, subtitle, ছবি ও call-to-action button।</p>
        <div className="space-y-5">
          <BilingualField label="Eyebrow text" name="heroEyebrow" value={data.heroEyebrow} valueEn={data.heroEyebrowEn} onChange={onChange} />
          <SinglePlain label="Eyebrow (日本語, optional)" name="heroEyebrowJa" value={data.heroEyebrowJa} onChange={onChange} />
          <SinglePlain label="Japanese title (日本語)" name="heroTitleJp" value={data.heroTitleJp} onChange={onChange} />
          <BilingualField label="Main title" name="heroTitle" value={data.heroTitle} valueEn={data.heroTitleEn} onChange={onChange} />
          <BilingualField label="Subtitle" name="heroSubtitle" value={data.heroSubtitle} valueEn={data.heroSubtitleEn} onChange={onChange} type="textarea" />
          <SinglePlain label="Subtitle (日本語, optional)" name="heroSubtitleJa" value={data.heroSubtitleJa} onChange={onChange} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BilingualField label="Primary CTA text" name="heroCtaPrimary" value={data.heroCtaPrimary} valueEn={data.heroCtaPrimaryEn} onChange={onChange} />
            <SinglePlain label="Primary CTA link" name="heroCtaPrimaryLink" value={data.heroCtaPrimaryLink} onChange={onChange} placeholder="/bookseminer" />
            <BilingualField label="Secondary CTA text" name="heroCtaSecondary" value={data.heroCtaSecondary} valueEn={data.heroCtaSecondaryEn} onChange={onChange} />
            <SinglePlain label="Secondary CTA link" name="heroCtaSecondaryLink" value={data.heroCtaSecondaryLink} onChange={onChange} />
          </div>
          <ImageUploadField
            label="Hero background image"
            value={data.heroBackgroundUrl}
            onChange={(url) => setData({ ...data, heroBackgroundUrl: url })}
            hint="হোম পেজের উপরের ছবিটা। Landscape (চওড়া) ছবি ভাল দেখায় — প্রস্থ ১৬০০px+"
          />
        </div>

        <div className="mt-6 border-t border-brand-tealLight/30 pt-5">
          <p className={labelClass}>Hero trust badges</p>
          <p className="-mt-1 mb-4 text-xs text-brand-slate">
            Hero-এর নিচের ছোট badge গুলো (যেমন "Govt. Registered", "BAIRA Member")।
            Icon-এ একটা চিহ্ন দিন (যেমন <span className="font-bold text-brand-teal">✓</span>{' '}
            বা <span className="font-bold text-brand-teal">⭐</span>) আর Bangla + English label দিন।
          </p>
          <div className="space-y-3">
            {(data.heroBadges || []).map((b, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 gap-3 rounded-lg border border-brand-tealLight/40 bg-brand-tealLight/5 p-3 md:grid-cols-12 md:items-end"
              >
                <div className="md:col-span-1">
                  <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-brand-slate">
                    Icon
                  </span>
                  <input
                    type="text"
                    placeholder="✓"
                    value={b.value || ''}
                    onChange={(e) => onBadgeChange(idx, 'value', e.target.value)}
                    className={inputClass + ' text-center'}
                  />
                </div>
                <div className="md:col-span-5">
                  <span className="mb-1 inline-block rounded bg-brand-teal/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-teal">
                    বাংলা
                  </span>
                  <input
                    type="text"
                    placeholder="যেমন: সরকার অনুমোদিত"
                    value={b.label || ''}
                    onChange={(e) => onBadgeChange(idx, 'label', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-5">
                  <span className="mb-1 inline-block rounded bg-brand-navy/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-navy">
                    English
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. Govt. Registered"
                    value={b.labelEn || ''}
                    onChange={(e) => onBadgeChange(idx, 'labelEn', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeBadge(idx)}
                  className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 md:col-span-1"
                  aria-label="Remove badge"
                >
                  Delete
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addBadge}
              className="inline-flex items-center gap-1.5 rounded-md border border-brand-teal/40 bg-white px-3 py-2 text-sm font-semibold text-brand-teal hover:bg-brand-teal/5"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              নতুন badge যোগ করুন
            </button>
          </div>
        </div>
      </div>

      <div className={sectionClass}>
        <h2 className={sectionHead}>Stats Counter (4 numbers)</h2>
        <p className={sectionSub}>হোম পেজে দেখানো ৪টা পরিসংখ্যান (যেমন "৫০০+ Students", "৯৫% Visa Success")।</p>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <SinglePlain label="Stat 1 value" name="statStudents" value={data.statStudents} onChange={onChange} />
            <SinglePlain label="Stat 2 value" name="statSuccess" value={data.statSuccess} onChange={onChange} />
            <SinglePlain label="Stat 3 value" name="statPartners" value={data.statPartners} onChange={onChange} />
            <SinglePlain label="Stat 4 value" name="statYears" value={data.statYears} onChange={onChange} />
          </div>
          <BilingualField label="Stat 1 label" name="statStudentsLabel" value={data.statStudentsLabel} valueEn={data.statStudentsLabelEn} onChange={onChange} />
          <BilingualField label="Stat 2 label" name="statSuccessLabel" value={data.statSuccessLabel} valueEn={data.statSuccessLabelEn} onChange={onChange} />
          <BilingualField label="Stat 3 label" name="statPartnersLabel" value={data.statPartnersLabel} valueEn={data.statPartnersLabelEn} onChange={onChange} />
          <BilingualField label="Stat 4 label" name="statYearsLabel" value={data.statYearsLabel} valueEn={data.statYearsLabelEn} onChange={onChange} />
        </div>
      </div>

      <div className={sectionClass}>
        <h2 className={sectionHead}>Trust & Compliance</h2>
        <p className={sectionSub}>সরকারি registration ও BAIRA membership-এর তথ্য — visitor-এর বিশ্বাস বাড়াতে।</p>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SinglePlain label="Govt. registration number" name="govLicense" value={data.govLicense} onChange={onChange} />
            <SinglePlain label="BAIRA membership number" name="bairaNumber" value={data.bairaNumber} onChange={onChange} />
          </div>
          <BilingualField label="Trust note (italic line)" name="trustNote" value={data.trustNote} valueEn={data.trustNoteEn} onChange={onChange} />
          <SinglePlain label="Trust note (日本語, optional)" name="trustNoteJa" value={data.trustNoteJa} onChange={onChange} />
        </div>
      </div>

      <div className={sectionClass}>
        <h2 className={sectionHead}>Contact Info</h2>
        <p className={sectionSub}>WhatsApp, hotline, email ও দুই দেশের office address। Footer ও contact page-এ দেখাবে।</p>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <SinglePlain label="WhatsApp number" name="whatsappNumber" value={data.whatsappNumber} onChange={onChange} placeholder="+8801XXXXXXXXX" />
            <SinglePlain label="Hotline" name="hotline" value={data.hotline} onChange={onChange} />
            <SinglePlain label="Email" name="email" value={data.email} onChange={onChange} />
          </div>
          <BilingualField label="Bangladesh address" name="addressBd" value={data.addressBd} valueEn={data.addressBdEn} onChange={onChange} type="textarea" rows={2} />
          <BilingualField label="Japan address" name="addressJp" value={data.addressJp} valueEn={data.addressJpEn} onChange={onChange} type="textarea" rows={2} />
          <BilingualField label="Office hours (Bangladesh)" name="officeHoursBd" value={data.officeHoursBd} valueEn={data.officeHoursBdEn} onChange={onChange} />
          <BilingualField label="Office hours (Japan)" name="officeHoursJp" value={data.officeHoursJp} valueEn={data.officeHoursJpEn} onChange={onChange} />
          <MapEmbedField
            name="mapEmbedUrl"
            label="Google Maps embed URL"
            value={data.mapEmbedUrl}
            onChange={onChange}
          />
        </div>
      </div>

      <div className={sectionClass}>
        <h2 className={sectionHead}>Social Links</h2>
        <p className={sectionSub}>Footer-এর social icon গুলোতে এই link কাজ করবে। না দিলে icon-টা hide হয়ে যাবে।</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SinglePlain label="Facebook URL" name="facebookUrl" value={data.facebookUrl} onChange={onChange} />
          <SinglePlain label="YouTube URL" name="youtubeUrl" value={data.youtubeUrl} onChange={onChange} />
          <SinglePlain label="Instagram URL" name="instagramUrl" value={data.instagramUrl} onChange={onChange} />
          <SinglePlain label="TikTok URL" name="tiktokUrl" value={data.tiktokUrl} onChange={onChange} />
          <SinglePlain label="LinkedIn URL" name="linkedinUrl" value={data.linkedinUrl} onChange={onChange} />
          <SinglePlain label="Twitter / X URL" name="twitterUrl" value={data.twitterUrl} onChange={onChange} />
          <SinglePlain label="Google Business URL" name="googleBusinessUrl" value={data.googleBusinessUrl} onChange={onChange} />
        </div>
      </div>

      <div className={sectionClass}>
        <h2 className={sectionHead}>About Section</h2>
        <p className={sectionSub}>হোম পেজের "About" সেকশন — heading, body text ও পাশের ছবি।</p>
        <div className="space-y-4">
          <BilingualField label="Heading" name="aboutHeading" value={data.aboutHeading} valueEn={data.aboutHeadingEn} onChange={onChange} />
          <SinglePlain label="Heading (日本語, optional)" name="aboutHeadingJa" value={data.aboutHeadingJa} onChange={onChange} />
          <BilingualField label="Body" name="aboutBody" value={data.aboutBody} valueEn={data.aboutBodyEn} onChange={onChange} type="textarea" rows={5} />
          <SinglePlain label="Body (日本語, optional, multi-line)" name="aboutBodyJa" value={data.aboutBodyJa} onChange={onChange} />
          <ImageUploadField
            label="About section image"
            value={data.aboutImageUrl}
            onChange={(url) => setData({ ...data, aboutImageUrl: url })}
            hint="About সেকশনের পাশে দেখানো ছবি — square বা portrait orientation ভাল।"
          />
        </div>
      </div>

      {/* ========= FACEBOOK ========= */}
      <div className={sectionClass}>
        <h2 className={sectionHead}>Facebook Integration</h2>
        <p className="text-xs text-brand-slate mb-4 leading-relaxed bg-blue-50 border border-blue-200 rounded p-3">
          📘 <strong>কীভাবে enable করবেন:</strong>
          <br />
          1. <strong>Facebook Page ID</strong> — আপনার Facebook Page এ যান → About → Page ID copy করুন।
          <br />
          2. <strong>Page Access Token</strong> — developers.facebook.com → Graph API Explorer → আপনার page সিলেক্ট → &quot;Get Page Access Token&quot; → তারপর &quot;Extend Access Token&quot; দিয়ে Long-lived Token নিন (60 দিন)।
          <br />
          3. <strong>App ID</strong> — developers.facebook.com → My Apps → আপনার App → Settings → Basic → App ID।
          <br />
          4. <strong>Pixel ID</strong> — business.facebook.com → Events Manager → Pixel ID copy করুন।
          <br />
          5. সব fill করে &quot;Auto-post blogs&quot; চেক করুন। নতুন blog approve করলে FB-তে যাবে।
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SinglePlain
            label="Facebook Page ID"
            name="fbPageId"
            value={data.fbPageId}
            onChange={onChange}
            placeholder="123456789012345"
          />
          <SinglePlain
            label="Facebook App ID"
            name="fbAppId"
            value={data.fbAppId}
            onChange={onChange}
            placeholder="987654321098765"
          />
          <div className="md:col-span-2">
            <label className="block">
              <span className={labelClass}>Page Access Token (long-lived)</span>
              <textarea
                name="fbPageAccessToken"
                value={data.fbPageAccessToken || ''}
                onChange={onChange}
                rows={2}
                className={inputClass + ' min-h-[60px] font-mono text-xs'}
                placeholder="EAAxxxxxxxxxx..."
              />
              <span className="text-[11px] text-brand-slate/70">
                🔒 এই token গোপনীয়। কাউকে শেয়ার করবেন না।
              </span>
            </label>
          </div>
          <SinglePlain
            label="Facebook Pixel ID (visitor tracking)"
            name="fbPixelId"
            value={data.fbPixelId}
            onChange={onChange}
            placeholder="1234567890"
          />
          <label className="flex items-center gap-2 pb-2">
            <input
              type="checkbox"
              name="fbAutoPostBlogs"
              checked={!!data.fbAutoPostBlogs}
              onChange={(e) => setData({ ...data, fbAutoPostBlogs: e.target.checked })}
            />
            <span className="text-sm font-semibold text-brand-navy">
              Auto-post blogs to Facebook (when approved)
            </span>
          </label>
        </div>

        <div className="mt-4 pt-4 border-t border-brand-tealLight/30">
          <p className={labelClass}>Messenger Chat Plugin (live chat on site)</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-2 pb-2">
              <input
                type="checkbox"
                name="fbMessengerEnabled"
                checked={!!data.fbMessengerEnabled}
                onChange={(e) =>
                  setData({ ...data, fbMessengerEnabled: e.target.checked })
                }
              />
              <span className="text-sm text-brand-navy">Show Messenger chat on site</span>
            </label>
            <SinglePlain
              label="Messenger Page ID (defaults to Facebook Page ID)"
              name="fbMessengerPageId"
              value={data.fbMessengerPageId}
              onChange={onChange}
            />
          </div>
          <p className="text-[11px] text-brand-slate/70 mt-1">
            💡 প্রথমে Facebook Business Suite-এ &quot;Domain&quot; whitelist করুন: inochieducation.com।
          </p>
        </div>
      </div>

      {/* ========= SEO / META ========= */}
      <div className={sectionClass}>
        <h2 className={sectionHead}>SEO &amp; Meta Tags</h2>
        <p className="text-xs text-brand-slate mb-4 leading-relaxed bg-amber-50 border border-amber-200 rounded p-3">
          🌐 <strong>সার্চ ইঞ্জিন ও Social share-এ যা দেখাবে:</strong>
          <br />
          1. <strong>Site title</strong> — Browser tab-এ ও Google search result-এ এটাই দেখাবে।
          <br />
          2. <strong>Site description</strong> — Google search result-এ title-এর নিচে যে ১-২ লাইন আসে।
          <br />
          3. <strong>Keywords</strong> — কমা দিয়ে আলাদা করে লিখুন (যেমন: <em>Japan study, JLPT, COE</em>)।
          <br />
          4. <strong>OG image</strong> — Facebook/WhatsApp-এ link share করলে যে preview ছবিটা আসবে।
          আদর্শ size: ১২০০×৬৩০ px।
          <br />
          5. খালি রাখলে built-in default value কাজ করবে।
        </p>
        <div className="space-y-4">
          <BilingualField
            label="Site title (browser tab + search result)"
            name="siteTitle"
            value={data.siteTitle}
            valueEn={data.siteTitleEn}
            onChange={onChange}
          />
          <BilingualField
            label="Site description (search result snippet)"
            name="siteDescription"
            value={data.siteDescription}
            valueEn={data.siteDescriptionEn}
            onChange={onChange}
            type="textarea"
            rows={3}
          />
          <SinglePlain
            label="Meta keywords (comma-separated)"
            name="metaKeywords"
            value={data.metaKeywords}
            onChange={onChange}
            placeholder="Japan study Bangladesh, JLPT Dhaka, COE Japan"
          />
          <ImageUploadField
            label="Social share image (Open Graph)"
            value={data.ogImageUrl}
            onChange={(url) => setData({ ...data, ogImageUrl: url })}
            hint="Facebook, WhatsApp, Twitter-এ link share করলে এই ছবি preview-তে আসবে। আদর্শ size 1200×630 px।"
          />
        </div>
      </div>

      {/* ========= BLOG OG PROMO BAND ========= */}
      <div className={sectionClass}>
        <h2 className={sectionHead}>Blog Share Image — Promo Banner</h2>
        <p className="text-xs text-brand-slate mb-4 leading-relaxed bg-emerald-50 border border-emerald-200 rounded p-3">
          🎨 <strong>প্রতিটা blog Facebook/WhatsApp/LinkedIn-এ share করলে cover image-এর নিচে এই promo banner দেখাবে।</strong>
          <br />
          1. <strong>Enable</strong> — checkbox বন্ধ করলে promo banner সরে যাবে, শুধু পরিষ্কার cover দেখাবে।
          <br />
          2. <strong>Text</strong> — যা banner-এ লিখা থাকবে। Comma এড়িয়ে চলুন (em-dash —, dot · বা hyphen - ব্যবহার করুন)।
          <br />
          3. <strong>Color</strong> — Hex code দিন (যেমন <code className="bg-white px-1 rounded">#0F2D52</code> Inochi navy)।
          <br />
          4. <strong>Font size + height</strong> — বড় text চাইলে font size বাড়ান, সাথে band height-ও বাড়ান যাতে কাটে না।
          <br />
          ✅ পরিবর্তন save করার পর Facebook share debugger-এ "Scrape Again" করলে নতুন banner আসবে।
        </p>
        <div className="space-y-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.blogOgPromoEnabled !== false}
              onChange={(e) =>
                setData({ ...data, blogOgPromoEnabled: e.target.checked })
              }
              className="h-4 w-4 rounded border-brand-tealLight/60 text-brand-teal focus:ring-brand-teal/40"
            />
            <span className="text-sm font-semibold text-brand-navy">
              Promo banner enable করুন
            </span>
          </label>

          <SinglePlain
            label="Banner text"
            name="blogOgPromoText"
            value={data.blogOgPromoText}
            onChange={onChange}
            placeholder="inochieducation.com — Japan Study Consultancy"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className={labelClass}>Band background color</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={data.blogOgPromoBandColor || '#0F2D52'}
                  onChange={(e) =>
                    setData({ ...data, blogOgPromoBandColor: e.target.value })
                  }
                  className="h-10 w-14 rounded border border-brand-tealLight/60 cursor-pointer"
                />
                <input
                  type="text"
                  name="blogOgPromoBandColor"
                  value={data.blogOgPromoBandColor || ''}
                  onChange={onChange}
                  placeholder="#0F2D52"
                  className={inputClass}
                />
              </div>
            </label>

            <label className="block">
              <span className={labelClass}>Text color</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={data.blogOgPromoTextColor || '#FFFFFF'}
                  onChange={(e) =>
                    setData({ ...data, blogOgPromoTextColor: e.target.value })
                  }
                  className="h-10 w-14 rounded border border-brand-tealLight/60 cursor-pointer"
                />
                <input
                  type="text"
                  name="blogOgPromoTextColor"
                  value={data.blogOgPromoTextColor || ''}
                  onChange={onChange}
                  placeholder="#FFFFFF"
                  className={inputClass}
                />
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="block">
              <span className={labelClass}>Font</span>
              <select
                name="blogOgPromoFont"
                value={data.blogOgPromoFont || 'Roboto'}
                onChange={onChange}
                className={inputClass}
              >
                <option value="Roboto">Roboto (modern, sans-serif)</option>
                <option value="Arial">Arial (system default)</option>
                <option value="Verdana">Verdana (wider)</option>
                <option value="Georgia">Georgia (serif)</option>
                <option value="Times">Times (classic serif)</option>
                <option value="Impact">Impact (bold display)</option>
              </select>
            </label>

            <label className="block">
              <span className={labelClass}>Font size (px)</span>
              <input
                type="number"
                name="blogOgPromoFontSize"
                value={data.blogOgPromoFontSize ?? 40}
                onChange={onChange}
                min="20"
                max="80"
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className={labelClass}>Band height (px)</span>
              <input
                type="number"
                name="blogOgPromoBandHeight"
                value={data.blogOgPromoBandHeight ?? 80}
                onChange={onChange}
                min="40"
                max="200"
                className={inputClass}
              />
            </label>
          </div>
        </div>
      </div>

      {/* ========= GOOGLE ========= */}
      <div className={sectionClass}>
        <h2 className={sectionHead}>Google Integration</h2>
        <p className="text-xs text-brand-slate mb-4 leading-relaxed bg-blue-50 border border-blue-200 rounded p-3">
          🔍 <strong>SEO + Analytics এর জন্য:</strong>
          <br />
          1. <strong>GA4 Tracking ID</strong> (G-XXXXXXXXXX) — analytics.google.com → Property → Data Streams → Web → Measurement ID।
          <br />
          2. <strong>Search Console verification</strong> — search.google.com/search-console → Add Property → HTML tag method → meta content value paste করুন।
          <br />
          3. <strong>GTM ID</strong> (optional, advanced) — tagmanager.google.com → Container ID।
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SinglePlain
            label="Google Analytics 4 Measurement ID"
            name="gaTrackingId"
            value={data.gaTrackingId}
            onChange={onChange}
            placeholder="G-XXXXXXXXXX"
          />
          <SinglePlain
            label="Google Search Console verification"
            name="googleSiteVerification"
            value={data.googleSiteVerification}
            onChange={onChange}
            placeholder="abc123xyz... (just the content value)"
          />
          <SinglePlain
            label="Google Tag Manager ID (optional)"
            name="googleTagManagerId"
            value={data.googleTagManagerId}
            onChange={onChange}
            placeholder="GTM-XXXXXX"
          />
          <SinglePlain
            label="Google rating (e.g. 4.8)"
            name="googleRating"
            type="number"
            step="0.1"
            min="0"
            max="5"
            value={data.googleRating}
            onChange={onChange}
            placeholder="4.8"
          />
          <SinglePlain
            label="Google review count (e.g. 50)"
            name="googleReviewCount"
            type="number"
            min="0"
            value={data.googleReviewCount}
            onChange={onChange}
            placeholder="50"
          />
        </div>
        <p className="mt-2 text-[11px] text-brand-slate/80">
          💡 rating + count দু'টোই সেট করলে Google search snippet-এ ⭐ দেখাবে (AggregateRating schema fire হবে)।
        </p>
      </div>

      {/* ========= OTHER SEARCH CONSOLES & DOMAIN VERIFICATION ========= */}
      <div className={sectionClass}>
        <h2 className={sectionHead}>Other Search Engines & Domain Verification</h2>
        <p className="text-xs text-brand-slate mb-4 leading-relaxed bg-blue-50 border border-blue-200 rounded p-3">
          🔐 <strong>Domain ownership tags:</strong> প্রতিটা platform-এ verify করতে গেলে একটা meta tag দেয় — সেটার <strong>content value</strong> এখানে paste করুন। Site root layout-এ auto inject হবে।
          <br />
          • <strong>Bing</strong>: bing.com/webmasters → Add Site → HTML Meta Tag → content value
          <br />
          • <strong>Yandex</strong>: webmaster.yandex.com → Add site → Meta tag → content value
          <br />
          • <strong>Facebook Domain</strong>: business.facebook.com → Brand Safety → Domains → Verify with Meta-tag
          <br />
          • <strong>Pinterest</strong>: pinterest.com/business → Claim website → Add HTML tag
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SinglePlain
            label="Bing Webmaster verification"
            name="bingSiteVerification"
            value={data.bingSiteVerification}
            onChange={onChange}
            placeholder="abc123... (content value only)"
          />
          <SinglePlain
            label="Yandex Webmaster verification"
            name="yandexSiteVerification"
            value={data.yandexSiteVerification}
            onChange={onChange}
            placeholder="abc123..."
          />
          <SinglePlain
            label="Facebook domain verification"
            name="fbDomainVerification"
            value={data.fbDomainVerification}
            onChange={onChange}
            placeholder="abc123..."
          />
          <SinglePlain
            label="Pinterest verification"
            name="pinterestSiteVerification"
            value={data.pinterestSiteVerification}
            onChange={onChange}
            placeholder="abc123..."
          />
        </div>
      </div>
    </form>
  );
};

export default SiteSettingsEdit;
