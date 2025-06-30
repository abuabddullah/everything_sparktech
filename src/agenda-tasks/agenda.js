const Agenda = require('agenda');
const mongoose = require('mongoose');
const checkPaymentStatus = require('./tasks/checkPaymentStatus');
const chatAndAgoraTokenGenerate = require('./tasks/chatAndAgoraTokenGenerate');

const mongoConnectionString = process.env.MONGODB_CONNECTION;

const setupAgenda = (io) => {
  const agenda = new Agenda({
    db: {
      address: mongoConnectionString,
      collection: 'agendaJobs'
    }
  });

  checkPaymentStatus(agenda, io);
  chatAndAgoraTokenGenerate(agenda);

  (async () => {
    try {
      await mongoose.connect(mongoConnectionString);
      console.log('Connected to MongoDB');
      await agenda.start();
      console.dir('---> Agenda task handler started');
      await agenda.every('1 minute', 'check payment status');
      await agenda.every('1 minute', 'chat and agora token generate');
    } catch (error) {
      console.error('Error starting services:', error);
      process.exit(1);
    }
  })();

  return agenda;
};

module.exports = setupAgenda;
