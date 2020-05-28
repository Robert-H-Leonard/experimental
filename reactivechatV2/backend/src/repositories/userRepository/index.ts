import moment from "moment";
import * as _ from "lodash";

export interface User {
    username: string,
    createdAt: string,
    isTyping?: boolean,
}

export interface UserRepository {
    getUserNames: () => Promise<string[]>
    getUser: (username: string) => Promise<User | undefined>
    addUser: (username: string) => Promise<void>
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

    addUser = async (username: string) => {
        this.users = {
            ...this.users,
            [username]: {
                username,
                createdAt:  moment().fromNow()
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