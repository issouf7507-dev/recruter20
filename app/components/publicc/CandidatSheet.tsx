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
  MessageCircle,
} from "lucide-react";
import { ProfilSection } from "./candidat-sections/ProfilSection";
import { ExperiencesFormationsSection } from "./candidat-sections/ExperiencesFormationsSection";
import { CandidaturesSection } from "./candidat-sections/CandidaturesSection";
import { AlertesSection } from "./candidat-sections/AlertesSection";
import { ObjectifsSection } from "./candidat-sections/ObjectifsSection";
import { DocumentsSection } from "./candidat-sections/DocumentsSection";
import { MessagesSection } from "./candidat-sections/MessagesSection";

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
        <SheetHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b gap-1 sm:gap-2">
          <SheetTitle className="text-xl sm:text-2xl">
            Espace Candidat
          </SheetTitle>
          <SheetDescription className="text-sm">
            Gérez votre profil, vos candidatures, et votre carrière
          </SheetDescription>
        </SheetHeader>

        <div className="overflow-hidden flex-1 flex flex-col">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="h-full flex flex-col"
          >
            <div className="border-b overflow-x-auto">
              <div className="px-4 sm:px-6">
                <TabsList className="inline-flex w-auto gap-1 sm:gap-2 h-auto p-1 bg-muted">
                  <TabsTrigger
                    value="profil"
                    className="flex flex-col items-center gap-1 py-2 sm:py-3 px-2 sm:px-3 data-[state=active]:bg-[#a590ff] data-[state=active]:text-white whitespace-nowrap shrink-0"
                  >
                    <User className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-[10px] sm:text-xs">Profil</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="experiences"
                    className="flex flex-col items-center gap-1 py-2 sm:py-3 px-2 sm:px-3 data-[state=active]:bg-[#a590ff] data-[state=active]:text-white whitespace-nowrap shrink-0"
                  >
                    <Briefcase className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-[10px] sm:text-xs">Expériences</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="candidatures"
                    className="flex flex-col items-center gap-1 py-2 sm:py-3 px-2 sm:px-3 data-[state=active]:bg-[#a590ff] data-[state=active]:text-white whitespace-nowrap shrink-0"
                  >
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-[10px] sm:text-xs">Candidatures</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="alertes"
                    className="flex flex-col items-center gap-1 py-2 sm:py-3 px-2 sm:px-3 data-[state=active]:bg-[#a590ff] data-[state=active]:text-white whitespace-nowrap shrink-0"
                  >
                    <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-[10px] sm:text-xs">Alertes</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="objectifs"
                    className="flex flex-col items-center gap-1 py-2 sm:py-3 px-2 sm:px-3 data-[state=active]:bg-[#a590ff] data-[state=active]:text-white whitespace-nowrap shrink-0"
                  >
                    <Target className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-[10px] sm:text-xs">Objectifs</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="documents"
                    className="flex flex-col items-center gap-1 py-2 sm:py-3 px-2 sm:px-3 data-[state=active]:bg-[#a590ff] data-[state=active]:text-white whitespace-nowrap shrink-0"
                  >
                    <FolderOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-[10px] sm:text-xs">Documents</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="messages"
                    className="flex flex-col items-center gap-1 py-2 sm:py-3 px-2 sm:px-3 data-[state=active]:bg-[#a590ff] data-[state=active]:text-white whitespace-nowrap shrink-0"
                  >
                    <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-[10px] sm:text-xs">Messages</span>
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 sm:py-4">
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

              <TabsContent value="messages" className="mt-0">
                <MessagesSection candidatId={candidat?.id} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
