const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_FILE = path.join(__dirname, 'data.sqlite');

function ensureDb() {
    // opens the DB (will create file if missing)
    const db = new sqlite3.Database(DB_FILE);
    return db;
}

function runAsync(db, sql, params=[]) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) return reject(err);
            resolve(this);
        });
    });
}

function allAsync(db, sql, params=[]) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

async function loadAll() {
    const db = ensureDb();

    // ensure kv_store exists
    await runAsync(db, `CREATE TABLE IF NOT EXISTS kv_store (
        collection TEXT NOT NULL,
        id TEXT NOT NULL,
        data TEXT NOT NULL,
        PRIMARY KEY (collection, id)
    );`);

    async function loadCollection(coll) {
        const rows = await allAsync(db, 'SELECT id, data FROM kv_store WHERE collection = ?', [coll]);
        const out = {};
        for (const r of rows) {
            try { out[r.id] = JSON.parse(r.data); } catch (e) { out[r.id] = r.data; }
        }
        return out;
    }

    async function loadArray(coll) {
        const rows = await allAsync(db, 'SELECT id, data FROM kv_store WHERE collection = ? ORDER BY rowid', [coll]);
        const arr = [];
        for (const r of rows) {
            try { arr.push(JSON.parse(r.data)); } catch (e) { arr.push(r.data); }
        }
        return arr;
    }

    const categories = await loadCollection('categories');
    const users = await loadCollection('users');
    const memes = await loadArray('memes');
    const nodes = await loadCollection('nodes');
    const edges = await loadArray('edges');
    const debates = await loadArray('debates');
    const evidenceQueue = await loadArray('evidenceQueue');

    return { db, categories, users, memes, nodes, edges, debates, evidenceQueue };
}

async function persistObjects(db, collection, objects) {
    const insertSql = 'INSERT OR REPLACE INTO kv_store (collection, id, data) VALUES (?, ?, ?)';
    await runAsync(db, 'BEGIN TRANSACTION');
    for (const [id, obj] of Object.entries(objects)) {
        await runAsync(db, insertSql, [collection, id, JSON.stringify(obj)]);
    }
    await runAsync(db, 'COMMIT');
}

async function persistArray(db, collection, arr) {
    const insertSql = 'INSERT OR REPLACE INTO kv_store (collection, id, data) VALUES (?, ?, ?)';
    await runAsync(db, 'BEGIN TRANSACTION');
    for (let i = 0; i < arr.length; i++) {
        const obj = arr[i];
        const id = obj.id || String(i);
        await runAsync(db, insertSql, [collection, id, JSON.stringify(obj)]);
    }
    await runAsync(db, 'COMMIT');
}

module.exports = {
    ensureDb,
    loadAll,
    persistObjects,
    persistArray,
    DB_FILE
};
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DB_FILE = path.join(__dirname, 'data.sqlite');

function ensureDb() {
    const db = new Database(DB_FILE);

    // Create simple key-value tables for different collections
    db.exec(`
        CREATE TABLE IF NOT EXISTS kv_store (
            collection TEXT NOT NULL,
            id TEXT NOT NULL,
            data TEXT NOT NULL,
            PRIMARY KEY (collection, id)
        );
    `);

    return db;
}

function loadCollection(db, collection) {
    const stmt = db.prepare('SELECT id, data FROM kv_store WHERE collection = ?');
    const rows = stmt.all(collection);
    const out = {};
    for (const r of rows) {
        try {
            out[r.id] = JSON.parse(r.data);
        } catch (e) {
            out[r.id] = r.data;
        }
    }
    return out;
}

function loadArrayCollection(db, collection) {
    const stmt = db.prepare('SELECT id, data FROM kv_store WHERE collection = ? ORDER BY rowid');
    const rows = stmt.all(collection);
    const arr = [];
    for (const r of rows) {
        try {
            arr.push(JSON.parse(r.data));
        } catch (e) {
            arr.push(r.data);
        }
    }
    return arr;
}

function persistObjects(db, collection, objects) {
    const insert = db.prepare('INSERT OR REPLACE INTO kv_store (collection, id, data) VALUES (?, ?, ?)');
    const tx = db.transaction((items) => {
        for (const [id, obj] of Object.entries(items)) {
            insert.run(collection, id, JSON.stringify(obj));
        }
    });
    tx(objects);
}

function persistArray(db, collection, arr) {
    // store arrays by using their id property if present, otherwise index
    const insert = db.prepare('INSERT OR REPLACE INTO kv_store (collection, id, data) VALUES (?, ?, ?)');
    const tx = db.transaction((items) => {
        for (let i = 0; i < items.length; i++) {
            const obj = items[i];
            const id = obj.id || String(i);
            insert.run(collection, id, JSON.stringify(obj));
        }
    });
    tx(arr);
}

function loadAll() {
    const db = ensureDb();

    const categories = loadCollection(db, 'categories');
    const users = loadCollection(db, 'users');
    const memes = loadArrayCollection(db, 'memes');
    const nodes = loadCollection(db, 'nodes');
    const edges = loadArrayCollection(db, 'edges');
    const debates = loadArrayCollection(db, 'debates');
    const evidenceQueue = loadArrayCollection(db, 'evidenceQueue');

    return { db, categories, users, memes, nodes, edges, debates, evidenceQueue };
}

module.exports = {
    ensureDb,
    loadAll,
    persistObjects,
    persistArray,
    DB_FILE
};
