import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const root = process.cwd();
const productsFile = path.join(root, "data", "products.ts");
const imagesFolder = path.join(root, "public", "products");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  console.error(
    "Faltan SUPABASE_URL o SUPABASE_SECRET_KEY en el archivo .env.sync"
  );
  process.exit(1);
}

if (!fs.existsSync(productsFile)) {
  console.error("No se encontró data/products.ts");
  process.exit(1);
}

if (!fs.existsSync(imagesFolder)) {
  console.error("No se encontró public/products");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

function repairText(value) {
  if (!/[ÃÂâ]/.test(value)) {
    return value;
  }

  try {
    const repaired = Buffer.from(value, "latin1").toString("utf8");

    if (repaired.includes("�")) {
      return value;
    }

    return repaired;
  } catch {
    return value;
  }
}

const productSource = fs.readFileSync(productsFile, "utf8");

const productRegex =
  /{\s*id:\s*"([^"]*)",\s*name:\s*"([^"]*)",\s*code:\s*"([^"]*)",\s*price:\s*([0-9.]+),\s*category:\s*"([^"]*)",\s*image:\s*"([^"]*)",\s*available:\s*(true|false),\s*featured:\s*(true|false),?\s*}/gs;

const imageFiles = fs
  .readdirSync(imagesFolder, { withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => entry.name);

const imageMap = new Map();

for (const fileName of imageFiles) {
  const baseName = path.parse(fileName).name.toLowerCase();
  imageMap.set(baseName, fileName);
}

const products = [];
const missingImages = [];

for (const match of productSource.matchAll(productRegex)) {
  const [
    ,
    id,
    originalName,
    code,
    price,
    originalCategory,
    previousImage,
    available,
    featured,
  ] = match;

  const previousFileName = path.basename(previousImage);
  const baseName = path.parse(previousFileName).name.toLowerCase();
  const realFileName = imageMap.get(baseName);

  if (!realFileName) {
    missingImages.push({
      id,
      name: originalName,
      image: previousImage,
    });
  }

  products.push({
    id,
    name: repairText(originalName),
    code,
    price: Number(price),
    category: repairText(originalCategory),
    image: realFileName
      ? `/products/${realFileName}`
      : previousImage,
    available: available === "true",
    featured: featured === "true",
    updated_at: new Date().toISOString(),
  });
}

if (products.length === 0) {
  console.error("No se encontraron productos en data/products.ts");
  process.exit(1);
}

if (missingImages.length > 0) {
  console.log("");
  console.log("IMÁGENES NO ENCONTRADAS:");

  for (const item of missingImages) {
    console.log(`- ${item.id} | ${item.name} | ${item.image}`);
  }

  console.log("");
  console.log(
    "Corrige esas imágenes antes de sincronizar para evitar productos sin foto."
  );

  process.exit(1);
}

console.log(`Productos encontrados: ${products.length}`);
console.log("Sincronizando con Supabase...");

const { error } = await supabase
  .from("products")
  .upsert(products, {
    onConflict: "id",
  });

if (error) {
  console.error("Error sincronizando productos:");
  console.error(error);
  process.exit(1);
}

console.log("Sincronización terminada correctamente.");
console.log("Supabase ya tiene los nombres, precios e imágenes actualizados.");