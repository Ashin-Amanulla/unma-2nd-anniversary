// Member associations data
// All associations have equal status - listing order does not imply hierarchy

export const MEMBER_ASSOCIATIONS = [
    {
        id: 1,
        name: "JNV Alumni Association, Thiruvananthapuram",
        district: "Thiruvananthapuram",
        region: "Kerala",
        yearJoined: 2023,
        status: "active",
    },
    {
        id: 2,
        name: "JNV Alumni Association, Kollam",
        district: "Kollam",
        region: "Kerala",
        yearJoined: 2023,
        status: "active",
    },
    {
        id: 3,
        name: "JNV Alumni Association, Pathanamthitta",
        district: "Pathanamthitta",
        region: "Kerala",
        yearJoined: 2023,
        status: "active",
    },
    {
        id: 4,
        name: "JNV Alumni Association, Alappuzha",
        district: "Alappuzha",
        region: "Kerala",
        yearJoined: 2023,
        status: "active",
    },
    {
        id: 5,
        name: "JNV Alumni Association, Kottayam",
        district: "Kottayam",
        region: "Kerala",
        yearJoined: 2023,
        status: "active",
    },
    {
        id: 6,
        name: "JNV Alumni Association, Idukki",
        district: "Idukki",
        region: "Kerala",
        yearJoined: 2023,
        status: "active",
    },
    {
        id: 7,
        name: "JNV Alumni Association, Ernakulam",
        district: "Ernakulam",
        region: "Kerala",
        yearJoined: 2023,
        status: "active",
    },
    {
        id: 8,
        name: "JNV Alumni Association, Thrissur",
        district: "Thrissur",
        region: "Kerala",
        yearJoined: 2023,
        status: "active",
    },
    {
        id: 9,
        name: "JNV Alumni Association, Palakkad",
        district: "Palakkad",
        region: "Kerala",
        yearJoined: 2023,
        status: "active",
    },
    {
        id: 10,
        name: "JNV Alumni Association, Malappuram",
        district: "Malappuram",
        region: "Kerala",
        yearJoined: 2023,
        status: "active",
    },
    {
        id: 11,
        name: "JNV Alumni Association, Kozhikode",
        district: "Kozhikode",
        region: "Kerala",
        yearJoined: 2023,
        status: "active",
    },
    {
        id: 12,
        name: "JNV Alumni Association, Wayanad",
        district: "Wayanad",
        region: "Kerala",
        yearJoined: 2023,
        status: "active",
    },
    {
        id: 13,
        name: "JNV Alumni Association, Kannur",
        district: "Kannur",
        region: "Kerala",
        yearJoined: 2023,
        status: "active",
    },
    {
        id: 14,
        name: "JNV Alumni Association, Kasaragod",
        district: "Kasaragod",
        region: "Kerala",
        yearJoined: 2023,
        status: "active",
    },
    {
        id: 15,
        name: "JNV Alumni Association, Mahe",
        district: "Mahe",
        region: "Mahe (UT)",
        yearJoined: 2023,
        status: "active",
    },
    {
        id: 16,
        name: "JNV Alumni Association, Lakshadweep",
        district: "Lakshadweep",
        region: "Lakshadweep (UT)",
        yearJoined: 2023,
        status: "active",
    },
];

// Get associations by region
export const getAssociationsByRegion = (region) => {
    return MEMBER_ASSOCIATIONS.filter((a) => a.region === region);
};

// Get active associations count
export const getActiveAssociationsCount = () => {
    return MEMBER_ASSOCIATIONS.filter((a) => a.status === "active").length;
};

export default MEMBER_ASSOCIATIONS;
