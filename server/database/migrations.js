export function runMigrations(db){
    db.run(`
        CREATE TABLE IF NOT EXISTS users
        (
            id         VARCHAR(255) UNIQUE NOT NULL PRIMARY KEY, -- This stores the "sub"
            name       VARCHAR(255),
            email      VARCHAR(255) UNIQUE,
            picture    TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS building_types (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(255) UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS buildings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            level INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (type) REFERENCES building_types(id),
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS characters (
            "id" INTEGER PRIMARY KEY AUTOINCREMENT,
            "str" INTEGER NOT NULL DEFAULT 1,
            "vit" INTEGER NOT NULL DEFAULT 1,
            "int" INTEGER NOT NULL DEFAULT 1,
            "agi" INTEGER NOT NULL DEFAULT 1,
            "dex" INTEGER NOT NULL DEFAULT 1,
            "luk" INTEGER NOT NULL DEFAULT 1,
            "points" INTEGER NOT NULL DEFAULT 0,
            "experience" INTEGER NOT NULL DEFAULT 0,
            "exp_required" INTEGER NOT NULL DEFAULT 1,
            "level" INTEGER NOT NULL DEFAULT 1,
            "user_id" INTEGER UNIQUE NOT NULL,
            "has_hub" BOOLEAN NOT NULL DEFAULT 0,
            "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS fight_logs (
            "id" INTEGER PRIMARY KEY AUTOINCREMENT,
            "user_id" INTEGER NOT NULL,
            "log" JSON,
            "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS resources (
            "id" INTEGER PRIMARY KEY AUTOINCREMENT,
            "user_id" INTEGER NOT NULL,
            "scraps" INTEGER DEFAULT 0,
            "energy_current" INTEGER DEFAULT 0,
            "energy_max" INTEGER DEFAULT 1000,
            "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
    `);
}
