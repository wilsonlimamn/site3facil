import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User, 
  signOut as firebaseSignOut 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { GoogleUserProfile } from '../types/car';

// Initialize Firebase App singleton safely
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Request Google Drive and user profile scopes
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
provider.addScope('https://www.googleapis.com/auth/userinfo.email');
provider.setCustomParameters({
  prompt: 'select_account'
});

let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Try restoring token from session cache if available during session
export const getCachedAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const setCachedAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const signInWithGoogle = async (): Promise<{ user: GoogleUserProfile; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    const accessToken = credential?.accessToken || '';
    cachedAccessToken = accessToken;

    const userProfile: GoogleUserProfile = {
      uid: result.user.uid,
      email: result.user.email || '',
      displayName: result.user.displayName || 'Usuário CarControle',
      photoURL: result.user.photoURL || undefined,
    };

    return { user: userProfile, accessToken };
  } catch (error: any) {
    console.error('Erro ao autenticar com Google:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const signOutUser = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
    cachedAccessToken = null;
  } catch (error) {
    console.error('Erro ao desconectar:', error);
    throw error;
  }
};
