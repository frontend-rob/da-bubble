# Refactoring Plan for chat.service.ts

## Current Issues
- File is 590 lines long (exceeds 400 LOC limit)
- Several functions exceed the 14-line limit
- The service has too many responsibilities

## Proposed Solution
Split the chat.service.ts file into multiple smaller services, each with a specific responsibility:

### 1. ChatUIStateService
**Responsibility**: Handle UI state management for chat-related components

**Properties and methods to move**:
- `_isChatResponsive` and getter
- `_isThreadOpen` and getter
- `_isNewMessage` and getter
- `_isProfileCardOpen` and getter
- `_activeChat` and getter
- `_currentPerson` and getter
- `handleChatResponsive()`
- `setCurrentPerson()`
- `handleThread()`
- `handleNewMessage()`
- `handleProfileCard()`
- `setActiveChat()`

### 2. ChannelService
**Responsibility**: Handle channel-related operations

**Methods to move**:
- `getChannels()`
- `isChannelNameDuplicate()`
- `createChannel()`
- `updateChannel()`
- `findDirectMessageChannel()`
- `createDirectMessageChannel()`
- `removeUserFromChannel()`
- `getChannelById()`

### 3. MessageService
**Responsibility**: Handle message-related operations

**Methods to move**:
- `getMessages()`
- `sendMessage()`
- `updateMessageReactions()`
- `updateMessageText()`
- `deleteMessage()`

### 4. ThreadService
**Responsibility**: Handle thread-related operations

**Properties and methods to move**:
- `selectedThreadMessageId`
- `updateThreadMessagesInformation()`
- `updateThreadMessagesName()`
- `getThreadMessages()`
- `sendThreadMessage()`
- `updateThreadMessageReactions()`

## Implementation Steps

1. Create the four new service files:
   - chat-ui-state.service.ts
   - channel.service.ts
   - message.service.ts
   - thread.service.ts

2. Move the relevant properties and methods to each service

3. Update the dependencies between services:
   - Inject services into each other as needed
   - Use observables to communicate between services

4. Update all components that use ChatService to use the new services

5. Gradually phase out the original ChatService or make it a facade that delegates to the new services

## Benefits

- Each service will be under the 400 LOC limit
- Functions can be refactored to be under 14 lines
- Better separation of concerns
- Easier to maintain and test
- More modular architecture

## Risks and Mitigation

- Breaking changes: Ensure all components that use ChatService are updated
- Circular dependencies: Carefully manage dependencies between services
- Regression: Write tests to ensure functionality is preserved
