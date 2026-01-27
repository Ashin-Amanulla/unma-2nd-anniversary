// Activities data - joint initiatives among member associations

export const ACTIVITY_CATEGORIES = [
    { id: "alumni-meets", name: "Joint Alumni Meets", icon: "UsersIcon" },
    { id: "student-welfare", name: "Student Welfare", icon: "AcademicCapIcon" },
    { id: "health", name: "Health Awareness", icon: "HeartIcon" },
    { id: "career", name: "Career Guidance", icon: "BriefcaseIcon" },
    { id: "knowledge", name: "Knowledge Sharing", icon: "BookOpenIcon" },
    { id: "social", name: "Social Initiatives", icon: "HandRaisedIcon" },
];

export const ACTIVITIES = [
    {
        id: 1,
        title: "UNMA 2nd Anniversary & 77th Republic Day Celebration",
        category: "alumni-meets",
        description: "A grand celebration bringing together Navodayans from across Kerala, Mahe, and Lakshadweep. Features walkathon, cultural programs, health awareness sessions, and boat ride.",
        date: "January 26, 2026",
        location: "T. K. Ramakrishnan Samskarika Kendram, Ernakulam",
        participants: ["All Member Associations"],
        status: "upcoming",
        registrationLink: "/republic-day-event",
    },
    {
        id: 2,
        title: "Blood Donation Drive",
        category: "health",
        description: "Collaborative blood donation drive organized in partnership with Kerala Police Officers Association and Indian Medical Association.",
        date: "January 26, 2026",
        location: "T. K. Ramakrishnan Samskarika Kendram, Ernakulam",
        participants: ["All Member Associations", "Kerala Police Officers Association", "IMA"],
        status: "upcoming",
        registrationLink: "/republic-day-event",
    },
    {
        id: 3,
        title: "UNMA Career Portal Launch",
        category: "career",
        description: "Launch of a dedicated career portal to connect Navodayan job seekers with opportunities shared by fellow Navodayans.",
        date: "January 26, 2026",
        location: "Online",
        participants: ["All Member Associations"],
        status: "upcoming",
        registrationLink: "/careers",
    },
    {
        id: 4,
        title: "Health Awareness Session - BLS Training",
        category: "health",
        description: "Basic Life Support (BLS) training session conducted by medical professionals for Navodayan alumni.",
        date: "January 26, 2026",
        location: "T. K. Ramakrishnan Samskarika Kendram, Ernakulam",
        participants: ["All Member Associations"],
        status: "upcoming",
        registrationLink: "/republic-day-event",
    },
    {
        id: 5,
        title: "Ask Our Doctors - Interactive Health Session",
        category: "health",
        description: "Interactive session where Navodayan doctors address health queries from fellow alumni.",
        date: "January 26, 2026",
        location: "T. K. Ramakrishnan Samskarika Kendram, Ernakulam",
        participants: ["All Member Associations"],
        status: "upcoming",
        registrationLink: "/republic-day-event",
    },
    // Completed Activities
    {
        id: 6,
        title: "UNMA Global Conference 2025",
        category: "alumni-meets",
        description: "Historic gathering of nearly 3,000 Navodayan alumni from Kerala, Mahe, and Lakshadweep. Inaugurated by Ramesh Pisharody, the event featured cultural programs including Pookalam and Chenda Melam, expert speeches, book releases by 9 alumni authors, fashion show, talent hunt, and career guidance sessions. Over 30 exhibition stalls showcased alumni achievements.",
        date: "September 1, 2025",
        location: "CIAL Convention Centre, Nedumbassery, Kochi",
        participants: ["All Member Associations", "NVS Hyderabad Region"],
        status: "completed",
        galleryLink: "/gallery",
        highlights: [
            "Nearly 3,000 alumni attended",
            "Inaugurated by Ramesh Pisharody",
            "9 books by alumni released",
            "30+ exhibition stalls",
            "Cultural programs & talent hunt"
        ],
    },
    {
        id: 7,
        title: "UNMA Foundation Day - 1st Anniversary",
        category: "alumni-meets",
        description: "The inaugural celebration marking one year of UNMA's formation, bringing together alumni from all member associations for a day of networking and cultural exchange.",
        date: "January 26, 2025",
        location: "Kochi, Kerala",
        participants: ["All Member Associations"],
        status: "completed",
        galleryLink: "/gallery",
    },
    {
        id: 8,
        title: "Navodayan Scholarship Fund Launch",
        category: "student-welfare",
        description: "Launch of a scholarship fund to support underprivileged current JNV students with educational resources and financial assistance for higher education.",
        date: "August 15, 2025",
        location: "Online",
        participants: ["All Member Associations"],
        status: "completed",
    },
    {
        id: 9,
        title: "Career Mentorship Program - Batch 1",
        category: "career",
        description: "First batch of career mentorship program connecting experienced Navodayan professionals with recent graduates and job seekers. Over 150 mentee-mentor pairs formed.",
        date: "July 20, 2025",
        location: "Online",
        participants: ["All Member Associations"],
        status: "completed",
    },
    {
        id: 10,
        title: "Medical Camp for Wayanad Landslide Victims",
        category: "social",
        description: "Emergency medical camp organized by Navodayan doctors and volunteers to support Wayanad landslide affected families. Free health checkups and medicines distributed.",
        date: "August 5, 2025",
        location: "Wayanad, Kerala",
        participants: ["Wayanad Alumni Association", "UNMA Medical Wing"],
        status: "completed",
    },
    {
        id: 11,
        title: "Navodayan Entrepreneurs Meetup",
        category: "knowledge",
        description: "First-ever meetup of Navodayan entrepreneurs sharing experiences, challenges, and success stories. Featured panel discussions on startup ecosystem in Kerala.",
        date: "June 15, 2025",
        location: "Startup Village, Kochi",
        participants: ["All Member Associations"],
        status: "completed",
    },
];

// Get activities by category
export const getActivitiesByCategory = (categoryId) => {
    return ACTIVITIES.filter((a) => a.category === categoryId);
};

// Get upcoming activities
export const getUpcomingActivities = () => {
    return ACTIVITIES.filter((a) => a.status === "upcoming");
};

// Get completed activities
export const getCompletedActivities = () => {
    return ACTIVITIES.filter((a) => a.status === "completed");
};

export default ACTIVITIES;
