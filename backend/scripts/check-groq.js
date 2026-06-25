/**
 * Verify GROQ_API_KEY in backend/.env
 * Usage: npm run check:groq   (from backend folder)
 */
import 'dotenv/config';
import { getGroqConfigStatus, groqChatCompletion, GROQ_CHAT_MODEL } from '../src/services/groqService.js';

const printKeyHelp = () => {
  console.error(`
How to fix GROQ_API_KEY:
  1. Open https://console.groq.com/keys
  2. Create an API key (starts with gsk_)
  3. In backend/.env set:  GROQ_API_KEY=gsk_...
  4. Optional: GROQ_MODEL=llama-3.3-70b-versatile
  5. Restart the backend and run: npm run check:groq

If you see rate limit errors, wait a moment and try again.
`);
};

const status = getGroqConfigStatus();

if (!status.configured) {
  console.error('\n❌ Groq is not configured.\n');
  console.error(status.message);
  printKeyHelp();
  process.exit(1);
}

if (status.keyFormatWarning) {
  console.warn('\n⚠️  Warning:', status.keyFormatWarning, '\n');
}

try {
  const reply = await groqChatCompletion(
    [{ role: 'user', content: 'Reply with exactly: OK' }],
    { maxTokens: 32 }
  );

  console.log('\n✅ Groq is working. Test reply:', reply);
  console.log(`   Model: ${process.env.GROQ_MODEL?.trim() || GROQ_CHAT_MODEL}\n`);
} catch (error) {
  const msg = error?.message || String(error);
  console.error('\n❌ Groq API call failed.\n');

  if (/429|quota|rate limit/i.test(msg)) {
    console.error('Cause: API rate limit exceeded. Wait and try again.\n');
  } else if (/401|invalid api key|authentication/i.test(msg)) {
    console.error('Cause: Invalid API key.\n');
  } else {
    console.error(msg.slice(0, 500));
  }

  printKeyHelp();
  process.exit(1);
}
