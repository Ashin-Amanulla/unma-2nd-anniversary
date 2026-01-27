import Update from "../models/Update.js";

const UPDATES_SEED_DATA = [
    // News
    {
        title: "UNMA Global Conference 2025 - A Historic Success!",
        content: "Nearly 3,000 Navodayan alumni gathered at CIAL Convention Centre, Nedumbassery for the UNMA Global Conference 2025. The event, inaugurated by renowned TV/Cinema star Ramesh Pisharody, featured cultural programs including Pookalam and Chenda Melam, expert speeches, book releases by 9 alumni authors, fashion show, talent hunt, career guidance sessions, and over 30 exhibition stalls. This historic gathering brought together alumni from all JNVs in Kerala, Mahe, and Lakshadweep, creating new memories and strengthening the Navodayan bond.",
        category: "news",
        date: new Date("2025-09-01"),
        link: "https://www.manoramaonline.com/district-news/ernakulam/2025/09/01/jawahar-navodaya-alumni.html",
        isPublished: true,
    },
    {
        title: "UNMA 2nd Anniversary & Republic Day Celebration Announced",
        content: "UNMA invites all Navodayans to join the 2nd Anniversary celebrations combined with 77th Republic Day on January 26, 2026 at T. K. Ramakrishnan Samskarika Kendram, Ernakulam. The event features walkathon, cultural programs, health awareness sessions, blood donation drive, and a memorable boat ride.",
        category: "news",
        date: new Date("2025-12-15"),
        link: "/republic-day-event",
        isPublished: true,
    },
    {
        title: "Ramesh Pisharody Inaugurates UNMA Global Conference",
        content: "Popular TV and cinema star Ramesh Pisharody inaugurated the UNMA Global Conference at CIAL Convention Centre. In his address, he humorously recalled his own school days and connected with the audience through shared experiences of student life. The event drew standing ovations as he spoke about the importance of alumni networks.",
        category: "news",
        date: new Date("2025-09-01"),
        isPublished: true,
    },

    // Announcements
    {
        title: "Registration Open for Republic Day Celebration 2026",
        content: "Online registration is now open for the UNMA 2nd Anniversary & 77th Republic Day Celebration. Limited seats available! Register early to secure your participation in the walkathon, cultural programs, health sessions, and boat ride.",
        category: "announcement",
        date: new Date("2025-12-20"),
        link: "/republic-day-event",
        isPublished: true,
    },
    {
        title: "UNMA Career Portal Coming Soon",
        content: "UNMA is launching a dedicated career portal to connect Navodayan job seekers with opportunities shared by fellow Navodayans. The portal will feature job listings, internship opportunities, and a mentorship matching system. Launch expected during the Republic Day celebration.",
        category: "announcement",
        date: new Date("2025-12-10"),
        isPublished: true,
    },
    {
        title: "Call for Volunteers - Republic Day Event",
        content: "We are looking for enthusiastic volunteers to help organize the UNMA 2nd Anniversary celebration. Various roles available including registration desk, cultural program coordination, health camp support, and transportation assistance. Volunteers will receive special recognition at the event.",
        category: "announcement",
        date: new Date("2025-12-18"),
        link: "/contact",
        isPublished: true,
    },
    {
        title: "Blood Donation Drive - Join Us!",
        content: "UNMA is organizing a blood donation drive in collaboration with Kerala Police Officers Association and Indian Medical Association during the Republic Day celebration. All healthy adults are encouraged to participate in this noble cause.",
        category: "announcement",
        date: new Date("2025-12-22"),
        isPublished: true,
    },

    // Activities
    {
        title: "Navodayan Scholarship Fund Supports 50 Students",
        content: "The Navodayan Scholarship Fund launched in August 2025 has successfully supported 50 underprivileged current JNV students with educational resources. The fund continues to accept donations from alumni to expand its reach.",
        category: "activity",
        date: new Date("2025-11-15"),
        isPublished: true,
    },
    {
        title: "Career Mentorship Program - 150+ Pairs Matched",
        content: "The first batch of UNMA Career Mentorship Program has successfully connected over 150 experienced Navodayan professionals with recent graduates and job seekers. Applications for the second batch will open soon.",
        category: "activity",
        date: new Date("2025-10-20"),
        isPublished: true,
    },
    {
        title: "Medical Camp for Wayanad Landslide Victims",
        content: "UNMA's Medical Wing, in collaboration with Wayanad Alumni Association, organized an emergency medical camp for Wayanad landslide affected families. Free health checkups and medicines were distributed to over 500 beneficiaries.",
        category: "activity",
        date: new Date("2025-08-05"),
        isPublished: true,
    },
    {
        title: "9 Alumni Authors Celebrated at Global Conference",
        content: "Nine Navodayan alumni had their books released at the UNMA Global Conference 2025. The publications span various genres including fiction, non-fiction, technical books, and poetry, showcasing the diverse talents of Navodayan alumni.",
        category: "activity",
        date: new Date("2025-09-01"),
        isPublished: true,
    },

    // Initiatives
    {
        title: "UNMA Medical Wing Formation",
        content: "UNMA has formed a dedicated Medical Wing comprising Navodayan doctors and healthcare professionals. The wing aims to organize health camps, provide medical guidance to alumni, and support healthcare initiatives in underserved areas.",
        category: "initiative",
        date: new Date("2025-07-01"),
        isPublished: true,
    },
    {
        title: "Navodayan Entrepreneurs Network Launched",
        content: "A dedicated network for Navodayan entrepreneurs has been launched to facilitate collaboration, mentorship, and investment opportunities. The first meetup at Startup Village, Kochi saw participation from 75+ entrepreneur alumni.",
        category: "initiative",
        date: new Date("2025-06-15"),
        isPublished: true,
    },
    {
        title: "Digital Alumni Directory Project",
        content: "UNMA is building a comprehensive digital alumni directory to help Navodayans connect with batchmates and schoolmates. The directory will include professional profiles, location mapping, and batch-wise groupings while maintaining privacy preferences.",
        category: "initiative",
        date: new Date("2025-11-01"),
        isPublished: true,
    },
    {
        title: "BLS Training Program for Alumni",
        content: "UNMA's Medical Wing is conducting Basic Life Support (BLS) training sessions for alumni. The upcoming session during Republic Day celebration will be conducted by certified medical professionals.",
        category: "initiative",
        date: new Date("2025-12-01"),
        isPublished: true,
    },
];

const seedUpdates = async () => {
    try {
        // Check if updates already exist
        const existingCount = await Update.countDocuments();
        
        if (existingCount > 0) {
            console.log(`Updates collection already has ${existingCount} documents. Skipping seed.`);
            return;
        }

        // Insert seed data
        await Update.insertMany(UPDATES_SEED_DATA);
        console.log(`Successfully seeded ${UPDATES_SEED_DATA.length} updates`);
    } catch (error) {
        console.error("Error seeding updates:", error);
    }
};

export { UPDATES_SEED_DATA, seedUpdates };
export default seedUpdates;
