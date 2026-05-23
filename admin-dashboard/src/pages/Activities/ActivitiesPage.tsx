import React, { useState } from 'react';
import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, query, orderBy,
} from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { db } from '@shared/firebase/config';

interface Activity {
  id: string;
  title: string;
  provider: string;
  location: string;
  duration: string;
  price: string;
  category: string;
  description: string;
  imageUrl: string;
  bookingUrl: string;
  isActive: boolean;
  createdAt: any;
}

const CATEGORIES = [
  'Snorkeling', 'Diving', 'Fishing', 'Water Sports',
  'Island Tour', 'Sunset Cruise', 'Yoga', 'Cultural',
];

const EMPTY: Omit<Activity, 'id' | 'createdAt'> = {
  title: '', provider: '', location: '', duration: '',
  price: '', category: 'Snorkeling', description: '',
  imageUrl: '', bookingUrl: '', isActive: true,
};

const C = {
  teal: '#1CC7C1', ocean: '#0E7490', coral: '#FF7A59',
  sand: '#F8F4EC', green: '#2F855A', dark: '#0F172A',
  gray: '#64748B', light: '#F1F5F9', white: '#FFFFFF',
};

const s: Record<string, React.CSSProperties> = {
  page:        { padding: 32, fontFamily: 'Inter, sans-serif', color: C.dark },
  topRow:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  h1:          { fontSize: 26, fontWeight: 800, margin: 0 },
  addBtn:      { background: C.teal, color: '#fff', border: 'none', borderRadius: 12, padding: '10px 22px', fontSize: 14, fontWeight: 700, cursor: 'pointer' },
  filterRow:   { display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' as const },
  filterBtn:   { background: C.light, border: '1.5px solid transparent', borderRadius: 20, padding: '6px 16px', fontSize: 13, cursor: 'pointer', fontWeight: 500 },
  filterBtnA:  { background: C.teal + '20', borderColor: C.teal, color: C.teal },
  grid:        { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 },
  card:        { background: C.white, borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' },
  cardImg:     { width: '100%', height: 160, objectFit: 'cover' as const, background: C.light, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 },
  cardBody:    { padding: 16 },
  cardTitle:   { fontSize: 16, fontWeight: 700, marginBottom: 4 },
  cardMeta:    { fontSize: 12, color: C.gray, marginBottom: 8 },
  cardDesc:    { fontSize: 13, color: C.gray, marginBottom: 12, lineHeight: '1.5' },
  cardFooter:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  priceBadge:  { background: C.ocean + '15', color: C.ocean, borderRadius: 8, padding: '3px 10px', fontSize: 13, fontWeight: 700 },
  catBadge:    { background: C.teal + '15', color: C.teal, borderRadius: 8, padding: '3px 10px', fontSize: 12, fontWeight: 600 },
  actions:     { display: 'flex', gap: 8, marginTop: 12 },
  editBtn:     { flex: 1, background: C.ocean + '15', color: C.ocean, border: 'none', borderRadius: 8, padding: '7px 0', fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  delBtn:      { flex: 1, background: '#FFF5F5', color: C.coral, border: 'none', borderRadius: 8, padding: '7px 0', fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  toggleOn:    { background: C.green + '20', color: C.green, border: 'none', borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  toggleOff:   { background: '#F1F5F9', color: C.gray, border: 'none', borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  overlay:     { position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal:       { background: C.white, borderRadius: 20, padding: 32, width: 520, maxHeight: '90vh', overflowY: 'auto' as const, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
  modalTitle:  { fontSize: 20, fontWeight: 800, marginBottom: 24 },
  label:       { display: 'block', fontSize: 12, fontWeight: 600, color: C.gray, textTransform: 'uppercase' as const, letterSpacing: 0.6, marginBottom: 6, marginTop: 16 },
  input:       { width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${C.light}`, fontSize: 14, outline: 'none', boxSizing: 'border-box' as const },
  textarea:    { width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${C.light}`, fontSize: 14, outline: 'none', boxSizing: 'border-box' as const, minHeight: 80, resize: 'vertical' as const },
  select:      { width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${C.light}`, fontSize: 14, outline: 'none', background: C.white },
  row2:        { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  modalFooter: { display: 'flex', gap: 12, marginTop: 24 },
  saveBtn:     { flex: 1, background: C.teal, color: '#fff', border: 'none', borderRadius: 12, padding: '12px 0', fontSize: 15, fontWeight: 700, cursor: 'pointer' },
  cancelBtn:   { flex: 1, background: C.light, color: C.dark, border: 'none', borderRadius: 12, padding: '12px 0', fontSize: 15, fontWeight: 700, cursor: 'pointer' },
  emptyState:  { textAlign: 'center' as const, padding: '80px 20px', color: C.gray },
  confirmBox:  { position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 },
  confirmCard: { background: C.white, borderRadius: 16, padding: 28, width: 320, textAlign: 'center' as const },
};

const CATEGORY_EMOJI: Record<string, string> = {
  Snorkeling: '🤿', Diving: '🐠', Fishing: '🎣',
  'Water Sports': '🏄', 'Island Tour': '🏝', 'Sunset Cruise': '🌅',
  Yoga: '🧘', Cultural: '🎭',
};

export default function ActivitiesPage() {
  const [showModal, setShowModal]         = useState(false);
  const [editing, setEditing]             = useState<Activity | null>(null);
  const [form, setForm]                   = useState({ ...EMPTY });
  const [saving, setSaving]               = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [filterCat, setFilterCat]         = useState('All');

  const q = query(collection(db, 'activities'), orderBy('createdAt', 'desc'));
  const [activities = [], loading] = useCollectionData(q, { idField: 'id' }) as [Activity[], boolean, any];

  const f = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY });
    setShowModal(true);
  };

  const openEdit = (a: Activity) => {
    setEditing(a);
    setForm({
      title: a.title, provider: a.provider, location: a.location,
      duration: a.duration, price: a.price, category: a.category,
      description: a.description, imageUrl: a.imageUrl,
      bookingUrl: a.bookingUrl, isActive: a.isActive,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.provider) return;
    setSaving(true);
    try {
      if (editing) {
        await updateDoc(doc(db, 'activities', editing.id), { ...form, updatedAt: serverTimestamp() });
      } else {
        await addDoc(collection(db, 'activities'), { ...form, createdAt: serverTimestamp() });
      }
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'activities', id));
    setDeleteConfirm(null);
  };

  const toggleActive = async (a: Activity) =>
    updateDoc(doc(db, 'activities', a.id), { isActive: !a.isActive });

  const filtered = filterCat === 'All'
    ? activities
    : activities.filter((a) => a.category === filterCat);

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.topRow}>
        <div>
          <h1 style={s.h1}>🏄 Activities</h1>
          <p style={{ margin: '4px 0 0', color: C.gray, fontSize: 14 }}>
            {activities.length} activities · {activities.filter(a => a.isActive).length} active
          </p>
        </div>
        <button style={s.addBtn} onClick={openCreate}>+ Add Activity</button>
      </div>

      {/* Category filters */}
      <div style={s.filterRow}>
        {['All', ...CATEGORIES].map((cat) => (
          <button
            key={cat}
            style={{ ...s.filterBtn, ...(filterCat === cat ? s.filterBtnA : {}) }}
            onClick={() => setFilterCat(cat)}
          >
            {CATEGORY_EMOJI[cat] || ''} {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div style={s.emptyState}>Loading activities...</div>
      ) : filtered.length === 0 ? (
        <div style={s.emptyState}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🏝</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>No activities yet</div>
          <div style={{ marginTop: 6 }}>Add island activities for passengers to discover</div>
        </div>
      ) : (
        <div style={s.grid}>
          {filtered.map((a) => (
            <div key={a.id} style={{ ...s.card, opacity: a.isActive ? 1 : 0.6 }}>
              {/* Image / Emoji fallback */}
              {a.imageUrl ? (
                <img src={a.imageUrl} alt={a.title} style={s.cardImg as any} />
              ) : (
                <div style={s.cardImg as any}>
                  {CATEGORY_EMOJI[a.category] || '🏝'}
                </div>
              )}
              <div style={s.cardBody}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div style={s.cardTitle}>{a.title}</div>
                  <span style={s.catBadge}>{a.category}</span>
                </div>
                <div style={s.cardMeta}>
                  📍 {a.location || a.provider} · ⏱ {a.duration}
                </div>
                <div style={s.cardDesc}>{a.description}</div>
                <div style={s.cardFooter}>
                  <span style={s.priceBadge}>
                    {a.price ? `MVR ${a.price}` : 'Free'}
                  </span>
                  <button
                    style={a.isActive ? s.toggleOn : s.toggleOff}
                    onClick={() => toggleActive(a)}
                  >
                    {a.isActive ? '● Live' : '○ Hidden'}
                  </button>
                </div>
                <div style={s.actions}>
                  <button style={s.editBtn} onClick={() => openEdit(a)}>✏ Edit</button>
                  <button style={s.delBtn} onClick={() => setDeleteConfirm(a.id)}>🗑 Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div style={s.modal}>
            <div style={s.modalTitle}>{editing ? 'Edit Activity' : 'New Activity'}</div>

            <label style={s.label}>Title *</label>
            <input style={s.input} value={form.title} onChange={e => f('title', e.target.value)} placeholder="e.g. Reef Snorkeling Tour" />

            <div style={s.row2}>
              <div>
                <label style={s.label}>Provider *</label>
                <input style={s.input} value={form.provider} onChange={e => f('provider', e.target.value)} placeholder="Business name" />
              </div>
              <div>
                <label style={s.label}>Category</label>
                <select style={s.select} value={form.category} onChange={e => f('category', e.target.value)}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <label style={s.label}>Location</label>
            <input style={s.input} value={form.location} onChange={e => f('location', e.target.value)} placeholder="e.g. Thoddoo North Beach" />

            <div style={s.row2}>
              <div>
                <label style={s.label}>Duration</label>
                <input style={s.input} value={form.duration} onChange={e => f('duration', e.target.value)} placeholder="e.g. 2 hours" />
              </div>
              <div>
                <label style={s.label}>Price (MVR)</label>
                <input style={s.input} value={form.price} onChange={e => f('price', e.target.value)} placeholder="e.g. 350" />
              </div>
            </div>

            <label style={s.label}>Description</label>
            <textarea style={s.textarea} value={form.description} onChange={e => f('description', e.target.value)} placeholder="Brief description shown to passengers..." />

            <label style={s.label}>Image URL</label>
            <input style={s.input} value={form.imageUrl} onChange={e => f('imageUrl', e.target.value)} placeholder="https://..." />

            <label style={s.label}>Booking URL (optional)</label>
            <input style={s.input} value={form.bookingUrl} onChange={e => f('bookingUrl', e.target.value)} placeholder="https://..." />

            <label style={{ ...s.label, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.isActive} onChange={e => f('isActive', e.target.checked)} />
              Show in passenger app
            </label>

            <div style={s.modalFooter}>
              <button style={s.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
              <button style={{ ...s.saveBtn, opacity: saving ? 0.6 : 1 }} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Activity'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div style={s.confirmBox}>
          <div style={s.confirmCard}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🗑</div>
            <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>Delete Activity?</div>
            <div style={{ color: C.gray, fontSize: 13, marginBottom: 20 }}>This cannot be undone.</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={{ ...s.cancelBtn, flex: 1 }} onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button style={{ ...s.delBtn, flex: 1, padding: '10px 0', borderRadius: 10, fontSize: 14 }} onClick={() => handleDelete(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
