import {
    addCharacterStatsToUser, characterAddExp,
    characterLevelUp,
    fetchCharacterOfUser, userAddScraps,
    userCharacterHasEnoughStatPoints,
} from "../database/crud.ts";

export {
    addCharacterExperienceForUser,
    addCharacterStatsIfPossibleForUser,
}

async function addCharacterStatsIfPossibleForUser(statsToAdd:any, userId:string){
    let requiredStatPoints = 0;
    Object.keys(statsToAdd).forEach((stat:string) => {
        requiredStatPoints += statsToAdd[stat];
    })
    console.log("Required stats: ", requiredStatPoints);
    if(await userCharacterHasEnoughStatPoints(requiredStatPoints, userId)){
        console.log("userCharacterHasEnoughStatPoints");
        await addCharacterStatsToUser(statsToAdd, userId);
    } else {
        console.log("FAILED: userCharacterHasEnoughStatPoints");
    }
}

async function addCharacterExperienceForUser(experienceToAdd:number, userId:string){
    console.log("experienceToAdd", experienceToAdd);
    const character = await fetchCharacterOfUser(userId)
    if(character.exp_required <= (experienceToAdd + character.experience)){
        await characterLevelUp(character.id);
        return true;
    } else {
        await characterAddExp(character.id, experienceToAdd);
        return false;
    }
}
