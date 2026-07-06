-- Ajoute le flag super admin plateforme sur user
ALTER TABLE `user` ADD COLUMN `isSuperAdmin` BOOLEAN NOT NULL DEFAULT false;
