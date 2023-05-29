exports.up = (pgm) => {
  // ? create table playlists
  pgm.createTable('playlists', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    name: {
      type: 'TEXT',
      notNull: true,
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });

  // ? assigns a foreign key constraint to the owner against the id column of the users table
  pgm.addConstraint(
    'playlists',
    'fk_playlists.owner_users.id',
    'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE',
  );
};

exports.down = (pgm) => {
  // ? delete the fk_playlists.owner_users.id constraint on the playlists table
  pgm.dropConstraint('playlists', 'fk_playlists.owner_users.id');

  // ? drop table playlists
  pgm.dropTable('playlists');
};
