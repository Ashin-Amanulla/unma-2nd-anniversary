// Helper function to get school filter for current admin
export const getSchoolFilter = (user) => {
  if (user.role === "super_admin" || user.permissions?.canViewAllSchools) {
    return {}; // No filter for super admin
  }

  if (user.assignedSchools && user.assignedSchools.length > 0) {
    return {
      $or: [
        {
          "formDataStructured.personalInfo.school": {
            $in: user.assignedSchools,
          },
        },
        { school: { $in: user.assignedSchools } }, // For backward compatibility
      ],
    };
  }

  return { _id: null }; // Return no results if no schools assigned
};
