import { Router } from "express";
import { eventController } from "../controllers/EventController";
const router = Router();
/**
 * @openapi
 * /api/events:
 *   get:
 *     summary: Get all events
 *     tags:
 *       - Events
 *     responses:
 *       200:
 *         description: A list of events
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 *       500:
 *         description: Internal server error
 */
router.get("/", eventController.getAllEvent);
/**
 * @openapi
 * /api/events/{id}:
 *   get:
 *     summary: Get a specific event by ID
 *     tags:
 *       - Events
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", eventController.getEventById);
/**
 * @openapi
 * /api/events/vouchers/{id}:
 *   get:
 *     summary: Get vouchers by eventID
 *     tags:
 *       - Events
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: vouchers
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal server error
 */
router.get("/vouchers/:id", eventController.getAllVoucherOfEventByEventId);
/**
 * @openapi
 * /api/events:
 *   post:
 *     summary: Create a new event
 *     tags:
 *       - Events
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       200:
 *         description: Event created successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Internal server error
 */
router.post("/", eventController.createEvent);
/**
 * @openapi
 * /api/events/{id}:
 *   put:
 *     summary: Update an existing event
 *     tags:
 *       - Events
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       200:
 *         description: Event updated successfully
 *       404:
 *         description: Event not found
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Internal server error
 */
router.put("/:id", eventController.updateEvent);
/**
 * @openapi
 * /api/events/{id}:
 *   delete:
 *     summary: Delete an event by ID
 *     tags:
 *       - Events
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", eventController.deleteEvent);
/**
 * @openapi
 * /api/events/request-voucher:
 *   post:
 *     summary: Request a voucher for an event
 *     tags:
 *       - Events
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventId
 *               - userId
 *             properties:
 *               eventId:
 *                 type: string
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Voucher requested successfully
 *       404:
 *         description: Event or user not found
 *       500:
 *         description: Internal server error
 */
router.post("/request-voucher", eventController.requestVoucher);
/**
 * @openapi
 * /api/events/{eventId}/editable/me:
 *   post:
 *     summary: Request permission to edit event
 *     tags:
 *       - Events
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 example: 661234abcd5678ef90123456
 *     responses:
 *       200:
 *         description: Editable granted
 *       409:
 *         description: Another user is editing this event
 *       404:
 *         description: Event not found
 */

router.post("/:eventId/editable/me", eventController.requestEdit);
/**
 * @openapi
 * /api/events/{eventId}/editable/release:
 *   post:
 *     summary: Release editing lock on event
 *     tags:
 *       - Events
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 example: 661234abcd5678ef90123456
 *     responses:
 *       200:
 *         description: Edit released
 *       403:
 *         description: You are not the editing user
 *       404:
 *         description: Event not found
 */

router.post("/:eventId/editable/release", eventController.releaseEdit);
/**
 * @openapi
 * /api/events/{eventId}/editable/maintain:
 *   post:
 *     summary: Maintain (extend) editing lock
 *     tags:
 *       - Events
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 example: 661234abcd5678ef90123456
 *     responses:
 *       200:
 *         description: Edit maintained
 *       409:
 *         description: Edit session expired or not owned by user
 *       404:
 *         description: Event not found
 */

router.post("/:eventId/editable/maintain", eventController.maintainEdit);
export default router;
