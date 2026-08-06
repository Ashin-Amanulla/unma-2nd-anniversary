import Admin from "../models/Admin.js";

const loginSeedData = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "securePassword123";

    let admin = await Admin.findOne({ email: adminEmail });

    if (!admin) {
      admin = {
        email: adminEmail,
        password: adminPassword,
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
