import {fetchResourcesOfUser} from "../database/crud.ts";
import {updateEnergy} from "../database/ticks.ts";

export default class Ticks {
    webSockets:Map<string, WebSocket>;
    tickIntervals:Map<string, number> = new Map();

    config = {
        intervalsInSeconds: {
            resources: 5,
        }
    }

    public constructor(webSockets:Map<string, WebSocket>) {
        console.log("[SERVER TICKS] INIT");
        // @ Future Me:
        // Maybe write all tick updates to database every Minute or something instead of on each interval.
        // Loosing Data of running Minute on server crash is acceptable
        // Would require a "floating gamestate" object to write/read from which handles all resource checks etc.
        // Would require a shutdown to happen gracefully to store running Minute update on shutdown.
        // Lower Database load not necessary for now, though; So whatever.
        this.webSockets = webSockets;
        this.startTicks();
    }

    public startTicks(): void {
        console.log("[SERVER TICKS] START TICKS");
        this.scheduleTick(this.config.intervalsInSeconds.resources, 'resources', this.resourcesTick.bind(this))
    }
    private async resourcesTick() {
        console.log("[SERVER TICKS] ["+new Date().toISOString()+"] --- RESOURCE TICK - START ---");
        const updatedResources:Array<{ user_id:string, scraps:number, energy:number, energy_max:number}> =  await updateEnergy()
        //Calculate new resources for all users
        this.sendResourcesUpdates(updatedResources);
        //Send message with new resource values
        console.log("[SERVER TICKS] ["+new Date().toISOString()+"] --- RESOURCE TICK - DONE ----");
    }

    private sendResourcesUpdates(updatedResources:Array<{ user_id:string, scraps:number, energy:number, energy_max:number}>) {
        //for each websocket
        //let resources = await fetchResourcesOfUser(user.id);
        const userWebSocketsToRemove:Array<string> = [];
        console.log("[SERVER TICKS] [Resource Update] Active WebSockets:", this.webSockets.size);
        updatedResources.forEach((updatedResourcesEntry:{ user_id:string, scraps:number, energy:number, energy_max:number}) => {
            const userWebsocket = this.webSockets.get(updatedResourcesEntry.user_id);
            if(!userWebsocket){
                console.log("[SERVER TICKS] [Resource Update] User '"+updatedResourcesEntry.user_id+"' has no active WebSocket.");
                return;
            }
            if(userWebsocket.readyState === WebSocket.CLOSED){
                console.log("[SERVER TICKS] [Resource Update] User '"+updatedResourcesEntry.user_id+"' WebSocket is closed. Removing WebSocket.");
                userWebSocketsToRemove.push(updatedResourcesEntry.user_id);
            } else {
                const message = {
                    action: 'updateResources',
                    data: {
                        energy: updatedResourcesEntry.energy,
                        energy_max: updatedResourcesEntry.energy_max,
                        scraps: updatedResourcesEntry.scraps,
                    },
                }
                console.log("[SERVER TICKS] [Resource Update] RESOURCE MESSAGE TO '"+updatedResourcesEntry.user_id+"'");
                userWebsocket.send(JSON.stringify(message));
            }
        })
        userWebSocketsToRemove.forEach((userWebSocketToRemove) => {
            this.webSockets.delete(userWebSocketToRemove);
        })
    }

    private scheduleTick(intervalInSeconds:number, tickName:string, tick:Function) {
        const now = new Date();
        const currentSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
        // Calculate the next target time in seconds
        const secondsUntilNextRun = intervalInSeconds - (currentSeconds % intervalInSeconds);
        // Schedule the task
        setTimeout(() => {
            tick();
            this.tickIntervals.set(tickName, setInterval(tick, intervalInSeconds * 1000)); // Set periodic task
        }, secondsUntilNextRun * 1000);
    }
}
