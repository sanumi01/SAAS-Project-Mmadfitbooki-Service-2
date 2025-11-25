

import type { User } from '../types';

const USERS_STORAGE_KEY = 'maadfitbook-users';
const PASSWORDS_STORAGE_KEY = 'maadfitbook-passwords';
const TRIAL_START_DATE_KEY = 'maadfitbook-trial-start';
const TRIAL_STAFF_LIMIT = 4;

// MOCK USER DATABASE
const INITIAL_USERS: User[] = [
  // Admin is removed to allow for first-run signup
  { id: 'staff-01', name: 'Alex Ray (Staff)', email: 'staff@maadfit.com', role: 'STAFF' },
  { id: 'user-01', name: 'Customer User', email: 'user@maadfit.com', role: 'CUSTOMER' },
];

const INITIAL_PASSWORDS: Record<string, string> = {
  'staff@maadfit.com': 'staff123',
  'user@maadfit.com': 'user123',
};

// --- Helper Functions ---

const getUsersFromStorage = (): User[] => {
    try {
        const stored = localStorage.getItem(USERS_STORAGE_KEY);
        if (stored) return JSON.parse(stored);
        
        // On first run, check if old data with an admin exists, otherwise start fresh
        const oldAdminUser = INITIAL_USERS.find(u => u.email === 'admin@maadfit.com');
        if (!oldAdminUser) {
             localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
             return INITIAL_USERS;
        }
        return INITIAL_USERS;

    } catch (e) {
        console.error("Could not get users from storage", e);
        return INITIAL_USERS;
    }
};

const getPasswordsFromStorage = (): Record<string, string> => {
    try {
        const stored = localStorage.getItem(PASSWORDS_STORAGE_KEY);
        if (stored) return JSON.parse(stored);
        localStorage.setItem(PASSWORDS_STORAGE_KEY, JSON.stringify(INITIAL_PASSWORDS));
        return INITIAL_PASSWORDS;
    } catch (e) {
        console.error("Could not get passwords from storage", e);
        return INITIAL_PASSWORDS;
    }
};

const saveUsersToStorage = (users: User[]): void => {
    try {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
        console.error("Could not save users to storage", e);
    }
};

const savePasswordsToStorage = (passwords: Record<string, string>): void => {
    try {
        localStorage.setItem(PASSWORDS_STORAGE_KEY, JSON.stringify(passwords));
    } catch (e) {
        console.error("Could not save passwords to storage", e);
    }
};


// --- Service Functions ---

/**
 * Checks if an admin account exists in the system.
 * @returns true if an admin exists, false otherwise.
 */
export const hasAdminAccount = (): boolean => {
    const users = getUsersFromStorage();
    return users.some(user => user.role === 'ADMIN');
};

/**
 * Simulates a login request.
 * @returns The authenticated user object on success, or throws an error on failure.
 */
export const login = async (email: string, password: string): Promise<User> => {
  await new Promise(res => setTimeout(res, 500)); // Simulate network delay

  const users = getUsersFromStorage();
  const passwords = getPasswordsFromStorage();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (user && passwords[user.email] === password) {
    try {
      sessionStorage.setItem('maadfitbook-user-session', JSON.stringify(user));
      return user;
    } catch (e) {
      console.error("Could not set user session in sessionStorage", e);
      throw new Error("Login failed: Could not create session.");
    }
  } else {
    throw new Error("Invalid email or password.");
  }
};

/**
 * Creates a new user and saves it to storage.
 * @returns The created user object.
 */
export const createUser = async (userData: Omit<User, 'id'>, password: string): Promise<User> => {
    await new Promise(res => setTimeout(res, 400)); // Simulate network delay

    const users = getUsersFromStorage();
    const passwords = getPasswordsFromStorage();

    if (userData.role === 'ADMIN') {
        if (hasAdminAccount()) {
            throw new Error('An admin account already exists. Cannot create another.');
        }
        // Start the trial period when the first admin is created
        localStorage.setItem(TRIAL_START_DATE_KEY, new Date().toISOString());
    }
    
    // Enforce staff limit for trial tier
    if (userData.role === 'STAFF' && getStaffAndAdminCount() >= TRIAL_STAFF_LIMIT) {
         throw new Error(`Staff limit of ${TRIAL_STAFF_LIMIT - 1} reached for the free trial.`);
    }

    const emailExists = users.some(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (emailExists) {
        throw new Error(`A user with the email ${userData.email} already exists.`);
    }

    const newUser: User = {
        ...userData,
        id: `${userData.role.toLowerCase()}-${Date.now()}`
    };

    const updatedUsers = [...users, newUser];
    const updatedPasswords = { ...passwords, [newUser.email]: password };

    saveUsersToStorage(updatedUsers);
    savePasswordsToStorage(updatedPasswords);

    return newUser;
};

/**
 * Clears the user session.
 */
export const logout = (): void => {
  try {
    sessionStorage.removeItem('maadfitbook-user-session');
  } catch (e) {
    console.error("Could not remove user session from sessionStorage", e);
  }
};

/**
 * Retrieves the currently logged-in user from the session.
 * @returns The user object if a session exists, otherwise null.
 */
export const getCurrentUser = (): User | null => {
  try {
    const sessionData = sessionStorage.getItem('maadfitbook-user-session');
    if (sessionData) {
      return JSON.parse(sessionData);
    }
    return null;
  } catch (e) {
    console.error("Could not retrieve user session from sessionStorage", e);
    return null;
  }
};

// --- Trial Management Functions ---

export const getTrialStartDate = (): Date | null => {
    try {
        const stored = localStorage.getItem(TRIAL_START_DATE_KEY);
        return stored ? new Date(stored) : null;
    } catch {
        return null;
    }
}

export const getStaffAndAdminCount = (): number => {
    const users = getUsersFromStorage();
    return users.filter(u => u.role === 'ADMIN' || u.role === 'STAFF').length;
}
