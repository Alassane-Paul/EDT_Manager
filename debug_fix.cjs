const { Enseignant, Cours, Classe, Matiere, CreneauCours, Eleve, Utilisateur } = require('./backend/database/models');
const { RoleUtilisateur } = require('./backend/utils/enums');

async function testGetMesCours(userId, targetEnseignantId = null) {
    try {
        const utilisateur = await Utilisateur.findByPk(userId);
        if (!utilisateur) throw new Error('User not found');

        const role = utilisateur.role;
        let enseignant;

        if (targetEnseignantId) {
            const rolesSuperieurs = [RoleUtilisateur.ADMIN, RoleUtilisateur.DIRECTEUR, RoleUtilisateur.RESPONSABLE_PEDAGOGIQUE];
            if (!rolesSuperieurs.includes(role)) {
                const monEnseignant = await Enseignant.findOne({ where: { utilisateur_id: userId } });
                if (!monEnseignant || monEnseignant.id !== targetEnseignantId) {
                    throw new Error('Forbidden');
                }
                enseignant = monEnseignant;
            } else {
                // Here we test if findByPk throws on invalid ID
                enseignant = await Enseignant.findByPk(targetEnseignantId);
            }
        } else {
            enseignant = await Enseignant.findOne({ where: { utilisateur_id: userId } });
        }

        if (!enseignant) {
            console.log('Enseignant not found');
            return;
        }

        console.log(`Found enseignant: ${enseignant.id}`);
    } catch (error) {
        console.error('CAUGHT ERROR:', error.message);
    }
}

async function run() {
    const admin = await Utilisateur.findOne({ where: { role: 'admin' } });
    if (admin) {
        console.log('Testing with invalid UUID string');
        await testGetMesCours(admin.id, 'invalid-uuid');

        console.log('Testing with numeric string');
        await testGetMesCours(admin.id, '123');

        console.log('Testing with "undefined" string');
        await testGetMesCours(admin.id, 'undefined');
    }
    process.exit(0);
}

run();
