/**
 * Parse UTC timestamp string from server and return Date object
 * Server sends UTC timestamps that may or may not have 'Z' suffix
 * This function ensures consistent UTC parsing regardless of format
 */
export const parseUTCTimestamp = (timestamp: string): Date => {
    // If timestamp already has 'Z' suffix, Date constructor handles it correctly
    if (timestamp.endsWith('Z')) {
        return new Date(timestamp);
    }

    // If no 'Z' suffix, explicitly treat as UTC by appending 'Z'
    // This prevents JavaScript from interpreting it as local time
    return new Date(timestamp + 'Z');
};

/**
 * Format timestamp for display in local timezone
 * Takes a Date object and returns formatted string based on how recent it is
 */
export const formatMessageTimestamp = (date: Date, locale: string = 'vi-VN'): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
        // Today - show time only
        return date.toLocaleTimeString(locale, {
            hour: '2-digit',
            minute: '2-digit'
        });
    } else if (days === 1) {
        // Yesterday
        const timeStr = date.toLocaleTimeString(locale, {
            hour: '2-digit',
            minute: '2-digit'
        });
        return locale === 'vi-VN' ? `Hôm qua ${timeStr}` : `Yesterday ${timeStr}`;
    } else if (days < 7) {
        // Within a week - show day name and time
        return date.toLocaleDateString(locale, {
            weekday: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    } else {
        // Older - show date and time
        return date.toLocaleDateString(locale, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
};
