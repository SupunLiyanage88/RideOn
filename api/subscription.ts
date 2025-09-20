// api/subscription.ts

import axios from 'axios';

// Define the type for a subscription package
export interface SubscriptionPackage {
  _id?: string; 
  name: string;
  rc: string;
  price: string;
  recommended: boolean;
  icon: string;
  description: string;
  isActive: boolean;
}



// Fetch subscription packages
export async function fetchSubscriptionPackages(token: string) {
  try {
    const response = await axios.get('https://rideon-server.vercel.app/api/packages', {
      headers: {
        Authorization: `Bearer ${token}`, // Attach the token in the Authorization header
      },
    });
    return response.data;
  } catch (err) {
    console.error('Error fetching subscription packages:', err);
    throw err; // Rethrow the error to be handled by the calling function
  }
}

