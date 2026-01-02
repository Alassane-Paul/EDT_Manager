const { Utilisateur } = require('./backend/database/models');

async function checkRoles() {
    try {
        const users = await Utilisateur.findAll({ limit: 5 });
        users.forEach(u => {
            console.log(`User: ${u.email}, Role: ${u.role}`);
        });
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkRoles();
