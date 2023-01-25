module.exports = function createTables(newdb) {
  newdb.exec(
    `

    create table user (
        user_name text not null,
        user_pass text not null,
        user_speed double,
        user_gravity double
    );

    insert into user (user_name, user_pass)
    values ('admin', 'admin');

    `,
    () => {}
  );
};
