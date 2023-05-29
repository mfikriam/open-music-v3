const autoBind = require('auto-bind');

class ExportsHandler {
  constructor(playlistsService, exportsService, validator) {
    this._playlistsService = playlistsService;
    this._exportsService = exportsService;
    this._validator = validator;

    autoBind(this);
  }

  async postExportPlaylistSongsHandler(request, h) {
    this._validator.validateExportPlaylistSongsPayload(request.payload);

    const { playlistId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(playlistId, userId);

    const message = {
      playlistId,
      userId,
      targetEmail: request.payload.targetEmail,
    };

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
