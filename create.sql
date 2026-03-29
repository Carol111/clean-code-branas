create database app_test;

\connect app;
\i /docker-entrypoint-initdb.d/sql/schema.sql

\connect app_test;
\i /docker-entrypoint-initdb.d/sql/schema.sql