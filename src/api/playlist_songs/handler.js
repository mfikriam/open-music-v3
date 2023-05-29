const autoBind = require('auto-bind');

class PlaylistSongsHandler {
  constructor(
    playlistSongsService,
    playlistsService,
    songsService,
    playlistSongActivitiesService,
    playlistSongsValidator,
    playlistSongActivitiesValidator,
  ) {
    this._playlistSongsService = playlistSongsService;
    this._playlistsService = playlistsService;
    this._songsService = songsService;
    this._playlistSongActivitiesService = playlistSongActivitiesService;
    this._playlistSongsValidator = playlistSongsValidator;
    this._playlistSongActivitiesValidator = playlistSongActivitiesValidator;

    autoBind(this);
  }

  async postPlaylistSongHandler(request, h) {
    this._playlistSongsValidator.validatePlaylistSongPayloadSchema(request.payload);
    const { id: playlistId } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._songsService.getSongById(songId);
    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
    const playlistSongId = await this._playlistSongsService.addPlaylistSong(playlistId, songId);

    // ? add playlist song activity
    const activity = { playlistId, songId, userId: credentialId, action: 'add' };
    this._playlistSongActivitiesValidator.validatePlaylistSongActivityPayloadSchema(activity);
    await this._playlistSongActivitiesService.addPlaylistSongActivity(activity);

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke dalam Playlist',
      data: {
        playlistSongId,
      },
    });
    response.code(201);

    return response;
  }

  async getPlaylistSongsHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    const playlist = await this._playlistsService.getPlaylistsById(playlistId);
    const songs = await this._playlistSongsService.getPlaylistSongsByPlaylistId(playlistId);
    playlist.songs = songs;

    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async deletePlaylistSongHandler(request) {
    this._playlistSongsValidator.validatePlaylistSongPayloadSchema(request.payload);
    const { id: playlistId } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
    await this._playlistSongsService.deletePlaylistSong(playlistId, songId);

    // ? add playlist song activity
    const activity = { playlistId, songId, userId: credentialId, action: 'delete' };
    this._playlistSongActivitiesValidator.validatePlaylistSongActivityPayloadSchema(activity);
    await this._playlistSongActivitiesService.addPlaylistSongActivity(activity);

    return {
      status: 'success',
      message: 'Lagu dalam playlist berhasil dihapus',
    };
  }
}

module.exports = PlaylistSongsHandler;
