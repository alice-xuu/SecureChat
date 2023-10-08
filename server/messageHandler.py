from time import sleep

# Singleton module handling messaging

users_awaiting_notifications = {}

def wait_on_message(username, sender):
    t = {}
    t.setdefault(username, {})[sender] = { "message": "", "msgTime": "" }
    users_awaiting_notifications.update(t)
    user = users_awaiting_notifications[username][sender]

    while user["message"] == "":
        sleep(1)

    message = user["message"]
    msgTime = user["msgTime"]

    del users_awaiting_notifications[username][sender]
    
    if len(users_awaiting_notifications[username]) == 0:
        del users_awaiting_notifications[username]

    return message, msgTime

def send_message(username, receiver, message, msgTime):
    user = users_awaiting_notifications
    if receiver in users_awaiting_notifications:
        if username in users_awaiting_notifications[receiver]:
            users_awaiting_notifications[receiver][username]["message"] = message
            users_awaiting_notifications[receiver][username]["msgTime"] = msgTime

