import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { CultTokenMetadata } from '~~/types/types';

// Type definition for your data.  Crucially important for type safety!
interface MyDataType {
  id: string;
  name: string;
  value: number;
  // ... other properties
}

export async function POST(req: Request) {
  try {
    const token: CultTokenMetadata = await req.json();

    // Validate the incoming token data
    if (!token.tokenAddress) {
      return NextResponse.json({ error: 'Invalid token data' }, { status: 400 });
    }
    // Revalidate the cached data
    revalidateTag('tokens');
    revalidateTag('latestCoins');
    revalidateTag('topCoins');

    return NextResponse.json({ 
      success: true, 
      message: 'Token created successfully',
      revalidated: true,
      token 
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Error processing webhook' }, { status: 500 });
  }
}


// In your client-side component (e.g., page.tsx):

'use client'; // Important for using hooks

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; // Or SWR, or your state management library

// ... other imports

const MyComponent = () => {
  const queryClient = useQueryClient();

  const { data: myData } = useQuery({
    queryKey: ['myData'], // This key should match the revalidation tag (or be derived from it)
    queryFn: async () => {
        // Fetch your initial data.  This might be from an API route or directly.
      const res = await fetch('/api/data'); // Or however you get your initial data
      return res.json();
    },
  });

  // Example mutation (if you also need to update from the client-side):
    const updateDataMutation = useMutation(async (newData: MyDataType) => {
        const res = await fetch('/api/data', {
            method: 'POST',
            body: JSON.stringify(newData),
        });
        return res.json();
    }, {
        onSuccess: () => {
            queryClient.invalidateQueries(['myData']); // Invalidate and refetch after a successful update.
        }
    });


  // ... your component logic

  return (
    <div>
        {/* ... display your data */}
        {myData && myData.map((item:MyDataType) => <p key={item.id}>{item.name}</p>)}

    </div>
  );
};

export default MyComponent;