import Admin from "../models/Admin.js";

const loginSeedData = async () => {
  try {
    let admin = await Admin.findOne({ email: "admin@summit2025.in" });

    if (!admin) {
      let admin = {
        email: "admin@summit2025.in",
        password: "@3#Hty_98Cvf!3vdf",
        role: "super_admin",
        name: "Super Admin",
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
