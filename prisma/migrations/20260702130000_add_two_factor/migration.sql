-- Authentification à deux facteurs (TOTP) pour better-auth
-- Flag sur user + table two_factor (secret, backup codes)
ALTER TABLE `user` ADD COLUMN `twoFactorEnabled` BOOLEAN NULL DEFAULT false;

CREATE TABLE `two_factor` (
  `id` VARCHAR(191) NOT NULL,
  `secret` VARCHAR(191) NOT NULL,
  `backupCodes` TEXT NOT NULL,
  `verified` BOOLEAN NOT NULL DEFAULT true,
  `userId` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `two_factor_secret_idx`(`secret`),
  INDEX `two_factor_userId_fkey`(`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `two_factor` ADD CONSTRAINT `two_factor_userId_fkey`
  FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
