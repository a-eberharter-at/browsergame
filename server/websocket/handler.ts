import {validateToken} from "../auth/validation.ts";
import {
    fetchBuildingsOfUser,
    fetchBuildingTypes, fetchCharacterOfUser, fetchResourcesOfUser, fetchUpgradeableStateOfUser,
    findOrCreateUser,
} from "../database/crud.ts";
import {upgradeBuildingTypeIfPossibleForUser} from "../logic/buildings.ts";
import {addCharacterStatsIfPossibleForUser} from "../logic/character.ts";
import {fight} from "../logic/fight";
import Ticks from "../ticks";

const registeredWebsockets:Map<string, WebSocket> = new Map<string, WebSocket>;

const ticks = new Ticks(registeredWebsockets);



export default {
    open(ws: WebSocket) {
        console.log("[WebSocket Handler] Connection opened");
    },
    async message(ws: WebSocket, message: string) {
        const data = JSON.parse(message);
        console.log("[WebSocket Handler] Message Received: ", data.payload.action);

        const userInfo = await validateToken(data);
        if(!userInfo){
            ws.send(
                JSON.stringify({ error: "User Validation failed." })
            );
            return;
        }

        const sendMessage = async (message:any) => {
            ws.send(JSON.stringify(message));
        }

        const sendFightLog = async (fightLog:any) => {
            const message = {
                action: 'fightLog',
                data: fightLog,
            }
            await sendMessage(message);
        }
        const sendState = async () => {
            let buildingTypes = await fetchBuildingTypes();
            let userBuildings = await fetchBuildingsOfUser(user.id)
            let character = await fetchCharacterOfUser(user.id);
            let upgradable = await fetchUpgradeableStateOfUser(user.id);
            const message = {
                action: 'state',
                data: {
                    buildingTypes: buildingTypes,
                    character: character,
                    userBuildings: userBuildings,
                    upgradable: upgradable,
                },
                timestamp: Date.now(),
            };
            await sendMessage(message);
        }

        const user:any = await findOrCreateUser(userInfo);
        let oneTimeData:any = {};
        switch (data.payload.action) {
            case 'init':
                registeredWebsockets.set(user.id, ws);
                break;
            case 'upgrade':
                await upgradeBuildingTypeIfPossibleForUser(data.payload.buildingType, user.id);
                break;
            case 'addCharacterStats':
                await addCharacterStatsIfPossibleForUser(data.payload.stats, user.id);
                break;
            case 'fight':
                const fight_log = await fight(data.payload.type, user.id);
                await sendFightLog(fight_log);
                break;
            default:
                console.log("[WebSocket Handler]: Could not establish Message Handler for action '"+data.payload.action+"'. No Action taken!");
        }
        await sendState();
    },
    close(ws: WebSocket) {
        console.log("[WebSocket Handler] Connection closed");
    },
};
