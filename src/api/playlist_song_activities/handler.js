const autoBind = require('auto-bind');

class PlaylistSongActivitiesHandler {
  constructor(playlistSongActivitiesService, playlistsService, validator) {
    this._playlistSongActivitiesService = playlistSongActivitiesService;
    this._playlistsService = playlistsService;
    this._validator = validator;

    autoBind(this);
  }

  async getPlaylistSongActivitiesHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);

    const activities =
      await this._playlistSongActivitiesService.getPlaylistSongActivitiesByPlaylistId(playlistId);

    return {
      status: 'success',
      data: {
        playlistId,
        activities,
      },
    };
  }
}

module.exports = PlaylistSongActivitiesHandler;
