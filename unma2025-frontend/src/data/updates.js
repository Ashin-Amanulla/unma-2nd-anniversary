// Updates/News data - static fallback for frontend display

export const UPDATES_DATA = [
    // News
    {
        id: 1,
        title: "UNMA Global Conference 2025 - A Historic Success!",
        content: "Nearly 3,000 Navodayan alumni gathered at CIAL Convention Centre, Nedumbassery for the UNMA Global Conference 2025. The event, inaugurated by renowned TV/Cinema star Ramesh Pisharody, featured cultural programs including Pookalam and Chenda Melam, expert speeches, book releases by 9 alumni authors, fashion show, talent hunt, career guidance sessions, and over 30 exhibition stalls.",
        category: "news",
        date: "September 1, 2025",
        link: "https://www.manoramaonline.com/district-news/ernakulam/2025/09/01/jawahar-navodaya-alumni.html",
    },
    {
        id: 2,
        title: "UNMA 2nd Anniversary & Republic Day Celebration Announced",
        content: "UNMA invites all Navodayans to join the 2nd Anniversary celebrations combined with 77th Republic Day on January 26, 2026 at T. K. Ramakrishnan Samskarika Kendram, Ernakulam. The event features walkathon, cultural programs, health awareness sessions, blood donation drive, and a memorable boat ride.",
        category: "news",
        date: "December 15, 2025",
        link: "/republic-day-event",
    },
    {
        id: 3,
        title: "Ramesh Pisharody Inaugurates UNMA Global Conference",
        content: "Popular TV and cinema star Ramesh Pisharody inaugurated the UNMA Global Conference at CIAL Convention Centre. In his address, he humorously recalled his own school days and connected with the audience through shared experiences of student life.",
        category: "news",
        date: "September 1, 2025",
    },

    // Announcements
    {
        id: 4,
        title: "Registration Open for Republic Day Celebration 2026",
        content: "Online registration is now open for the UNMA 2nd Anniversary & 77th Republic Day Celebration. Limited seats available! Register early to secure your participation in the walkathon, cultural programs, health sessions, and boat ride.",
        category: "announcement",
        date: "December 20, 2025",
        link: "/republic-day-event",
    },
    {
        id: 5,
        title: "UNMA Career Portal Coming Soon",
        content: "UNMA is launching a dedicated career portal to connect Navodayan job seekers with opportunities shared by fellow Navodayans. The portal will feature job listings, internship opportunities, and a mentorship matching system.",
        category: "announcement",
        date: "December 10, 2025",
    },
    {
        id: 6,
        title: "Call for Volunteers - Republic Day Event",
        content: "We are looking for enthusiastic volunteers to help organize the UNMA 2nd Anniversary celebration. Various roles available including registration desk, cultural program coordination, health camp support, and transportation assistance.",
        category: "announcement",
        date: "December 18, 2025",
        link: "/contact",
    },
    {
        id: 7,
        title: "Blood Donation Drive - Join Us!",
        content: "UNMA is organizing a blood donation drive in collaboration with Kerala Police Officers Association and Indian Medical Association during the Republic Day celebration. All healthy adults are encouraged to participate.",
        category: "announcement",
        date: "December 22, 2025",
    },

    // Activities
    {
        id: 8,
        title: "Navodayan Scholarship Fund Supports 50 Students",
        content: "The Navodayan Scholarship Fund launched in August 2025 has successfully supported 50 underprivileged current JNV students with educational resources. The fund continues to accept donations from alumni.",
        category: "activity",
        date: "November 15, 2025",
    },
    {
        id: 9,
        title: "Career Mentorship Program - 150+ Pairs Matched",
        content: "The first batch of UNMA Career Mentorship Program has successfully connected over 150 experienced Navodayan professionals with recent graduates and job seekers. Applications for the second batch will open soon.",
        category: "activity",
        date: "October 20, 2025",
    },
    {
        id: 10,
        title: "Medical Camp for Wayanad Landslide Victims",
        content: "UNMA's Medical Wing, in collaboration with Wayanad Alumni Association, organized an emergency medical camp for Wayanad landslide affected families. Free health checkups and medicines were distributed to over 500 beneficiaries.",
        category: "activity",
        date: "August 5, 2025",
    },
    {
        id: 11,
        title: "9 Alumni Authors Celebrated at Global Conference",
        content: "Nine Navodayan alumni had their books released at the UNMA Global Conference 2025. The publications span various genres including fiction, non-fiction, technical books, and poetry.",
        category: "activity",
        date: "September 1, 2025",
    },

    // Initiatives
    {
        id: 12,
        title: "UNMA Medical Wing Formation",
        content: "UNMA has formed a dedicated Medical Wing comprising Navodayan doctors and healthcare professionals. The wing aims to organize health camps, provide medical guidance to alumni, and support healthcare initiatives.",
        category: "initiative",
        date: "July 1, 2025",
    },
    {
        id: 13,
        title: "Navodayan Entrepreneurs Network Launched",
        content: "A dedicated network for Navodayan entrepreneurs has been launched to facilitate collaboration, mentorship, and investment opportunities. The first meetup at Startup Village, Kochi saw participation from 75+ entrepreneur alumni.",
        category: "initiative",
        date: "June 15, 2025",
    },
    {
        id: 14,
        title: "Digital Alumni Directory Project",
        content: "UNMA is building a comprehensive digital alumni directory to help Navodayans connect with batchmates and schoolmates. The directory will include professional profiles and batch-wise groupings while maintaining privacy.",
        category: "initiative",
        date: "November 1, 2025",
    },
    {
        id: 15,
        title: "BLS Training Program for Alumni",
        content: "UNMA's Medical Wing is conducting Basic Life Support (BLS) training sessions for alumni. The upcoming session during Republic Day celebration will be conducted by certified medical professionals.",
        category: "initiative",
        date: "December 1, 2025",
    },
];

// Get updates by category
export const getUpdatesByCategory = (category) => {
    if (category === "all") return UPDATES_DATA;
    return UPDATES_DATA.filter((u) => u.category === category);
};

// Get recent updates (sorted by date, newest first)
export const getRecentUpdates = (limit = 5) => {
    return [...UPDATES_DATA]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, limit);
};

// Get news only
export const getNews = () => UPDATES_DATA.filter((u) => u.category === "news");

// Get announcements only
export const getAnnouncements = () => UPDATES_DATA.filter((u) => u.category === "announcement");

// Get activities only
export const getActivitiesUpdates = () => UPDATES_DATA.filter((u) => u.category === "activity");

// Get initiatives only
export const getInitiatives = () => UPDATES_DATA.filter((u) => u.category === "initiative");

export default UPDATES_DATA;
