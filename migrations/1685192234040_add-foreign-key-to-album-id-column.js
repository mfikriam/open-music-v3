exports.up = (pgm) => {
  // ? assigns a foreign key constraint to the album_id against the id column of the albums table
  pgm.addConstraint(
    'songs',
    'fk_songs.album_id_albums.id',
    'FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE',
  );
};

exports.down = (pgm) => {
  // ? delete the fk_songs.album_id_albums.id constraint on the songs table
  pgm.dropConstraint('songs', 'fk_songs.album_id_albums.id');
};
