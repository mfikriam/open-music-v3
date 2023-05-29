const autoBind = require('auto-bind');

class AlbumLikesHandler {
  constructor(albumLikesService, albumsService) {
    this._albumLikesService = albumLikesService;
    this._albumsService = albumsService;

    autoBind(this);
  }

  async postAlbumLikeHandler(request, h) {
    const { id: albumId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._albumsService.getAlbumById(albumId);
    await this._albumLikesService.addAlbumLike(userId, albumId);

    const response = h.response({
      status: 'success',
      message: 'Album berhasil di-like',
    });
    response.code(201);

    return response;
  }

  async deleteAlbumLikeHandler(request) {
    const { id: albumId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._albumLikesService.deleteAlbumLike(userId, albumId);

    return {
      status: 'success',
      message: 'Like pada album berhasil dihapus',
    };
  }

  async getAlbumLikesHandler(request, h) {
    const { id: albumId } = request.params;
    const { likes, cache } = await this._albumLikesService.getAlbumLikes(albumId);

    const response = h.response({
      status: 'success',
      data: {
        likes,
      },
    });

    if (cache) {
      response.header('X-Data-Source', 'cache');
    }

    response.code(200);

    return response;
  }
}

module.exports = AlbumLikesHandler;
