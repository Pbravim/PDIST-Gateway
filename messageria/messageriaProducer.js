import amqp from 'amqplib';

const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect('amqp://localhost'); 
    const channel = await connection.createChannel();
    const queue = 'reservation_queue'; 

    await channel.assertQueue(queue, { durable: true });
    return { connection, channel, queue };
  } catch (error) {
    console.error('Erro ao conectar ao RabbitMQ:', error);
  }
};

const sendReservationRequest = async (reservationData) => {
  const data  = await connectRabbitMQ();
  
  if (!data) {
    console.error('Erro ao conectar ao RabbitMQ');
    return;
  }
  const { channel, queue } = data;

  channel.sendToQueue(queue, Buffer.from(JSON.stringify(reservationData)), {
    persistent: true, 
  });

  console.log('Reserva enviada:', reservationData);
};

export default sendReservationRequest