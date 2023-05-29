const autoBind = require('auto-bind');
const config = require('../../utils/config');

class UploadsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postUploadCoverHandler(request, h) {
    const { cover } = request.payload;
    this._validator.validateImageHeaders(cover.hapi.headers);

    const filename = await this._service.writeFile(cover, cover.hapi);

    const fileLocation = `http://${config.app.host}:${config.app.port}/upload/images/${filename}`;
    console.log(fileLocation);

    const response = h.response({
      status: 'success',
      message: 'Cover album berhasil diupload',
    });
    response.code(201);

    return response;
  }
}

module.exports = UploadsHandler;
