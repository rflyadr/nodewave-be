export interface FileUpload {
  id: number;
  filename: string;
  fileUrl: string;
  status: "pending" | "success" | "fail";
  uploadedBy: number;
  createdAt: Date;
  updatedAt: Date;
  failReason?: string;
}

export const fileUploads: FileUpload[] = [];
let idCounter = 1;

export function createFileUpload(data: Omit<FileUpload, "id" | "createdAt" | "updatedAt">): FileUpload {
  const file: FileUpload = {
    id: idCounter++,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...data,
  };
  fileUploads.push(file);
  return file;
}
