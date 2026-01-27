import Activity from "../models/Activity.js";

const ACTIVITIES_SEED_DATA = [
    // Upcoming Activities
    {
        title: "UNMA 2nd Anniversary & 77th Republic Day Celebration",
        description: "A grand celebration bringing together Navodayans from across Kerala, Mahe, and Lakshadweep. Features walkathon, cultural programs, health awareness sessions, blood donation drive, and boat ride.",
        category: "alumni-meets",
        date: "January 26, 2026",
        location: "T. K. Ramakrishnan Samskarika Kendram, Ernakulam",
        participants: ["All Member Associations"],
        status: "upcoming",
        registrationLink: "/republic-day-event",
        isPublished: true,
        order: 1,
    },
    {
        title: "Blood Donation Drive",
        description: "Collaborative blood donation drive organized in partnership with Kerala Police Officers Association and Indian Medical Association. All healthy adults are encouraged to participate.",
        category: "health",
        date: "January 26, 2026",
        location: "T. K. Ramakrishnan Samskarika Kendram, Ernakulam",
        participants: ["All Member Associations", "Kerala Police Officers Association", "IMA"],
        status: "upcoming",
        registrationLink: "/republic-day-event",
        isPublished: true,
        order: 2,
    },
    {
        title: "UNMA Career Portal Launch",
        description: "Launch of a dedicated career portal to connect Navodayan job seekers with opportunities shared by fellow Navodayans. The portal will feature job listings, internships, and mentorship matching.",
        category: "career",
        date: "January 26, 2026",
        location: "Online",
        participants: ["All Member Associations"],
        status: "upcoming",
        registrationLink: "/careers",
        isPublished: true,
        order: 3,
    },
    {
        title: "Health Awareness Session - BLS Training",
        description: "Basic Life Support (BLS) training session conducted by certified medical professionals. Learn life-saving techniques that could help in emergency situations.",
        category: "health",
        date: "January 26, 2026",
        location: "T. K. Ramakrishnan Samskarika Kendram, Ernakulam",
        participants: ["All Member Associations", "UNMA Medical Wing"],
        status: "upcoming",
        registrationLink: "/republic-day-event",
        isPublished: true,
        order: 4,
    },
    {
        title: "Ask Our Doctors - Interactive Health Session",
        description: "Interactive Q&A session where Navodayan doctors address health queries from fellow alumni. Get personalized advice from experienced healthcare professionals.",
        category: "health",
        date: "January 26, 2026",
        location: "T. K. Ramakrishnan Samskarika Kendram, Ernakulam",
        participants: ["All Member Associations", "UNMA Medical Wing"],
        status: "upcoming",
        registrationLink: "/republic-day-event",
        isPublished: true,
        order: 5,
    },

    // Completed Activities
    {
        title: "UNMA Global Conference 2025",
        description: "Historic gathering of nearly 3,000 Navodayan alumni from Kerala, Mahe, and Lakshadweep. Inaugurated by Ramesh Pisharody, the event featured cultural programs including Pookalam and Chenda Melam, expert speeches, book releases by 9 alumni authors, fashion show, talent hunt, career guidance sessions, and 30+ exhibition stalls.",
        category: "alumni-meets",
        date: "September 1, 2025",
        location: "CIAL Convention Centre, Nedumbassery, Kochi",
        participants: ["All Member Associations", "NVS Hyderabad Region"],
        status: "completed",
        galleryLink: "/gallery",
        isPublished: true,
        order: 1,
    },
    {
        title: "UNMA Foundation Day - 1st Anniversary",
        description: "The inaugural celebration marking one year of UNMA's formation. Alumni from all member associations gathered to celebrate the spirit of Navodayan brotherhood and sisterhood.",
        category: "alumni-meets",
        date: "January 26, 2025",
        location: "Kochi, Kerala",
        participants: ["All Member Associations"],
        status: "completed",
        galleryLink: "/gallery",
        isPublished: true,
        order: 2,
    },
    {
        title: "Navodayan Scholarship Fund Launch",
        description: "Launch of a scholarship fund to support underprivileged current JNV students with educational resources and financial assistance. The fund has since supported 50+ students.",
        category: "student-welfare",
        date: "August 15, 2025",
        location: "Online",
        participants: ["All Member Associations"],
        status: "completed",
        isPublished: true,
        order: 3,
    },
    {
        title: "Career Mentorship Program - Batch 1",
        description: "First batch of the career mentorship program connecting experienced Navodayan professionals with recent graduates and job seekers. Successfully matched 150+ mentee-mentor pairs across various industries.",
        category: "career",
        date: "July 20, 2025",
        location: "Online",
        participants: ["All Member Associations"],
        status: "completed",
        isPublished: true,
        order: 4,
    },
    {
        title: "Medical Camp for Wayanad Landslide Victims",
        description: "Emergency medical camp organized by UNMA Medical Wing and Wayanad Alumni Association for Wayanad landslide affected families. Free health checkups and medicines distributed to 500+ beneficiaries.",
        category: "social",
        date: "August 5, 2025",
        location: "Wayanad, Kerala",
        participants: ["Wayanad Alumni Association", "UNMA Medical Wing"],
        status: "completed",
        isPublished: true,
        order: 5,
    },
    {
        title: "Navodayan Entrepreneurs Meetup",
        description: "First-ever meetup of Navodayan entrepreneurs sharing experiences, challenges, and success stories. Featured panel discussions on startup ecosystem in Kerala with 75+ entrepreneur alumni.",
        category: "knowledge",
        date: "June 15, 2025",
        location: "Startup Village, Kochi",
        participants: ["All Member Associations"],
        status: "completed",
        isPublished: true,
        order: 6,
    },
    {
        title: "UNMA Medical Wing Formation",
        description: "Official formation of UNMA Medical Wing comprising Navodayan doctors and healthcare professionals dedicated to organizing health camps and medical support initiatives.",
        category: "health",
        date: "July 1, 2025",
        location: "Online",
        participants: ["Navodayan Healthcare Professionals"],
        status: "completed",
        isPublished: true,
        order: 7,
    },
    {
        title: "Alumni Authors Book Release Event",
        description: "Special event at the Global Conference where 9 Navodayan alumni had their books released. Publications included fiction, non-fiction, technical books, and poetry collections.",
        category: "knowledge",
        date: "September 1, 2025",
        location: "CIAL Convention Centre, Nedumbassery",
        participants: ["All Member Associations"],
        status: "completed",
        isPublished: true,
        order: 8,
    },
];

const seedActivities = async () => {
    try {
        // Check if activities already exist
        const existingCount = await Activity.countDocuments();
        
        if (existingCount > 0) {
            console.log(`Activities collection already has ${existingCount} documents. Skipping seed.`);
            return;
        }

        // Insert seed data
        await Activity.insertMany(ACTIVITIES_SEED_DATA);
        console.log(`Successfully seeded ${ACTIVITIES_SEED_DATA.length} activities`);
    } catch (error) {
        console.error("Error seeding activities:", error);
    }
};

export { ACTIVITIES_SEED_DATA, seedActivities };
export default seedActivities;
