import Event from "../models/Event.js";

const EVENTS_SEED_DATA = [
    {
        year: "2025",
        title: "UNMA First Inaugural Meet",
        date: "January 26, 2025",
        fullDate: "26 Jan 2025",
        description: "The historic founding event that marked the beginning of UNMA - United Navodaya Alumni of Kerala. A gathering of passionate Navodayans coming together to form a united community.",
        location: "Thiruvananthapuram, Kerala",
        attendees: "500+",
        status: "completed",
        category: "Foundation",
        highlights: [
            "Formation of UNMA officially announced",
            "Core team introduction",
            "Vision and mission presentation",
            "District coordinators appointed"
        ],
        isMilestone: true,
        isNext: false,
        order: 1,
        isPublished: true,
    },
    {
        year: "2025",
        title: "UNMA State Coordination Meet",
        date: "March 2025",
        fullDate: "15 Mar 2025",
        description: "First official coordination meeting bringing together district representatives from all 14 districts of Kerala to plan the roadmap for UNMA activities.",
        location: "Ernakulam, Kerala",
        attendees: "100+",
        status: "completed",
        category: "Coordination",
        highlights: [
            "District-wise action plans finalized",
            "Membership drive strategy discussed",
            "Working committees formed"
        ],
        isMilestone: false,
        isNext: false,
        order: 2,
        isPublished: true,
    },
    {
        year: "2025",
        title: "UNMA Grand Summit 2025",
        date: "August 2025",
        fullDate: "15-16 Aug 2025",
        description: "The flagship annual summit bringing together Navodaya alumni from across Kerala for networking, knowledge sharing, and celebrating the Navodayan spirit.",
        location: "Kochi, Kerala",
        attendees: "1000+",
        status: "completed",
        category: "Summit",
        highlights: [
            "Keynote by distinguished alumni",
            "Panel discussions on education",
            "Cultural programs",
            "Award ceremony"
        ],
        isMilestone: true,
        isNext: false,
        order: 3,
        isPublished: true,
    },
    {
        year: "2025",
        title: "UNMA Regional Meets",
        date: "October - November 2025",
        fullDate: "Oct-Nov 2025",
        description: "Series of regional meetings conducted across different zones of Kerala to strengthen grassroots connections and expand community outreach.",
        location: "Multiple Locations",
        attendees: "2000+",
        status: "completed",
        category: "Outreach",
        highlights: [
            "North Kerala Meet - Kozhikode",
            "Central Kerala Meet - Thrissur",
            "South Kerala Meet - Kollam"
        ],
        isMilestone: false,
        isNext: false,
        order: 4,
        isPublished: true,
    },
    {
        year: "2026",
        title: "UNMA 2nd Anniversary & Republic Day Celebration",
        date: "January 26, 2026",
        fullDate: "26 Jan 2026",
        description: "A grand celebration marking two years of UNMA coinciding with the 77th Republic Day of India. Join us for a day of celebration, reflection, and renewed commitment to our community.",
        location: "Thiruvananthapuram, Kerala",
        attendees: "Expected 2000+",
        status: "upcoming",
        category: "Anniversary",
        link: "/republic-day-event",
        highlights: [
            "Flag hoisting ceremony",
            "Annual report presentation",
            "Special recognition awards",
            "Cultural extravaganza",
            "Vision 2030 announcement"
        ],
        isMilestone: true,
        isNext: true,
        order: 1,
        isPublished: true,
    },
    {
        year: "2026",
        title: "UNMA Education Initiative Launch",
        date: "March 2026",
        fullDate: "Mar 2026",
        description: "Launch of UNMA's flagship education support program aimed at mentoring current JNV students and providing career guidance.",
        location: "Pan-Kerala",
        attendees: "TBA",
        status: "upcoming",
        category: "Initiative",
        highlights: [
            "Mentorship program kickoff",
            "Scholarship announcements",
            "Career guidance workshops"
        ],
        isMilestone: false,
        isNext: false,
        order: 2,
        isPublished: true,
    },
    {
        year: "2026",
        title: "UNMA Grand Summit 2026",
        date: "August 2026",
        fullDate: "Aug 2026",
        description: "The second annual grand summit of UNMA, expected to be bigger and better with participation from alumni across India.",
        location: "TBA",
        attendees: "Expected 2000+",
        status: "upcoming",
        category: "Summit",
        highlights: [
            "National level participation",
            "Industry connect sessions",
            "Alumni startup showcase"
        ],
        isMilestone: false,
        isNext: false,
        order: 3,
        isPublished: true,
    },
];

const seedEvents = async () => {
    try {
        // Check if events already exist
        const existingCount = await Event.countDocuments();
        
        if (existingCount > 0) {
            console.log(`Events collection already has ${existingCount} documents. Skipping seed.`);
            return;
        }

        // Insert seed data
        await Event.insertMany(EVENTS_SEED_DATA);
        console.log(`Successfully seeded ${EVENTS_SEED_DATA.length} events`);
    } catch (error) {
        console.error("Error seeding events:", error);
    }
};

export { EVENTS_SEED_DATA, seedEvents };
export default seedEvents;
