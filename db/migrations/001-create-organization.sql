create table organizations (
  id bigint primary key generated always as identity,
  name text not null,
  address text,
  city text,
  state text,
  postal_code text,
  country text,
  phone_number text,
  email text unique,
  website text
);
