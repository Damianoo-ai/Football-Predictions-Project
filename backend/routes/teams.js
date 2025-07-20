import express from 'express';
import { query, param } from 'express-validator';
import sportmonksService from '../../services/sportmonksService.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validationResult } from 'express-validator';

const router = express.Router();

/**
 * Validazioni per i parametri delle richieste
 */
const validateTeamId = [
  param('teamId')
    .isInt({ min: 1 })
    .withMessage('ID squadra deve essere un numero intero positivo')
];

const validateTeamQuery = [
  query('league_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID campionato deve essere un numero intero positivo'),
  query('season_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID stagione deve essere un numero intero positivo'),
  query('name')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Nome squadra deve essere tra 2 e 50 caratteri')
];

/**
 * @route   GET /api/teams
 * @desc    Ottiene la lista delle squadre
 * @access  Public
 */
router.get('/', 
  validateTeamQuery,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Parametri non validi',
        details: errors.array()
      });
    }

    const { league_id, season_id, name } = req.query;
    
    const filters = {};
    if (league_id) filters.league_id = league_id;
    if (season_id) filters.season_id = season_id;
    if (name) filters.name = name;

    const data = await sportmonksService.getTeams(filters);
    
    res.json({
      success: true,
      data: data.data || [],
      pagination: data.pagination || null,
      timestamp: new Date().toISOString()
    });
  })
);

/**
 * @route   GET /api/teams/:teamId
 * @desc    Ottiene i dettagli di una squadra specifica
 * @access  Public
 */
router.get('/:teamId',
  validateTeamId,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Parametri non validi',
        details: errors.array()
      });
    }

    const { teamId } = req.params;
    const data = await sportmonksService.getTeam(teamId);
    
    res.json({
      success: true,
      data: data.data || null,
      timestamp: new Date().toISOString()
    });
  })
);

/**
 * @route   GET /api/teams/:teamId/fixtures
 * @desc    Ottiene le partite di una squadra
 * @access  Public
 */
router.get('/:teamId/fixtures',
  validateTeamId,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Parametri non validi',
        details: errors.array()
      });
    }

    const { teamId } = req.params;
    const { season_id = '2024' } = req.query;
    
    const data = await sportmonksService.getTeamFixtures(teamId, season_id);
    
    res.json({
      success: true,
      data: data.data || [],
      pagination: data.pagination || null,
      timestamp: new Date().toISOString()
    });
  })
);

/**
 * @route   GET /api/teams/:teamId/statistics
 * @desc    Ottiene le statistiche di una squadra
 * @access  Public
 */
router.get('/:teamId/statistics',
  validateTeamId,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Parametri non validi',
        details: errors.array()
      });
    }

    const { teamId } = req.params;
    const { season_id = '2024' } = req.query;
    
    const data = await sportmonksService.getTeamStatistics(teamId, season_id);
    
    res.json({
      success: true,
      data: data.data || null,
      timestamp: new Date().toISOString()
    });
  })
);

export default router;