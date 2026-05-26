"use client";
import React, { useState } from "react";
import { useForm, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ChevronDownIcon, Eye, EyeOff } from "lucide-react";

import { Button as ButtonUI } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "../shared";

interface AuthFormProps {
  type: "login" | "register";
  userType: "candidat" | "recruteur";
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

// Schéma de validation pour le login
const loginSchema = z.object({
  email: z.string().email("L'email n'est pas valide"),
  password: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

// Schéma de validation pour l'inscription candidat
const registerCandidatSchema = z
  .object({
    firstName: z.string().min(1, "Le prénom est requis"),
    lastName: z.string().min(1, "Le nom est requis"),
    email: z.string().email("L'email n'est pas valide"),
    password: z
      .string()
      .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    confirmPassword: z
      .string()
      .min(1, "La confirmation du mot de passe est requise"),
    phone: z.string().optional(),
    dateNaissance: z.date().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

// Schéma de validation pour l'inscription recruteur
const registerRecruteurSchema = z
  .object({
    firstName: z.string().min(1, "Le prénom est requis"),
    lastName: z.string().min(1, "Le nom est requis"),
    email: z.string().email("L'email n'est pas valide"),
    password: z
      .string()
      .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    confirmPassword: z
      .string()
      .min(1, "La confirmation du mot de passe est requise"),
    companyName: z.string().min(1, "Le nom de l'entreprise est requis"),
    phone: z.string().optional(),
    typeUser: z.enum(["RECRUTEUR", "COLLABORATEUR", "CANDIDAT"]).optional(),
    dateNaissance: z.date().optional(),
  })

  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export default function AuthForm({
  type,
  userType,
  onSubmit,
  isLoading = false,
}: AuthFormProps) {
  // Sélectionner le bon schéma selon le type et le userType
  const schema =
    type === "login"
      ? loginSchema
      : userType === "recruteur"
        ? registerRecruteurSchema
        : registerCandidatSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<any>({
    resolver: zodResolver(schema),
  });

  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const title = type === "login" ? "Connexion" : "Inscription";
  const subtitle =
    type === "login"
      ? `Connectez-vous à votre compte ${userType === "candidat" ? "candidat" : "recruteur"
      }`
      : `Créez votre compte ${userType === "candidat" ? "candidat" : "recruteur"
      }`;

  const [open, setOpen] = useState(false);
  const [dateNaissance, setDateNaissance] = useState<Date | undefined>(
    undefined
  );

  return (
    <div className="h-full w-full flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 rounded-2xl relative">
      <div className="block w-full max-w-2xl">
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-2">
            {type === "login" ? "Bienvenue" : "Créer un compte"}
          </h1>
          <p className="text-base text-gray-600 mb-6">{subtitle}</p>
        </div>

        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          {type === "register" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="text"
                  label="Prénom"
                  {...register("firstName")}
                  error={errors.firstName?.message as string | undefined}
                  placeholder="Prénom"
                />
                <Input
                  type="text"
                  label="Nom"
                  {...register("lastName")}
                  error={errors.lastName?.message as string | undefined}
                  placeholder="Nom"
                />
              </div>

              {userType === "recruteur" && (
                <Input
                  type="text"
                  label="Nom de l'entreprise"
                  {...register("companyName")}
                  error={errors.companyName?.message as string | undefined}
                  placeholder="Nom de l'entreprise"
                />
              )}

              <div className="flex flex-col gap-3">
                <Label htmlFor="date" className="px-1 text-gray-700">
                  {userType === "recruteur"
                    ? "Date de création de l'entreprise"
                    : "Date de naissance"}
                </Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <ButtonUI
                      // variant="outline"
                      id="date"
                      className="w-full justify-between font-normal bg-transparent py-5 border text-gray-500 border-gray-300 text-base hover:bg-gray-200"
                      onClick={() => setOpen(true)}
                    >
                      {dateNaissance
                        ? new Date(dateNaissance).toLocaleDateString()
                        : "Sélectionner une date"}
                      <ChevronDownIcon />
                    </ButtonUI>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-full overflow-hidden"
                    align="start"
                  >
                    <Calendar
                      className="w-full"
                      mode="single"
                      selected={dateNaissance}
                      fromYear={1900}
                      toYear={2055}
                      {...register("dateNaissance", {
                        valueAsDate: true,
                      })}
                      captionLayout="dropdown"
                      onSelect={(date: Date | undefined) => {
                        if (date) {
                          setDateNaissance(date);
                          setValue("dateNaissance", date);
                          setOpen(false);
                        }
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Input
                type="tel"
                label="Téléphone"
                {...register("phone")}
                error={errors.phone?.message as string | undefined}
                placeholder="+33 6 12 34 56 78"
              />
            </>
          )}

          <Input
            type="email"
            label="Email"
            {...register("email")}
            error={errors.email?.message as string | undefined}
            placeholder="Email"
          />

          {/* <Input
            type="password"
            label="Mot de passe"
            {...register("password")}
            error={errors.password?.message as string | undefined}
            placeholder="Mot de passe"
          /> */}

          <div className="relative ">
            <Input
              type={show ? "text" : "password"}
              label="Mot de passe"
              error={errors.password?.message as string | undefined}
              placeholder="Mot de passe"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShow((prev) => !prev)}
              className="absolute right-3 top-[40px] text-gray-400 hover:text-gray-600"
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {type === "register" && (
            <div className="relative ">

              <Input
                type="password"
                label="Confirmer le mot de passe"
                {...register("confirmPassword")}
                error={errors.confirmPassword?.message as string | undefined}
                placeholder="Confirmer le mot de passe"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((prev) => !prev)}
                className="absolute right-3 top-[40px] text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          )}

          {type === "login" && (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input type="checkbox" id="remember" className="mr-2" />
                <label htmlFor="remember" className="text-sm text-gray-600">
                  Se souvenir de moi
                </label>
              </div>

              <Link
                href="/auth/recruteur/forgot-password"
                className="text-base text-[#a590ff] hover:text-[#a590ff]/80"
              >
                Mot de passe oublié ?
              </Link>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#a590ff] text-white hover:bg-[#a590ff]/80 py-2 rounded-full text-base font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Chargement..." : title}
          </button>

          {/* <div className="text-center mb-10">Ou continuez avec</div> */}
        </form>

        {/* <div className="flex items-center justify-center">
          <button className="w-full text-black py-2 rounded-full text-base font-semibold cursor-pointer text-center flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50">
            <Image
              src="/icons/Google__G__logo.svg"
              alt="Google"
              width={24}
              height={24}
            />
            Continue avec Google
          </button>
        </div> */}

        <div className="text-center mt-10">
          <p className="text-sm text-gray-600">
            {type === "login" ? "Pas encore de compte ?" : "Déjà un compte ?"}
            <a
              href={
                type === "login"
                  ? `/auth/${userType}/register`
                  : `/auth/${userType}/login`
              }
              className="text-sm text-[#a590ff] hover:text-[#a590ff]/80 ml-1"
            >
              {type === "login" ? "S'inscrire" : "Se connecter"}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
