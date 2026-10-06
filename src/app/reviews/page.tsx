import { createClient } from '@/lib/supabase/server';
import { ReviewCard } from '@/components/ReviewCard';
import { NewReviewForm } from '@/components/NewReviewForm';

export const dynamic = 'force-dynamic';

export default async function ReviewsPage() {
  const supabase = await createClient();
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('*, review_responses(response_text)')
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Reviews</h1>
          <NewReviewForm />
        </div>
        <div className="p-4 bg-red-50 text-red-700 rounded-md">
          Error loading reviews: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Reviews</h1>
        <NewReviewForm />
      </div>
      <div className="grid gap-4 max-w-4xl">
        {reviews?.map((review) => {
          const responseText = review.review_responses?.[0]?.response_text || null;
          return <ReviewCard key={review.id} review={review} existingResponse={responseText} />;
        })}
        {reviews?.length === 0 && (
          <p className="text-slate-500">No reviews found.</p>
        )}
      </div>
    </div>
  );
}
