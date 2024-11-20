import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { sendVerificationEmail } from '../lib/email-service';

interface User {
  id: string;
  name: string;
  email: string;
}

interface PendingVerification {
  name: string;
  email: string;
  code: string;
  expiresAt: number;
  attempts: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  pendingVerification: PendingVerification | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  logout: () => void;
  resendVerificationCode: () => Promise<void>;
}

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const MAX_VERIFICATION_ATTEMPTS = 3;
const VERIFICATION_TIMEOUT = 10 * 60 * 1000; // 10 minutes

// Default admin credentials
const ADMIN_USER = {
  id: 'admin-001',
  name: 'betasys',
  email: 'admin@betasys.ai',
  password: 'Betasys@2024'
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      pendingVerification: null,

      login: async (email: string, password: string) => {
        try {
          // Check for admin credentials
          if (email === ADMIN_USER.email && password === ADMIN_USER.password) {
            set({ 
              user: {
                id: ADMIN_USER.id,
                name: ADMIN_USER.name,
                email: ADMIN_USER.email
              }, 
              isAuthenticated: true 
            });
            return;
          }

          // Handle other users (mock implementation)
          const mockUser = {
            id: crypto.randomUUID(),
            name: email.split('@')[0],
            email,
          };
          
          set({ user: mockUser, isAuthenticated: true });
        } catch (error) {
          throw new Error('Invalid email or password');
        }
      },

      register: async (name: string, email: string, password: string) => {
        try {
          // Prevent registration with admin email
          if (email === ADMIN_USER.email) {
            throw new Error('This email address is not available for registration');
          }

          // Clear any existing verification
          set({ pendingVerification: null });

          const verificationCode = generateVerificationCode();
          const expiresAt = Date.now() + VERIFICATION_TIMEOUT;

          // Create pending verification before sending email
          const verification = {
            name,
            email,
            code: verificationCode,
            expiresAt,
            attempts: 0,
          };

          // Send verification email
          await sendVerificationEmail(email, verificationCode, name);

          // Only store verification if email was sent successfully
          set({ pendingVerification: verification });
        } catch (error) {
          console.error('Registration error:', error);
          // Clear any partial verification state
          set({ pendingVerification: null });
          throw error;
        }
      },

      verifyEmail: async (email: string, code: string) => {
        const { pendingVerification } = get();

        if (!pendingVerification) {
          throw new Error('No pending verification found. Please restart the registration process.');
        }

        if (Date.now() > pendingVerification.expiresAt) {
          set({ pendingVerification: null });
          throw new Error('Verification code has expired. Please request a new code.');
        }

        if (pendingVerification.attempts >= MAX_VERIFICATION_ATTEMPTS) {
          set({ pendingVerification: null });
          throw new Error('Too many attempts. Please restart the registration process.');
        }

        if (email !== pendingVerification.email) {
          throw new Error('Email mismatch. Please use the same email you registered with.');
        }

        if (code !== pendingVerification.code) {
          set({
            pendingVerification: {
              ...pendingVerification,
              attempts: pendingVerification.attempts + 1,
            },
          });
          const remainingAttempts = MAX_VERIFICATION_ATTEMPTS - (pendingVerification.attempts + 1);
          throw new Error(`Invalid code. ${remainingAttempts} attempts remaining.`);
        }

        // Create user account
        const newUser = {
          id: crypto.randomUUID(),
          name: pendingVerification.name,
          email: pendingVerification.email,
        };

        set({
          user: newUser,
          isAuthenticated: true,
          pendingVerification: null,
        });
      },

      resendVerificationCode: async () => {
        const { pendingVerification } = get();
        
        if (!pendingVerification) {
          throw new Error('No pending verification found. Please restart the registration process.');
        }

        const newCode = generateVerificationCode();
        const expiresAt = Date.now() + VERIFICATION_TIMEOUT;

        try {
          await sendVerificationEmail(
            pendingVerification.email,
            newCode,
            pendingVerification.name
          );

          set({
            pendingVerification: {
              ...pendingVerification,
              code: newCode,
              expiresAt,
              attempts: 0,
            },
          });
        } catch (error) {
          if (error instanceof Error) {
            throw new Error(`Failed to resend code: ${error.message}`);
          }
          throw new Error('Failed to resend verification code. Please try again.');
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, pendingVerification: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);