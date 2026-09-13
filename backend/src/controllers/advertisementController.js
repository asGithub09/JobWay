const fs = require("fs/promises");

const Advertisement = require("../models/Advertisement");

const {
  uploadCourseBanner,
  deleteCloudinaryAsset,
} = require("../services/cloudinaryService");

function serializeAdvertisement(advertisement) {
  if (!advertisement) {
    return null;
  }

  return {
    id: advertisement._id,
    name: advertisement.name,
    imageUrl: advertisement.imageUrl,
    title: advertisement.title,
    description: advertisement.description,
    ctaText: advertisement.ctaText,
    displayDelay: advertisement.displayDelay,
    placement: advertisement.placement,
    leadSource: advertisement.leadSource,
    isActive: advertisement.isActive,
    createdAt: advertisement.createdAt,
    updatedAt: advertisement.updatedAt,
  };
}

async function getActiveAdvertisement(req, res) {
  try {
    const advertisements = await Advertisement.find({
      placement: "landing-page",
      isActive: true,
    })
      .sort({ updatedAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      advertisements: advertisements.map(serializeAdvertisement),
    });
  } catch (error) {
    console.error("Get active advertisement error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load advertisement.",
    });
  }
}

async function getAdvertisements(req, res) {
  try {
    const advertisements = await Advertisement.find({
      placement: "landing-page",
    })
      .sort({ updatedAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      advertisements: advertisements.map(serializeAdvertisement),
    });
  } catch (error) {
    console.error("Get advertisements error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load advertisements.",
    });
  }
}

async function createAdvertisement(req, res) {
  let uploadedFilePath = "";
  let uploadedPublicId = "";

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an advertisement image.",
      });
    }

    uploadedFilePath = req.file.path;

    const uploadedImage = await uploadCourseBanner(
      uploadedFilePath,
      {
        folder: "jobway/advertisements",
      },
    );

    uploadedPublicId = uploadedImage.publicId;

    const {
      name,
      title,
      description,
      ctaText,
      displayDelay,
      isActive,
    } = req.body || {};

    const cleanName =
      String(name || "Landing Page Advertisement").trim() ||
      "Landing Page Advertisement";

    const cleanTitle = String(title || "").trim();
    const cleanDescription = String(description || "").trim();

    const cleanCtaText =
      String(ctaText || "Get Enrolled").trim() ||
      "Get Enrolled";

    const parsedDelay = Number(displayDelay);
    const safeDelay = Number.isFinite(parsedDelay)
      ? Math.min(Math.max(parsedDelay, 0), 60)
      : 5;

    const shouldActivate =
      String(isActive).toLowerCase() === "true";


    const advertisement = await Advertisement.create({
      name: cleanName,
      imageUrl: uploadedImage.secureUrl,
      cloudinaryPublicId: uploadedImage.publicId,
      title: cleanTitle,
      description: cleanDescription,
      ctaText: cleanCtaText,
      displayDelay: safeDelay,
      placement: "landing-page",
      leadSource: "landing-ad",
      isActive: shouldActivate,
    });

    return res.status(201).json({
      success: true,
      message: "Advertisement created successfully.",
      advertisement: serializeAdvertisement(advertisement),
    });
  } catch (error) {
    console.error("Create advertisement error:", error);

    if (uploadedPublicId) {
      await deleteCloudinaryAsset(uploadedPublicId).catch(
        (cloudinaryError) => {
          console.error(
            "Advertisement Cloudinary cleanup error:",
            cloudinaryError,
          );
        },
      );
    }

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to create advertisement.",
    });
  } finally {
    if (uploadedFilePath) {
      await fs.unlink(uploadedFilePath).catch(() => {});
    }
  }
}

async function updateAdvertisement(req, res) {
  try {
    const { id } = req.params;

    const advertisement =
      await Advertisement.findById(id);

    if (!advertisement) {
      return res.status(404).json({
        success: false,
        message: "Advertisement not found.",
      });
    }

    const {
      name,
      title,
      description,
      ctaText,
      displayDelay,
      isActive,
    } = req.body || {};

    if (name !== undefined) {
      advertisement.name =
        String(name).trim() ||
        "Landing Page Advertisement";
    }

    if (title !== undefined) {
      advertisement.title = String(title).trim();
    }

    if (description !== undefined) {
      advertisement.description =
        String(description).trim();
    }

    if (ctaText !== undefined) {
      advertisement.ctaText =
        String(ctaText).trim() ||
        "Get Enrolled";
    }

    if (displayDelay !== undefined) {
      const parsedDelay = Number(displayDelay);

      if (
        !Number.isFinite(parsedDelay) ||
        parsedDelay < 0 ||
        parsedDelay > 60
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Display delay must be between 0 and 60 seconds.",
        });
      }

      advertisement.displayDelay = parsedDelay;
    }

    if (isActive !== undefined) {
      const activate =
        isActive === true ||
        String(isActive).toLowerCase() === "true";


      advertisement.isActive = activate;
    }

    await advertisement.save();

    return res.status(200).json({
      success: true,
      message: "Advertisement updated successfully.",
      advertisement:
        serializeAdvertisement(advertisement),
    });
  } catch (error) {
    console.error("Update advertisement error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to update advertisement.",
    });
  }
}

async function deleteAdvertisement(req, res) {
  try {
    const { id } = req.params;

    const advertisement =
      await Advertisement.findByIdAndDelete(id);

    if (!advertisement) {
      return res.status(404).json({
        success: false,
        message: "Advertisement not found.",
      });
    }

    if (advertisement.cloudinaryPublicId) {
      await deleteCloudinaryAsset(
        advertisement.cloudinaryPublicId,
      ).catch((cloudinaryError) => {
        console.error(
          "Advertisement Cloudinary delete error:",
          cloudinaryError,
        );
      });
    }

    return res.status(200).json({
      success: true,
      message: "Advertisement deleted successfully.",
    });
  } catch (error) {
    console.error("Delete advertisement error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete advertisement.",
    });
  }
}

module.exports = {
  getActiveAdvertisement,
  getAdvertisements,
  createAdvertisement,
  updateAdvertisement,
  deleteAdvertisement,
};

