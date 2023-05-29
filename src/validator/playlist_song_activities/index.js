const { PlaylistSongActivityPayloadSchema } = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const PlaylistSongActivitiesValidator = {
  validatePlaylistSongActivityPayloadSchema: (payload) => {
    const validationResult = PlaylistSongActivityPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = PlaylistSongActivitiesValidator;
