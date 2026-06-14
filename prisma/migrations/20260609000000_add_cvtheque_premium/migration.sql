-- Pilier 2 : CVthèque Premium (modèle économique YLSIX 2026-2028)
-- Basic : 10 000 FCFA/mois — 100 CV consultables
-- Pro   : 25 000 FCFA/mois — 500 CV consultables
-- Illimité : 50 000 FCFA/mois — illimité

-- 1) Créer la table abonnement_cvtheque
CREATE TABLE `abonnement_cvtheque` (
  `id`          VARCHAR(191) NOT NULL,
  `recruteurId` VARCHAR(191) NOT NULL,
  `plan`        ENUM('BASIC','PRO','ILLIMITE') NOT NULL,
  `statut`      ENUM('INACTIF','ACTIF','EXPIRE','SUSPENDU') NOT NULL DEFAULT 'INACTIF',
  `cvConsultes` INTEGER NOT NULL DEFAULT 0,
  `dateDebut`   DATETIME(3) NULL,
  `dateFin`     DATETIME(3) NULL,
  `createdAt`   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`   DATETIME(3) NOT NULL,

  UNIQUE INDEX `abonnement_cvtheque_recruteurId_key` (`recruteurId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2) Créer la table paiement_cvtheque
CREATE TABLE `paiement_cvtheque` (
  `id`            VARCHAR(191) NOT NULL,
  `abonnementId`  VARCHAR(191) NOT NULL,
  `reference`     VARCHAR(191) NOT NULL,
  `montant`       DOUBLE NOT NULL,
  `devise`        VARCHAR(191) NOT NULL DEFAULT 'XOF',
  `statut`        ENUM('EN_ATTENTE','COMPLETE','ECHOUE','EXPIRE','REMBOURSE') NOT NULL DEFAULT 'EN_ATTENTE',
  `plan`          ENUM('BASIC','PRO','ILLIMITE') NOT NULL,
  `geniuspayData` JSON NULL,
  `createdAt`     DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`     DATETIME(3) NOT NULL,

  UNIQUE INDEX `paiement_cvtheque_reference_key` (`reference`),
  INDEX `paiement_cvtheque_reference_idx` (`reference`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 3) Clés étrangères
ALTER TABLE `abonnement_cvtheque` ADD CONSTRAINT `abonnement_cvtheque_recruteurId_fkey`
  FOREIGN KEY (`recruteurId`) REFERENCES `Recruteur`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `paiement_cvtheque` ADD CONSTRAINT `paiement_cvtheque_abonnementId_fkey`
  FOREIGN KEY (`abonnementId`) REFERENCES `abonnement_cvtheque`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
