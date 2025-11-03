"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCandidat } from "@/lib/hooks/use-candidat";
import { useSession } from "@/lib/auth-client";
import {
  User,
  Briefcase,
  GraduationCap,
  FileText,
  Bell,
  Target,
  FolderOpen,
} from "lucide-react";
import { ProfilSection } from "./candidat-sections/ProfilSection";
import { ExperiencesFormationsSection } from "./candidat-sections/ExperiencesFormationsSection";
import { CandidaturesSection } from "./candidat-sections/CandidaturesSection";
import { AlertesSection } from "./candidat-sections/AlertesSection";
import { ObjectifsSection } from "./candidat-sections/ObjectifsSection";
import { DocumentsSection } from "./candidat-sections/DocumentsSection";

interface CandidatSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CandidatSheet({ open, onOpenChange }: CandidatSheetProps) {
  const { data: session } = useSession();
  const { candidat } = useCandidat();
  const [activeTab, setActiveTab] = useState("profil");

  // Reset tab when sheet closes
  useEffect(() => {
    if (!open) {
      setActiveTab("profil");
    }
  }, [open]);

  if (!session) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:w-3/4 lg:w-2/3 xl:w-1/2 h-full overflow-hidden flex flex-col p-0 bg-background border-none"
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b  gap-2">
          <SheetTitle className="text-2xl">Espace Candidat</SheetTitle>
          <SheetDescription>
            Gérez votre profil, vos candidatures, et votre carrière
          </SheetDescription>
        </SheetHeader>

        <div className=" overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="h-full flex flex-col"
          >
            <div className="border-b px-6">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 gap-2 h-auto">
                <TabsTrigger
                  value="profil"
                  className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-[#a590ff] data-[state=active]:text-primary-foreground"
                >
                  <User className="h-4 w-4" />
                  <span className="text-xs">Profil</span>
                </TabsTrigger>
                <TabsTrigger
                  value="experiences"
                  className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-[#a590ff] data-[state=active]:text-primary-foreground"
                >
                  <Briefcase className="h-4 w-4" />
                  <span className="text-xs">Expériences</span>
                </TabsTrigger>
                <TabsTrigger
                  value="candidatures"
                  className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-[#a590ff] data-[state=active]:text-primary-foreground"
                >
                  <FileText className="h-4 w-4" />
                  <span className="text-xs">Candidatures</span>
                </TabsTrigger>
                <TabsTrigger
                  value="alertes"
                  className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-[#a590ff] data-[state=active]:text-primary-foreground"
                >
                  <Bell className="h-4 w-4" />
                  <span className="text-xs">Alertes</span>
                </TabsTrigger>
                <TabsTrigger
                  value="objectifs"
                  className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-[#a590ff] data-[state=active]:text-primary-foreground"
                >
                  <Target className="h-4 w-4" />
                  <span className="text-xs">Objectifs</span>
                </TabsTrigger>
                <TabsTrigger
                  value="documents"
                  className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-[#a590ff] data-[state=active]:text-primary-foreground"
                >
                  <FolderOpen className="h-4 w-4" />
                  <span className="text-xs">Documents</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <TabsContent value="profil" className="mt-0">
                <ProfilSection candidat={candidat} />
              </TabsContent>

              <TabsContent value="experiences" className="mt-0 flex-1">
                <ExperiencesFormationsSection candidatId={candidat?.id} />
              </TabsContent>

              <TabsContent value="candidatures" className="mt-0">
                <CandidaturesSection candidatId={candidat?.id} />
              </TabsContent>

              <TabsContent value="alertes" className="mt-0">
                <AlertesSection candidatId={candidat?.id} />
              </TabsContent>

              <TabsContent value="objectifs" className="mt-0">
                <ObjectifsSection candidatId={candidat?.id} />
              </TabsContent>

              <TabsContent value="documents" className="mt-0">
                <DocumentsSection candidatId={candidat?.id} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
