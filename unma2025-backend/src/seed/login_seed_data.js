import Admin from "../models/Admin.js";

const loginSeedData = async () => {
  try {
    let admin = await Admin.findOne({ email: "admin@unma.in" });

    if (!admin) {
      let admin = {
        email: process.env.ADMIN_EMAIL || "admin@example.com",
        password: process.env.ADMIN_PASSWORD || "securePassword123",
        role: "super_admin",
        name: "UNMA Admin",
        assignedSchools: [],
        permissions: {
          canViewAllSchools: true,
          canManageAdmins: true,
          canViewAnalytics: true,
          canExportData: true,
          canManageSettings: true,
        },
        isActive: true,
      };

      await Admin.create(admin);

      console.log("Super Admin created successfully");
    } else {
      console.log("Admin already exists");
    }
  } catch (error) {
    console.log("Error creating admin", error);
  }
};

export default loginSeedData;

