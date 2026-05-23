import React, { useState } from 'react';
import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, query, orderBy,
} from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { db } from '@shared/firebase/config';

interface Event {
  id: string;
  title: string;
  venue: string;
  date: string;
  time: string;
  category: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: any;
}

const CATEGORIES = ['Nightlife', 'Pool', 'Water', 'Entertainment', 'Beach', 'Music'];

const EMPTY_EVENT = {
  title: '', venue: '', date: '', time: '',
  category: 'Nightlife', description: '', imageUrl: '', isActive: true,
};

export default function EventsPage() {
  const [showModal, setShowModal]   = useState(false);
  const [editing, setEditing]       = useState<Event | null>(null);
  const [form, setForm]             = useState(EMPTY_EVENT);
  const [saving, setSaving]         = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const q = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
  const [events = [], loading] = useCollectionData(q, { idField: 'id' }) as [Event[], boolean, any];

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_EVENT);
    setShowModal(true);
  };

  const openEdit = (ev: Event) => {
    setEditing(ev);
    setForm({
      title: ev.title, venue: ev.venue, date: ev.date,
      time: ev.time, category: ev.category, description: ev.description,
      imageUrl: ev.imageUrl, isActive: ev.isActive,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.venue || !form.date) return;
    setSaving(true);
    try {
      if (editing) {
        await updateDoc(doc(db, 'events', editing.id), { ...form, updatedAt: serverTimestamp() });
      } else {
        await addDoc(collection(db, 'events'), { ...form, createdAt: serverTimestamp() });
      }
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'events', id));
    setDeleteConfirm(null);
  };

  const toggleActive = async (ev: Event) => {
    await updateDoc(doc(db, 'events', ev.id), { isActive: !ev.isActive });
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Events</h1>
          <p style={styles.subtitle}>Manage events shown in the passenger app</p>
        </div>
        <button style={styles.createBtn} onClick={openCreate}>+ Create Event</button>
      </div>

      {/* Stats */}
      <div style={styles.statsRow}>
        <StatCard label="Total Events"  value={events.length}                       color="#0E7490" />
        <StatCard label="Active"        value={events.filter((e) => e.isActive).length} color="#2F855A" />
        <StatCard label="Tonight"       value={events.filter((e) => e.date === new Date().toISOString().slice(0,10)).length} color="#FF7A59" />
      </div>

      {/* Events grid */}
      {loading ? (
        <p style={{ color: '#64748b' }}>Loading events…</p>
      ) : (
        <div style={styles.grid}>
          {events.map((ev) => (
            <div key={ev.id} style={styles.card}>
              {/* Image */}
              <div style={{ ...styles.cardImage, backgroundImage: ev.imageUrl ? `url(${ev.imageUrl})` : undefined }}>
                <span style={{ fontSize: 40 }}>
                  {ev.category === 'Nightlife' ? '🎧' : ev.category === 'Pool' ? '🏊' : '🎉'}
                </span>
                <span style={{ ...styles.badge, backgroundColor: ev.isActive ? '#D1FAE5' : '#FEE2E2', color: ev.isActive ? '#065F46' : '#991B1B' }}>
                  {ev.isActive ? 'Active' : 'Hidden'}
                </span>
              </div>

              {/* Info */}
              <div style={styles.cardBody}>
                <span style={styles.category}>{ev.category}</span>
                <h3 style={styles.cardTitle}>{ev.title}</h3>
                <p style={styles.cardVenue}>📍 {ev.venue}</p>
                <p style={styles.cardDate}>📅 {ev.date} · {ev.time}</p>
                <p style={styles.cardDesc}>{ev.description}</p>
              </div>

              {/* Actions */}
              <div style={styles.cardActions}>
                <button style={styles.editBtn} onClick={() => openEdit(ev)}>Edit</button>
                <button style={styles.toggleBtn} onClick={() => toggleActive(ev)}>
                  {ev.isActive ? 'Hide' : 'Show'}
                </button>
                <button style={styles.deleteBtn} onClick={() => setDeleteConfirm(ev.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div style={styles.overlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>{editing ? 'Edit Event' : 'Create Event'}</h2>

            <div style={styles.formGrid}>
              <FormField label="Event Title *" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="e.g. Karaoke Night" />
              <FormField label="Venue *"       value={form.venue} onChange={(v) => setForm({ ...form, venue: v })} placeholder="e.g. Thilana Lounge" />
              <FormField label="Date *"        value={form.date}  onChange={(v) => setForm({ ...form, date: v })}  type="date" />
              <FormField label="Time"          value={form.time}  onChange={(v) => setForm({ ...form, time: v })}  placeholder="e.g. 9:00 PM" />
              <FormField label="Image URL"     value={form.imageUrl} onChange={(v) => setForm({ ...form, imageUrl: v })} placeholder="https://..." />

              <div style={styles.formField}>
                <label style={styles.formLabel}>Category</label>
                <select
                  style={styles.formSelect}
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div style={styles.formField}>
              <label style={styles.formLabel}>Description</label>
              <textarea
                style={{ ...styles.formInput, height: 80, resize: 'vertical' } as any}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the event…"
              />
            </div>

            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
              <button style={styles.saveBtn} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : editing ? 'Update Event' : 'Create Event'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div style={styles.overlay}>
          <div style={{ ...styles.modal, maxWidth: 400 }}>
            <h3 style={{ margin: '0 0 12px', color: '#1e293b' }}>Delete event?</h3>
            <p style={{ color: '#64748b', marginBottom: 24 }}>This cannot be undone.</p>
            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button style={{ ...styles.saveBtn, background: '#EF4444' }} onClick={() => handleDelete(deleteConfirm!)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, padding: '16px 20px', flex: 1, borderLeft: `4px solid ${color}` }}>
      <div style={{ fontSize: 28, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{label}</div>
    </div>
  );
}

function FormField({ label, value, onChange, placeholder, type = 'text' }: any) {
  return (
    <div style={styles.formField}>
      <label style={styles.formLabel}>{label}</label>
      <input
        style={styles.formInput}
        type={type} value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page:       { padding: '32px 40px' },
  header:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  title:      { margin: 0, fontSize: 26, fontWeight: 800, color: '#0f172a' },
  subtitle:   { margin: '4px 0 0', color: '#64748b', fontSize: 14 },
  createBtn:  {
    background: 'linear-gradient(135deg, #1CC7C1, #0E7490)',
    color: '#fff', border: 'none', borderRadius: 12,
    padding: '10px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer',
  },
  statsRow:   { display: 'flex', gap: 16, marginBottom: 32 },
  grid:       { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 },
  card:       { background: '#fff', borderRadius: 18, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' },
  cardImage:  {
    height: 120, background: 'linear-gradient(135deg, #0E7490, #1CC7C1)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative', backgroundSize: 'cover', backgroundPosition: 'center',
  },
  badge:      {
    position: 'absolute', top: 10, right: 10,
    padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
  },
  cardBody:   { padding: 16 },
  category:   { fontSize: 11, fontWeight: 700, color: '#1CC7C1', textTransform: 'uppercase', letterSpacing: 0.8 },
  cardTitle:  { margin: '4px 0', fontSize: 16, fontWeight: 800, color: '#0f172a' },
  cardVenue:  { margin: 0, fontSize: 13, color: '#64748b' },
  cardDate:   { margin: '4px 0', fontSize: 13, color: '#64748b' },
  cardDesc:   { margin: '8px 0 0', fontSize: 12, color: '#94a3b8', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as any,
  cardActions:{ display: 'flex', gap: 8, padding: '12px 16px', borderTop: '1px solid #F1F5F9' },
  editBtn:    { flex: 1, padding: '8px 0', borderRadius: 8, border: '1px solid #E2E8F0', background: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', color: '#0E7490' },
  toggleBtn:  { flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', background: '#F0FFFE', fontWeight: 600, fontSize: 13, cursor: 'pointer', color: '#0E7490' },
  deleteBtn:  { padding: '8px 14px', borderRadius: 8, border: 'none', background: '#FFF5F5', fontWeight: 600, fontSize: 13, cursor: 'pointer', color: '#EF4444' },

  overlay:    { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal:      { background: '#fff', borderRadius: 20, padding: 32, width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto' },
  modalTitle: { margin: '0 0 24px', fontSize: 20, fontWeight: 800, color: '#0f172a' },
  formGrid:   { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' },
  formField:  { marginBottom: 16 },
  formLabel:  { display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6, letterSpacing: 0.5, textTransform: 'uppercase' },
  formInput:  { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 14, color: '#0f172a', outline: 'none', boxSizing: 'border-box' } as any,
  formSelect: { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 14, color: '#0f172a', outline: 'none', background: '#fff' },
  modalFooter:{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 },
  cancelBtn:  { padding: '10px 20px', borderRadius: 10, border: '1.5px solid #E2E8F0', background: '#fff', fontWeight: 600, cursor: 'pointer', color: '#64748b' },
  saveBtn:    { padding: '10px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #1CC7C1, #0E7490)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14 },
};
