import fs from "fs";
import { dirname, join, extname } from "path";
import { fileURLToPath } from "url";
import { Binary } from "mongodb";
import { connectToMongo, getMongoClient } from "./mongoClient";



// Simulate __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Item interface
interface RawItem {
  id: number;
  name: string;
  imageFileName: string; // filename in /src/images
  price: number;
  description?: string; // optional for some items
  stockQuantity: number; // optional for some items
}

// Your item(s)
const items: RawItem[] = [
//   {
//     id: 1,
//     name: "Teddy Bear",
//     imageFileName: "teddy.png",
//     price: 1,
//     description: "A soft and cuddly teddy bear to warm your heart.",
//     stockQuantity: 100, 
//   },
//   {
//     id: 2,
//     name: "Gold Pendant",
//     imageFileName: "gold-pendant.png",
//     price: 500,
//     description: "A beautiful gold pendant to cherish forever.",
//     stockQuantity: 100, 
//   },
  
//   {
//       id: 3,
//       name: "Gold Ring",
//       imageFileName: "gold-ring.png",
//       price: 500,
//       description: "A stunning gold ring to symbolize your love.",
//       stockQuantity: 100,
//   },

//   {
//       id: 4,
//       name: "Wristwatch",
//       imageFileName: "wristwatch.png",
//       price: 750,
//       description: "A stylish wristwatch to keep you on time.",
//       stockQuantity: 100,    
//   },
//   {
//       id: 5,
//       name: "Wine Bottle",
//       imageFileName: "wine.png",
//       price: 600,
//       description: "A fine wine bottle to celebrate special moments.",
//       stockQuantity: 100,
//   },
//   {
//       id: 6,
//       name: "Ring Pack",
//       imageFileName: "velvetbox.png",
//       price: 1200,
//       description: "A luxurious velvet box containing a set of exquisite rings.",
//       stockQuantity: 100,
//   }
];

// Helper to load image file and convert to BSON
function loadImageAsBinary(filename: string): { binary: Binary; contentType: string } {
  const filePath = join(__dirname, "images", filename);
  const buffer = fs.readFileSync(filePath);
  const ext = extname(filename).toLowerCase();

  const mimeType =
    ext === ".png"
      ? "image/png"
      : ext === ".jpg" || ext === ".jpeg"
      ? "image/jpeg"
      : "application/octet-stream";

  return {
    binary: new Binary(buffer),
    contentType: mimeType,
  };
}

// Upload items to MongoDB
async function uploadItemsToMongo() {
  try {
    await connectToMongo();
    const client = getMongoClient();
    const db = client.db("Itiza_Delivery");
    const collection = db.collection("items");

    const formatted = items.map((item) => {
      const { binary, contentType } = loadImageAsBinary(item.imageFileName);
      return {
        id: item.id,
        name: item.name,
        price: item.price,
        img: binary,
        contentType,
        description: item.description || "",
        stockQuantity: item.stockQuantity,
        createdAt: new Date(),

      };
    });

    const result = await collection.insertMany(formatted);
    console.log(`✅ Uploaded ${result.insertedCount} item(s) to MongoDB.`);
  } catch (err) {
    console.error("❌ Upload error:", err);
  }
}

uploadItemsToMongo();