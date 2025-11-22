const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/Product");
const products = require("./data/products.json");

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Drop the entire collection to remove all indexes
    try {
      await Product.collection.drop();
      console.log("Dropped products collection");
    } catch (dropError) {
      console.log(
        "Collection didn't exist or couldn't be dropped, continuing..."
      );
    }

    // Transform products data - remove id field
    const productsToInsert = products.map((product) => {
      const { id, ...productData } = product;
      return productData;
    });

    await Product.insertMany(productsToInsert);
    console.log("Database seeded successfully!");

    // Verify the inserted products
    const count = await Product.countDocuments();
    console.log(`Total products in database: ${count}`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
