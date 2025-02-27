import {fetchCharacterOfUser, findOrCreateUser, setCharacterHasHub, storeFightLogOfUser} from "../../database/crud.ts";
import {addCharacterExperienceForUser} from "../character.ts";
import {addScrapsForUser} from "../user.ts";

export {
    fight
}


type participant = {
    name:string,
    stats: { str: number, vit: number, int: number, agi: number, dex: number, luk: number },
    health: number,
}

async function fight(type:string, userId:string){
    const character = await fetchCharacterOfUser(userId);
    console.log("[Fight] Initializing Fight: ", type, userId);
    console.log("[Fight] Character ID: ", character.id)
    let enemy = {
        name: "FallbackBot",
        stats: { str: 1, vit: 0, int: 1, agi: 1, dex: 1, luk: 1 },
        health: 0,
    };
    let scrapReward = 0;
    let expReward = 0;
    switch (type) {
        case "intro":
            await setCharacterHasHub(true, userId);
            enemy = {
                name: "SmallBot",
                stats: { str: 1, vit: 0, int: 1, agi: 1, dex: 1, luk: 1 },
                health: 25,
            };
            scrapReward = 10;
            expReward = 1;
            break
        case "dev":
            enemy = {
                name: "DevBot",
                stats: {
                    str: Math.floor(Math.random() * 4),
                    vit: Math.floor(Math.random() * 4),
                    int: Math.floor(Math.random() * 4),
                    agi: Math.floor(Math.random() * 4),
                    dex: Math.floor(Math.random() * 4),
                    luk: Math.floor(Math.random() * 4)
                },
                health: Math.floor(Math.random() * 51),
            };
            scrapReward = Math.floor(Math.random() * 11);
            expReward = Math.floor(Math.random() * 4);
            break;
    }
    const rewards = {
        scraps: scrapReward,
        exp: expReward,
    }

    const outcome = runFight({name: 'Player', stats: character, health:0}, enemy, rewards);
    await processFightOutcomeForUser(outcome, userId);
    return outcome;
}

function runFight(playerCharacter:participant, enemy:participant, rewards:{scraps:number, exp:number}) {
    const log:Array<any> = [];
    let winner = null;
    const loot:Array<any> = [];

    // Initialize health
    playerCharacter.health += (playerCharacter.stats.vit * 25);
    enemy.health += (enemy.stats.vit * 25);

    // Utility function for logging actions
    function logAction(round:number, attacker:participant, defender:participant, result:any) {
        log.push({
            round,
            attacker: attacker.name,
            defender: defender.name,
            damageDealt: result.damageDealt,
            mitigatedDamage: result.mitigatedDamage,
            criticalHit: result.criticalHit,
            attackHit: result.attackHit,
            luckyDodge: result.luckyDodge,
            defenderRemainingHealth: defender.health,
            description: result.description,
        });
    }

    let round = 1;
    while (playerCharacter.health > 0 && enemy.health > 0) {
        // Minimum Damage
        const minDamage = 1;

        // Determine attacker and defender for this round
        const attacker = round % 2 !== 0 ? playerCharacter : enemy;
        const defender = attacker === playerCharacter ? enemy : playerCharacter;

        const damageDealt = Math.max(0, attacker.stats.str - defender.stats.vit);
        const mitigatedDamage = defender.stats.vit;

        // Hit or miss check
        const hitChance = attacker.stats.dex - defender.stats.agi;
        const attackHit = Math.random() * 100 < Math.max(10, 50 + hitChance);

        // Lucky dodge check
        const luckyDodge = Math.random() * 100 < defender.stats.luk * 0.5;

        // Critical hit check
        const criticalHit = Math.random() * 100 < attacker.stats.luk * 0.3;

        // Final Damage
        const damage = attackHit && !luckyDodge ? Math.floor(damageDealt * (criticalHit ? 1.5 : 1)) : 0;
        const finalDamage = Math.max(damage, minDamage);

        // Apply damage
        defender.health = Math.max(0, defender.health - finalDamage);

        const description = attackHit
            ? `${attacker.name} attacked ${defender.name} dealing ${finalDamage} damage.${criticalHit ? ' Critical hit!' : ''} ${luckyDodge ? `${defender.name} dodged by sheer luck!` : ''}`
            : `${attacker.name} attacked but missed.`;

        // Log the round
        logAction(round, attacker, defender, {
            damageDealt: finalDamage,
            mitigatedDamage,
            criticalHit,
            attackHit,
            luckyDodge,
            description,
        });

        // Check for double attack based on agility
        if (Math.abs(attacker.stats.agi - defender.stats.agi) >= 10) {
            round++;
            continue; // Attacker gets an extra turn
        }

        round++;
    }
    const winnerName = playerCharacter.health > 0 ? playerCharacter.name : enemy.name;
    winner = {
        name: winnerName,
        playerWon: playerCharacter.name === winnerName,
    };

    return {
        winner,
        log,
        rewards,
        loot: winner.playerWon ? loot : [],
    };
}

async function processFightOutcomeForUser(fightLog:any, userId:string) {
    await storeFightLogOfUser(fightLog, userId)
    if(fightLog.loot.length > 0){
        console.log("[To-Do] Process Loot");
    }
    if(fightLog.winner.playerWon){
        await addScrapsForUser(fightLog.rewards.scraps, userId);
        fightLog.rewards.levelUp = await addCharacterExperienceForUser(fightLog.rewards.exp, userId);
    }
}



