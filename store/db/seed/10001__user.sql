INSERT INTO 
  user (
    `id`, 
    `email`,
    `role`,
    `name`, 
    `open_id`,
    `password_hash`
  )
VALUES
  (
    101, 
    'demo@silver-ts.com',
    'HOST',
    'Demo Host',
    'demo_open_id',
    -- raw password: secret
    '$2a$14$ajq8Q7fbtFRQvXpdCq7Jcuy.Rx1h/L4J60Otx.gyNLbAYctGMJ9tK'
  );

INSERT INTO 
  user (
    `id`, 
    `email`,
    `role`,
    `name`, 
    `open_id`,
    `password_hash`
  )
VALUES
  (
    102, 
    'jack@silver-ts.com',
    'USER',
    'Jack',
    'jack_open_id',
    -- raw password: secret
    '$2a$14$ajq8Q7fbtFRQvXpdCq7Jcuy.Rx1h/L4J60Otx.gyNLbAYctGMJ9tK'
  );

INSERT INTO 
  user (
    `id`, 
    `row_status`, 
    `email`,
    `role`,
    `name`, 
    `open_id`,
    `password_hash`
  )
VALUES
  (
    103, 
    'ARCHIVED', 
    'bob@silver-ts.com',
    'USER',
    'Bob',
    'bob_open_id',
    -- raw password: secret
    '$2a$14$ajq8Q7fbtFRQvXpdCq7Jcuy.Rx1h/L4J60Otx.gyNLbAYctGMJ9tK'
  );