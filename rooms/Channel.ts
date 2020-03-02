import { Room, Client } from "colyseus";
import { Schema, type, MapSchema } from "@colyseus/schema";
import { generateName } from "../util/helpers";

class ChannelPlayer extends Schema {
    @type("string") username: string = '';
}

class ChannelMessage extends Schema {
    @type("string") username: string = '';
    @type("string") content: string = '';
}

class ChannelState extends Schema {
    @type({ map: ChannelPlayer }) players = new MapSchema<ChannelPlayer>()

    createPlayer(id: string, username: string) {
        this.players[id] = new ChannelPlayer()
        this.players[id].username = username;
    }

    removePlayer(id: string) {
        delete this.players[id];
    }
}

export class Channel extends Room<ChannelState> {

    onCreate() {
        this.setState(new ChannelState())
    }

    onJoin(client: Client) {
        const name = generateName();

        this.state.createPlayer(client.sessionId, name)

        const data = new ChannelMessage();

        data.username = name;
        data.content = "joined the channel.";

        console.log(`[${name}] just joined the channel.`)

        this.broadcast(data);
    }

    onMessage(client: Client, message: any) {
        const player: ChannelPlayer = this.state.players[client.sessionId];
        const data = new ChannelMessage();

        data.username = player.username;
        data.content = message.content;

        console.log(`[${player.username}] ${message.content}`)

        this.broadcast(data);
    }

    onLeave(client: Client) {
        this.state.removePlayer(client.sessionId)
    }
}