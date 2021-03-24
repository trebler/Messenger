export enum Action {
    subscribe = 'subscribe',
    unsubscribe = 'unsubscribe',
    publish = 'publish',
    direct = 'direct',
    broadcast = 'broadcast',
    disconnect = 'disconnect',
}
export type MessageReceive =
    | {
          action: Action.subscribe;
          room: string;
      }
    | { action: Action.unsubscribe; room: string }
    | { action: Action.direct; userSubject: string; message: string }
    | { action: Action.publish; room: string; message: string }
    | { action: Action.broadcast; message: string }
    | { action: Action.disconnect };

export type MessageSend = MessageReceive & { userSubject: string; timestamp: number };

export enum InfoKind {
    users = 'users',
    rooms = 'rooms',
}

export type MessageInfo =
    | {
          kind: InfoKind.rooms;
          items: string[];
      }
    | {
          kind: InfoKind.users;
          items: { userSubject: string; userName: string }[];
      };
