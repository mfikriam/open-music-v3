const autoBind = require('auto-bind');

class UploadsHandler {
  constructor(storageService, albumsService, validator) {
    this._storageService = storageService;
    this._albumsService = albumsService;
    this._validator = validator;

    autoBind(this);
  }

  async postUploadCoverHandler(request, h) {
    const { cover } = request.payload;
    const { id } = request.params;
    this._validator.validateImageHeaders(cover.hapi.headers);

    // ? remove old cover if album already have cover
    const { cover: oldfilename } = await this._albumsService.getAlbumById(id);
    if (oldfilename) {
      await this._storageService.deleteFile(oldfilename);
    }

    // ? write file
    const filename = await this._storageService.writeFile(cover, cover.hapi);
    await this._albumsService.editCoverAlbumById(id, filename);

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });
    response.code(201);

    return response;
  }
}

module.exports = UploadsHandler;
