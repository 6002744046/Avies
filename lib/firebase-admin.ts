import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, Timestamp, getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { env } from "@/lib/env";

type ServiceAccountConfig = {
  projectId?: string;
  clientEmail?: string;
  privateKey?: string;
};

function parseServiceAccount(): ServiceAccountConfig | null {
  if (env.firebaseServiceAccountBase64) {
    try {
      return JSON.parse(
        Buffer.from(env.firebaseServiceAccountBase64, "base64").toString("utf8")
      ) as ServiceAccountConfig;
    } catch {
      return null;
    }
  }

  if (env.firebaseProjectId && env.firebaseClientEmail && env.firebasePrivateKey) {
    return {
      clientEmail: env.firebaseClientEmail,
      privateKey: env.firebasePrivateKey.replace(/\\n/g, "\n"),
      projectId: env.firebaseProjectId
    };
  }

  return null;
}

export function getFirebaseAdminApp() {
  const existingApp = getApps()[0];
  if (existingApp) {
    return existingApp;
  }

  const serviceAccount = parseServiceAccount();
  if (!serviceAccount?.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
    return null;
  }

  return initializeApp({
    credential: cert({
      clientEmail: serviceAccount.clientEmail,
      privateKey: serviceAccount.privateKey,
      projectId: serviceAccount.projectId
    }),
    projectId: serviceAccount.projectId,
    storageBucket: env.firebaseStorageBucket || undefined
  });
}

export function createFirebaseAdminAuth() {
  const app = getFirebaseAdminApp();
  return app ? getAuth(app) : null;
}

export function createFirebaseAdminDb() {
  const app = getFirebaseAdminApp();
  return app ? getFirestore(app) : null;
}

export function createFirebaseAdminBucket() {
  const app = getFirebaseAdminApp();
  if (!app || !env.firebaseStorageBucket) {
    return null;
  }

  return getStorage(app).bucket(env.firebaseStorageBucket);
}

export { FieldValue, Timestamp };
