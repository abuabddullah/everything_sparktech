const {
  getAppointmentPaymentChecks,
  deleteAppointmentPaymentCheck,
} = require("../../modules/AppointmentPaymentCheck/appointmentPaymentCheck.service");
const {
  updateAnAppointment,
} = require("../../modules/Appointment/appointment.controller");
const {
  addNotification,
} = require("../../modules/Notification/notification.service");

const checkPaymentStatus = async (agenda, emitSocketEvent) => {
  agenda.define("check payment status", async (job) => {
    try {
      const checkForPaymentStatus = await getAppointmentPaymentChecks();
      if (checkForPaymentStatus && checkForPaymentStatus.length > 0) {
        for (const data of checkForPaymentStatus) {
          if (data.appointment.paymentStatus === "paid") {
          } else {
            await updateAnAppointment(data.appointment._id, {
              status: "cancelled",
            });
            const notificationData = {
              message: `Your appointment with ${data.ootms.fullName} has been cancelled due to non-payment of fees.`,
              receiver: data.user,
              type: "appointment",
              link: data.appointment._id,
              role: "user",
              receiver: data.user._id,
            };
            const newNotification = await addNotification(notificationData);
            const roomId = "user-notification::" + data.user._id.toString;

            // Emit the socket event
            io.emit(roomId, newNotification);
          }
          await deleteAppointmentPaymentCheck(data._id);
        }
      }
    } catch (error) {
      console.log(error);
    }
  });
};

module.exports = checkPaymentStatus;
