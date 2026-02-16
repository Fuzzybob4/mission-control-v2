# Telegram Bot API Skill

## Overview
The Telegram Bot API skill enables seamless integration between Atlas AI agents and Telegram messaging platform. This skill allows agents to send notifications, handle commands, and interact with users directly through Telegram.

## Capabilities

### Core Functions
- **Send Messages**: Text, formatted messages, and rich media
- **Handle Commands**: Bot command processing (/start, /status, /help)
- **Message Reactions**: Add emoji reactions to messages
- **Inline Keyboards**: Interactive button interfaces
- **File Uploads**: Photos, documents, and media sharing
- **Channel Management**: Broadcast to channels and groups

### Advanced Features
- **Webhook Integration**: Real-time message handling
- **Scheduled Messages**: Time-based notifications
- **Reply Parameters**: Thread and message threading
- **Message Effects**: Visual effects (invisible ink, balloons, etc.)
- **Polls & Quizzes**: Interactive surveys
- **Activity Status**: Show "typing", "playing", etc.

## Business Applications

### Lone Star Lighting
- **Lead Notifications**: Instant alerts when new leads come in
- **Quote Follow-ups**: Automated reminder messages to customers
- **Installation Updates**: Crew status and job completion notices
- **Customer Support**: Quick responses to holiday lighting inquiries
- **Marketing Campaigns**: Seasonal promotion broadcasts
- **Review Requests**: Automated post-service review collection

**Example Use Cases:**
```
New lead: John Smith - $2,500 estimate
Installation complete: 123 Main St ✅
Reminder: Follow up with Alora Hess (due Feb 20)
```

### RedFox CRM
- **Beta Signups**: Instant notifications when users join waitlist
- **System Alerts**: Infrastructure monitoring notifications
- **Customer Onboarding**: Welcome sequences for new users
- **Payment Confirmations**: Subscription billing receipts
- **Feature Announcements**: New release notifications to beta users
- **Support Tickets**: Help desk integration

**Example Use Cases:**
```
New beta signup: acme@lights.com
Payment received: Professional Plan - $79/mo
System alert: Database backup completed
```

## Technical Specifications

### Required Parameters
- `chat_id`: Target chat or channel ID
- `text`: Message content
- `parse_mode`: Formatting style (HTML, Markdown)
- `reply_to_message_id`: Thread reference (optional)

### Security
- Bot token stored in encrypted key vault
- Rate limiting: 30 messages/second
- Allowed chat ID whitelist

### Rate Limits
- 30 messages per second per bot
- 20 messages per minute to same chat
- 100 webhook calls per second

## Implementation

### Message Tool
```typescript
{
  action: "send",
  target: "<chat_id>",
  message: "<text>",
  parseMode: "Markdown",
  replyTo: "<message_id>",
  silent: false
}
```

### Reaction Tool
```typescript
{
  action: "react",
  target: "<chat_id>",
  messageId: "<msg_id>",
  emoji: "👍"
}
```

## Status
**Active** - Currently deployed and operational for Atlas AI.

## Related Skills
- Email Notifications
- SMS Gateway
- Discord Integration
- Slack Integration
