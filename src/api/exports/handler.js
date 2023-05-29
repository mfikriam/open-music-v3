const autoBind = require('auto-bind');

class ExportsHandler {
  constructor(playlistsService, playlistSongsService, exportsService, validator) {
    this._playlistsService = playlistsService;
    this._playlistSongsService = playlistSongsService;
    this._exportsService = exportsService;
    this._validator = validator;

    autoBind(this);
  }

  async postExportPlaylistSongsHandler(request, h) {
    this._validator.validateExportPlaylistSongsPayload(request.payload);

    const { id: credentialId } = request.auth.credentials;
    const { playlistId } = request.params;

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);

    const playlist = await this._playlistsService.getPlaylistsById(playlistId);
    const songs = await this._playlistSongsService.getPlaylistSongsByPlaylistId(playlistId);
    playlist.songs = songs;
    delete playlist.username;

    const message = { playlist };

    await this._exportsService.sendMessage('export:playlistsongs', JSON.stringify(message));

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses',
    });
    response.code(201);

    return response;
  }
}

module.exports = ExportsHandler;
