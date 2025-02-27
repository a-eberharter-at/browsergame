import {userAddScraps} from "../database/crud.ts";
export {
    addScrapsForUser,
}
async function addScrapsForUser(scrapsToAdd:number, userId:string){
    await userAddScraps(userId, scrapsToAdd);
}
