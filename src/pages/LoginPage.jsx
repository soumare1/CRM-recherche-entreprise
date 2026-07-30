import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { signInWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await signInWithEmail(email);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo / Branding */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/20">
            <span className="text-white font-bold text-2xl">B</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">buzz SAS — CRM</h1>
          <p className="text-neutral-500 text-sm mt-2">Outil de prospection commerciale</p>
        </div>

        <div className="bg-[#181818] border border-[#262626] rounded-2xl p-8 shadow-2xl">
          {!sent ? (
            <>
              <h2 className="text-lg font-semibold text-white mb-1">Connexion</h2>
              <p className="text-sm text-neutral-400 mb-6">
                Entrez votre email pour recevoir un lien de connexion magique.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1.5">
                    Adresse email
                  </label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="vous@buzzsas.fr"
                      className="w-full pl-10 pr-4 py-3 bg-[#121212] border border-[#333] rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      Recevoir le lien <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Vérifiez votre email !</h2>
              <p className="text-neutral-400 text-sm">
                Un lien de connexion a été envoyé à <strong className="text-white">{email}</strong>.
                Cliquez dessus pour accéder à l'application.
              </p>
              <button
                onClick={() => setSent(false)}
                className="mt-6 text-sm text-violet-400 hover:underline"
              >
                Utiliser une autre adresse
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-neutral-600 mt-6">
          buzz SAS · Évry-Courcouronnes · Données stockées de manière sécurisée
        </p>
      </div>
    </div>
  );
}
