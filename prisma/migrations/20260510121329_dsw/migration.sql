-- CreateIndex
CREATE INDEX `Application_status_idx` ON `Application`(`status`);

-- CreateIndex
CREATE INDEX `Application_candidatId_jobOfferId_idx` ON `Application`(`candidatId`, `jobOfferId`);

-- CreateIndex
CREATE INDEX `Candidat_ville_idx` ON `Candidat`(`ville`);

-- CreateIndex
CREATE INDEX `Candidat_domaine_idx` ON `Candidat`(`domaine`);
