'use client';

import React, { useState, useEffect } from 'react';
import { TeacherProfile, User } from '@/types';
import { apiClient } from '@/lib/api-client';
import { motion } from 'framer-motion';

interface SettingsViewProps {
  teacherProfile: TeacherProfile | null;
  currentUser: User | null;
  onProfileUpdated: () => void;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  icon,
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  type?: string;
  icon: string;
  readOnly?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold uppercase tracking-widest text-outline flex items-center gap-1.5">
        <span className="material-symbols-outlined text-[14px]">{icon}</span>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary/40 transition-colors ${
          readOnly ? 'opacity-60 cursor-not-allowed' : ''
        }`}
      />
    </div>
  );
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  teacherProfile,
  currentUser,
  onProfileUpdated,
}) => {
  const [matiere, setMatiere] = useState('');
  const [classe, setClasse] = useState('');
  const [ecole, setEcole] = useState('');
  const [numero, setNumero] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Populate form from profile
  useEffect(() => {
    if (teacherProfile) {
      setMatiere(teacherProfile.matiere ?? '');
      setClasse(teacherProfile.classe ?? '');
      setEcole(teacherProfile.ecole ?? '');
      setNumero(teacherProfile.numero ?? '');
    }
  }, [teacherProfile]);

  const handleSave = async () => {
    if (!teacherProfile) return;
    setIsSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    try {
      await apiClient.put(`/teachers/${teacherProfile.id}`, {
        matiere: matiere.trim() || null,
        classe: classe.trim() || null,
        ecole: ecole.trim() || null,
        numero: numero.trim() || null,
      });
      setSaveSuccess(true);
      onProfileUpdated();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('[SettingsView] Save failed:', err);
      setSaveError('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const isDirty =
    matiere !== (teacherProfile?.matiere ?? '') ||
    classe !== (teacherProfile?.classe ?? '') ||
    ecole !== (teacherProfile?.ecole ?? '') ||
    numero !== (teacherProfile?.numero ?? '');

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div>
        <h2 className="font-headline text-3xl font-bold text-primary italic lowercase tracking-tight">
          Settings
        </h2>
        <p className="text-on-surface-variant text-sm">
          Manage your educator profile and clinical credentials
        </p>
      </div>

      {/* Identity Section (read-only) */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-6 space-y-5"
      >
        <p className="text-[10px] font-bold uppercase tracking-widest text-outline">
          Account Identity
        </p>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-2xl">person</span>
          </div>
          <div>
            <p className="font-headline font-bold text-on-surface text-lg">
              {currentUser?.nom ?? 'Educator'}
            </p>
            <p className="text-sm text-outline">{currentUser?.email ?? '—'}</p>
          </div>
          <span className="ml-auto px-3 py-1 bg-primary-container text-primary rounded-full text-[10px] font-bold uppercase tracking-wider">
            Enseignant
          </span>
        </div>
        <Field
          label="Email Address"
          value={currentUser?.email ?? ''}
          icon="mail"
          readOnly
        />
      </motion.div>

      {/* Professional Profile (editable) */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-6 space-y-5"
      >
        <p className="text-[10px] font-bold uppercase tracking-widest text-outline">
          Professional Details
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Subject (Matière)"
            value={matiere}
            onChange={setMatiere}
            placeholder="e.g. Mathematics"
            icon="school"
          />
          <Field
            label="Class (Classe)"
            value={classe}
            onChange={setClasse}
            placeholder="e.g. CM2"
            icon="class"
          />
          <Field
            label="School (École)"
            value={ecole}
            onChange={setEcole}
            placeholder="e.g. École Jean Moulin"
            icon="domain"
          />
          <Field
            label="Phone (Numéro)"
            value={numero}
            onChange={setNumero}
            placeholder="+33 6 00 00 00 00"
            type="tel"
            icon="phone"
          />
        </div>

        {/* Save Actions */}
        <div className="flex justify-between items-center pt-2 border-t border-outline-variant/10">
          {saveSuccess && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-success text-xs font-bold flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">check_circle</span>
              Profile saved successfully
            </motion.span>
          )}
          {saveError && (
            <span className="text-error text-xs">{saveError}</span>
          )}
          <span />

          <div className="flex gap-3 ml-auto">
            {isDirty && (
              <button
                onClick={() => {
                  setMatiere(teacherProfile?.matiere ?? '');
                  setClasse(teacherProfile?.classe ?? '');
                  setEcole(teacherProfile?.ecole ?? '');
                  setNumero(teacherProfile?.numero ?? '');
                }}
                className="px-4 py-2 rounded-xl border border-outline-variant/20 text-sm text-outline hover:bg-surface-container-low transition-colors"
              >
                Discard
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={!isDirty || isSaving}
              className="bg-primary text-on-primary px-6 py-2 rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-40 transition-all flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <span className="material-symbols-outlined text-sm animate-spin">
                    progress_activity
                  </span>
                  Saving…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">save</span>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
