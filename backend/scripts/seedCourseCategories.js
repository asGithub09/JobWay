require("dotenv").config();

const connectDB = require("../src/config/db");
const CourseCategory = require("../src/models/CourseCategory");

const categories = [
  {
    name: "SSC",
    slug: "ssc",
    description: "Staff Selection Commission examinations and preparation.",
    displayOrder: 1,
  },
  {
    name: "Banking",
    slug: "banking",
    description: "Banking examinations including IBPS, SBI and related exams.",
    displayOrder: 2,
  },
  {
    name: "UPSC",
    slug: "upsc",
    description: "UPSC Civil Services and other central government examinations.",
    displayOrder: 3,
  },
  {
    name: "Railway",
    slug: "railway",
    description: "Railway recruitment examinations and preparation.",
    displayOrder: 4,
  },
  {
    name: "State PSC",
    slug: "state-psc",
    description: "State Public Service Commission examinations.",
    displayOrder: 5,
  },
  {
    name: "Teaching",
    slug: "teaching",
    description: "Teaching and education recruitment examinations.",
    displayOrder: 6,
  },
  {
    name: "Defence",
    slug: "defence",
    description: "Defence recruitment and entrance examinations.",
    displayOrder: 7,
  },
  {
    name: "Engineering",
    slug: "engineering",
    description: "Engineering entrance, recruitment and competitive examinations.",
    displayOrder: 8,
  },
  {
    name: "Medical",
    slug: "medical",
    description: "Medical entrance and competitive examinations.",
    displayOrder: 9,
  },
  {
    name: "Other",
    slug: "other",
    description: "Other competitive examinations and preparation programs.",
    displayOrder: 10,
  },
];

async function seedCategories() {
  try {
    await connectDB();

    for (const category of categories) {
      await CourseCategory.updateOne(
        { slug: category.slug },
        {
          $set: {
            name: category.name,
            description: category.description,
            isActive: true,
            displayOrder: category.displayOrder,
          },
          $setOnInsert: {
            slug: category.slug,
            icon: "",
            image: "",
          },
        },
        {
          upsert: true,
        },
      );

      console.log(`✓ ${category.name}`);
    }

    console.log("\nCourse categories seeded successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed course categories:");
    console.error(error);
    process.exit(1);
  }
}

seedCategories();