'use client';

import { useState } from 'react';
import { Star, Loader2, Sparkles, Send } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface ReviewCardProps {
  review: {
    id: string;
    author_name: string;
    rating: number;
    comment: string;
    status: string;
    created_at: string;
  };
  existingResponse?: string | null;
}

export function ReviewCard({ review, existingResponse }: ReviewCardProps) {
  const [status, setStatus] = useState(review.status);
  const [responseText, setResponseText] = useState(existingResponse || '');
  const [isDrafting, setIsDrafting] = useState(false);
  const [draft, setDraft] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const supabase = createClient();

  const handleDraftReply = async () => {
    setIsDrafting(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/generate-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId: review.id,
          authorName: review.author_name,
          rating: review.rating,
          comment: review.comment,
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || `Server error: ${res.status}`);
      }
      
      if (data.reply) {
        setDraft(data.reply);
      }
    } catch (error: any) {
      console.error('Failed to draft reply:', error);
      setErrorMsg(error.message || 'An unexpected error occurred while drafting the reply.');
    } finally {
      setIsDrafting(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    setErrorMsg(null);
    try {
      const { error: insertError } = await supabase
        .from('review_responses')
        .insert({ review_id: review.id, response_text: draft });
        
      if (insertError) throw insertError;

      const { error: updateError } = await supabase
        .from('reviews')
        .update({ status: 'published' })
        .eq('id', review.id);

      if (updateError) throw updateError;

      setResponseText(draft);
      setStatus('published');
      setDraft('');
    } catch (error: any) {
      console.error('Failed to publish:', error);
      setErrorMsg(error.message || 'Failed to publish response.');
    } finally {
      setIsPublishing(false);
    }
  };

  const isUnanswered = status === 'unanswered';
  const badgeColor = isUnanswered 
    ? 'bg-amber-100 text-amber-800 border-amber-200' 
    : 'bg-green-100 text-green-800 border-green-200';

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg text-slate-900">{review.author_name}</h3>
          <div className="flex gap-1 mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star}
                size={16}
                className={star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}
              />
            ))}
          </div>
        </div>
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${badgeColor}`}>
          {status}
        </span>
      </div>
      <p className="text-slate-700">{review.comment}</p>

      {responseText && (
        <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <p className="text-sm font-semibold text-slate-900 mb-1">Your Response</p>
          <p className="text-slate-700 text-sm whitespace-pre-wrap">{responseText}</p>
        </div>
      )}

      {isUnanswered && !responseText && (
        <div className="mt-2 border-t border-slate-100 pt-4">
          {!draft ? (
            <div className="flex flex-col gap-2 items-start">
              <button 
                onClick={handleDraftReply}
                disabled={isDrafting}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 font-medium rounded-md hover:bg-blue-100 transition-colors disabled:opacity-50 text-sm"
              >
                {isDrafting ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                {isDrafting ? 'Drafting...' : 'Draft AI Reply'}
              </button>
              {errorMsg && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-1.5 rounded border border-red-100">{errorMsg}</p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <textarea 
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-slate-800"
                rows={4}
              />
              {errorMsg && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-1.5 rounded border border-red-100">{errorMsg}</p>
              )}
              <div className="flex justify-end gap-2">
                <button 
                  onClick={() => { setDraft(''); setErrorMsg(null); }}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button 
                  onClick={handlePublish}
                  disabled={isPublishing || !draft.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white font-medium rounded-md hover:bg-slate-800 transition-colors disabled:opacity-50 text-sm"
                >
                  {isPublishing ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                  {isPublishing ? 'Publishing...' : 'Approve & Publish'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
