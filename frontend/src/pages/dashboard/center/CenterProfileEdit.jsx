import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiUpload, FiMapPin, FiSave } from 'react-icons/fi';
import { centerAPI, uploadAPI } from '../../../api/index';
import useMyCenter from '../../../hooks/useMyCenter';
import { SUBJECTS, getCurrentLocation } from '../../../utils/helpers';
import GoogleMapView from '../../../components/maps/GoogleMapView';
import CreateCenterForm from './CreateCenterForm';

const CenterProfileEdit = () => {
  const { t } = useTranslation();
  const { center, loading, refresh } = useMyCenter();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (center) {
      setForm({
        name: center.name || '',
        description: center.description || '',
        phone: center.phone || '',
        email: center.email || '',
        website: center.website || '',
        subjects: center.subjects || [],
        latitude: center.location?.coordinates?.[1]?.toString() || '',
        longitude: center.location?.coordinates?.[0]?.toString() || '',
        address: {
          street: center.address?.street || '',
          city: center.address?.city || '',
          country: center.address?.country || 'Morocco',
        },
        priceRange: center.priceRange || { min: 0, max: 0 },
        logo: center.logo || '',
        coverImage: center.coverImage || '',
      });
    }
  }, [center]);

  if (loading) return <div className="animate-pulse h-64 bg-muted rounded-xl" />;
  if (!center) return <CreateCenterForm onCreated={refresh} />;
  if (!form) return null;

  const toggleSubject = (s) => {
    setForm((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(s)
        ? prev.subjects.filter((x) => x !== s)
        : [...prev.subjects, s],
    }));
  };

  const useMyLocation = async () => {
    const loc = await getCurrentLocation();
    setForm((prev) => ({
      ...prev,
      latitude: loc.lat.toFixed(6),
      longitude: loc.lng.toFixed(6),
    }));
  };

  const handleImageUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(field);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const { data } = await uploadAPI.image(fd);
      setForm((prev) => ({ ...prev, [field]: data.url }));
    } catch {
      alert(t('dashboard.center.profileEdit.uploadFailed'));
    } finally {
      setUploading('');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await centerAPI.update(center._id, form);
      setMessage(t('dashboard.center.profileEdit.saved'));
      refresh();
    } catch (err) {
      setMessage(err.response?.data?.message || t('dashboard.center.profileEdit.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('dashboard.center.profileEditPage.title')}</h1>

      {message && (
        <div className={`p-3 rounded-lg mb-4 text-sm ${message.includes('success') ? 'bg-accent text-accent-foreground' : 'bg-destructive-muted text-destructive-muted-foreground'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Images */}
        <div className="card p-6">
          <h2 className="font-semibold mb-4">{t('dashboard.center.profileEditPage.images')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">{t('dashboard.center.profileEditPage.logo')}</p>
              <div className="flex items-center gap-4">
                {form.logo ? (
                  <img src={form.logo} alt="Logo" className="w-20 h-20 rounded-xl object-cover border" />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">{t('dashboard.center.profileEditPage.logo')}</div>
                )}
                <label className="btn-secondary cursor-pointer flex items-center gap-2 text-sm">
                  <FiUpload /> {uploading === 'logo' ? t('dashboard.center.profileEditPage.uploading') : t('dashboard.center.profileEditPage.upload')}
                  <input type="file" accept="image/*" className="hidden"
                    onChange={(e) => handleImageUpload(e, 'logo')} />
                </label>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">{t('dashboard.center.profileEditPage.coverImage')}</p>
              <div className="flex items-center gap-4">
                {form.coverImage ? (
                  <img src={form.coverImage} alt="Cover" className="w-32 h-20 rounded-xl object-cover border" />
                ) : (
                  <div className="w-32 h-20 rounded-xl bg-muted flex items-center justify-center text-muted-foreground text-xs">{t('dashboard.center.profileEditPage.cover')}</div>
                )}
                <label className="btn-secondary cursor-pointer flex items-center gap-2 text-sm">
                  <FiUpload /> {uploading === 'coverImage' ? t('dashboard.center.profileEditPage.uploading') : t('dashboard.center.profileEditPage.upload')}
                  <input type="file" accept="image/*" className="hidden"
                    onChange={(e) => handleImageUpload(e, 'coverImage')} />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Basic info */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold">{t('dashboard.center.profileEditPage.basicInfo')}</h2>
          <input required className="input-field" placeholder={t('dashboard.center.profileEdit.centerName')} value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <textarea required className="input-field" rows={4} placeholder={t('dashboard.center.profileEdit.description')} value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input className="input-field" placeholder={t('dashboard.center.profileEdit.phone')} value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input className="input-field" placeholder={t('dashboard.center.profileEdit.email')} value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <input className="input-field" placeholder={t('dashboard.center.profileEdit.website')} value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })} />
        </div>

        {/* Address */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold">{t('dashboard.center.profileEditPage.address')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input className="input-field" placeholder={t('dashboard.center.profileEdit.street')} value={form.address.street}
              onChange={(e) => setForm({ ...form, address: { ...form.address, street: e.target.value } })} />
            <input className="input-field" placeholder={t('dashboard.center.profileEdit.neighborhood')} value={form.address.neighborhood || ''}
              onChange={(e) => setForm({ ...form, address: { ...form.address, neighborhood: e.target.value } })} />
            <input className="input-field" placeholder={t('dashboard.center.profileEdit.city')} value={form.address.city}
              onChange={(e) => setForm({ ...form, address: { ...form.address, city: e.target.value } })} />
          </div>
        </div>

        {/* Subjects */}
        <div className="card p-6">
          <h2 className="font-semibold mb-3">{t('dashboard.center.profileEditPage.subjects')}</h2>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map((s) => (
              <button key={s} type="button" onClick={() => toggleSubject(s)}
                className={`px-3 py-1 rounded-full text-sm border ${
                  form.subjects.includes(s) ? 'bg-accent border-primary text-accent-foreground' : 'border-border'
                }`}>{s}</button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{t('dashboard.center.profileEditPage.gpsLocation')}</h2>
            <button type="button" onClick={useMyLocation} className="text-sm text-primary flex items-center gap-1">
              <FiMapPin /> {t('dashboard.center.profileEditPage.useMyLocation')}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input className="input-field" placeholder={t('dashboard.center.createForm.latitude')} value={form.latitude}
              onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
            <input className="input-field" placeholder={t('dashboard.center.createForm.longitude')} value={form.longitude}
              onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
          </div>
          {form.latitude && form.longitude && (
            <GoogleMapView
              center={{
                ...center,
                location: {
                  coordinates: [parseFloat(form.longitude), parseFloat(form.latitude)],
                },
              }}
              height="250px"
            />
          )}
        </div>

        {/* Price range */}
        <div className="card p-6">
          <h2 className="font-semibold mb-4">{t('dashboard.center.profileEditPage.priceRange')}</h2>
          <div className="grid grid-cols-2 gap-4">
            <input type="number" min="0" className="input-field" placeholder={t('dashboard.center.profileEditPage.min')} value={form.priceRange.min}
              onChange={(e) => setForm({ ...form, priceRange: { ...form.priceRange, min: Number(e.target.value) } })} />
            <input type="number" min="0" className="input-field" placeholder={t('dashboard.center.profileEditPage.max')} value={form.priceRange.max}
              onChange={(e) => setForm({ ...form, priceRange: { ...form.priceRange, max: Number(e.target.value) } })} />
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
          <FiSave /> {saving ? t('dashboard.center.profileEditPage.saving') : t('dashboard.center.profileEditPage.saveChanges')}
        </button>
      </form>
    </div>
  );
};

export default CenterProfileEdit;
