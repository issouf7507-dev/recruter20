// app/actions/signup.ts
"use server";

import prisma from "@/lib/prisma";

export async function completeSignupRecruteur(data: {
  description: string;
  email: string;
  type: "ENTREPRISE" | "PARTICULIER" | "ENTITE";
  typeUser: "RECRUTEUR" | "COLLABORATEUR" | "CANDIDAT";
  firstName: string;
  lastName: string;
  companyName: string;
  phone: string;
}) {
  return await prisma.user.update({
    where: { email: data.email },
    data: {
      email: data.email,
      name: data.firstName + " " + data.lastName,
      type: data.typeUser || "RECRUTEUR",
      recruteur: {
        create: {
          type: data.type || "ENTREPRISE",
          companyName: data.companyName,
          description: data.description,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
        },
      },
    },
  });
}

export async function completeSignupCandidat(data: {
  email: string;
  password?: string;
  confirmPassword?: string;
  nom: string;
  prenom: string;
  telephone: string;
  pays: string;
  dateNaissance: string;
  nationalite: string;
  situationFamiliale?: string;
  permisConduire?: string;
  type: "CANDIDAT";
}) {
  return await prisma.user.update({
    where: { email: data.email },
    data: {
      email: data.email,
      name: data.nom + " " + data.prenom,
      type: data.type,
      candidat: {
        create: {
          nom: data.nom,
          prenom: data.prenom,
          telephone: data.telephone,
          pays: data.pays,
          dateNaissance: new Date(data.dateNaissance),
          nationalite: data.nationalite,
          situationFamiliale: data.situationFamiliale,
          permisConduire: data.permisConduire,
        },
      },
    },
  });
}
