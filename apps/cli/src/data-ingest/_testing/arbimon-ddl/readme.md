To recreate the sql files in this folder:
1. Export the DDL for each of the tables in Arbimon used in sync
2. Remove backticks (`)
3. Remove unused AUTO_INCREMENT and UNSIGNED
4. Remove primary key, unique key, key, and constraints lines
5. Remove the DEFAULT CHARSET and ENGINE from the end of each CREATE statement

As there are no keys, the files can be run in any order (new tables added to the end).
