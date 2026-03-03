# Prio – Firestore Database Schema

## Collections Overview

```
/users/{uid}
/groups/{groupId}
/groups/{groupId}/members/{uid}        (subcollection)
/tasks/{taskId}
/tasks/{taskId}/subtasks/{subtaskId}   (subcollection)
/tasks/{taskId}/messages/{messageId}   (subcollection)
/tasks/{taskId}/notes/{noteId}         (subcollection)
/expenses/{expenseId}
/notifications/{notificationId}
/auditLogs/{logId}
```

---

## Document Schemas

### `/users/{uid}`
```json
{
  "uid":          "string  — Firebase Auth UID (document ID)",
  "displayName":  "string",
  "email":        "string",
  "photoURL":     "string | null",
  "twoFAEnabled": "boolean",
  "createdAt":    "Timestamp",
  "updatedAt":    "Timestamp"
}
```

### `/groups/{groupId}`
```json
{
  "groupId":     "string  — auto-generated (document ID)",
  "name":        "string",
  "description": "string | null",
  "createdBy":   "string  — uid",
  "memberIds":   ["string"],
  "createdAt":   "Timestamp",
  "updatedAt":   "Timestamp"
}
```

### `/groups/{groupId}/members/{uid}`
```json
{
  "uid":       "string",
  "role":      "owner | admin | member",
  "joinedAt":  "Timestamp"
}
```

### `/tasks/{taskId}`
```json
{
  "taskId":      "string  — auto-generated (document ID)",
  "groupId":     "string  — parent group reference",
  "title":       "string",
  "description": "string | null",
  "priority":    "low | medium | high",
  "status":      "pending | in_progress | completed",
  "deadline":    "Timestamp | null",
  "assigneeIds": ["string  — uid"],
  "createdBy":   "string  — uid",
  "createdAt":   "Timestamp",
  "updatedAt":   "Timestamp"
}
```

### `/tasks/{taskId}/subtasks/{subtaskId}`
```json
{
  "subtaskId":  "string  — auto-generated",
  "title":      "string",
  "completed":  "boolean",
  "assigneeId": "string | null  — uid",
  "createdAt":  "Timestamp",
  "updatedAt":  "Timestamp"
}
```

### `/tasks/{taskId}/messages/{messageId}`
```json
{
  "messageId": "string",
  "authorId":  "string  — uid",
  "text":      "string",
  "pinned":    "boolean",
  "createdAt": "Timestamp",
  "editedAt":  "Timestamp | null"
}
```

### `/tasks/{taskId}/notes/{noteId}`
```json
{
  "noteId":    "string",
  "authorId":  "string  — uid",
  "text":      "string",
  "pinned":    "boolean",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

### `/expenses/{expenseId}`
```json
{
  "expenseId":   "string",
  "taskId":      "string  — linked task",
  "groupId":     "string",
  "amount":      "number",
  "currency":    "string  — e.g. 'USD'",
  "description": "string",
  "submittedBy": "string  — uid",
  "createdAt":   "Timestamp"
}
```

### `/notifications/{notificationId}`
```json
{
  "notificationId": "string",
  "recipientId":    "string  — uid",
  "type":           "deadline_approaching | task_overdue | task_updated | message_received | expense_logged",
  "taskId":         "string | null",
  "groupId":        "string | null",
  "message":        "string  — human-readable text",
  "read":           "boolean",
  "createdAt":      "Timestamp"
}
```

### `/auditLogs/{logId}`
```json
{
  "logId":      "string",
  "actorId":    "string  — uid",
  "action":     "string  — e.g. 'task.created', 'task.deleted', 'member.removed'",
  "entityType": "task | group | expense | user",
  "entityId":   "string",
  "before":     "object | null  — snapshot before change",
  "after":      "object | null  — snapshot after change",
  "timestamp":  "Timestamp"
}
```

---

## Firestore Security Rules (reference)

See `firestore.rules` for access-control enforcement.

## Indexes Required (composite)

| Collection    | Fields                            | Query purpose               |
|---------------|-----------------------------------|-----------------------------|
| tasks         | groupId ASC, createdAt DESC       | List tasks for a group      |
| tasks         | assigneeIds ARRAY, status ASC     | My assigned tasks by status |
| notifications | recipientId ASC, read ASC, createdAt DESC | Unread notifications  |
| expenses      | groupId ASC, createdAt DESC       | Group expense history       |
| auditLogs     | entityId ASC, timestamp DESC      | Entity audit trail          |
