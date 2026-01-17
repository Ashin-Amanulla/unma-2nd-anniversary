# TanStack Query Migration

## Overview

This document outlines the migration from direct API calls to TanStack Query for the Contact Messages and Issues management features to resolve duplicate API call issues.

## Problem

The previous implementation was causing duplicate API calls to the backend for the same frontend actions due to:

- Direct axios calls in useEffect hooks
- React StrictMode causing effects to run twice in development
- Manual state management leading to unnecessary re-renders

## Solution

Migrated to TanStack Query which provides:

- Automatic request deduplication
- Intelligent caching
- Background refetching
- Optimistic updates
- Better error handling

## Changes Made

### 1. Created TanStack Query Hooks

#### Contact Messages (`/src/hooks/useContactMessages.js`)

- `useContactMessages(filters)` - Get paginated contact messages
- `useContactMessage(id)` - Get single contact message
- `useContactMessagesStats()` - Get contact messages statistics
- `useUnreadMessagesCount()` - Get unread messages count
- `useUpdateMessageStatus()` - Update message status
- `useRespondToMessage()` - Send response to message
- `useAddMessageNote()` - Add admin note to message
- `useBulkUpdateMessageStatus()` - Bulk update message status
- `useSendContactMessage()` - Send new contact message (public)

#### Issues (`/src/hooks/useIssues.js`)

- `useIssues(filters)` - Get paginated issues
- `useIssue(id)` - Get single issue
- `useCreateIssue()` - Create new issue
- `useUpdateIssue()` - Update issue
- `useUpdateIssueStatus()` - Update issue status specifically
- `useDeleteIssue()` - Delete issue
- `useUploadFile()` - Upload file for issues

#### User Logs (`/src/hooks/useUserLogs.js`)

- `useUserLogs(filters)` - Get paginated user logs
- `useUserLogsStats()` - Get user logs statistics
- `useUserLog(id)` - Get single user log
- `useUserActivityTimeline(userId)` - Get user activity timeline
- `useExportUserLogs()` - Export user logs as CSV
- `useCleanupUserLogs()` - Cleanup old user logs

### 2. Updated API Files

#### Issues API (`/src/api/issueApi.js`)

- Added `updateStatus(id, status)` method to match backend PATCH endpoint

### 3. Refactored Components

#### Contact Messages (`/src/pages/admin/ContactMessages.jsx`)

- Removed direct axios calls and useEffect hooks
- Replaced with TanStack Query hooks
- Simplified state management
- Added proper error handling

#### Issues (`/src/pages/admin/Issues.jsx`)

- Removed direct axios calls and useEffect hooks
- Replaced with TanStack Query hooks
- Simplified state management
- Added proper error handling

#### User Logs (`/src/pages/admin/UserLogs.jsx`)

- Removed direct axios calls and useEffect hooks
- Replaced with TanStack Query hooks
- Simplified state management
- Added proper error handling
- Enhanced export functionality with loading states

### 4. Updated Hooks Index (`/src/hooks/index.js`)

- Added exports for new TanStack Query hooks

## Benefits

### Performance

- **Request Deduplication**: Multiple components requesting the same data will only trigger one API call
- **Intelligent Caching**: Data is cached and reused across components
- **Background Refetching**: Data stays fresh without blocking the UI
- **Optimistic Updates**: UI updates immediately while API calls happen in background

### Developer Experience

- **Simplified State Management**: No more manual loading/error states
- **Better Error Handling**: Centralized error handling with automatic retries
- **DevTools Integration**: React Query DevTools for debugging
- **Type Safety**: Better TypeScript support (when migrated)

### User Experience

- **Faster Loading**: Cached data loads instantly
- **Real-time Updates**: Automatic background refetching keeps data fresh
- **Better Error Recovery**: Automatic retries and error boundaries
- **Consistent UI**: Loading and error states are handled consistently

## Configuration

### Query Client Setup (`/src/main.jsx`)

```javascript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000, // 1 minute
    },
  },
});
```

### Query Key Patterns

- Contact Messages: `['contact-messages', 'list', filters]`
- Issues: `['issues', 'list', filters]`
- User Logs: `['user-logs', 'list', filters]`
- Single Items: `['contact-messages', 'detail', id]`, `['issues', 'detail', id]`, `['user-logs', 'detail', id]`
- Statistics: `['contact-messages', 'stats']`, `['user-logs', 'stats']`

## Usage Examples

### Fetching Data

```javascript
const { data, isLoading, error } = useContactMessages({
  page: 1,
  limit: 10,
  status: "new",
  search: "query",
});
```

### Mutations

```javascript
const updateStatus = useUpdateMessageStatus();

const handleStatusUpdate = (id, status) => {
  updateStatus.mutate({ id, status });
};
```

## Migration Checklist

- [x] Create TanStack Query hooks for Contact Messages
- [x] Create TanStack Query hooks for Issues
- [x] Create TanStack Query hooks for User Logs
- [x] Update Contact Messages component
- [x] Update Issues component
- [x] Update User Logs component
- [x] Add missing API methods (updateStatus for issues)
- [x] Update hooks index exports
- [x] Remove direct axios calls from components
- [x] Remove manual useEffect data fetching
- [x] Test for duplicate API calls resolution

## Future Improvements

1. Add TypeScript for better type safety
2. Implement infinite queries for large datasets
3. Add more granular cache invalidation
4. Implement offline support with persistence
5. Add loading skeletons for better UX
