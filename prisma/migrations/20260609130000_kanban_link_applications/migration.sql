-- Add mappedStatus to KanbanColumn
ALTER TABLE `KanbanColumn` ADD COLUMN `mappedStatus` VARCHAR(191) NULL;

-- Add applicationId to KanbanCard
ALTER TABLE `KanbanCard` ADD COLUMN `applicationId` VARCHAR(191) NULL;
ALTER TABLE `KanbanCard` ADD UNIQUE INDEX `KanbanCard_applicationId_key` (`applicationId`);
ALTER TABLE `KanbanCard` ADD INDEX `KanbanCard_applicationId_idx` (`applicationId`);
ALTER TABLE `KanbanCard` ADD CONSTRAINT `KanbanCard_applicationId_fkey`
  FOREIGN KEY (`applicationId`) REFERENCES `Application`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
