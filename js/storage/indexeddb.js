// ═══════════════════════════════════════════
// STATE & STORAGE
// ═══════════════════════════════════════════
const LS_KEY='leitner_v2';
const LS_KEY_V1='leitner_v1';
const LS_KEY_OLD='leitner_state'; // very old monolithic key
const LS_BACKUP_KEY='leitner_backup';
const SCHEMA_VERSION=3;

// ═══ IndexedDB Storage — unlimited, offline ═══
const IDB_NAME='leitnerDB';
const IDB_STORE='data';
let _db=null;

function openDB(){
  return new Promise(function(resolve,reject){
    if(_db){resolve(_db);return}
    const req=indexedDB.open(IDB_NAME,1);
    req.onupgradeneeded=function(e){
      const db=e.target.result;
      if(!db.objectStoreNames.contains(IDB_STORE))db.createObjectStore(IDB_STORE);
    };
    req.onsuccess=function(e){_db=e.target.result;resolve(_db)};
    req.onerror=function(e){reject(e.target.error)};
  });
}

function idbPut(key,value){
  return openDB().then(function(db){
    return new Promise(function(resolve,reject){
      const tx=db.transaction(IDB_STORE,'readwrite');
      tx.objectStore(IDB_STORE).put(value,key);
      tx.oncomplete=function(){resolve()};
      tx.onerror=function(e){reject(e.target.error)};
    });
  });
}

function idbGet(key){
  return openDB().then(function(db){
    return new Promise(function(resolve,reject){
      const tx=db.transaction(IDB_STORE,'readonly');
      const req=tx.objectStore(IDB_STORE).get(key);
      req.onsuccess=function(){resolve(req.result)};
      req.onerror=function(e){reject(e.target.error)};
    });
  });
}
