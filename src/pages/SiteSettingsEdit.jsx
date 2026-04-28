import { useEffect, useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';
import BilingualField from '../components/BilingualField';

const labelClass = 'block text-xs font-semibold text-brand-navy mb-1';
const inputClass =
  'w-full px-3 py-2 text-sm border border-brand-tealLight/60 rounded focus:outline-none focus:ring-2 focus:ring-brand-teal/40 bg-white';
const sectionClass = 'bg-white rounded-xl border border-brand-tealLight/40 shadow-sm p-5';
const sectionHead =
  'text-sm font-bold text-brand-navy uppercase tracking-wide mb-4 pb-2 border-b border-brand-tealLight/40';

const SinglePlain = ({ label, name, value, onChange, placeholder = '' }) => (
  <label className="block">
    <span className={labelClass}>{label}</span>
    <input
      type="text"
      name={name}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
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
    <form onSubmit={submit} className="space-y-5 max-w-6xl">
      <div className="flex items-center justify-between sticky top-0 z-10 bg-brand-tealLight/10 -mx-6 px-6 py-3 backdrop-blur">
        <div>
          <h1 className="text-xl font-extrabold text-brand-navy">Site Settings</h1>
          <p className="text-xs text-brand-slate">
            Hero, stats, contact info — site-wide content. Edit BN + EN side by side.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {msg && <span className="text-sm font-semibold text-brand-teal">{msg}</span>}
          <button
            type="submit"
            disabled={saving}
            className="bg-brand-teal hover:bg-brand-navy disabled:opacity-50 text-white font-semibold px-5 py-2 rounded transition-colors"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className={sectionClass}>
        <h2 className={sectionHead}>Hero Section</h2>
        <div className="space-y-4">
          <BilingualField label="Eyebrow text" name="heroEyebrow" value={data.heroEyebrow} valueEn={data.heroEyebrowEn} onChange={onChange} />
          <SinglePlain label="Japanese title (日本語)" name="heroTitleJp" value={data.heroTitleJp} onChange={onChange} />
          <BilingualField label="Main title" name="heroTitle" value={data.heroTitle} valueEn={data.heroTitleEn} onChange={onChange} />
          <BilingualField label="Subtitle" name="heroSubtitle" value={data.heroSubtitle} valueEn={data.heroSubtitleEn} onChange={onChange} type="textarea" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BilingualField label="Primary CTA text" name="heroCtaPrimary" value={data.heroCtaPrimary} valueEn={data.heroCtaPrimaryEn} onChange={onChange} />
            <SinglePlain label="Primary CTA link" name="heroCtaPrimaryLink" value={data.heroCtaPrimaryLink} onChange={onChange} placeholder="/bookseminer" />
            <BilingualField label="Secondary CTA text" name="heroCtaSecondary" value={data.heroCtaSecondary} valueEn={data.heroCtaSecondaryEn} onChange={onChange} />
            <SinglePlain label="Secondary CTA link" name="heroCtaSecondaryLink" value={data.heroCtaSecondaryLink} onChange={onChange} />
          </div>
          <SinglePlain label="Hero background image URL" name="heroBackgroundUrl" value={data.heroBackgroundUrl} onChange={onChange} placeholder="https://…" />
        </div>

        <div className="mt-5">
          <p className={labelClass}>Hero badges</p>
          <div className="space-y-2">
            {(data.heroBadges || []).map((b, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-7 gap-2 items-end">
                <input
                  type="text"
                  placeholder="Value"
                  value={b.value || ''}
                  onChange={(e) => onBadgeChange(idx, 'value', e.target.value)}
                  className={inputClass + ' md:col-span-1'}
                />
                <input
                  type="text"
                  placeholder="🇧🇩 Label (Bangla)"
                  value={b.label || ''}
                  onChange={(e) => onBadgeChange(idx, 'label', e.target.value)}
                  className={inputClass + ' md:col-span-3'}
                />
                <input
                  type="text"
                  placeholder="🇺🇸 Label (English)"
                  value={b.labelEn || ''}
                  onChange={(e) => onBadgeChange(idx, 'labelEn', e.target.value)}
                  className={inputClass + ' md:col-span-2'}
                />
                <button
                  type="button"
                  onClick={() => removeBadge(idx)}
                  className="text-red-500 hover:text-red-700 font-bold"
                >
                  ✕
                </button>
              </div>
            ))}
            <button type="button" onClick={addBadge} className="text-sm text-brand-teal hover:text-brand-navy font-semibold">
              + Add badge
            </button>
          </div>
        </div>
      </div>

      <div className={sectionClass}>
        <h2 className={sectionHead}>Stats Counter (4 numbers)</h2>
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
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SinglePlain label="Govt. registration number" name="govLicense" value={data.govLicense} onChange={onChange} />
            <SinglePlain label="BAIRA membership number" name="bairaNumber" value={data.bairaNumber} onChange={onChange} />
          </div>
          <BilingualField label="Trust note (italic line)" name="trustNote" value={data.trustNote} valueEn={data.trustNoteEn} onChange={onChange} />
        </div>
      </div>

      <div className={sectionClass}>
        <h2 className={sectionHead}>Contact Info</h2>
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
          <SinglePlain label="Google Maps embed URL" name="mapEmbedUrl" value={data.mapEmbedUrl} onChange={onChange} />
        </div>
      </div>

      <div className={sectionClass}>
        <h2 className={sectionHead}>Social Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SinglePlain label="Facebook URL" name="facebookUrl" value={data.facebookUrl} onChange={onChange} />
          <SinglePlain label="YouTube URL" name="youtubeUrl" value={data.youtubeUrl} onChange={onChange} />
          <SinglePlain label="Instagram URL" name="instagramUrl" value={data.instagramUrl} onChange={onChange} />
          <SinglePlain label="TikTok URL" name="tiktokUrl" value={data.tiktokUrl} onChange={onChange} />
        </div>
      </div>

      <div className={sectionClass}>
        <h2 className={sectionHead}>About Section</h2>
        <div className="space-y-4">
          <BilingualField label="Heading" name="aboutHeading" value={data.aboutHeading} valueEn={data.aboutHeadingEn} onChange={onChange} />
          <BilingualField label="Body" name="aboutBody" value={data.aboutBody} valueEn={data.aboutBodyEn} onChange={onChange} type="textarea" rows={5} />
          <SinglePlain label="Image URL" name="aboutImageUrl" value={data.aboutImageUrl} onChange={onChange} />
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
        </div>
      </div>
    </form>
  );
};

export default SiteSettingsEdit;
