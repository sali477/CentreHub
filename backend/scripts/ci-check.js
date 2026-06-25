import { generateToken } from '../src/utils/generateToken.js';

import stripe from '../src/config/stripe.js';

import { getGroqClient } from '../src/services/groqService.js';



// Verify CI env defaults allow config modules to load without external services.

if (!process.env.JWT_SECRET) {

  throw new Error('JWT_SECRET must be set in CI');

}



generateToken('000000000000000000000000');



if (stripe !== null) {

  throw new Error('Stripe should be disabled when STRIPE_SECRET_KEY is empty');

}



const groq = getGroqClient();

if (groq !== null) {

  throw new Error('Groq should be disabled when GROQ_API_KEY is empty');

}



console.log('Backend CI check passed');

