import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle, XCircle, Loader } from "lucide-react";
import { verifyEmail } from "../lib/AuthClient";

export default function EmailVerified() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyUserEmail = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setStatus("error");
        setMessage(
          "Token de vérification manquant. Veuillez vérifier le lien dans votre email.",
        );
        return;
      }

      try {
        console.log("🔐 [VERIFY] Verifying email with token...");
        const result = await verifyEmail(token);

        if (result.data) {
          setStatus("success");
          setMessage(
            "Votre email a été vérifié avec succès ! Vous pouvez maintenant vous connecter.",
          );
          console.log("✅ [VERIFY] Email verification successful");
        } else {
          throw new Error("Verification failed");
        }
      } catch (error: any) {
        console.error("❌ [VERIFY] Email verification failed:", error);
        setStatus("error");
        setMessage(
          error.message ||
            "Erreur lors de la vérification de l'email. Le lien peut être expiré.",
        );
      }
    };

    verifyUserEmail();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9F7F2] px-4">
      <div className="bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/40 max-w-md w-full text-center">
        {status === "loading" && (
          <>
            <div className="w-20 h-20 bg-[#C5A065]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader className="text-[#C5A065] animate-spin" size={40} />
            </div>
            <h1 className="text-2xl font-bold mb-6 text-[#2D2A26]">
              Vérification en cours...
            </h1>
            <p className="text-stone-600">
              Veuillez patienter pendant que nous vérifions votre email.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-green-600" size={40} />
            </div>
            <h1 className="text-2xl font-bold mb-6 text-[#2D2A26]">
              ✅ Email vérifié avec succès
            </h1>
            <p className="text-stone-600 mb-8">{message}</p>
            <button
              onClick={() => navigate("/se-connecter")}
              className="w-full px-6 py-3 text-sm font-bold text-white bg-[#C5A065] rounded-xl hover:opacity-90 transition-all"
            >
              Se connecter
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="text-red-600" size={40} />
            </div>
            <h1 className="text-2xl font-bold mb-6 text-[#2D2A26]">
              Erreur de vérification
            </h1>
            <p className="text-stone-600 mb-8">{message}</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/se-connecter")}
                className="w-full px-6 py-3 text-sm font-bold text-[#2D2A26] bg-white border border-black/10 rounded-xl hover:bg-stone-50 transition-all"
              >
                Retour à la connexion
              </button>
              <button
                onClick={() => navigate("/")}
                className="w-full px-6 py-3 text-sm font-bold text-white bg-[#2D2A26] rounded-xl hover:opacity-90 transition-all"
              >
                Accueil
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
