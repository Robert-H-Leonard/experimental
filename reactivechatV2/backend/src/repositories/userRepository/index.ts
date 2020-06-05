import moment from "moment";
import * as _ from "lodash";
import { Socket } from "socket.io";

export interface User {
    username: string,
    createdAt: string,
    sockets: {
        [namespace: string]: Socket
    },
    isTyping?: boolean,
}

export interface UserRepository {
    getUserNames: () => Promise<string[]>
    getUser: (username: string) => Promise<User | undefined>
    addUser: (username: string, namespace:string, socket: Socket) => Promise<void>
    removeUser: (username: string) => Promise<void>
}

/**
 * User repository that is implemented in memory using a map
 */
export class DumbUserRepository implements UserRepository {
    users: {[username: string]: User} = {}

    getUserNames = async () => _.keys(this.users);
    
    getUser = async (username: string) => {
        return _.get(this.users, username, undefined);
    }

    addUser = async (username: string , namespace: string, socket: Socket) => {
        this.users = {
            ...this.users,
            [username]: {
                username,
                createdAt:  moment().fromNow(),
                sockets: {
                    [namespace]: socket
                }
            }
        }
    }

    removeUser = async (username: string) => {
        const isSaved = _.hasIn(this.users, username);
        if (isSaved) {
            const {[username]: _, ...remainingUsers} = this.users;
            this.users = remainingUsers;
        }
    }

}