import {Database} from "bun:sqlite";
import {buildingTypeIdCanUpgradeForUser} from "../logic/buildings.ts";

export {
    getDb,
    addCharacterStatsToUser,
    characterLevelUp,
    characterAddExp,
    createBuildingOfUser,
    fetchBuildingsOfUser,
    fetchBuildingTypes,
    fetchCharacterOfUser,
    fetchUpgradeableStateOfUser,
    fetchResourcesOfUser,
    findOrCreateUser,
    setCharacterHasHub,
    storeFightLogOfUser,
    upgradeBuildingOfUser,
    userAddScraps,
    userCharacterHasEnoughStatPoints,
    userHasBuilding,
    userHasBuildingLevel,
}
let db:Database|null = null;

function getDb():Database{
    if(!db){
        db = new Database('./database/game.db', { strict : true });
    }
    return db;
}

async function addCharacterStatsToUser(statsToAdd:any, userId:string){
    if(!db){throw new Error('[DB CRUD] db not yet initialized.')}
    const statPointsUsed = (statsToAdd.str + statsToAdd.vit + statsToAdd.int + statsToAdd.agi + statsToAdd.dex + statsToAdd.luk);
    db.run(
        'UPDATE characters SET str = str + ?, vit = vit + ?, "int" = "int" + ?, agi = agi + ?, dex = dex + ?, luk = luk + ?, points = points - ? WHERE user_id = ?',
        [statsToAdd.str, statsToAdd.vit, statsToAdd.int, statsToAdd.agi, statsToAdd.dex, statsToAdd.luk, statPointsUsed, userId]
    );
    console.log("[DB CRUD] Added Character Stats to User.", statsToAdd, userId);
}

async function setCharacterHasHub(hasHub:boolean, userId:string){
    if(!db){throw new Error('[DB CRUD] db not yet initialized.')}
    db.run(
        'UPDATE characters SET has_hub = ? WHERE user_id = ?',
        [hasHub ? 1 : 0, userId]
    );
    console.log("[DB CRUD] Set Character Has Hub: ", hasHub, userId);
}

async function createBuildingOfUser(buildingTypeId:number, userId:string){
    if(!db){throw new Error('[DB CRUD] db not yet initialized.')}
    console.log("[DB CRUD] CREATE Building of Type ID '"+buildingTypeId+"' for user ID '"+userId+"'." );
    db.run('INSERT INTO buildings (type, user_id, level) VALUES (?, ?, ?)', [buildingTypeId, userId, 1]);
}
async function upgradeBuildingOfUser(buildingTypeId:number, userId:string){
    if(!db){throw new Error('[DB CRUD] db not yet initialized.')}
    db.run(
        'UPDATE buildings SET level = level + 1 WHERE type = ? AND user_id = ?',
        [buildingTypeId, userId]
    );
    console.log("[DB CRUD] UPGRADE Building of Type ID '"+buildingTypeId+"' for user ID '"+userId+"' - SUCCESS." );
}
async function fetchBuildingTypes() {
    if(!db){throw new Error('[DB CRUD] db not yet initialized.')}
    const sql = 'SELECT * FROM building_types';
    return db.prepare(sql).all();
}
async function fetchBuildingsOfUser(userId:string){
    if(!db){throw new Error('[DB CRUD] db not yet initialized.')}
    const sql = 'SELECT * FROM buildings WHERE user_id = ?';
    let buildingsOfUser:Array<any> = db.prepare(sql).all(userId);
    for (const buildingOfUser of buildingsOfUser) {
        buildingOfUser.canUpgrade = await buildingTypeIdCanUpgradeForUser(buildingOfUser.type, userId);
    }
    return buildingsOfUser;
}
async function fetchCharacterOfUser(userId:string){
    if(!db){throw new Error('[DB CRUD] db not yet initialized.')}
    const sql = 'SELECT * FROM characters WHERE user_id = ?';
    let characterOfUser:any = db.prepare(sql).get(userId);
    return characterOfUser;
}
async function fetchResourcesOfUser(userId:string){
    if(!db){throw new Error('[DB CRUD] db not yet initialized.')}
    const sql = 'SELECT * FROM resources WHERE user_id = ?';
    let resourcesOfUser:any = db.prepare(sql).get(userId);
    return resourcesOfUser;
}
async function fetchUpgradeableStateOfUser(userId:string){
    if(!db){throw new Error('[DB CRUD] db not yet initialized.')}
    const buildingTypes:Array<any> = await fetchBuildingTypes();
    const buildingUpgrades = [];

    for (const buildingType of buildingTypes) {
        const canUpgrade = await buildingTypeIdCanUpgradeForUser(buildingType.id, userId)
        buildingUpgrades.push({
            buildingType: buildingType.id,
            canUpgrade: canUpgrade,
        })
    }

    return buildingUpgrades;
}
async function findOrCreateUser(userInfo:any) {
    if(!db){throw new Error('[DB CRUD] db not yet initialized.')}
    const { sub, name, email, picture } = userInfo;

    // Check if the user already exists
    const existingUser = await fetchUserById(sub);
    if (existingUser) {
        return existingUser;
    } else {
        console.log('[DB CRUD] findOrCreateUser: New User sub "'+sub+'" ... creating.');
        const insertResult = db.run(
            'INSERT INTO users (id, name, email, picture) VALUES (?, ?, ?, ?)',
            [sub, name, email, picture]
        );
        // Ensure the insert succeeded
        if (insertResult.changes > 0) {
            db.run(
                'INSERT INTO characters (user_id) VALUES (?)',
                [sub]
            );
            db.run(
                'INSERT INTO resources (user_id) VALUES (?)',
                [sub]
            );
            // Fetch the new user and log it
            const sql = 'SELECT * FROM users WHERE id = ?';
            const user:any = db.prepare(sql).get(sub);
            console.log('[DB CRUD] findOrCreateUser: New user created.', user.name);
            return user;
        } else {
            console.log('[DB CRUD] findOrCreateUser: Failed to create new user.');
            return null;
        }
    }
}

async function fetchUserById(sub:string){
    if(!db){throw new Error('[DB CRUD] db not yet initialized.')}
    try {
        const sql = 'SELECT * FROM users WHERE id = ?';
        return db.prepare(sql).get(sub);
    } catch (e) {
        console.log("[DB CRUD] ", e);
    }
}

async function userHasBuilding(userId:string, buildingTypeId:number):Promise<boolean>{
    if(!db){throw new Error('[DB CRUD] db not yet initialized.')}
    const sql = 'SELECT * FROM buildings WHERE user_id = ? AND type = ?';
    const result = db.prepare(sql).all(userId, buildingTypeId);
    console.log("[DB CRUD] userHasBuilding - user ID '"+userId+"' has building ID '"+buildingTypeId+"': "+ (result.length > 0));
    return result.length > 0;
}

async function userHasBuildingLevel(userId:string, buildingTypeId:number, level:number):Promise<boolean>{
    if(!db){throw new Error('[DB CRUD] db not yet initialized.')}
    const sql = 'SELECT * FROM buildings WHERE user_id = ? AND type = ?';
    const result:Array<any> = db.prepare(sql).all(userId, buildingTypeId);
    const userHasBuildingLevel = (result.length > 0) && (result[0].level >= level);
    console.log("[DB CRUD] userHasBuildingLevel - building id '"+buildingTypeId+"' for user ID '"+userId+"' has level '"+level+" or higher': "+ userHasBuildingLevel);
    return userHasBuildingLevel;
}

async function userCharacterHasEnoughStatPoints(requiredStatPoints:number, userId:string){
    let userHasEnoughStatPoints: boolean = false;
    if(!db){throw new Error('[DB CRUD] db not yet initialized.')}
    const sql = 'SELECT points FROM characters WHERE user_id = ?';
    const result:any = db.prepare(sql).get(userId);
    return requiredStatPoints <= result.points;
}

async function characterLevelUp(characterId:number){
    if(!db){throw new Error('[DB CRUD] db not yet initialized.')}
    db.run(
        'UPDATE characters SET level = level + 1, exp_required = exp_required * 2, experience = 0, points = points + 5 WHERE id = ?',
        [characterId]
    );
    console.log("[DB CRUD] Character ID '"+characterId+"' leveled up.");
}
async function characterAddExp(characterId:number, experience:number){
    if(!db){throw new Error('[DB CRUD] db not yet initialized.')}
    db.run(
        'UPDATE characters SET experience = experience + ? WHERE id = ?',
        [experience, characterId]
    );
    console.log("[DB CRUD] Character ID '"+characterId+"' added '"+experience+"' EXP.", );

}
async function userAddScraps(userId:string, scraps:number){
    if(!db){throw new Error('[DB CRUD] db not yet initialized.')}
    db.run(
        'UPDATE resources SET scraps = scraps + ? WHERE user_id = ?',
        [scraps, userId]
    );
    console.log("[DB CRUD] User ID '"+userId+"' added '"+scraps+"' Scraps.", );

}

async function storeFightLogOfUser(fightLog:any, userId:string){
    if(!db){throw new Error('[DB CRUD] db not yet initialized.')}
    db.run('INSERT INTO fight_logs (user_id, log) VALUES (?, ?)', [userId, JSON.stringify(fightLog)]);
    console.log("[DB CRUD] Stored FightLog of User", userId);
}

