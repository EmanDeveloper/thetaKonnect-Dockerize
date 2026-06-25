import dotenv from "dotenv";
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';


dotenv.config({
    path:"./.env"
})


cloudinary.config({ 
  cloud_name: process.env.Cloudinary_Cloud_Name, 
  api_key: process.env.Cloudinary_Api_Key, 
  api_secret:  process.env.Cloudinary_Api_Secret
})

// Create a CloudinaryStorage instance
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "Profilecreated",
        allowedFormats: ["png", "jpg", "jpeg"],
    },
});

// Extract the Cloudinary public_id from a delivery URL.
// e.g. https://res.cloudinary.com/<cloud>/image/upload/v123/<folder>/<name>.png -> <folder>/<name>
function getPublicIdFromUrl(url) {
  if (!url) return null;
  const parts = url.split("/");
  const versionIndex = parts.findIndex((p) => /^v\d+$/.test(p));
  if (versionIndex === -1) return null; // not a Cloudinary delivery URL (e.g. a default image)
  const publicIdWithExt = parts.slice(versionIndex + 1).join("/");
  return publicIdWithExt.replace(/\.[^/.]+$/, ""); // strip the file extension
}

// Best-effort delete: never throws, so a Cloudinary timeout/outage can't block DB deletions.
async function deleteFromCloudinary(url) {
  const publicId = getPublicIdFromUrl(url);
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { timeout: 15000 });
  } catch (error) {
    console.warn(
      `Cloudinary cleanup failed for "${publicId}":`,
      error?.error?.message || error?.message || error
    );
  }
}

export {
  cloudinary,
  storage,
  deleteFromCloudinary,
};
