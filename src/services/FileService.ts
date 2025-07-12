import { FileUpload, fileUploads, createFileUpload } from "../entities/FileUpload";
import { Product, createProduct } from "../entities/Product";

type CreatePendingFileInput = {
  filename: string;
  fileUrl: string;
  uploadedBy: number;
};

type ListFilesInput = {
  uploadedBy: number;
  page: number;
  size: number;
  status?: string;
  filename?: string;
};

export const FileService = {
  async createPendingFile({ filename, fileUrl, uploadedBy }: CreatePendingFileInput) {
    return createFileUpload({ filename, fileUrl, status: "pending", uploadedBy });
  },

  async processFile(fileId: number) {
    const file = fileUploads.find(f => f.id === fileId);
    if (!file) throw new Error("File not found");

    for (let i = 0; i < 10; i++) {
      createProduct({
        name: `Produk ${i + 1}`,
        price: Math.round(Math.random() * 10_000_000) / 100,
        stock: Math.floor(Math.random() * 100),
        origin: i % 2 === 0 ? "toko" : "individu",
        category: ["gadget", "aksesoris", "hardware", "office", "lifestyle"][i % 5],
        fileId: fileId,
      });
    }

    file.status = "success";
    file.updatedAt = new Date();
    return file;
  },

  async failFile(fileId: number, reason: string) {
    const file = fileUploads.find(f => f.id === fileId);
    if (file) {
      file.status = "fail";
      (file as any).failReason = reason;
      file.updatedAt = new Date();
    }
  },

  async listFiles({ uploadedBy, page, size, status, filename }: ListFilesInput) {
    let list = fileUploads.filter(f => f.uploadedBy === uploadedBy);
    if (status) list = list.filter(f => f.status === status);
    if (filename) list = list.filter(f => f.filename.includes(filename));
    
    const total = list.length;
    const pages = Math.ceil(total / size);
    list = list.slice((page - 1) * size, page * size);
    return { total, pages, page, size, list };
  }
};
