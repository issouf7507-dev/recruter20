-- Add structured interview date to ApplicationNote (candidat-side notes)
ALTER TABLE `ApplicationNote` ADD COLUMN `entretienDate` DATETIME(3) NULL;
