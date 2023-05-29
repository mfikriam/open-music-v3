exports.up = (pgm) => {
  // ? create table playlist_song_activities
  pgm.createTable('playlist_song_activities', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    playlist_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    song_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    action: {
      type: 'TEXT',
      notNull: true,
    },
    time: {
      type: 'TIMESTAMP WITH TIME ZONE',
      notNull: true,
    },
  });

  // ? assigns a foreign key constraint to the playlist_id
  // ? against the id column of the playlists table
  pgm.addConstraint(
    'playlist_song_activities',
    'fk_playlist_song_activities.playlist_id_playlists.id',
    'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE',
  );
};

exports.down = (pgm) => {
  // ? delete the fk_playlist_song_activities.playlist_id_playlists.id constraint
  // ? on the playlist_song_activities table
  pgm.dropConstraint(
    'playlist_song_activities',
    'fk_playlist_song_activities.playlist_id_playlists.id',
  );

  // ? drop table playlist_song_activities
  pgm.dropTable('playlist_song_activities');
};
