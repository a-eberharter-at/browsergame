import {createBuildingOfUser, upgradeBuildingOfUser, userHasBuilding, userHasBuildingLevel} from "../database/crud.ts";

export {
    upgradeBuildingTypeIfPossibleForUser,
    buildingTypeIdCanUpgradeForUser,
}

async function upgradeBuildingTypeIfPossibleForUser(buildingTypeId:number, userId:string){
    const canUpgrade = await buildingTypeIdCanUpgradeForUser(buildingTypeId, userId);
    if(canUpgrade){
        if(await userHasBuilding(userId, buildingTypeId)){
            await upgradeBuildingOfUser(buildingTypeId, userId);
        } else {
            await createBuildingOfUser(buildingTypeId, userId);
        }
    }
}

async function buildingTypeIdCanUpgradeForUser(buildingTypeId:number, userId:string){
    //ToDo: Make this more sophisticated not with hardcoded IDs etc.
    let canUpgrade: boolean;
    switch (buildingTypeId) {
        case 2: //Solarkraftwerk
            canUpgrade = await userHasBuildingLevel(userId, 1, 1) //requires Haupthaus(ID 1) level >=1
            break;
        case 1: //Haupthaus
        default:
            canUpgrade = true; //Everything else can upgrade freely, for now.
    }
    if(canUpgrade){
        console.log("[Logic Building] canUpgrade check of Building-Type ID '"+buildingTypeId+"' for user ID '"+userId+"' - SUCCESS." );
    } else {
        console.log("[Logic Building] canUpgrade check of Building-Type ID '"+buildingTypeId+"' for user ID '"+userId+"' - FAILED." );
    }
    return canUpgrade
}
