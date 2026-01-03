// scripts/initBilling.cjs
const {
  PricingRule,
  Etablissement,
  Subscription,
  sequelize
} = require('../backend/database/models');
const { PlanType, StatutSubscription, TypeMetrique } = require('../backend/utils/enums');

async function initializeBilling() {
  console.log('--- Initialisation du Système de Facturation ---');

  try {
    // Synchroniser les modèles pour recréer les tables manquantes ou modifiées
    console.log('... Synchronisation de la base de données ...');
    await sequelize.sync({ force: false });
    console.log('✅ Base de données synchronisée');

    // 1. Créer les règles de tarification par défaut
    console.log('1. Création des règles de tarification...');

    const defaultRules = [
      // Utilisateurs
      {
        nom: 'Utilisateurs Basic',
        type_metrique: TypeMetrique.USER,
        prix_unitaire: 1300.00,
        seuil_min: 5, // 5 gratuits
        ordre: 1
      },
      // Classes
      {
        nom: 'Classes Basic',
        type_metrique: TypeMetrique.CLASS,
        prix_unitaire: 3250.00,
        seuil_min: 2, // 2 gratuites
        ordre: 1
      },
      // Stockage
      {
        nom: 'Stockage Supplémentaire',
        type_metrique: TypeMetrique.STORAGE,
        prix_unitaire: 6.00,
        seuil_min: 500, // 500MB gratuits
        ordre: 1
      },
      // Emplois du temps
      {
        nom: 'Générations EDT',
        type_metrique: TypeMetrique.TIMETABLE,
        prix_unitaire: 650.00,
        seuil_min: 10, // 10 gratuits par mois
        ordre: 1
      }
    ];

    for (const ruleData of defaultRules) {
      const [rule, created] = await PricingRule.findOrCreate({
        where: { nom: ruleData.nom },
        defaults: ruleData
      });
      if (created) console.log(`   ✅ Règle créée: ${ruleData.nom}`);
      else console.log(`   ℹ️ Règle existante: ${ruleData.nom}`);
    }

    // 2. Initialiser les établissements existants
    console.log('2. Initialisation des établissements existants...');

    const etablissements = await Etablissement.findAll({
      where: { subscription_id: null }
    });

    console.log(`   Found ${etablissements.length} establishments to initialize.`);

    for (const etablissement of etablissements) {
      console.log(`   Processing: ${etablissement.nom}`);

      // Créer un abonnement TRIAL par défaut
      const subscription = await Subscription.create({
        etablissement_id: etablissement.id,
        plan_type: PlanType.TRIAL,
        date_debut: new Date(),
        statut: StatutSubscription.ACTIVE
      });

      // Mettre à jour l'établissement
      etablissement.subscription_id = subscription.id;
      etablissement.limite_utilisateurs = 5;
      etablissement.limite_classes = 2;
      etablissement.limite_stockage_mb = 500;
      await etablissement.save();

      console.log(`      ✅ Abonnement TRIAL créé et limites configurées.`);
    }

    console.log('--- Initialisation terminée avec succès ---');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
  } finally {
    process.exit();
  }
}

initializeBilling();
