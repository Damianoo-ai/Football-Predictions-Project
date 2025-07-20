// sportmonksService.js
import fetch from 'node-fetch';

export class SportmonksService {
    constructor() {
        this.apiKey = process.env.SPORTMONKS_API_KEY || 'dghDVgUMxnwoz4LhHzlqhYRsOIVcoom5se43KAEYvNdodYQ0ClSCFCKiBNon';
        this.baseUrl = 'https://api.sportmonks.com/football';
        this.timeout = 10000; // 10 seconds timeout
    }

    async makeRequest(endpoint, params = {}) {
        try {
            const url = this.buildUrl(endpoint, params);
            console.log(`Making request to: ${url}`);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            const response = await fetch(url, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'FootballAnalyticsPro/1.0'
                }
            });

            clearTimeout(timeoutId);    

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new SportmonksAPIError(
                    `API request failed: ${response.status} ${response.statusText}`,
                    response.status,
                    errorData
                );
            }

            const data = await response.json();
            return this.processResponse(data);

        } catch (error) {
            if (error.name === 'AbortError') {
                throw new SportmonksAPIError('Request timeout', 408);
            }
            if (error instanceof SportmonksAPIError) {
                throw error;
            }
            throw new SportmonksAPIError(`Network error: ${error.message}`, 503);
        }
    }

    buildUrl(endpoint, params) {
        const url = new URL(`${this.baseUrl}/${endpoint}`);
        
        // Add API key
        url.searchParams.set('api_token', this.apiKey);
        
        // Add other parameters
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                url.searchParams.set(key, value);
            }
        });

        return url.toString();
    }

    processResponse(data) {
        return {
            success: true,
            data: data.data || data,
            meta: data.meta || null,
            pagination: data.pagination || null,
            subscription: data.subscription || null
        };
    }

    // Specific methods for different endpoints
    async getTeams(params = {}) {
        return this.makeRequest('teams', params);
    }

    async getTeam(teamId, params = {}) {
        return this.makeRequest(`teams/${teamId}`, params);
    }

    async getLeagues(params = {}) {
        return this.makeRequest('leagues', params);
    }

    async getLeague(leagueId, params = {}) {
        return this.makeRequest(`leagues/${leagueId}`, params);
    }

    async getFixtures(params = {}) {
        return this.makeRequest('fixtures', params);
    }

    async getFixture(fixtureId, params = {}) {
        return this.makeRequest(`fixtures/${fixtureId}`, params);
    }

    async getSeasons(params = {}) {
        return this.makeRequest('seasons', params);
    }

    async getSeason(seasonId, params = {}) {
        return this.makeRequest(`seasons/${seasonId}`, params);
    }

    async getStandings(params = {}) {
        return this.makeRequest('standings', params);
    }

    async getPlayers(params = {}) {
        return this.makeRequest('players', params);
    }

    async getPlayer(playerId, params = {}) {
        return this.makeRequest(`players/${playerId}`, params);
    }

    // Team statistics
    async getTeamStatistics(teamId, seasonId, params = {}) {
        return this.makeRequest(`teams/${teamId}/statistics`, {
            season_id: seasonId,
            ...params
        });
    }

    // Fixture statistics
    async getFixtureStatistics(fixtureId, params = {}) {
        return this.makeRequest(`fixtures/${fixtureId}/statistics`, params);
    }

    // Live scores
    async getLiveScores(params = {}) {
        return this.makeRequest('livescores', params);
    }

    // Venues
    async getVenues(params = {}) {
        return this.makeRequest('venues', params);
    }

    // Coaches
    async getCoaches(params = {}) {
        return this.makeRequest('coaches', params);
    }

    // Referees
    async getReferees(params = {}) {
        return this.makeRequest('referees', params);
    }

    // Predictions (if available in your plan)
    async getPredictions(params = {}) {
        return this.makeRequest('predictions', params);
    }

    // Odds (if available in your plan)
    async getOdds(params = {}) {
        return this.makeRequest('odds', params);
    }

    // Helper methods for common queries
    async getLeagueFixtures(leagueId, seasonId, params = {}) {
        return this.makeRequest('fixtures', {
            league_id: leagueId,
            season_id: seasonId,
            ...params
        });
    }

    async getTeamFixtures(teamId, seasonId, params = {}) {
        return this.makeRequest('fixtures', {
            team_id: teamId,
            season_id: seasonId,
            ...params
        });
    }

    async getUpcomingFixtures(params = {}) {
        const today = new Date().toISOString().split('T')[0];
        return this.makeRequest('fixtures', {
            date_from: today,
            ...params
        });
    }

    async getRecentFixtures(params = {}) {
        const today = new Date();
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        return this.makeRequest('fixtures', {
            date_from: weekAgo.toISOString().split('T')[0],
            date_to: today.toISOString().split('T')[0],
            ...params
        });
    }

    // Error handling for rate limits
    async handleRateLimit(retryAfter) {
        console.log(`Rate limit hit, waiting ${retryAfter} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
    }
}

// Custom error class for Sportmonks API errors
export class SportmonksAPIError extends Error {
    constructor(message, status, details) {
        super(message);
        this.name = 'SportmonksAPIError';
        this.status = status;
        this.details = details;
    }
}

// Export default instance
export default new SportmonksService();