import {Database} from "bun:sqlite";

export function runSeeds(db){
    const buildingTypes = [
        { name: 'Haupthaus' },
        { name: 'Solarkraftwerk' },
    ];
    const seedBuildingTypes = () => {
        buildingTypes.forEach(({ name }) => {
            const exists = db.prepare('SELECT COUNT(*) AS count FROM building_types WHERE name = ?').get(name).count;
            if(!exists){
                db.run('INSERT INTO building_types (name) VALUES (?)', [name]);
            }
        });
    };
    // Run seed functions
    seedBuildingTypes();
}
