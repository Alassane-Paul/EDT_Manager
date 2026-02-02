const { Sequelize } = require('sequelize');
const config = require('../edt-api/config/config.json');
const { Utilisateur, Notification, Etablissement, Role } = require('../edt-api/database/models');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    logging: false
});

async function debugNotifications() {
    try {
        await sequelize.authenticate();
        console.log('Connected to database.');

        // 1. List Users and their Etablissement
        const users = await Utilisateur.findAll({
            attributes: ['id', 'nom', 'prenom', 'role', 'etablissement_id', 'email']
        });

        console.log('\n=== USERS ===');
        console.table(users.map(u => ({
            id: u.id,
            name: `${u.prenom} ${u.nom}`,
            role: u.role,
            etab_id: u.etablissement_id,
            email: u.email
        })));

        // 2. Count Notifications per User
        const notifications = await Notification.findAll({
            attributes: ['utilisateur_id', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
            group: ['utilisateur_id']
        });

        console.log('\n=== NOTIFICATION COUNTS ===');
        const counts = {};
        notifications.forEach(n => {
            counts[n.utilisateur_id] = n.get('count');
        });
        console.table(Object.keys(counts).map(uid => ({
            userId: uid,
            count: counts[uid]
        })));

        // 3. Simulate Targeting for Etablissement 1
        const etabId = 1;
        console.log(`\n=== SIMULATION: Targeting Admins for Etablissement ${etabId} ===`);

        // Logic from NotificationService.notifierNouveauRattrapage
        const gestionnaires = await Utilisateur.findAll({
            where: {
                role: ['admin', 'directeur', 'responsable_pedagogique'],
                etablissement_id: etabId
            }
        });

        console.log(`Found ${gestionnaires.length} targets:`);
        gestionnaires.forEach(g => console.log(`- [${g.id}] ${g.prenom} ${g.nom} (${g.role}) - Etab: ${g.etablissement_id}`));

        if (gestionnaires.length === 0) {
            console.log('WARNING: No admins found for this establishment!');
            // Check if there are ANY admins
            const globalAdmins = await Utilisateur.findAll({
                where: { role: 'admin' }
            });
            console.log('Global Admins found (any etab):');
            globalAdmins.forEach(g => console.log(`- [${g.id}] ${g.prenom} ${g.nom} - Etab: ${g.etablissement_id}`));
        }

    } catch (error) {
        console.error('Debug Error:', error);
    } finally {
        await sequelize.close();
    }
}

debugNotifications();
