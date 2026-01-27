import Admin from "../models/Admin.js";
import { logger } from "../utils/logger.js";
import Registration from "../models/Registration.js";




export const getAdmin = async (req, res) => {
  try {
    const admin = await Admin.find();
    res.status(200).json(admin);
  } catch (error) {
    logger.error(`Error getting admin: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

export const getAdminById = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findById(id);
    res.status(200).json(admin);
  } catch (error) {
    logger.error(`Error getting admin: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const admin = await Admin.create(req.body);
    res.status(201).json(admin);
  } catch (error) {
    logger.error(`Error creating admin: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

// New function to create sub-admin
export const createSubAdmin = async (req, res) => {
  try {
    const { name, email, password, assignedSchools, permissions, sidebarAccess, role } = req.body;

    logger.info("Creating sub-admin with data:", {
      name,
      email,
      role,
      sidebarAccess,
      hasSidebarAccess: !!sidebarAccess,
      sidebarAccessLength: sidebarAccess?.length || 0,
    });

    // Validate required fields
    if (
      !name ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        status: "error",
        message:
          "Name, email, and password are required",
      });
    }

    // Validate role
    const validRoles = ["school_admin", "career_admin", "registration_desk"];
    const adminRole = validRoles.includes(role) ? role : "school_admin";

    const subAdminData = {
      name,
      email,
      password,
      role: adminRole,
      assignedSchools: assignedSchools || [],
      permissions: {
        canViewAllSchools: false,
        canManageAdmins: false,
        canViewAnalytics: permissions?.canViewAnalytics || true,
        canExportData: permissions?.canExportData || false,
        canManageSettings: false,
      },
      sidebarAccess: sidebarAccess || [],
      createdBy: req.admin._id,
    };

    logger.info("Sub-admin data to be created:", {
      ...subAdminData,
      password: "[REDACTED]",
    });

    const subAdmin = await Admin.create(subAdminData);

    // Remove password from response
    const response = subAdmin.toObject();
    delete response.password;

    res.status(201).json({
      status: "success",
      message: "Sub-admin created successfully",
      data: response,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        status: "error",
        message: "Email already exists",
      });
    }
    logger.error(`Error creating sub-admin: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

// Get all sub-admins (only for super admin)
export const getSubAdmins = async (req, res) => {
  try {
 

    const subAdmins = await Admin.find({ role: "school_admin" })
      .select("-password")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      data: subAdmins,
    });
  } catch (error) {
    logger.error(`Error getting sub-admins: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

// Update sub-admin
export const updateSubAdmin = async (req, res) => {
  try {
    
    const { id } = req.params;
    const { assignedSchools, permissions, isActive, sidebarAccess, role } = req.body;

    

    const updateData = {};
    if (assignedSchools) updateData.assignedSchools = assignedSchools;
    if (permissions)
      updateData.permissions = {
        ...permissions,
        canViewAllSchools: false,
        canManageAdmins: false,
      };
    if (typeof isActive === "boolean") updateData.isActive = isActive;
    if (sidebarAccess !== undefined) updateData.sidebarAccess = sidebarAccess;
    if (role) {
      const validRoles = ["school_admin", "career_admin", "registration_desk"];
      if (validRoles.includes(role)) {
        updateData.role = role;
      }
    }

    const subAdmin = await Admin.findByIdAndUpdate(id, updateData, {
      new: true,
    }).select("-password");

    if (!subAdmin) {
      return res.status(404).json({
        status: "error",
        message: "Sub-admin not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Sub-admin updated successfully",
      data: subAdmin,
    });
  } catch (error) {
    logger.error(`Error updating sub-admin: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(admin);
  } catch (error) {
    logger.error(`Error updating admin: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findByIdAndDelete(id);
    res.status(200).json({ message: "Admin deleted successfully", admin });
  } catch (error) {
    logger.error(`Error deleting admin: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};



// Get available schools for dropdown
export const getAvailableSchools = async (req, res) => {
  try {
    const schools = await Registration.distinct(
      "formDataStructured.personalInfo.school"
    );
    const schoolsFromOldField = await Registration.distinct("school");

    // Combine and filter unique schools
    const allSchools = [...new Set([...schools, ...schoolsFromOldField])]
      .filter((school) => school && school.trim() !== "")
      .sort();

    res.status(200).json({
      status: "success",
      data: allSchools,
    });
  } catch (error) {
    logger.error(`Error getting available schools: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};
