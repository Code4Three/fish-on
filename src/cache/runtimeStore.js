const DATABASE_NAME = "fish-on-runtime-data";
const DATABASE_VERSION = 1;

const STORE_NAMES = [
  "locations",
  "current",
  "history",
  "forecast",
  "tides",
  "refresh",
];

function createLocationIndex(store) {
  store.createIndex("byLocationKey", "locationKey", { unique: false });
}

export function openRuntimeDatabase() {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB is unavailable in this browser"));
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains("locations")) {
        database.createObjectStore("locations", { keyPath: "id" });
      }

      if (!database.objectStoreNames.contains("current")) {
        database.createObjectStore("current", { keyPath: "locationKey" });
      }

      for (const storeName of ["history", "forecast"]) {
        if (!database.objectStoreNames.contains(storeName)) {
          const store = database.createObjectStore(storeName, {
            keyPath: ["locationKey", "date"],
          });
          createLocationIndex(store);
        }
      }

      if (!database.objectStoreNames.contains("tides")) {
        const store = database.createObjectStore("tides", {
          keyPath: ["locationKey", "timestamp"],
        });
        createLocationIndex(store);
      }

      if (!database.objectStoreNames.contains("refresh")) {
        const store = database.createObjectStore("refresh", {
          keyPath: ["locationKey", "slice"],
        });
        createLocationIndex(store);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () =>
      reject(new Error("IndexedDB upgrade is blocked by another open tab"));
  });
}

function runTransaction(storeNames, mode, runRequests) {
  return openRuntimeDatabase().then(
    (database) =>
      new Promise((resolve, reject) => {
        const transaction = database.transaction(storeNames, mode);
        let result;

        try {
          result = runRequests(transaction);
        } catch (error) {
          database.close();
          reject(error);
          return;
        }

        transaction.oncomplete = () => {
          database.close();
          resolve(result);
        };
        transaction.onerror = () => {
          database.close();
          reject(transaction.error);
        };
        transaction.onabort = () => {
          database.close();
          reject(transaction.error ?? new Error("IndexedDB transaction aborted"));
        };
      }),
  );
}

export function getRuntimeRecord(storeName, key) {
  return openRuntimeDatabase().then((database) =>
    new Promise((resolve, reject) => {
      const transaction = database.transaction(storeName, "readonly");
      const request = transaction.objectStore(storeName).get(key);

      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => reject(request.error);
      transaction.oncomplete = () => database.close();
      transaction.onerror = () => {
        database.close();
        reject(transaction.error);
      };
    }),
  );
}

export function getRuntimeRecordsForLocation(storeName, locationKey) {
  return openRuntimeDatabase().then((database) =>
    new Promise((resolve, reject) => {
      const transaction = database.transaction(storeName, "readonly");
      const index = transaction.objectStore(storeName).index("byLocationKey");
      const request = index.getAll(IDBKeyRange.only(locationKey));

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      transaction.oncomplete = () => database.close();
      transaction.onerror = () => {
        database.close();
        reject(transaction.error);
      };
    }),
  );
}

export function putRuntimeRecord(storeName, record) {
  return runTransaction([storeName], "readwrite", (transaction) => {
    transaction.objectStore(storeName).put(record);
  });
}

export function putRuntimeRecords(storeName, records) {
  return runTransaction([storeName], "readwrite", (transaction) => {
    const store = transaction.objectStore(storeName);
    records.forEach((record) => store.put(record));
  });
}

export function deleteRuntimeLocation(locationKey) {
  return runTransaction(STORE_NAMES, "readwrite", (transaction) => {
    transaction.objectStore("locations").delete(locationKey);
    transaction.objectStore("current").delete(locationKey);

    for (const storeName of ["history", "forecast", "tides", "refresh"]) {
      const store = transaction.objectStore(storeName);
      const cursorRequest = store.index("byLocationKey").openCursor(
        IDBKeyRange.only(locationKey),
      );
      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result;
        if (!cursor) return;
        cursor.delete();
        cursor.continue();
      };
    }
  });
}

export function saveRuntimeLocation(location) {
  return putRuntimeRecord("locations", location);
}

export function getRuntimeLocations() {
  return openRuntimeDatabase().then((database) =>
    new Promise((resolve, reject) => {
      const transaction = database.transaction("locations", "readonly");
      const request = transaction.objectStore("locations").getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      transaction.oncomplete = () => database.close();
      transaction.onerror = () => {
        database.close();
        reject(transaction.error);
      };
    }),
  );
}

export function getRuntimeStoreNames() {
  return [...STORE_NAMES];
}