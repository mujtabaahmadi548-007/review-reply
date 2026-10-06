'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Save, Loader2, CheckCircle2 } from 'lucide-react';

interface Settings {
  id?: string;
  business_name: string;
  support_email: string;
  tone_preset: string;
  custom_instructions: string;
}

export function SettingsForm({ initialSettings }: { initialSettings: Settings | null }) {
  const [formData, setFormData] = useState<Settings>({
    business_name: initialSettings?.business_name || '',
    support_email: initialSettings?.support_email || '',
    tone_preset: initialSettings?.tone_preset || 'Professional',
    custom_instructions: initialSettings?.custom_instructions || '',
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const supabase = createClient();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg(null);
    setShowSuccess(false);

    try {
      if (initialSettings?.id) {
        const { error } = await supabase
          .from('business_settings')
          .update({
            business_name: formData.business_name,
            support_email: formData.support_email,
            tone_preset: formData.tone_preset,
            custom_instructions: formData.custom_instructions,
          })
          .eq('id', initialSettings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('business_settings')
          .insert({
            business_name: formData.business_name,
            support_email: formData.support_email,
            tone_preset: formData.tone_preset,
            custom_instructions: formData.custom_instructions,
          });
        if (error) throw error;
      }
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      router.refresh();
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      setErrorMsg(error.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 max-w-2xl flex flex-col gap-6">
      {errorMsg && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-100">
          {errorMsg}
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Business Name</label>
        <input 
          type="text" 
          value={formData.business_name}
          onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
          placeholder="e.g. Acme Corp"
          className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-slate-900"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Support Email</label>
        <input 
          type="email" 
          value={formData.support_email}
          onChange={(e) => setFormData({ ...formData, support_email: e.target.value })}
          placeholder="e.g. support@acme.com"
          className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-slate-900"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Tone Preset</label>
        <div className="grid grid-cols-2 gap-3">
          {['Professional', 'Friendly & Warm', 'Concise & Direct', 'Casual'].map((tone) => (
            <label key={tone} className={`
              flex items-center p-3 border rounded-md cursor-pointer transition-colors
              ${formData.tone_preset === tone ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-500' : 'border-slate-200 hover:bg-slate-50'}
            `}>
              <input 
                type="radio" 
                name="tone_preset" 
                value={tone}
                checked={formData.tone_preset === tone}
                onChange={(e) => setFormData({ ...formData, tone_preset: e.target.value })}
                className="sr-only"
              />
              <span className={`text-sm font-medium ${formData.tone_preset === tone ? 'text-blue-700' : 'text-slate-700'}`}>
                {tone}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Custom Sign-off / Instructions</label>
        <textarea 
          value={formData.custom_instructions}
          onChange={(e) => setFormData({ ...formData, custom_instructions: e.target.value })}
          placeholder="e.g., Sign off with: - The Management"
          rows={3}
          className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-slate-900 resize-none"
        />
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="flex-1">
          {showSuccess && (
            <div className="flex items-center gap-2 text-green-600 animate-in fade-in slide-in-from-left-4">
              <CheckCircle2 size={18} />
              <span className="text-sm font-medium">Settings saved successfully</span>
            </div>
          )}
        </div>
        <button 
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white font-medium rounded-md hover:bg-slate-800 transition-colors disabled:opacity-50 text-sm"
        >
          {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </form>
  );
}
