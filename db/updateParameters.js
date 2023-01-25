module.exports = function updateParameters(newdb, name, speed, grav) {
  newdb.exec(
    `
        update user
        set user_speed = '${speed}',
            user_gravity =  '${grav}'
        where user_name = '${name}';
      `,
    () => {}
  );
};
