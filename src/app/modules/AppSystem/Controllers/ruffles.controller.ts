import httpStatus from 'http-status';
import sendResponse from '../../../utils/sendResponse';
import catchAsync from '../../../utils/catchAsync';
import { TicketServices } from '../Services/ruffles.service';

const createRuffles = catchAsync(async (req, res) => {
  const result = await TicketServices.createRuffles(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Ruffles created successfully!',
    data: result,
  });
});

const createTicket = catchAsync(async (req, res) => {
  const { qty } = req.body;
  const payload = {
    qty,
    user: req.user.userId,
  };
  const result = await TicketServices.createTicket(payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Ticket Created successfully!',
    data: result,
  });
});

const getTickets = catchAsync(async (req, res) => {
  const result = await TicketServices.getTickets();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Tickets are retrieved successfully!',
    data: result,
  });
});

const getMyTickets = catchAsync(async (req, res) => {
  const result = await TicketServices.getMyTickets(req.user.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Tickets are retrieved successfully!',
    data: result,
  });
});

const getTicketDetailes = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await TicketServices.getMyTickets(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Tickets are retrieved successfully!',
    data: result,
  });
});

const getMaxTicketHolder = catchAsync(async (req, res) => {
  console.log('hello');
  const result = await TicketServices.getMaxTicketHolder();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'user retrieved successfully!',
    data: result,
  });
});

const deleteRuffles = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await TicketServices.deleteRuffles(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Ruffles is deleted successfully!',
    data: result,
  });
});

export const TicketControllers = {
  createRuffles,
  createTicket,
  getTickets,
  getMyTickets,
  getTicketDetailes,
  getMaxTicketHolder,
  deleteRuffles,
};
