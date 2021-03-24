# Messenger

Messenger using WS (and MQTT topics) with K8S Deployment

Use

```bash
./scripts/keycloaktoken.sh $USERNAME $PASSWORD
```

to get `JWT` that can be used
to authenticate towards `WS`. E.g.

```bash
TOKEN=`./keycloaktoken.sh test0@user.com test0 | jq -r .access_token`
wscat -c "wss://messenger.trebler.dev/ws?access_token=$TOKEN"
```

## Supported commands

```typescript
enum Action {
    subscribe = 'subscribe',
    unsubscribe = 'unsubscribe',
    publish = 'publish',
    direct = 'direct',
    broadcast = 'broadcast',
    disconnect = 'disconnect',
}
type MessageReceive =
    | {
          action: Action.subscribe;
          room: string;
      }
    | { action: Action.unsubscribe; room: string }
    | { action: Action.direct; userSubject: string; message: string }
    | { action: Action.publish; room: string; message: string }
    | { action: Action.broadcast; message: string }
    | { action: Action.disconnect };
```

E.g.:

* Subscribe to chat room

```json
{
    "action": "subscribe",
    "room": "room0"
}
```

* Unsubscribe from chat room

```json
{
    "action": "unsubscribe",
    "room": "room0"
}
```

* Publish to chat room

```json
{
    "action": "publish",
    "room": "room0",
    "message": "some_text"
}
```

* Direct message another user

```json
{
    "action": "direct",
    "userSubject": "some_user_sub",
    "message": "some_text"
}
```

* Broadcast message to all users

```json
{
    "action": "broadcast",
    "message": "some_announcement"
}
```

* Tell server to close WS connection

```json
{
    "action": "disconnect"
}
```
