import { Room, Client } from "colyseus";
import { Schema, type, MapSchema } from "@colyseus/schema";
import { generateName } from "../util/helpers";

class Player extends Schema {
    @type("string") username: string = '';
}

class Message extends Schema {
    @type("string") username: string = '';
    @type("string") content: string = '';
}

class State extends Schema {
    @type({ map: Player }) players = new MapSchema<Player>()

    createPlayer(id: string, username: string) {
        this.players[id] = new Player()
        this.players[id].username = username;
    }

    removePlayer(id: string) {
        delete this.players[id];
    }
}

export class Channel extends Room<State> {

    onCreate() {
        this.setState(new State())
    }

    onJoin(client: Client) {
        const name = generateName();

        this.state.createPlayer(client.sessionId, name)

        const data = new Message();

        data.username = name;
        data.content = "joined the channel.";

        console.log(`[${name}] just joined the channel.`)

        this.broadcast(data);
    }

    onMessage(client: Client, message: any) {
        const player: Player = this.state.players[client.sessionId];
        const data = new Message();

        data.username = player.username;
        data.content = message.content;

        console.log(`[${player.username}] ${message.content}`)

        this.broadcast(data);
    }

    onLeave(client: Client) {
        this.state.removePlayer(client.sessionId)
    }
}