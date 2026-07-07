import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfilesStore } from '../stores/profiles.store';
import type { Profile, ProfileFormData } from '../types/profile';
import { LEVELS, LEVEL_LABELS } from '../constants/levels';

const AVATARS = ['🎓', '🌟', '🐱', '🦊', '🐼', '🦁', '🐯', '🐸'];

export function ProfilesPage() {
  const navigate = useNavigate();
  const { profiles, activeProfile, loadProfiles, createProfile, updateProfile, deleteProfile, selectProfile } = useProfilesStore();
  const [showForm, setShowForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({ name: '', level: '1_ابتدائي', avatar: AVATARS[0] });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadProfiles();
  }, []);

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;
    try {
      if (editingProfile) {
        await updateProfile(editingProfile.id, formData);
      } else {
        await createProfile(formData);
      }
      resetForm();
    } catch (err) {
      console.error('Failed to save profile:', err);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingProfile(null);
    setFormData({ name: '', level: '1_ابتدائي', avatar: AVATARS[0] });
  };

  const startEdit = (profile: Profile) => {
    setEditingProfile(profile);
    setFormData({ name: profile.name, level: profile.level, avatar: profile.avatar || AVATARS[0] });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProfile(id);
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete profile:', err);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          الملفات الشخصية
        </h1>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => { resetForm(); setShowForm(true); }}
        >
          + إضافة ملف
        </button>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="card" style={{ animation: 'fadeIn 0.3s ease', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            {editingProfile ? 'تعديل الملف الشخصي' : 'إنشاء ملف شخصي جديد'}
          </h2>

          <div>
            <label className="label" style={{ fontSize: '0.9rem', marginBottom: '4px' }}>
              الاسم
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              placeholder="اسم الطالب"
              dir="rtl"
            />
          </div>

          <div>
            <label className="label" style={{ fontSize: '0.9rem', marginBottom: '4px' }}>
              المستوى
            </label>
            <select
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
              className="input"
              dir="rtl"
            >
              {LEVELS.map((level) => (
                <option key={level} value={level}>{LEVEL_LABELS[level]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" style={{ fontSize: '0.9rem', marginBottom: '8px' }}>
              الصورة الرمزية
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {AVATARS.map((avatar) => (
                <button
                  key={avatar}
                  onClick={() => setFormData({ ...formData, avatar })}
                  style={{
                    width: '48px',
                    height: '48px',
                    fontSize: '1.5rem',
                    borderRadius: 'var(--radius-md)',
                    border: formData.avatar === avatar
                      ? '2px solid var(--accent-primary)'
                      : '2px solid var(--border-default)',
                    background: formData.avatar === avatar
                      ? 'var(--nav-active-bg)'
                      : 'var(--surface-card)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    transform: formData.avatar === avatar ? 'scale(1.1)' : 'none',
                  }}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
            <button className="btn btn-primary" onClick={handleSubmit}>
              {editingProfile ? 'حفظ التعديلات' : 'إنشاء'}
            </button>
            <button className="btn btn-ghost" onClick={resetForm}>
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {profiles.length === 0 && !showForm && (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.95rem', margin: 0 }}>
            لا يوجد أي ملف شخصي بعد
          </p>
        </div>
      )}

      {/* Profile list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {profiles.map((profile) => (
          <div
            key={profile.id}
            className="card"
            style={{
              padding: '16px',
              border: activeProfile?.id === profile.id
                ? '2px solid var(--accent-primary)'
                : '1px solid var(--border-default)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.75rem' }}>{profile.avatar || '👤'}</span>
                <div>
                  <h3 style={{ fontWeight: 600, color: 'var(--text-primary)', margin: 0, fontSize: '1rem' }}>
                    {profile.name}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', margin: '2px 0 0 0' }}>
                    {LEVEL_LABELS[profile.level]}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {activeProfile?.id !== profile.id && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => selectProfile(profile.id)}
                  >
                    اختيار
                  </button>
                )}
                <button
                  className="btn-icon"
                  onClick={() => startEdit(profile)}
                  title="تعديل"
                >
                  ✏️
                </button>
                <button
                  className="btn-icon"
                  onClick={() => setDeleteConfirm(profile.id)}
                  title="حذف"
                >
                  🗑️
                </button>
              </div>
            </div>

            {activeProfile?.id === profile.id && (
              <div style={{ marginTop: '8px' }}>
                <span className="badge badge-success">نشط</span>
              </div>
            )}

            {deleteConfirm === profile.id && (
              <div style={{
                marginTop: '10px',
                paddingTop: '10px',
                borderTop: '1px solid var(--border-light)',
                animation: 'fadeIn 0.3s ease',
              }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0 0 8px 0' }}>
                  هل أنت متأكد من حذف هذا الملف؟ سيتم حذف جميع البيانات المرتبطة به.
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleDelete(profile.id)}
                  >
                    تأكيد الحذف
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setDeleteConfirm(null)}
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
