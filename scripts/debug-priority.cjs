const GenerationService = require('../edt-api/services/generation.service');

async function testPriority() {
    const classeId = '20ec9111-4374-49c2-bece-d74f0e9603d3';
    const parametres = {
        mode_generation: 'equilibre',
        periode_debut: '2026-01-01',
        periode_fin: '2026-06-30'
    };

    try {
        console.log('--- TEST ROOM PRIORITY ---');
        // On peut intercepter les données si besoin, mais ici on va juste voir le résultat
        // Si on veut voir ce qui est passé à l'algo, on peut mocker la méthode generer
        const resultat = await GenerationService.genererEmploiTemps(classeId, parametres);
        console.log('--- RESULTAT ---');
        console.log('Nombre de créneaux:', resultat.creneaux.length);

        // Vérifier si les créneaux respectent la salle par défaut
        const slotsWithRoom = resultat.creneaux.filter(c => c.salle_id);
        console.log('Créneaux avec salle:', slotsWithRoom.length);

        if (slotsWithRoom.length > 0) {
            console.log('Distribution des salles:');
            const salleCount = {};
            slotsWithRoom.forEach(c => {
                salleCount[c.salle_nom] = (salleCount[c.salle_nom] || 0) + 1;
            });
            console.log(JSON.stringify(salleCount, null, 2));
        }

    } catch (error) {
        console.error('--- ERREUR ---');
        console.error(error);
    } finally {
        process.exit(0);
    }
}

testPriority();
