
const DB_NAME = 'nova_chat_db';
const DB_VERSION = 1;
const STORE_NAME = 'chat_messages';

interface StoredMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

export async function saveMessages(messages: StoredMessage[]): Promise<void> {
  const db = await openDB();
  const transaction = db.transaction(STORE_NAME, 'readwrite');
  const store = transaction.objectStore(STORE_NAME);

  // 清除旧数据
  store.clear();

  // 保存新数据
  for (const message of messages) {
    store.put(message);
  }

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

export async function loadMessages(): Promise<StoredMessage[]> {
  const db = await openDB();
  const transaction = db.transaction(STORE_NAME, 'readonly');
  const store = transaction.objectStore(STORE_NAME);
  const request = store.getAll();

  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      db.close();
      const messages = request.result || [];
      // 按时间排序
      messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      resolve(messages);
    };
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}

export async function clearMessages(): Promise<void> {
  const db = await openDB();
  const transaction = db.transaction(STORE_NAME, 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  store.clear();

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

// 拒绝辅导上下文
export interface RejectionContext {
  jobTitle: string;
  company: string;
  rejectionReason: string;
  improvementAreas: string[];
}

export function setRejectionContext(context: RejectionContext): void {
  sessionStorage.setItem('nova_rejection_context', JSON.stringify(context));
}

export function getRejectionContext(): RejectionContext | null {
  const data = sessionStorage.getItem('nova_rejection_context');
  if (data) {
    sessionStorage.removeItem('nova_rejection_context');
    return JSON.parse(data);
  }
  return null;
}
