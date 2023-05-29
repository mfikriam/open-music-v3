const PlaylistSongsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlistSongs',
  version: '1.0.0',
  register: async (
    server,
    {
      playlistSongsService,
      playlistsService,
      songsService,
      playlistSongActivitiesService,
      playlistSongsValidator,
      playlistSongActivitiesValidator,
    },
  ) => {
    const playlistSongsHandler = new PlaylistSongsHandler(
      playlistSongsService,
      playlistsService,
      songsService,
      playlistSongActivitiesService,
      playlistSongsValidator,
      playlistSongActivitiesValidator,
    );
    server.route(routes(playlistSongsHandler));
  },
};
