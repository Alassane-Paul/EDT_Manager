import { Bulletin } from "@/api/bulletins/api";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface BulletinTemplateProps {
    bulletin: Bulletin;
}

export function BulletinTemplate({ bulletin }: BulletinTemplateProps) {
    if (!bulletin) return null;

    const { eleve, details_matieres, moyenne_generale, appreciation_conseil } = bulletin;
    const dateGeneration = bulletin.date_generation ? new Date(bulletin.date_generation) : new Date();

    // Ensure details_matieres is an array (handle JSON string or missing data)
    let matieres: any[] = [];
    try {
        if (Array.isArray(details_matieres)) {
            matieres = details_matieres;
        } else if (typeof details_matieres === 'string') {
            matieres = JSON.parse(details_matieres);
        }
    } catch (e) {
        console.error("Error parsing details_matieres:", e);
        matieres = [];
    }

    console.log("DEBUG BULLETIN - Matieres:", matieres);

    return (
        <div className="bg-white text-black p-8 max-w-[210mm] mx-auto min-h-[297mm] font-serif printable-content">
            {/* Header / En-tête Etablissement */}
            <div className="border-b-2 border-black pb-4 mb-8 flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold uppercase tracking-wider">{bulletin.etablissement.nom}</h1>
                    <p className="text-sm">Année Scolaire {bulletin.etablissement.annee_scolaire}</p>
                    <p className="text-sm">Tél: {bulletin.etablissement.telephone}</p>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold">BULLETIN DE NOTES</h2>
                    <p className="text-sm italic">Généré le {format(dateGeneration, "d MMMM yyyy", { locale: fr })}</p>
                </div>
            </div>

            {/* Student Info */}
            <div className="bg-gray-100 p-4 rounded-sm border border-gray-300 mb-8 flex justify-between">
                <div>
                    <span className="block text-xs uppercase text-gray-500">Élève</span>
                    <span className="text-lg font-bold">{eleve?.utilisateur.nom} {eleve?.utilisateur.prenom}</span>
                    <span className="block text-sm">Matricule: {eleve?.matricule}</span>
                </div>
                <div className="text-right">
                    {/* TODO: Add Classe name if available in bulletin object, otherwise just ID */}
                    <span className="block text-xs uppercase text-gray-500">Classe</span>
                    <span className="text-lg font-bold">{bulletin.classe ? bulletin.classe.nom_classe : "N/A"}</span>
                </div>
            </div>

            {/* Grades Table */}
            <div className="mb-8">
                <table className="w-full border-collapse border border-black text-sm">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border border-black p-2 text-left w-1/3">Matière</th>
                            <th className="border border-black p-2 text-center w-24">Coef.</th>
                            <th className="border border-black p-2 text-center w-24">Moyenne</th>
                            <th className="border border-black p-2 text-left">Appréciation / Professeur</th>
                        </tr>
                    </thead>
                    <tbody>
                        {matieres.map((matiere: any, index: number) => (
                            <tr key={index}>
                                <td className="border border-black p-2 font-medium">
                                    {matiere.nom_matiere}
                                    <span className="block text-xs font-normal text-gray-500 italic"> {matiere.nom_prof && matiere.nom_prof !== 'N/A' ? matiere.nom_prof : ""}</span>
                                </td>
                                <td className="border border-black p-2 text-center">{matiere.coef_matiere}</td>
                                <td className="border border-black p-2 text-center font-bold">
                                    {matiere.moyenne.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="border border-black p-2 text-xs text-gray-600">
                                    {matiere.appreciation || "Aucune appréciation particulière."}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-gray-100 font-bold text-lg">
                            <td className="border border-black p-3 text-right" colSpan={2}>MOYENNE GÉNÉRALE</td>
                            <td className="border border-black p-3 text-center">
                                {moyenne_generale !== undefined ? moyenne_generale.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : "N/A"} / 20
                            </td>
                            <td className="border border-black bg-gray-200"></td>
                        </tr>
                        {bulletin.rang && (
                            <tr className="bg-gray-50">
                                <td className="border border-black p-2 text-right font-semibold" colSpan={2}>RANG</td>
                                <td className="border border-black p-2 text-center font-bold text-primary">
                                    {bulletin.rang}
                                </td>
                                <td className="border border-black bg-gray-200"></td>
                            </tr>
                        )}
                    </tfoot>
                </table>
            </div>

            {/* Footer / Review */}
            <div className="border-t border-black pt-4 mt-auto">
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="border p-2">
                        <h3 className="font-bold underline text-sm mb-2">Absences</h3>
                        <p className="text-2xl font-bold text-center text-red-600">{bulletin.nb_absences || 0}</p>
                    </div>
                    <div className="border p-2">
                        <h3 className="font-bold underline text-sm mb-2">Conduite</h3>
                        <p className="text-xs">{bulletin.appreciation_conduite || "Non défini."}</p>
                    </div>
                    <div className="border p-2">
                        <h3 className="font-bold underline text-sm mb-2">Décision du conseil</h3>
                        <p className="text-xs">{appreciation_conseil || "Non défini."}</p>
                    </div>
                </div>
                <div className="border p-2 h-24">
                    <h3 className="font-bold underline text-sm mb-2">Signature du Directeur</h3>
                </div>
                <p className="text-center text-xs text-gray-500 mt-4">
                    Ce document est un relevé de notes officiel de l'établissement.
                </p>
            </div>
        </div>
    );
}
