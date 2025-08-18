import ImageKit from "imagekit";
import fs from "fs/promises";
import fsSync from "fs"; // for createReadStream

const imageKit = new ImageKit({
  publicKey: process.env.imageKit_Public_Key as string,
  privateKey: process.env.imageKit_Private_Key as string,
  urlEndpoint: process.env.imageKit_Url_Endpoint as string,
});

interface FolderDetails {
  folderStructure: string;
}

interface UploadedImg {
  fileId: string;
  url: string;
  [key: string]: any;
}

export const UploadImages = async (
  filepath: string,
  name: string,
  folderDetails: FolderDetails,
  tags: string[] = []
): Promise<UploadedImg> => {
  try {
    // ✅ FIX: Use file stream instead of raw filepath
    const fileStream = fsSync.createReadStream(filepath);

    const uploadedImg = await imageKit.upload({
      file: fileStream, // ✅ stream instead of filepath string
      fileName: name,
      tags,
      folder: folderDetails.folderStructure,
      isPrivateFile: false,
      useUniqueFileName: false,
    });

    if (!uploadedImg) throw new Error("Image uploading failed from imageKit");

    await fs.unlink(filepath); // Clean up tmp file

    return uploadedImg as UploadedImg;
  } catch (error) {
    console.error("Error in UploadImages:", error);
    throw error;
  }
};

export const DeleteImage = async (fileId: string = ""): Promise<void> => {
  console.log(fileId);
  if (!fileId) {
    console.error("No fileId provided for deletion.");
    return;
  }
  imageKit.deleteFile(fileId, function (error: Error | null, result: unknown) {
    if (error) console.log(error);
    else console.log(result);
  });
};

export const DeleteBulkImage = async (fileId: string[] = []): Promise<void> => {
  return imageKit
    .bulkDeleteFiles(fileId)
    .then((response: unknown) => {
      console.log(response);
    })
    .catch((error: unknown) => {
      console.log(error);
    });
};
