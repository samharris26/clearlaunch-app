import { NextResponse } from "next/server";

export async function GET() {
    const ics = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//ClearLaunch//Calendar Test//EN",
        "BEGIN:VEVENT",
        "UID:test-event@clearlaunch.app",
        "DTSTAMP:20250101T120000Z",
        "DTSTART:20250101T120000Z",
        "DTEND:20250101T123000Z",
        "SUMMARY:Test ClearLaunch event",
        "DESCRIPTION:If you can see this in your calendar, the route works.",
        "END:VEVENT",
        "END:VCALENDAR",
    ].join("\r\n");

    return new NextResponse(ics, {
        status: 200,
        headers: {
            "Content-Type": "text/calendar; charset=utf-8",
            "Content-Disposition": 'attachment; filename="test.ics"',
        },
    });
}