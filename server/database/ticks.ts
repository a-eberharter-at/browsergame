import {Database} from "bun:sqlite";
import {fetchResourcesOfUser, getDb} from "./crud.ts";
export {
    updateEnergy,
}
const db:Database|null = getDb();

async function updateEnergy():Promise<Array<{ user_id:string, scraps:number, energy:number, energy_max:number}>>{
    if(!db){throw new Error('[DB CRUD] db not yet initialized.')}
    const query = `
        SELECT r.id AS resource_id, r.energy_current, r.energy_max, r.scraps, b.level, r.user_id
        FROM resources r
        JOIN buildings b ON b.user_id = r.user_id
        JOIN building_types bt ON bt.id = b.type
        WHERE bt.name = 'Solarkraftwerk';
    `;
    //ToDo: I really should think about using some kind of ORM by now...
    const updates:Array<{resource_id:any, energy_current:any, energy_max:any, level:any, scraps:any, user_id:any}> = db.query(query).all() as Array<{resource_id:any, energy_current:any, energy_max:any, level:any, scraps:any, user_id:any}>;
    const resourceUpdates:Array<{ user_id:string, scraps:number, energy:number, energy_max:number}> = [];
    db.transaction(() => {
        for (const { resource_id, energy_current, energy_max, level, scraps, user_id } of updates) {
            if (level > 0) {
                const energyToAdd = level * 5;
                const newEnergy = Math.min(energy_current + energyToAdd, energy_max);

                db.run(
                    `UPDATE resources SET energy_current = ? WHERE id = ?`,
                    newEnergy,
                    resource_id
                );
                resourceUpdates.push({
                    user_id,
                    scraps,
                    energy: newEnergy,
                    energy_max,
                });
            }
        }
    })();
    console.log('[DB CRUD] Resources updated for all users with "Solarkraftwerk."');
    return resourceUpdates;
}

