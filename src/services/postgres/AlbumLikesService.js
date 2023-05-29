const { Pool } = require('pg'); // ? Postgres Pool
const { nanoid } = require('nanoid'); // ? Unique string ID generator

// ? Exceptions Types
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const ClientError = require('../../exceptions/ClientError');

class AlbumLikesService {
  constructor() {
    this._pool = new Pool();
  }

  async checkAlbumLike(userId, albumId) {
    const query = {
      text: `SELECT id FROM user_album_likes
      WHERE user_id = $1 AND album_id = $2`,
      values: [userId, albumId],
    };
    const result = await this._pool.query(query);

    return result.rowCount > 0;
  }

  async addAlbumLike(userId, albumId) {
    // ? check if album already liked before
    const isLiked = await this.checkAlbumLike(userId, albumId);
    if (isLiked) {
      throw new ClientError('Album sudah pernah di-like');
    }

    const id = `album_like-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal di-like ditambahkan');
    }

    return result.rows[0].id;
  }

  async deleteAlbumLike(userId, albumId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Like pada album gagal dihapus. Id tidak ditemukan');
    }
  }

  async getAlbumLikes(albumId) {
    const query = {
      text: `SELECT id FROM user_album_likes
      WHERE album_id = $1`,
      values: [albumId],
    };
    const result = await this._pool.query(query);

    return result.rowCount;
  }
}

module.exports = AlbumLikesService;
