require("dotenv").config();

const path = require("path");
const mongoose = require("mongoose");

const Course = require("../src/models/Course");
const {
  uploadCourseBanner,
} = require("../src/services/cloudinaryService");

const MONGODB_URI = process.env.MONGODB_URI;

const migrations = [
  {
    title: "SSC CGL Complete Preparation",
    fileName: "1788503274309-297556318-ojdpic.jpg",
  },
  {
    title: "TestBanner",
    fileName: "1788503714022-400113885-ojd2.jpg",
  },
];

async function migrate() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured.");
  }

  await mongoose.connect(MONGODB_URI);

  console.log("MongoDB connected.");

  for (const migration of migrations) {
    console.log(`\nMigrating: ${migration.title}`);

    const course = await Course.findOne({
      title: migration.title,
    });

    if (!course) {
      console.log("Course not found. Skipping.");
      continue;
    }

    console.log(`Course ID: ${course._id}`);
    console.log(`Current banner: ${course.bannerImage}`);

    if (
      course.bannerImage &&
      course.bannerImage.includes("res.cloudinary.com")
    ) {
      console.log("Already using Cloudinary. Skipping.");
      continue;
    }

    const localFilePath = path.join(
      __dirname,
      "..",
      "uploads",
      "course-banners",
      migration.fileName,
    );

    console.log(`Local file: ${localFilePath}`);

    const uploadedImage = await uploadCourseBanner(localFilePath, {
      folder: "jobway/course-banners",
    });

    console.log(`Cloudinary URL: ${uploadedImage.secureUrl}`);
    console.log(`Cloudinary public ID: ${uploadedImage.publicId}`);

    course.bannerImage = uploadedImage.secureUrl;

    await course.save();

    console.log("Course updated successfully.");
  }

  console.log("\nBanner migration completed.");
}

migrate()
  .catch((error) => {
    console.error("\nMigration failed:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => {});
  });