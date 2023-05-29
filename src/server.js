// ? import dotenv and run its configurations
require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');

// ? environment configuration for external services
const config = require('./utils/config');

// ? albums
const albums = require('./api/albums');
const AlbumsService = require('./services/postgres/AlbumsService');
const AlbumsValidator = require('./validator/albums');

// ? songs
const songs = require('./api/songs');
const SongsService = require('./services/postgres/SongsService');
const SongsValidator = require('./validator/songs');

// ? users
const users = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validator/users');

// ? authentications
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');

// ? playlists
const playlists = require('./api/playlists');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const PlaylistsValidator = require('./validator/playlists');

// ? playlist songs
const playlistSongs = require('./api/playlist_songs');
const PlaylistSongsService = require('./services/postgres/PlaylistSongsService');
const PlaylistSongsValidator = require('./validator/playlist_songs');

// ? playlist song activities
const playlistSongActivities = require('./api/playlist_song_activities');
const PlaylistSongActivitiesService = require('./services/postgres/PlaylistSongActivitiesService');
const PlaylistSongActivitiesValidator = require('./validator/playlist_song_activities');

// ? collaborations
const collaborations = require('./api/collaborations');
const CollaborationsService = require('./services/postgres/CollaborationsService');
const CollaborationsValidator = require('./validator/collaborations');

// ? exports
const _exports = require('./api/exports');
const ProducerService = require('./services/rabbitmq/ProducerService');
const ExportsValidator = require('./validator/exports');

// ? Exceptions Types
const ClientError = require('./exceptions/ClientError');

const init = async () => {
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const collaborationsService = new CollaborationsService();
  const playlistsService = new PlaylistsService(collaborationsService);
  const playlistSongsService = new PlaylistSongsService();
  const playlistSongActivitiesService = new PlaylistSongActivitiesService();

  const server = Hapi.server({
    port: config.app.port,
    host: config.app.host,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // * external plugin registration
  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  // * define jwt authentication strategy
  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: config.jwt.accessTokenKey,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: config.jwt.accessTokenAge,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: albums,
      options: {
        service: albumsService,
        validator: AlbumsValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        service: playlistsService,
        validator: PlaylistsValidator,
      },
    },
    {
      plugin: playlistSongs,
      options: {
        playlistSongsService,
        playlistsService,
        songsService,
        playlistSongActivitiesService,
        playlistSongsValidator: PlaylistSongsValidator,
        playlistSongActivitiesValidator: PlaylistSongActivitiesValidator,
      },
    },
    {
      plugin: playlistSongActivities,
      options: {
        playlistSongActivitiesService,
        playlistsService,
        validator: PlaylistSongActivitiesValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        playlistsService,
        usersService,
        validator: CollaborationsValidator,
      },
    },
    {
      plugin: _exports,
      options: {
        playlistsService,
        exportsService: ProducerService,
        validator: ExportsValidator,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      // * handling client errors internally
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }

      // * maintain native hapi handling of client errors, such as 404, etc
      if (!response.isServer) {
        return h.continue;
      }

      // * handling server errors as needed
      const newResponse = h.response({
        status: 'error',
        message: 'terjadi kegagalan pada server kami',
      });
      newResponse.code(500);
      return newResponse;
    }

    // * if not an error, continue with the previous response (without intervening)
    return h.continue;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
