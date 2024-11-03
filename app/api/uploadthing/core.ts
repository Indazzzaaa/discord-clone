import { auth } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

const handleAuth = async () => {
  const { userId } = await auth();
  if (!userId) throw new Error("->> Unauthorized");

  return { userId: userId };
};

export const ourFileRouter = {
  serverImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      console.log("->> serverImage Auth");
      const user = await handleAuth();
      console.log("->> serverImage Auth Completed");
      return user;
    })
    .onUploadError((error) => {
      console.log("->> Error while uploading :", error);
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload completed for user id: ", metadata.userId);
      console.log("File URL: ", file, file.url);

      return { uploadedBy: metadata.userId };
    }),

  messageFile: f(["image", "pdf"])
    .middleware(async () => await handleAuth())
    .onUploadComplete(() => {}),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
