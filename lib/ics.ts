export type CalendarEvent = {
    uid: string;
    title: string;
    description?: string;
    url?: string;
    start: Date;
    end: Date;
};

export function formatDateToICS(dt: Date): string {
    return dt.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export function generateICS(events: CalendarEvent[]): string {
    const now = new Date();
    const dtStamp = formatDateToICS(now);

    const eventBlocks = events.map((event) => {
        const lines = [
            "BEGIN:VEVENT",
            `UID:${event.uid}`,
            `DTSTAMP:${dtStamp}`,
            `DTSTART:${formatDateToICS(event.start)}`,
            `DTEND:${formatDateToICS(event.end)}`,
            `SUMMARY:${escapeICS(event.title)}`,
        ];

        if (event.description) {
            lines.push(`DESCRIPTION:${escapeICS(event.description)}`);
        }

        if (event.url) {
            lines.push(`URL:${event.url}`);
        }

        lines.push("END:VEVENT");
        return lines.join("\r\n");
    });

    return [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//ClearLaunch//Calendar Export//EN",
        ...eventBlocks,
        "END:VCALENDAR",
    ].join("\r\n");
}

function escapeICS(str: string): string {
    return str
        .replace(/\\/g, "\\\\")
        .replace(/;/g, "\\;")
        .replace(/,/g, "\\,")
        .replace(/\n/g, "\\n");
}
