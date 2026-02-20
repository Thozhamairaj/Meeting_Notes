export interface ActionItem {
    task: string;
    owner: string;
    deadline: string;
    priority: "High" | "Medium" | "Low";
}

export interface Meeting {
    id: string; // Unique ID
    title: string;
    date: string; // ISO string or readable date
    owner: string; // Main owner or "Multiple"
    actions: ActionItem[];
    tags: string[];
    keyPoints: string[];
    summary: string;
    transcriptSample: string; // First 100 chars for preview
}

// Seed data for demo
const seedData: Meeting[] = [
    {
        id: "seed-1",
        title: "Launch planning — Sprint 12",
        date: "Feb 18, 2026",
        owner: "Anna",
        actions: [
            { task: "Finalize launch date", owner: "Anna", deadline: "Feb 20", priority: "High" },
            { task: "Prepare GTM deck", owner: "Marketing", deadline: "Feb 29", priority: "High" },
        ],
        tags: ["Launch", "Marketing"],
        keyPoints: [
            "Confirmed Mar 14 as hard launch date – no slippage allowed.",
            "Marketing to deliver GTM deck by Feb 29.",
            "Engineering freeze date set to Mar 7.",
            "Risk flagged: analytics instrumentation still incomplete.",
        ],
        summary: "Team confirmed March 14 launch date. Marketing GTM deck due Feb 29. Engineering code freeze on March 7.",
        transcriptSample: "Team sync focused on the March launch..."
    },
    {
        id: "seed-2",
        title: "Customer advisory board",
        date: "Feb 16, 2026",
        owner: "Victor",
        actions: [
            { task: "Follow up on renewal", owner: "Victor", deadline: "ASAP", priority: "Medium" }
        ],
        tags: ["Enterprise", "Feedback"],
        keyPoints: [
            "Enterprise customers want SSO + audit logs by Q2.",
            "Positive signal on AI summarisation – 4/5 rated it 9+.",
            "Victor to follow up with Acme on renewal terms.",
        ],
        summary: "Enterprise customers requested SSO and audit logs. AI summarization received high ratings.",
        transcriptSample: "Feedback session with enterprise customers..."
    },
];

const STORAGE_KEY = "meetmind_history";

export const historyStore = {
    getMeetings: (): Meeting[] => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : seedData;
        } catch (e) {
            console.error("Failed to parse history", e);
            return [];
        }
    },

    saveMeeting: (meeting: Omit<Meeting, "id">) => {
        try {
            const meetings = historyStore.getMeetings();
            const newMeeting = { ...meeting, id: crypto.randomUUID() };
            localStorage.setItem(STORAGE_KEY, JSON.stringify([newMeeting, ...meetings]));
            return newMeeting;
        } catch (e) {
            console.error("Failed to save meeting", e);
        }
    },

    clearHistory: () => {
        localStorage.removeItem(STORAGE_KEY);
    },

    // Helper to generate CSV content
    generateCSV: (actions: ActionItem[]): string => {
        const headers = ["Task", "Owner", "Deadline", "Priority"];
        const rows = actions.map(a =>
            [a.task, a.owner, a.deadline, a.priority]
                .map(field => `"${field.replace(/"/g, '""')}"`) // Escape quotes
                .join(",")
        );
        return [headers.join(","), ...rows].join("\n");
    }
};
