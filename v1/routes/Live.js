const express = require('express');
const { createNewLiveStream, getAllLiveStreamByPuja, deleteLiveStream, LiveStreamingEnd, getAllLiveStreamByRithuals, createNewLiveStreamByRithuls } = require('../controllers/livestream.controller');
const router = express.Router();
const { create_liveStream_validator, createNewLiveStreamByRithuls_validator, ValidatorResult, deleteLiveStreaming_validator } = require('../../validation/liveStream.validator')


/**
 * @swagger
 * /LiveStream/createNewLiveStream:
 *   post:
 *     summary: Create a new live stream
 *     description: Endpoint to create a new live stream.
 *     tags: [LIVESTREAM]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               templeId:
 *                 type: string
 *                 description: ID of the temple associated with the live stream.
 *               pujaId:
 *                 type: string
 *                 description: ID of the puja associated with the live stream.
 *               ritualId:
 *                 type: string
 *                 description: ID of the ritual associated with the live stream.
 *     responses:
 *       '201':
 *         description: Successfully created a new live stream
 *       '400':
 *         description: Bad request, missing required fields
 */


router.post('/createNewLiveStream', create_liveStream_validator, ValidatorResult, createNewLiveStream);
router.post('/createNewLiveStreamByRithuls', createNewLiveStreamByRithuls_validator, ValidatorResult, createNewLiveStreamByRithuls);

/**
 * @swagger
 * /LiveStream/getAllLiveStreamByPuja:
 *   get:
 *     summary: Get all live streams Puja
 *     description: Endpoint to fetch all live streams.
 *     tags: [LIVESTREAM]
 *     responses:
 *       '200':
 *         description: A list of live streams by puja
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   streamName:
 *                     type: string
 *                     description: The name of the live stream.
 *                   description:
 *                     type: string
 *                     description: Description of the live stream.
 *       '404':
 *         description: No live streams found
 */

router.get('/getAllLiveStreamByPuja', getAllLiveStreamByPuja);

/**
 * @swagger
 * /LiveStream/getAllLiveStreamByRithuals:
 *   get:
 *     summary: Get all live streams Rihuals
 *     description: Endpoint to fetch all live streams.
 *     tags: [LIVESTREAM]
 *     responses:
 *       '200':
 *         description: A list of live streams by Rihuals
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   streamName:
 *                     type: string
 *                     description: The name of the live stream.
 *                   description:
 *                     type: string
 *                     description: Description of the live stream.
 *       '404':
 *         description: No live streams found
 */

router.get('/getAllLiveStreamByRithuals', getAllLiveStreamByRithuals);

/**
 * @swagger
 * /LiveStream/LiveStreamEnd/{LIVE_STREAM_ID}/{id}:
 *   put:
 *     summary: End a live stream
 *     description: Endpoint to mark the end of a live stream.
 *     tags: [LIVESTREAM]
 *     parameters:
 *       - in: path
 *         name: LIVE_STREAM_ID
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the live stream to end.
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Placeholder for any additional identifier if needed.
 *     responses:
 *       '200':
 *         description: Successfully marked the end of the live stream
 *       '404':
 *         description: Live stream not found
 *       '500':
 *         description: Internal server error
 */

router.put('/LiveStreamEnd/:LIVE_STREAM_ID/:id', deleteLiveStreaming_validator, ValidatorResult, LiveStreamingEnd);

/**
 * @swagger
 * /LiveStream/deleteLiveStreams/{LIVE_STREAM_ID}/{id}:
 *   delete:
 *     summary: Delete a live stream
 *     description: Endpoint to delete a live stream.
 *     tags: [LIVESTREAM]
 *     parameters:
 *       - in: path
 *         name: LIVE_STREAM_ID
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the live stream to delete.
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Placeholder for any additional identifier if needed.
 *     responses:
 *       '200':
 *         description: Successfully deleted the live stream
 *       '404':
 *         description: Live stream not found
 *       '500':
 *         description: Internal server error
 */

router.delete('/deleteLiveStreams/:LIVE_STREAM_ID/:id', deleteLiveStreaming_validator, ValidatorResult, deleteLiveStream)



module.exports = router;