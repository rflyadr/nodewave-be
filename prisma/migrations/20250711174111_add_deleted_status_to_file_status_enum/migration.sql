-- AlterTable
ALTER TABLE `fileupload` MODIFY `status` ENUM('PENDING', 'SUCCESS', 'FAIL', 'DELETED') NOT NULL;
