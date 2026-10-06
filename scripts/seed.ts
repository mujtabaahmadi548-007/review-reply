import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const reviews = [
    {
      author_name: 'Alice Smith',
      rating: 5,
      comment: 'Excellent service and friendly staff! Highly recommended.',
      status: 'unanswered',
    },
    {
      author_name: 'Bob Jones',
      rating: 5,
      comment: 'I absolutely love this place. Will be coming back again.',
      status: 'unanswered',
    },
    {
      author_name: 'Charlie Brown',
      rating: 3,
      comment: 'It was okay. Nothing special but not terrible either.',
      status: 'unanswered',
    },
    {
      author_name: 'David Lee',
      rating: 1,
      comment: 'Terrible experience. The wait times were ridiculously long.',
      status: 'unanswered',
    },
    {
      author_name: 'Eve Davis',
      rating: 1,
      comment: 'Rude customer service and poor quality. Avoid at all costs.',
      status: 'unanswered',
    }
  ];

  const { data, error } = await supabase.from('reviews').insert(reviews).select();

  if (error) {
    console.error('Error inserting reviews:', error);
  } else {
    console.log('Successfully inserted 5 reviews:', data?.length);
  }
}

main();
