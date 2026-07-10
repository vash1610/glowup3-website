# Mobile App - Ticket Notification Implementation

## 1. Add Dependency (if not already installed)
```bash
npm install react-native-toast-message
# OR for Expo
npx expo install react-native-toast-message
```

## 2. Create Notification Service
Create `services/ticketNotificationService.ts`:

```typescript
import { supabase } from '@/lib/supabase';
import Toast from 'react-native-toast-message';

class TicketNotificationService {
  private channel: any = null;
  private userId: string | null = null;

  // Start listening for ticket updates
  async startListening(userId: string, userTicketIds: string[]) {
    this.userId = userId;
    
    // Don't listen if already listening or no tickets
    if (this.channel || userTicketIds.length === 0) return;

    this.channel = supabase
      .channel('ticket-updates-' + userId)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ticket_messages',
          filter: `ticket_id=in.(${userTicketIds.join(',')})`
        },
        (payload) => this.handleNewMessage(payload)
      )
      .subscribe();
  }

  // Stop listening
  stopListening() {
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }

  // Handle new message
  private handleNewMessage(payload: any) {
    const message = payload.new;
    
    // Only show notification for admin/system messages
    if (message.sender_type === 'admin' || message.sender_type === 'system') {
      this.showNotification(message);
    }
  }

  // Show toast notification
  private showNotification(message: any) {
    Toast.show({
      type: 'info',
      text1: '💬 New Reply from Support',
      text2: message.content.substring(0, 50) + (message.content.length > 50 ? '...' : ''),
      position: 'top',
      visibilityTime: 4000,
      onPress: () => {
        // Navigate to ticket detail
        // You can use navigation or event emitter
      }
    });
  }
}

export const ticketNotificationService = new TicketNotificationService();
```

## 3. Add Toast Component to App
In your main layout or App.tsx:

```typescript
import Toast from 'react-native-toast-message';

// Add at the end of your component tree
export default function App() {
  return (
    <>
      <YourMainContent />
      <Toast />
    </>
  );
}
```

## 4. Integrate in Support Screen
In your support/tickets screen:

```typescript
import { ticketNotificationService } from '@/services/ticketNotificationService';
import { useAuthStore } from '@/stores/authStore';

export default function SupportScreen() {
  const userId = useAuthStore(state => state.user?.id);
  
  useEffect(() => {
    // Get user's ticket IDs
    const userTicketIds = tickets.map(t => t.id);
    
    if (userId && userTicketIds.length > 0) {
      ticketNotificationService.startListening(userId, userTicketIds);
    }
    
    return () => {
      ticketNotificationService.stopListening();
    };
  }, [userId, tickets]);
}
```

## 5. Bell Icon Badge Update
For the bell icon badge, use Zustand store:

```typescript
// stores/notificationStore.ts
import { create } from 'zustand';

interface NotificationState {
  unreadCount: number;
  incrementUnread: () => void;
  clearUnread: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  incrementUnread: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
  clearUnread: () => set({ unreadCount: 0 }),
}));
```

Then in the notification service, call `incrementUnread()` when new admin message arrives.

## 6. Bell Icon Component Example
```typescript
import { useNotificationStore } from '@/stores/notificationStore';
import { View, TouchableOpacity, Text } from 'react-native';
import { Bell } from 'lucide-react-native';

export function NotificationBell() {
  const { unreadCount, clearUnread } = useNotificationStore();
  
  return (
    <TouchableOpacity onPress={clearUnread}>
      <View>
        <Bell size={24} color="#333" />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = {
  badge: {
    position: 'absolute',
    right: -6,
    top: -6,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
};
```

---

## Summary
| Feature | Implementation |
|---------|----------------|
| Real-time subscription | Supabase `postgres_changes` channel |
| Toast notification | `react-native-toast-message` |
| Bell badge | Zustand store + badge component |