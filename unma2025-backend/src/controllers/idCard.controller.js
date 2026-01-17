import Registration from "../models/Registration.js";
import IDCard from "../models/IDCard.js";
import IDCardGenerator from "../utils/idCardGenerator.js";
import { logger } from "../utils/logger.js";
import archiver from "archiver";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate ID card for a registration
 */
export const generateIDCard = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const { format = "png" } = req.query; // png or pdf

    // Validate registration ID
    if (!registrationId) {
      return res.status(400).json({
        status: "error",
        message: "Registration ID is required",
      });
    }

    // Fetch registration data
    const registration = await Registration.findById(registrationId);
    if (!registration) {
      return res.status(404).json({
        status: "error",
        message: "Registration not found",
      });
    }

    // Initialize ID card generator
    const generator = new IDCardGenerator();

    if (format === "pdf") {
      // Generate PDF
      const pdfBuffer = await generator.generatePDF(registration);

      // Set response headers
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="idcard-${
          registration.name || "unknown"
        }-${registrationId}.pdf"`
      );

      return res.send(pdfBuffer);
    } else {
      // Generate PNG (default)
      const imageBuffer = await generator.generateIDCard(registration);

      // Set response headers
      res.setHeader("Content-Type", "image/png");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="idcard-${
          registration.name || "unknown"
        }-${registrationId}.png"`
      );

      return res.send(imageBuffer);
    }
  } catch (error) {
    logger.error("Error generating ID card:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to generate ID card",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Generate and save ID card to file system
 */
export const generateAndSaveIDCard = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const { filename } = req.body;

    // Validate registration ID
    if (!registrationId) {
      return res.status(400).json({
        status: "error",
        message: "Registration ID is required",
      });
    }

    // Fetch registration data
    const registration = await Registration.findById(registrationId);
    if (!registration) {
      return res.status(404).json({
        status: "error",
        message: "Registration not found",
      });
    }

    // Initialize ID card generator
    const generator = new IDCardGenerator();

    // Generate and save ID card
    const result = await generator.saveIDCard(registration, filename);

    logger.info(`ID card generated and saved: ${result.filename}`);

    return res.status(200).json({
      status: "success",
      message: "ID card generated and saved successfully",
      data: result,
    });
  } catch (error) {
    logger.error("Error generating and saving ID card:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to generate and save ID card",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Bulk generate ID cards for multiple registrations
 */
export const bulkGenerateIDCards = async (req, res) => {
  try {
    const { registrationIds, saveToFile = false } = req.body;

    // Validate input
    if (
      !registrationIds ||
      !Array.isArray(registrationIds) ||
      registrationIds.length === 0
    ) {
      return res.status(400).json({
        status: "error",
        message: "Array of registration IDs is required",
      });
    }

    // Limit bulk processing to prevent server overload
    if (registrationIds.length > 50) {
      return res.status(400).json({
        status: "error",
        message: "Maximum 50 ID cards can be generated at once",
      });
    }

    // Fetch all registrations
    const registrations = await Registration.find({
      _id: { $in: registrationIds },
    });

    if (registrations.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No valid registrations found",
      });
    }

    // Initialize ID card generator
    const generator = new IDCardGenerator();
    const results = [];
    const errors = [];

    // Process each registration
    for (const registration of registrations) {
      try {
        if (saveToFile) {
          const result = await generator.saveIDCard(registration);
          results.push({
            registrationId: registration._id,
            name: registration.name,
            ...result,
          });
        } else {
          const imageBuffer = await generator.generateIDCard(registration);
          results.push({
            registrationId: registration._id,
            name: registration.name,
            image: imageBuffer.toString("base64"),
            mimeType: "image/png",
          });
        }
      } catch (error) {
        errors.push({
          registrationId: registration._id,
          name: registration.name,
          error: error.message,
        });
      }
    }

    logger.info(
      `Bulk ID card generation completed: ${results.length} successful, ${errors.length} failed`
    );

    return res.status(200).json({
      status: "success",
      message: `Generated ${results.length} ID cards successfully`,
      data: {
        successful: results,
        failed: errors,
        summary: {
          total: registrationIds.length,
          successful: results.length,
          failed: errors.length,
        },
      },
    });
  } catch (error) {
    logger.error("Error in bulk ID card generation:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to generate ID cards",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get list of downloadable ID cards (with payment completed)
 */
export const getDownloadableIDCards = async (req, res) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const skip = (page - 1) * limit;

    // Build query for registrations with completed payment and attending event
    let matchQuery = {
      $and: [
        {
          $or: [
            { paymentStatus: "completed" },
            { "formDataStructured.financial.paymentStatus": "completed" },
          ],
        },
        { "formDataStructured.eventAttendance.isAttending": true },
      ],
    };

    // Add search functionality
    if (search) {
      matchQuery.$and.push({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { contactNumber: { $regex: search, $options: "i" } },
        ],
      });
    }

    // Get registrations with completed payment
    const registrations = await Registration.find(matchQuery)
      .select(
        "_id name email contactNumber serialNumber paymentStatus formDataStructured.financial.paymentStatus"
      )
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    // Get corresponding ID card records
    const registrationIds = registrations.map((r) => r._id);
    const idCards = await IDCard.find({
      registrationId: { $in: registrationIds },
    }).select(
      "registrationId generationStatus downloadStatus fileName fileSize downloadCount lastDownloadDate"
    );

    // Create a map for quick lookup
    const idCardMap = new Map();
    idCards.forEach((card) => {
      idCardMap.set(card.registrationId.toString(), card);
    });

    // Combine registration and ID card data
    const downloadableCards = registrations.map((registration) => {
      const idCard = idCardMap.get(registration._id.toString());
      const paymentStatus =
        registration.paymentStatus ||
        registration.formDataStructured?.financial?.paymentStatus;

      return {
        registrationId: registration._id,
        name: registration.name,
        email: registration.email,
        contactNumber: registration.contactNumber,
        serialNumber: registration.serialNumber,
        paymentStatus,
        idCard: idCard
          ? {
              generationStatus: idCard.generationStatus,
              downloadStatus: idCard.downloadStatus,
              fileName: idCard.fileName,
              fileSize: idCard.fileSize,
              downloadCount: idCard.downloadCount,
              lastDownloadDate: idCard.lastDownloadDate,
              hasFile:
                idCard.fileName &&
                fs.existsSync(
                  path.join(
                    __dirname,
                    "../../generated-id-cards",
                    idCard.fileName
                  )
                ),
            }
          : {
              generationStatus: "pending",
              downloadStatus: "not_downloaded",
              hasFile: false,
            },
      };
    });

    // Get total count for pagination
    const totalCount = await Registration.countDocuments(matchQuery);

    return res.status(200).json({
      status: "success",
      data: {
        cards: downloadableCards,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalCards: totalCount,
          hasNext: skip + registrations.length < totalCount,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    logger.error("Error fetching downloadable ID cards:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch downloadable ID cards",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Bulk download ID cards as ZIP file
 */
export const bulkDownloadIDCards = async (req, res) => {
  try {
    const { registrationIds, downloadAll = false } = req.body;
    const adminId = req.user?.id; // Assuming admin authentication middleware

    let targetRegistrationIds = [];

    if (downloadAll) {
      // Get all registrations with completed payment and attending event
      const completedRegistrations = await Registration.find({
        $and: [
          {
            $or: [
              { paymentStatus: "Completed" },
              { "formDataStructured.financial.paymentStatus": "Completed" },
            ],
          },
          { "formDataStructured.eventAttendance.isAttending": true },
        ],
      }).select("_id");

      targetRegistrationIds = completedRegistrations.map((r) =>
        r._id.toString()
      );
    } else {
      // Validate provided registration IDs
      if (
        !registrationIds ||
        !Array.isArray(registrationIds) ||
        registrationIds.length === 0
      ) {
        return res.status(400).json({
          status: "error",
          message:
            "Array of registration IDs is required when downloadAll is false",
        });
      }

      // Verify all registrations have completed payment and are attending
      const registrations = await Registration.find({
        _id: { $in: registrationIds },
        $and: [
          {
            $or: [
              { paymentStatus: "Completed" },
              { "formDataStructured.financial.paymentStatus": "Completed" },
            ],
          },
          { "formDataStructured.eventAttendance.isAttending": true },
        ],
      }).select("_id");

      targetRegistrationIds = registrations.map((r) => r._id.toString());

      // Check if any registrations were filtered out due to incomplete payment or not attending
      const filteredCount =
        registrationIds.length - targetRegistrationIds.length;
      if (filteredCount > 0) {
        logger.warn(
          `Filtered out ${filteredCount} registrations due to incomplete payment or not attending event`
        );
      }
    }

    if (targetRegistrationIds.length === 0) {
      return res.status(404).json({
        status: "error",
        message:
          "No registrations found with completed payment status and attending event",
      });
    }

    // Limit to prevent server overload
    if (targetRegistrationIds.length > 500) {
      return res.status(400).json({
        status: "error",
        message: "Maximum 500 ID cards can be downloaded at once",
      });
    }

    // Get ID card records
    const idCards = await IDCard.find({
      registrationId: { $in: targetRegistrationIds },
      generationStatus: "generated",
    }).populate("registrationId", "name");

    if (idCards.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No generated ID cards found for the specified registrations",
      });
    }

    // Prepare file paths and check existence
    const idCardDir = path.join(__dirname, "../../generated-id-cards");
    const availableFiles = [];
    const missingFiles = [];

    for (const idCard of idCards) {
      if (idCard.fileName) {
        const filePath = path.join(idCardDir, idCard.fileName);
        if (fs.existsSync(filePath)) {
          availableFiles.push({
            idCard,
            filePath,
            fileName: idCard.fileName,
          });
        } else {
          missingFiles.push({
            registrationId: idCard.registrationId._id,
            name: idCard.registrationId.name,
            fileName: idCard.fileName,
          });
        }
      }
    }

    if (availableFiles.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No ID card files found on disk",
        missingFiles,
      });
    }

    // Set response headers for ZIP download
    const zipFileName = `UNMA_2025_ID_Cards_${
      new Date().toISOString().split("T")[0]
    }_${Date.now()}.zip`;
    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${zipFileName}"`
    );

    // Create ZIP archive
    const archive = archiver("zip", {
      zlib: { level: 9 }, // Maximum compression
    });

    // Handle archive errors
    archive.on("error", (err) => {
      logger.error("Archive error:", err);
      if (!res.headersSent) {
        return res.status(500).json({
          status: "error",
          message: "Failed to create ZIP archive",
        });
      }
    });

    // Pipe archive to response
    archive.pipe(res);

    // Add files to archive with organized naming
    for (const fileInfo of availableFiles) {
      const { idCard, filePath, fileName } = fileInfo;
      const registration = idCard.registrationId;

      // Create organized filename: SerialNumber_Name_RegistrationId.png
      const organizedFileName = `${
        idCard.serialNumber || "NoSerial"
      }_${registration.name.replace(/[^a-zA-Z0-9]/g, "_")}_${
        registration._id
      }.png`;

      archive.file(filePath, { name: organizedFileName });
    }

    // Finalize archive
    await archive.finalize();

    // Update download tracking for all processed ID cards
    const updatePromises = availableFiles.map(({ idCard }) => {
      return idCard.markAsDownloaded("bulk", {
        adminId,
        userAgent: req.get("User-Agent"),
        ipAddress: req.ip || req.connection.remoteAddress,
      });
    });

    await Promise.all(updatePromises);

    // Log download activity
    logger.info(
      `Bulk download initiated: ${availableFiles.length} ID cards, ${missingFiles.length} missing files, Admin: ${adminId}`
    );
  } catch (error) {
    logger.error("Error in bulk download:", error);
    if (!res.headersSent) {
      return res.status(500).json({
        status: "error",
        message: "Failed to create bulk download",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
};

/**
 * Generate and track ID cards for registrations with completed payment
 */
export const generateIDCardsForPaidRegistrations = async (req, res) => {
  try {
    const { batchSize = 500 } = req.body;
    const adminId = req.user?.id;

    // Find registrations with completed payment and attending event that don't have ID card records yet
    const completedRegistrations = await Registration.find({
      $and: [
        {
          $or: [
            { paymentStatus: "Completed" },
            { "formDataStructured.financial.paymentStatus": "Completed" },
          ],
        },
        { "formDataStructured.eventAttendance.isAttending": true },
      ],
    });

    if (completedRegistrations.length === 0) {
      return res.status(404).json({
        status: "error",
        message:
          "No registrations found with completed payment status and attending event",
      });
    }

    // Check which registrations already have ID card records
    const registrationIds = completedRegistrations.map((r) => r._id);
    const existingIdCards = await IDCard.find({
      registrationId: { $in: registrationIds },
    }).select("registrationId");

    const existingIdCardMap = new Set(
      existingIdCards.map((card) => card.registrationId.toString())
    );

    // Filter to only include registrations without ID card records
    const registrationsToProcess = completedRegistrations.filter(
      (reg) => !existingIdCardMap.has(reg._id.toString())
    );

    if (registrationsToProcess.length === 0) {
      return res.status(200).json({
        status: "success",
        message:
          "All paid and attending registrations already have ID card records",
        data: {
          totalPaidAndAttendingRegistrations: completedRegistrations.length,
          alreadyProcessed: completedRegistrations.length,
          newlyProcessed: 0,
        },
      });
    }

    // Limit batch processing to prevent server overload
    const batchesToProcess = registrationsToProcess.slice(
      0,
      Math.min(batchSize, 500)
    );

    const generator = new IDCardGenerator();
    const results = [];
    const errors = [];

    // Process each registration
    for (const registration of batchesToProcess) {
      const startTime = Date.now();

      try {
        // Create ID card record first
        const idCardRecord = new IDCard({
          registrationId: registration._id,
          name: registration.name,
          email: registration.email,
          serialNumber: registration.serialNumber,
          registrationType: registration.registrationType,
          generationStatus: "pending",
        });

        await idCardRecord.save();

        // Generate and save ID card file
        const fileInfo = await generator.saveIDCard(registration);
        const duration = Date.now() - startTime;

        // Update ID card record with success info
        await idCardRecord.markAsGenerated(
          {
            fileName: fileInfo.filename,
            filePath: fileInfo.path,
            fileSize: fs.statSync(fileInfo.path).size,
          },
          {
            adminId,
            duration,
            qrCodeData: generator.generateVCard(registration),
          }
        );

        results.push({
          registrationId: registration._id,
          name: registration.name,
          fileName: fileInfo.filename,
          success: true,
        });
      } catch (error) {
        // Update ID card record with error info
        const idCardRecord = await IDCard.findOne({
          registrationId: registration._id,
        });
        if (idCardRecord) {
          await idCardRecord.markAsFailedGeneration(error);
        }

        errors.push({
          registrationId: registration._id,
          name: registration.name,
          error: error.message,
        });
      }
    }

    logger.info(
      `Generated ID cards: ${results.length} successful, ${errors.length} failed`
    );

    return res.status(200).json({
      status: "success",
      message: `Generated ${results.length} ID cards for paid and attending registrations`,
      data: {
        totalPaidAndAttendingRegistrations: completedRegistrations.length,
        alreadyProcessed: existingIdCards.length,
        newlyProcessed: batchesToProcess.length,
        successful: results,
        failed: errors,
        remaining: Math.max(
          0,
          registrationsToProcess.length - batchesToProcess.length
        ),
        summary: {
          total: batchesToProcess.length,
          successful: results.length,
          failed: errors.length,
        },
      },
    });
  } catch (error) {
    logger.error(
      "Error generating ID cards for paid and attending registrations:",
      error
    );
    return res.status(500).json({
      status: "error",
      message:
        "Failed to generate ID cards for paid and attending registrations",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get download statistics and summary
 */
export const getDownloadStats = async (req, res) => {
  try {
    const stats = await IDCard.getBulkDownloadStats();

    // Get additional statistics
    const [
      totalRegistrations,
      paidRegistrations,
      pendingGeneration,
      failedGeneration,
      downloadedCards,
      notDownloadedCards,
    ] = await Promise.all([
      Registration.countDocuments(),
      Registration.countDocuments({
        $and: [
          {
            $or: [
              { paymentStatus: "completed" },
              { "formDataStructured.financial.paymentStatus": "completed" },
            ],
          },
          { "formDataStructured.eventAttendance.isAttending": true },
        ],
      }),
      IDCard.countDocuments({ generationStatus: "pending" }),
      IDCard.countDocuments({ generationStatus: "failed" }),
      IDCard.countDocuments({ downloadStatus: { $ne: "not_downloaded" } }),
      IDCard.countDocuments({ downloadStatus: "not_downloaded" }),
    ]);

    return res.status(200).json({
      status: "success",
      data: {
        registrations: {
          total: totalRegistrations,
          paidAndAttending: paidRegistrations,
          others: totalRegistrations - paidRegistrations,
        },
        idCards: {
          total: stats[0]?.totalGenerated || 0,
          pending: pendingGeneration,
          failed: failedGeneration,
          averageFileSize: Math.round(stats[0]?.averageFileSize || 0),
        },
        downloads: {
          downloaded: downloadedCards,
          notDownloaded: notDownloadedCards,
          bulkDownloaded: stats[0]?.totalBulkDownloaded || 0,
          totalDownloadCount: stats[0]?.totalDownloadCount || 0,
        },
      },
    });
  } catch (error) {
    logger.error("Error fetching download stats:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch download statistics",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get ID card preview (smaller version for display)
 */
export const getIDCardPreview = async (req, res) => {
  try {
    const { registrationId } = req.params;

    // Fetch registration data
    const registration = await Registration.findById(registrationId);
    if (!registration) {
      return res.status(404).json({
        status: "error",
        message: "Registration not found",
      });
    }

    // Generate ID card
    const generator = new IDCardGenerator();
    const imageBuffer = await generator.generateIDCard(registration);

    // Return as base64 for easy display in frontend
    const base64Image = imageBuffer.toString("base64");

    return res.status(200).json({
      status: "success",
      data: {
        registrationId,
        name: registration.name,
        image: `data:image/png;base64,${base64Image}`,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error("Error generating ID card preview:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to generate ID card preview",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Verify registration using QR code data
 */
export const verifyRegistration = async (req, res) => {
  try {
    const { registrationId } = req.params;

    // Fetch registration data
    const registration = await Registration.findById(registrationId).select(
      "name email contactNumber registrationType formSubmissionComplete emailVerified paymentStatus serialNumber"
    );

    if (!registration) {
      return res.status(404).json({
        status: "error",
        message: "Registration not found",
      });
    }

    // Return verification data
    return res.status(200).json({
      status: "success",
      message: "Registration verified successfully",
      data: {
        registrationId: registration._id,
        name: registration.name,
        email: registration.email,
        contactNumber: registration.contactNumber,
        registrationType: registration.registrationType,
        serialNumber: registration.serialNumber,
        isComplete: registration.formSubmissionComplete,
        isEmailVerified: registration.emailVerified,
        paymentStatus: registration.paymentStatus,
        verifiedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error("Error verifying registration:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to verify registration",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
