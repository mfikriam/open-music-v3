const PlaylistSongActivitiesHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlistSongActivities',
  version: '1.0.0',
  register: async (server, { playlistSongActivitiesService, playlistsService, validator }) => {
    const playlistSongActivitiesHandler = new PlaylistSongActivitiesHandler(
      playlistSongActivitiesService,
      playlistsService,
      validator,
    );
    server.route(routes(playlistSongActivitiesHandler));
  },
};
