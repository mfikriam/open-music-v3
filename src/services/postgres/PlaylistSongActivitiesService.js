const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');

class PlaylistSongActivitiesService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylistSongActivity({ playlistId, songId, userId, action }) {
    const id = `playlist_song_activity-${nanoid(16)}`;
    const currentTimestamp = new Date().toISOString();

    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, userId, action, currentTimestamp],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist song activity gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylistSongActivitiesByPlaylistId(playlistId) {
    const query = {
      text: `SELECT 
      users.username, 
      songs.title, 
      playlist_song_activities.action, 
      playlist_song_activities.time FROM playlist_song_activities
      LEFT JOIN users ON users.id = playlist_song_activities.user_id
      LEFT JOIN songs ON songs.id = playlist_song_activities.song_id
      WHERE playlist_song_activities.playlist_id = $1`,
      values: [playlistId],
    };
    const result = await this._pool.query(query);

    return result.rows;
  }
}

module.exports = PlaylistSongActivitiesService;
