INSERT INTO 
  memo (
    `id`,
    `content`, 
    `creator_id`
  )
VALUES
  (
    1001,
    "#Hello π Welcome to memos.
And here is old Jack's Page: [/u/102](/u/102)", 
    101
  );

INSERT INTO 
  memo (
    `id`,
    `content`, 
    `creator_id`,
    `visibility`
  )
VALUES
  (
    1002,
    '#TODO 
- [ ] Take more photos about **π sunset**;
- [x] Clean the room;
- [x] Read *π The Little Prince*;
(π click to toggle status)', 
    101,
    'PROTECTED'
  );

INSERT INTO 
  memo (
    `id`,
    `content`, 
    `creator_id`,
    `visibility`
  )
VALUES
  (
    1003,
    'ε₯½ε₯½ε­¦δΉ οΌε€©ε€©εδΈγπ€π€',
    101,
    'PUBLIC'
  );

INSERT INTO 
  memo (
    `id`,
    `content`, 
    `creator_id`,
    `visibility`
  )
VALUES
  (
    1004,
    '#TODO 
- [x] Take more photos about **π sunset**;
- [ ] Clean the classroom;
- [ ] Watch *π¦ The Boys*;
(π click to toggle status)
', 
    102,
    'PROTECTED'
  );

INSERT INTO 
  memo (
    `id`,
    `content`, 
    `creator_id`,
    `visibility`
  )
VALUES
  (
    1005,
    'δΈδΊΊθ‘οΌεΏζζεΈηοΌπ¨βπ«', 
    102,
    'PUBLIC'
  );
