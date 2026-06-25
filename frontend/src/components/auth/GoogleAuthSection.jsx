import { GoogleLogin } from '@react-oauth/google';
import { isGoogleAuthConfigured } from '../../utils/googleAuth';

const SETUP_STEPS = [
  'Open Google Cloud Console → Credentials',
  'Create OAuth 2.0 Client ID (Web application)',
  'Add origin: http://localhost:5173',
  'Run: npm run setup:google -- YOUR_CLIENT_ID YOUR_SECRET',
  'Restart: npm run dev',
];

const GoogleAuthSection = ({
  onSuccess,
  onError,
  text = 'signin_with',
  dividerLabel = 'Or continue with',
}) => {
  if (!isGoogleAuthConfigured()) {
    return (
      <div className="mt-6 rounded-xl border border-border bg-muted/50 px-4 py-4">
        <p className="text-sm font-medium text-foreground text-center">
          Google Sign-In not configured yet
        </p>
        <ol className="mt-3 space-y-1.5 text-xs text-muted-foreground list-decimal list-inside">
          {SETUP_STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p className="text-xs text-muted-foreground mt-3 text-center">
          <a
            href="https://console.cloud.google.com/apis/credentials"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-medium hover:underline"
          >
            Open Google Cloud Console
          </a>
          {' · '}
          Use email and password above in the meantime.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-card text-muted-foreground">{dividerLabel}</span>
        </div>
      </div>

      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={onSuccess}
          onError={onError}
          theme="outline"
          size="large"
          text={text}
        />
      </div>
    </>
  );
};

export default GoogleAuthSection;
