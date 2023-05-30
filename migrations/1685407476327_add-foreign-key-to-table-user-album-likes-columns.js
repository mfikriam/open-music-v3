exports.up = (pgm) => {
  /*
    ? Added a UNIQUE constraint, a combination of the user_id and album_id columns.
    ? In order to avoid data duplication between the two values.
  */
  pgm.addConstraint('user_album_likes', 'unique_user_id_and_album_id', 'UNIQUE(user_id, album_id)');

  /*
      ? provide a foreign key constraint on the user_id column
      ? and album_id against users.id and albums.id
    */
  pgm.addConstraint(
    'user_album_likes',
    'fk_user_album_likes.user_id_users.id',
    'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE',
  );
  pgm.addConstraint(
    'user_album_likes',
    'fk_user_album_likes.album_id_albums.id',
    'FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE',
  );
};

exports.down = (pgm) => {
  pgm.dropConstraint('user_album_likes', 'fk_user_album_likes.album_id_albums.id');
  pgm.dropConstraint('user_album_likes', 'fk_user_album_likes.user_id_users.id');
  pgm.dropConstraint('user_album_likes', 'unique_user_id_and_album_id');
};
