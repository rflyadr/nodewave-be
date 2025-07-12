import { Request, Response } from "express";
import { prisma } from "../../utils/prisma.utils";
import { response_success, response_bad_request } from "../../utils/response.utils";
import { getUserFromJWT } from "../../utils/user.utils";
import XLSX from "xlsx";
import fs from "fs";
import path from "path";

export const uploadFile = async (req: Request, res: Response) => {
  const user = getUserFromJWT(req);

  if (!req.file) {
    return response_bad_request(res, "File wajib diupload (gunakan form-data dengan key 'file').");
  }

  const { originalname, filename, path: filePath, mimetype, size } = req.file;

  const fileUpload = await prisma.fileUpload.create({
    data: {
      filename: originalname,
      status: "PENDING",
      user: { connect: { id: user.id } },
      data: {
        storedFilename: filename,
        path: filePath,
        mimetype,
        size,
      },
    },
  });

  setTimeout(async () => {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];

      const rows = XLSX.utils.sheet_to_json<Record<string, any>>(workbook.Sheets[sheetName]);
          
      for (const row of rows) {
        await prisma.product.create({
          data: {
            name: String(row["name"] ?? row["Nama Produk"] ?? "Produk Tanpa Nama"),
            price: Number(row["price"] ?? row["Harga"] ?? 0),
            stock: Number(row["stock"] ?? row["Stok"] ?? 0),
            origin: String(row["origin"] ?? row["Origin"] ?? "toko"),
            category: String(row["category"] ?? row["Kategori"] ?? "lainnya"),
            is_active: true,
            fileId: fileUpload.id,
          },
        });
      }

      await prisma.fileUpload.update({
        where: { id: fileUpload.id },
        data: { status: "SUCCESS", processedAt: new Date() },
      });
    } catch (err: any) {
      await prisma.fileUpload.update({
        where: { id: fileUpload.id },
        data: { status: "FAIL", error: err.message },
      });
    }
  }, 2000);

  return response_success(res, {
    message: "Upload sukses! File sedang diproses di background.",
    id: fileUpload.id,
    fileInfo: {
      originalname, filename, path: filePath, mimetype, size
    },
  });
};


// ============ LIST FILES ============

export const listFiles = async (req: Request, res: Response) => {
  const user = getUserFromJWT(req);
  console.log("[DEBUG] Logged in user:", user);


  let { page = 1, rows = 10, filters, searchFilters, rangedFilters, orderKey, orderRule } = req.query;

  // 1. Parse filters
  let filtersObj: Record<string, any> = {};
  if (filters) {
    try {
      filtersObj = JSON.parse(String(filters));
    } catch {
      return response_bad_request(res, "filters format must be valid JSON!");
    }
  }

  // 2. Parse searchFilters
  let searchObj: Record<string, any> = {};
  if (searchFilters) {
    try {
      searchObj = JSON.parse(String(searchFilters));
    } catch {
      return response_bad_request(res, "searchFilters format must be valid JSON!");
    }
  }

  // 3. Parse rangedFilters
  let rangedArr: any[] = [];
  if (rangedFilters) {
    try {
      rangedArr = JSON.parse(String(rangedFilters));
      if (!Array.isArray(rangedArr)) throw new Error();
    } catch {
      return response_bad_request(res, "rangedFilters format must be JSON array!");
    }
  }

  // 4. Build Prisma "where"
  let where: any = {};
  
  for (const key in filtersObj) {
    if (key === "uploadedBy" && user.role === "ADMIN") continue;
  
    const value = filtersObj[key];
    where[key] = Array.isArray(value) ? { in: value } : value;
  }
  
  if (user.role !== "ADMIN" && !filtersObj.uploadedBy) {
    where.uploadedBy = user.id;
  }

  // 5. SearchFilters (OR conditions with contains)
  if (Object.keys(searchObj).length > 0) {
    where.OR = Object.entries(searchObj).map(([k, v]) => ({
      [k]: { contains: v }
    }));
  }

  // 6. RangedFilters
  for (const range of rangedArr) {
    if (range.key && range.start !== undefined && range.end !== undefined) {
      const gteDate = new Date(range.start);
      const lteDate = new Date(range.end);
      if (isNaN(gteDate.getTime()) || isNaN(lteDate.getTime())) {
        return response_bad_request(res, "Invalid date format in rangedFilters");
      }
      where[range.key] = { gte: gteDate, lte: lteDate };
    }
  }

  // 7. Sorting
  type SortOrder = "asc" | "desc";
  const orderRuleStr = String(orderRule).toLowerCase();
  const orderRuleVal: SortOrder = orderRuleStr === "asc" || orderRuleStr === "desc" ? orderRuleStr as SortOrder : "desc";
  const orderBy = orderKey ? { [String(orderKey)]: orderRuleVal } : { createdAt: "desc" as SortOrder };

  // 8. Pagination
  const skip = (Number(page) - 1) * Number(rows);
  const take = Number(rows);

  // 9. Query Prisma
  let total = 0;
  let files: any[] = [];
  try {
    total = await prisma.fileUpload.count({ where });

    files = await prisma.fileUpload.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    });
  } catch (err: any) {
    return response_bad_request(res, err.message || "Query error");
  }

  // 10. Response
  return response_success(res, {
    page: Number(page),
    rows: Number(rows),
    total,
    files,
  });
};


export const getFileContent = async (req: Request, res: Response) => {
  const user = getUserFromJWT(req);
  const fileId = Number(req.params.id);
  if (isNaN(fileId)) return response_bad_request(res, "Invalid file ID");

  try {
    const fileRecord = await prisma.fileUpload.findUnique({
      where: { id: fileId },
      include: { user: true },
    });
    if (!fileRecord) return response_bad_request(res, "File not found");
    if (fileRecord.uploadedBy !== user.id) return res.status(403).json({ message: "Unauthorized" });

    const storedFilename = (fileRecord.data as any)?.storedFilename;
    if (!storedFilename) return response_bad_request(res, "Stored filename not found");

    const filePath = path.join(__dirname, "../../../uploads", storedFilename);
    if (!fs.existsSync(filePath)) return response_bad_request(res, "File not found on disk");

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    return response_success(res, { rows });
  } catch (err: any) {
    return response_bad_request(res, err.message || "Error reading file content");
  }
};


export const deleteFile = async (req: Request, res: Response) => {
  const user = getUserFromJWT(req);
  const fileId = Number(req.params.id);
  if (isNaN(fileId)) return response_bad_request(res, "Invalid file ID");

  try {
    const fileRecord = await prisma.fileUpload.findUnique({
      where: { id: fileId },
    });

    if (!fileRecord) return response_bad_request(res, "File not found");

    if (fileRecord.uploadedBy !== user.id && user.role.toLowerCase() !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await prisma.fileUpload.update({
      where: { id: fileId },
      data: { status: "DELETED" },
    });

    await prisma.product.updateMany({
      where: { fileId },
      data: { is_active: false },
    });

    return response_success(res, { message: "File marked as deleted, related products deactivated." });
  } catch (err: any) {
    console.error("Error soft deleting file:", err);
    return response_bad_request(res, err.message || "Error deleting file");
  }
};
