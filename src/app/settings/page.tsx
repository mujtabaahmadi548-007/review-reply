import { createClient } from '@/lib/supabase/server';
import { SettingsForm } from '@/components/SettingsForm';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('business_settings')
    .select('*')
    .limit(1)
    .maybeSingle();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-slate-900">AI Tone Settings</h1>
      
      {error && error.code !== 'PGRST205' && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-100 max-w-2xl">
          Warning: Could not load existing settings ({error.message})
        </div>
      )}
      
      {error?.code === 'PGRST205' && (
        <div className="mb-6 p-4 bg-amber-50 text-amber-800 rounded-md border border-amber-200 max-w-2xl">
          <p className="font-semibold">Database Setup Required</p>
          <p className="text-sm mt-1">
            The <code>business_settings</code> table does not exist yet in your remote database. 
            Please run the SQL migration to create it before saving settings.
          </p>
        </div>
      )}

      <SettingsForm initialSettings={data} />
    </div>
  );
}
