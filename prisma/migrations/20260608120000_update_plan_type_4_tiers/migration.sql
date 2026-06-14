-- Aligner PlanType sur les 4 offres ATS du modèle économique YLSIX 2026-2028
-- Mapping des anciennes valeurs vers les nouvelles :
--   STARTER    -> DECOUVERTE (gratuit)
--   PRO        -> BUSINESS   (offres illimitées, multi-utilisateurs)
--   ENTREPRISE -> CORPORATE  (palier sur mesure le plus haut)

-- 1) Élargir temporairement les enums pour accepter anciennes ET nouvelles valeurs
ALTER TABLE `abonnement` MODIFY COLUMN `plan` ENUM('STARTER','PRO','ENTREPRISE','DECOUVERTE','PME','BUSINESS','CORPORATE') NOT NULL;
ALTER TABLE `paiement_history` MODIFY COLUMN `plan` ENUM('STARTER','PRO','ENTREPRISE','DECOUVERTE','PME','BUSINESS','CORPORATE') NOT NULL;

-- 2) Migrer les données existantes
UPDATE `abonnement` SET `plan` = 'DECOUVERTE' WHERE `plan` = 'STARTER';
UPDATE `abonnement` SET `plan` = 'BUSINESS' WHERE `plan` = 'PRO';
UPDATE `abonnement` SET `plan` = 'CORPORATE' WHERE `plan` = 'ENTREPRISE';

UPDATE `paiement_history` SET `plan` = 'DECOUVERTE' WHERE `plan` = 'STARTER';
UPDATE `paiement_history` SET `plan` = 'BUSINESS' WHERE `plan` = 'PRO';
UPDATE `paiement_history` SET `plan` = 'CORPORATE' WHERE `plan` = 'ENTREPRISE';

-- 3) Restreindre les enums aux 4 nouvelles valeurs uniquement
ALTER TABLE `abonnement` MODIFY COLUMN `plan` ENUM('DECOUVERTE','PME','BUSINESS','CORPORATE') NOT NULL;
ALTER TABLE `paiement_history` MODIFY COLUMN `plan` ENUM('DECOUVERTE','PME','BUSINESS','CORPORATE') NOT NULL;
