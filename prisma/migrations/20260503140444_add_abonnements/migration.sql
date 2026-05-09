-- CreateTable
CREATE TABLE `abonnement` (
    `id` VARCHAR(191) NOT NULL,
    `recruteurId` VARCHAR(191) NOT NULL,
    `plan` ENUM('STARTER', 'PRO', 'ENTREPRISE') NOT NULL,
    `statut` ENUM('INACTIF', 'ACTIF', 'EXPIRE', 'SUSPENDU') NOT NULL DEFAULT 'INACTIF',
    `dateDebut` DATETIME(3) NULL,
    `dateFin` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `abonnement_recruteurId_key`(`recruteurId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `paiement_history` (
    `id` VARCHAR(191) NOT NULL,
    `abonnementId` VARCHAR(191) NOT NULL,
    `reference` VARCHAR(191) NOT NULL,
    `montant` DOUBLE NOT NULL,
    `devise` VARCHAR(191) NOT NULL DEFAULT 'XOF',
    `statut` ENUM('EN_ATTENTE', 'COMPLETE', 'ECHOUE', 'EXPIRE', 'REMBOURSE') NOT NULL DEFAULT 'EN_ATTENTE',
    `plan` ENUM('STARTER', 'PRO', 'ENTREPRISE') NOT NULL,
    `geniuspayData` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `paiement_history_reference_key`(`reference`),
    INDEX `paiement_history_reference_idx`(`reference`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `abonnement` ADD CONSTRAINT `abonnement_recruteurId_fkey` FOREIGN KEY (`recruteurId`) REFERENCES `Recruteur`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `paiement_history` ADD CONSTRAINT `paiement_history_abonnementId_fkey` FOREIGN KEY (`abonnementId`) REFERENCES `abonnement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
