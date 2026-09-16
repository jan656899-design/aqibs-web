/**
 * Paste your Firebase web app keys here, then commit.
 * Console → Project settings → Your apps → Web.
 *
 * Also enable Authentication → Sign-in method → Phone,
 * and add https://jan656899-design.github.io to Authorized domains.
 */
export const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  appId: "",
};

export function firebaseReady() {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId);
}
