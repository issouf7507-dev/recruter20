import Link from "next/link";
import { Button } from "../components";
// import Button from "@/components/Button";

export default function AuthHomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Bienvenue sur Ylsix
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Choisissez votre profil pour continuer
          </p>
        </div>

        <div className="space-y-6">
          {/* Section Candidat */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Je suis un candidat
              </h2>
              <p className="text-gray-600 mb-4">
                Trouvez votre emploi idéal et postulez facilement
              </p>
              <div className="space-y-2">
                <Link href="/auth/candidat/login" className="block">
                  <Button variant="primary" className="w-full">
                    Se connecter
                  </Button>
                </Link>
                <Link href="/auth/candidat/register" className="block">
                  <Button variant="secondary" className="w-full">
                    S'inscrire
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Section Recruteur */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Je suis un recruteur
              </h2>
              <p className="text-gray-600 mb-4">
                Publiez vos offres et trouvez les meilleurs talents
              </p>
              <div className="space-y-2">
                <Link href="/auth/recruteur/login" className="block">
                  <Button variant="primary" className="w-full">
                    Se connecter
                  </Button>
                </Link>
                <Link href="/auth/recruteur/register" className="block">
                  <Button variant="secondary" className="w-full">
                    S'inscrire
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
