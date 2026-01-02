const { sequelize } = require('../config/database');
const { Notification, Utilisateur } = require('../database/models');

async function testNotifications() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        // Count notifications
        const count = await Notification.count();
        console.log(`Total notifications: ${count}`);

        // Try to find one
        const notification = await Notification.findOne();
        if (notification) {
            console.log('Found a notification:', notification.toJSON());
        } else {
            console.log('No notifications found.');
        }

    } catch (error) {
        console.error('Unable to connect to the database or query notifications:', error);
    } finally {
        await sequelize.close();
    }
}

testNotifications();
